# Start the SDLC flow

Entry point for a fresh feature on a forked repo. One command takes the user from "I have a brief" to "stage-01 has produced idea.md", asking only the questions that cannot be derived from the brief.

Apply skill `starting-the-flow`. The skill handles:

1. Repo / branch / `.pipeline/` setup (runs `init-project.sh` if needed).
2. Brief capture (paste, file path, or pointer to existing `_inputs/`).
3. Platform selection — multi-select via `AskUserQuestion`: mobile-ios, mobile-android, mobile-cross-platform, web, desktop, backend, cli.
4. Per-platform tech preference — only the questions relevant to chosen platforms (e.g. iOS native → Swift+SwiftUI vs UIKit; cross-platform → React Native vs Flutter; backend → Node vs Python vs Go vs reuse-existing).
5. Writes `_inputs/stack-preferences.md` from the answers.
6. Hands off to `/stage-01` to generate `idea.md` with the `## Platforms` section pre-filled from step 3.

Once `/stage-01` validates, the skill prints the next-step prompt: `/stage-02`. The user advances through stages by re-running `/start-flow` (which detects state and resumes) or by calling `/stage-XX` directly.
