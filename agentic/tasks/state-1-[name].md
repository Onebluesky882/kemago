Stage: 1
Domain: modules/[name-1]
Depends On: none
Status: ASSIGNED
Model: claude-opus-4-8

Workspace: branch from `<conductor-branch>` (Stage 1 starts as IN PROGRESS immediately — no prior stage)

Context Files:
- PROJECT.md
- PIPELINE.md (Stage 1)
- ARCHITECTURE.md
- CONTRACTS.md
- DECISIONS.md

Task:
[Clear description of what the agent must implement for Stage 1]

Gate-In Verified: YES
Prior Gate-Out: N/A (this is Stage 1)
Prior Merge: N/A (this is Stage 1)

Constraints:
- Branch from `<conductor-branch>` only
- STOP after assigned work is complete
- Do NOT merge to dev/`<conductor-branch>` directly
- Create PR targeting `<conductor-branch>` via feature/[name-1]
