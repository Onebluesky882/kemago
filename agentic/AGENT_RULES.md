AGENT_RULES.md

Status: ACTIVE

Owner: CONDUCTOR

⸻

Purpose

Defines worker behavior, execution boundaries, compliance requirements, and governance protections. All workers must follow these rules.

Violation → Default Violation Rule in GOVERNANCE_CORE.md (Status: FAIL, Ready For Next Stage: NO).

⸻

Governance Protection

See GOVERNANCE_CORE.md for the governance file ownership table. Workers may NOT modify any governance file. Only Dev and Conductor may, per that table.

⸻

Worker Scope

Each worker owns one stage, one branch, one domain. Workers may not execute tasks outside assigned scope.

⸻

Main Branch Merge Authority

Agents may NOT create, rename, delete, or re-point the main branch. `main` is owned exclusively by Dev.

⸻

Domain Ownership

Workers may only modify files inside their assigned domain. Cross-domain changes require explicit Conductor approval.

⸻

Technology Stack Authority

DECISIONS.md is authoritative. Workers must use approved technologies and must NOT replace frameworks, libraries, databases, authentication systems, or infrastructure without Conductor approval.

⸻

Version Policy — MANDATORY

Workers must use the latest stable version of every package unless the package appears in the **Pinned Versions** table in DECISIONS.md.

If a package is pinned: use the exact version in that table. Do NOT upgrade, downgrade, or substitute. Do NOT run `@latest` for pinned packages.

**Workers may NOT rely on memory or training data for version numbers** — versions known at training time are outdated. Always verify at runtime.

Before installing any package, run the appropriate check:

```bash
# npm
npm info <package> version

# pip
pip index versions <package>

# cargo
cargo search <package>
```

Bootstrap commands must always use `@latest`:

```bash
npm create vite@latest
npx create-expo-app@latest
npx create-next-app@latest
```

Violations that result in Status: FAIL:
* installing a package without running the version check above
* using a pinned version not declared in DECISIONS.md Pinned Versions table
* ignoring a pinned version and using @latest instead
* bootstrapping from a template without `@latest`
* claiming "latest" without evidence from the check command

Workers must include the verified version number in `dependencies_added` in gate-out.

⸻

Dependencies

Prefer existing dependencies. If a new dependency is required, document in gate-out.md: package, version, reason. See SECURITY_RULES.md for supply chain and security requirements.

⸻

Testing Rules

Required: build verification, unit tests, type checks. Workers may not claim tests passed unless executed.

⸻

Error Handling

Applications must fail gracefully. Return structured errors. Never intentionally crash systems.

⸻

Sub-Agent Restriction

Workers may NOT create, dispatch, or generate new workers or autonomous agents, delegate tasks, or create recursive execution chains. Only the Conductor may create workers.

⸻

Security Rules

See SECURITY_RULES.md for all security requirements (secrets, access control, data, network, APIs, dependencies, cryptography, infrastructure, CI/CD).

⸻

Build Artifact Rules

Never commit: `node_modules/`, `dist/`, `build/`, `.next/`, `target/`, `vendor/`, `__pycache__/`, `.venv/`. Verify `.gitignore` before push.

⸻

Stage Completion

Worker must create `gate-out/stage-[N]-<domain>.md` using this template:

```
stage_id:
status:                    # PASS | FAIL
ready_for_next:            # YES | NO
modified_files:
tests_run:
dependencies_added:        # package, version, reason — or "none"
acceptance_criteria:       # list each criterion: PASS | FAIL
known_issues:              # or "none"
risks:
blockers:
recommendations:
```

All fields are required. Empty fields must be explicitly set to "none" or "N/A".

⸻

Final Rule

Workers execute. Conductor decides. Governance overrides implementation.
