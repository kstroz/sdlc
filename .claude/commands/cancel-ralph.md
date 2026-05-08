---
description: "Cancel active Ralph Loop"
allowed-tools: ["Bash(test -f .claude/ralph-loop.local.md:*)", "Bash(rm .claude/ralph-loop.local.md)", "Read(.claude/ralph-loop.local.md)"]
---

# Cancel Ralph

1. Check: `test -f .claude/ralph-loop.local.md && echo "EXISTS" || echo "NOT_FOUND"`

2. If NOT_FOUND: say "No active Ralph loop found."

3. If EXISTS:
   - Read `.claude/ralph-loop.local.md` to get current `iteration:` value
   - Remove: `rm .claude/ralph-loop.local.md`
   - Report: "Cancelled Ralph loop (was at iteration N)"
