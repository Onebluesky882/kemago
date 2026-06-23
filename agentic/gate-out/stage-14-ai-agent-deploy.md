stage_id: stage-14-ai-agent-deploy
status: PASS
ready_for_next: YES

modified_files:
  - packages/db/migrations/agent-deploy.sql (created — deploy_status, site_url, pushed_at, deployed_at columns)
  - apps/api/src/domains/agent/agent.schema.ts (added deployNotifySchema, deployCompleteSchema, deployStatusQuerySchema)
  - apps/api/src/domains/agent/agent.route.ts (added POST /deploy-notify, POST /deploy-complete, GET /deploy-status)
  - apps/api/wrangler.toml (added DEPLOY_WEBHOOK_SECRET, SITE_URL secret comments)
  - apps/admin/hooks/use-agent.ts (added DeployStatus type, deployStatus + siteUrl state, notifyAndPollDeploy)
  - apps/admin/components/agent/deploy-result.tsx (created — client-facing status: pushed → deploying → live)
  - apps/admin/components/agent/chat-window.tsx (removed download button — not needed)
  - apps/admin/app/(dashboard)/agent/page.tsx (integrated DeployResult, removed downloadFiles)
  - .github/workflows/deploy.yml (created — auto-deploy on push to main)
  - agentic/CONDUCTOR.md (added Rule 7: deploy + client reload notification)

tests_run:
  - pnpm type-check → exit 0 ✓

dependencies_added: none

acceptance_criteria:
  - [PASS] agent-deploy.sql migration created
  - [PASS] POST /api/agent/deploy-notify — marks status deploying, called after SSE done
  - [PASS] POST /api/agent/deploy-complete — webhook from GitHub Actions, marks status live
  - [PASS] GET /api/agent/deploy-status — frontend polls this every 10s
  - [PASS] DeployResult component — plain Thai language, no technical terms
  - [PASS] Progress steps: บันทึกการเปลี่ยนแปลง → กำลังอัพเดทเว็บ → เสร็จแล้ว
  - [PASS] "ดูเว็บ" button when status = live
  - [PASS] No download button (client sees result on live site, not file download)
  - [PASS] GitHub Actions workflow — auto-deploy all 3 apps on push to main
  - [PASS] CONDUCTOR.md Rule 7 — deploy + "กรุณา reload หน้าเว็บ" notification
  - [PASS] pnpm type-check exits 0

known_issues:
  - deploy-complete webhook requires GitHub Actions secret DEPLOY_WEBHOOK_SECRET to match API secret
  - SITE_URL must be set per deployment (each client has different URL)

risks: none

blockers: none — deploy requires Dev to configure GitHub Secrets: CLOUDFLARE_API_TOKEN, API_URL, DEPLOY_WEBHOOK_SECRET, CF_WORKER_NAME

recommendations:
  - Dev: set GitHub Secrets before testing the Actions workflow
  - Dev: set wrangler secret put DEPLOY_WEBHOOK_SECRET + SITE_URL before deploying stage-14
  - Apply D1 migration: wrangler d1 execute fullstack-builder-db --remote --file packages/db/migrations/agent-deploy.sql
