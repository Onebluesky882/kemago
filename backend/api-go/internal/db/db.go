// Package db owns the feed domain (rooms, posts, comments, likes) — the
// only tables api-go writes to. It reads (never writes) the "user" and
// "session" tables that backend/better-auth owns, to verify Bearer tokens
// and resolve author identity — see DECISIONS.md → "Backend Domain
// Ownership — TypeScript Is Auth-Only" for why this split exists.
package db

import (
	"database/sql"

	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/driver/pgdriver"
)

func Open(databaseURL string) *bun.DB {
	sqldb := sql.OpenDB(pgdriver.NewConnector(pgdriver.WithDSN(databaseURL)))
	return bun.NewDB(sqldb, pgdialect.New())
}
