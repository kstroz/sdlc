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

## Validate

After bootstrap, all three commands must exit 0 from the project root:

```bash
cd app && npm install && npm test && npm run lint && npm run typecheck
```

If any fail, fix before proceeding. The impl-loop assumes a green baseline.
