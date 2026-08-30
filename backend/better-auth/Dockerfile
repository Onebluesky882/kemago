# Build context must be the REPO ROOT, not this directory — this service
# is a pnpm workspace member and needs packages/email + packages/config
# resolved via the "workspace:*" protocol.
#
# On Railway: set the service's root directory to the repo root and the
# Dockerfile path to backend/better-auth/Dockerfile.
#   docker build -f backend/better-auth/Dockerfile -t kemago-better-auth .

FROM oven/bun:1-alpine
WORKDIR /repo

RUN apk add --no-cache nodejs npm && npm install -g pnpm@11.22.0

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/email packages/email
COPY packages/config packages/config
COPY backend/better-auth backend/better-auth

RUN pnpm install --frozen-lockfile --filter @kemago/better-auth-service...

WORKDIR /repo/backend/better-auth
EXPOSE 3002
CMD ["bun", "src/server.ts"]
