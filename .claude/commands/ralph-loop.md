---
description: "Start Ralph Loop — autonomous iteration until completion promise is output"
argument-hint: "PROMPT [--max-iterations N] [--completion-promise TEXT]"
allowed-tools: ["Bash(.claude/scripts/setup-ralph-loop.sh:*)"]
---

# Ralph Loop

Execute the setup script to initialise the Ralph loop:

```!
bash ".claude/scripts/setup-ralph-loop.sh" $ARGUMENTS
```

Work on the task. When you try to exit, the Ralph loop will feed the SAME PROMPT back to you for the next iteration. Your previous work persists in files and git history — read them at the start of each iteration to understand what was done and what remains.

CRITICAL RULE: If a completion promise is set, output it ONLY when the statement is completely and unequivocally TRUE. Do not output a false promise to escape the loop.
