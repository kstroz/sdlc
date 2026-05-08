---
name: bootstrapping-project
description: Use at Stage 05.0 (before plan generation) to scaffold the application codebase based on the tech stack chosen in Stage 04, so the impl-loop has files to write into
---

# Bootstrapping the Project

**Announce at start:** "I'm using the bootstrapping-project skill to scaffold the codebase from the chosen tech stack."

## When to use

Run **once** per feature branch, after Stage 04 (tech-stack.md exists) and before Stage 05.1 (plan generation). The output is a working project skeleton that:

- Compiles and lints successfully on a clean clone
- Has empty placeholder folders for the layers required by `pure-function-policy.md` (`src/domain/`, `src/use-cases/`, `src/platform/`)
- Has a working test runner so `test-driven-development` can produce its first failing test
- Has lint and typecheck commands that the GitHub Actions workflow expects

## What to read first

1. `.pipeline/04-architecture/tech-stack.md` — Mobile, Backend, Data, Infra, Observability choices
2. `.pipeline/04-architecture/architecture.md` — three-layer overview (domain / use-cases / platform)
3. `pipeline/conventions/05-dev/pure-function-policy.md` — folder layout the linter and validators expect

If `tech-stack.md` is missing, stop and tell the user to run `/stage-04` first.

## Procedure

### 1. Read the chosen mobile and backend stacks

Identify from `tech-stack.md`:
- Framework (e.g. React Native + Expo, Flutter, native, Capacitor)
- Language (TypeScript, Dart, Kotlin, Swift)
- Test runner (Jest, Vitest, Dart test, XCTest)
- Lint and typecheck commands (eslint, tsc, dart analyze)
- DB / storage choice (WatermelonDB, Realm, SQLite, AsyncStorage)

### 2. Run the framework's init command in a fresh `app/` directory

The init command depends on the chosen stack. Common cases:

| Stack | Init command |
|---|---|
| React Native + Expo (managed) | `npx --yes create-expo-app@latest app --template default --no-install` |
| Flutter | `flutter create app --platforms=ios,android` |
| Vite + React (web) | `npm create vite@latest app -- --template react-ts` |
| Node + Express (backend) | `npm init -y` then add `express`, `typescript`, `jest` |

Always:
- Pin the project to a specific framework version (write the version in `package.json` exact, no `^` or `~` for the framework itself)
- Use `--no-install` and run `npm install` (or `yarn install`) explicitly so the lockfile is reproducible
- Add `.gitignore` entries for `node_modules/`, build artefacts, IDE state — most init commands do this; verify

### 3. Carve out the three-layer folders

After init, create empty placeholder files inside the app:

```
app/src/domain/.gitkeep
app/src/use-cases/.gitkeep
app/src/platform/.gitkeep
```

These let the linter glob over the right paths and prevent confusion when the first task starts writing files.

### 4. Wire test, lint, typecheck commands

Verify or add these npm/yarn scripts in `app/package.json`:

```json
{
  "scripts": {
    "test": "jest --ci",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit"
  }
}
```

Adapt for the chosen toolchain (e.g. `flutter test`, `flutter analyze`). The names should match the GitHub Actions workflow steps in `.github/workflows/dev-pipeline.yml`.

### 5. Add a sanity test that passes

Place one trivial test in `app/src/domain/__sanity__/sanity.test.ts` (or framework equivalent) that asserts `1 + 1 === 2`. This proves the test runner is functional before the impl-loop adds its first failing test.

### 6. Write a stack-specific README at `app/README.md`

Two paragraphs maximum. List the install, test, lint, and run commands. Cross-reference `.pipeline/04-architecture/tech-stack.md` for the rationale behind the chosen tools.

### 7. Update the GitHub Actions workflow

Edit `.github/workflows/dev-pipeline.yml` to replace the `# project: replace with...` placeholders with the concrete commands from step 4. Run the workflow locally with `act` (if available) or push and let CI run.

### 8. Commit

```bash
git add app/ .github/workflows/dev-pipeline.yml
git commit -m "chore(bootstrap): scaffold app from tech-stack.md"
```

The bootstrap commit is the baseline that the impl-loop will write on top of.

## Concrete recipes

The generic procedure above maps to one of three stack-specific recipes. Pick the one that matches `tech-stack.md` and run it verbatim. Each recipe ends in a green `test`/`lint`/`typecheck` baseline.

### React Native + Expo (managed workflow)

This is the recipe used in this repo for BAJ-100. Run from the repo root:

```bash
npx --yes create-expo-app@latest app --template default --no-install
cd app && npm install
mkdir -p src/domain src/use-cases src/platform
touch src/domain/.gitkeep src/use-cases/.gitkeep src/platform/.gitkeep
npm install --save-dev jest@^29.7.0 jest-expo@~54.0.0 ts-jest@^29.2.5 @types/jest@^29.5.14
```

Then edit `app/package.json` to add the `test` and `typecheck` scripts and a top-level `jest` config block:

```json
{
  "scripts": {
    "test": "jest --ci --passWithNoTests",
    "typecheck": "tsc --noEmit",
    "lint": "expo lint"
  },
  "jest": {
    "preset": "jest-expo",
    "testMatch": ["<rootDir>/src/**/*.test.ts", "<rootDir>/src/**/*.test.tsx"],
    "transformIgnorePatterns": [
      "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-clone-referenced-element|@react-navigation/.*|@unimodules/.*|@sentry/.*))"
    ]
  }
}
```

Add a sanity test at `app/src/domain/__sanity__/sanity.test.ts`:

```ts
describe('sanity', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Verify:

```bash
cd app && npm test && npm run typecheck && npm run lint
```

Does NOT include: WatermelonDB / Realm / SQLite, Sentry, navigation state libraries, or auth SDKs. Those are installed by the first task that touches them, with an ADR amendment if they cross a layer.

### Flutter

Run from the repo root:

```bash
flutter create app --platforms=ios,android
cd app
mkdir -p lib/domain lib/use_cases lib/platform
touch lib/domain/.gitkeep lib/use_cases/.gitkeep lib/platform/.gitkeep
```

`flutter create` already wires `flutter test` and `flutter analyze` against `package:flutter_test` and `analysis_options.yaml`. Add a sanity test at `app/test/domain/sanity_test.dart`:

```dart
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('arithmetic works', () {
    expect(1 + 1, 2);
  });
}
```

Verify:

```bash
cd app && flutter test && flutter analyze
```

Does NOT include: drift / sqflite / isar persistence, riverpod or bloc state management, firebase or sentry SDKs. Add via ADR amendment when first needed.

### Vite + React (web-only)

Run from the repo root:

```bash
npm create vite@latest app -- --template react-ts
cd app && npm install
mkdir -p src/domain src/use-cases src/platform
touch src/domain/.gitkeep src/use-cases/.gitkeep src/platform/.gitkeep
npm install --save-dev vitest @vitest/coverage-v8 jsdom @testing-library/react
```

Edit `app/package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "lint": "eslint . --max-warnings=0",
    "typecheck": "tsc --noEmit"
  }
}
```

Add `test` config to `vite.config.ts` (`test: { environment: 'jsdom', globals: true }`) and a sanity test at `app/src/domain/__sanity__/sanity.test.ts`:

```ts
import { describe, it, expect } from 'vitest';

describe('sanity', () => {
  it('arithmetic works', () => {
    expect(1 + 1).toBe(2);
  });
});
```

Verify:

```bash
cd app && npm test && npm run lint && npm run typecheck
```

Does NOT include: a router (react-router / tanstack-router), state manager, data-fetching client, or styling system. Each is added by the first task that requires it, with an ADR amendment if it crosses a layer.

## Validate

After bootstrap, all three commands must exit 0 from the project root:

```bash
cd app && npm install && npm test && npm run lint && npm run typecheck
```

If any fail, fix before proceeding. The impl-loop assumes a green baseline.
