# Agent Rules

## Before Starting Any Task

**MANDATORY — Every agent must read `agentic/START_HERE.md` before doing anything else. No exceptions.**

**For any UI/frontend task: also read `agentic/DESIGN_SYSTEM.md` before writing a single line of UI code.**

If you are a worker agent assigned to a PIPELINE.md stage:
1. Read agentic/START_HERE.md first
2. Read agentic/AGENT_RULES.md
3. Confirm your assigned stage's `agentic/tasks/stage-XX-<name>.md` has Status: READY/IN_PROGRESS before beginning work

## ADR Numbering

**MANDATORY — do this before creating any ADR, no exceptions:**

```bash
ls agentic/docs/adrs/ | sort | tail -3
```

Take the highest number shown, add 1, use that as your ADR number.

Rules:
- Never guess or assume the next number
- Never create a file without running the check above first
- File name: `NNN-short-slug.md` (zero-padded to 3 digits)
- Header inside the file must match the filename exactly:
  ```
  # ADR NNN — Title
  ```
- This rule applies in every worktree — the `agentic/docs/adrs/` directory is shared via git
