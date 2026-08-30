package db

import (
	"context"
	"fmt"

	"github.com/uptrace/bun"
)

// Migrate creates the feed domain's tables if they don't exist yet. This is
// the same bootstrap-migration approach the original backend/api-go used
// (see PIPELINE.md stage-4) — a real migration tool is still a follow-up.
//
// author_id/created_by/user_id reference "user"(id), a table this service
// doesn't own or migrate (backend/better-auth does) — the FK is safe
// because both services share one physical Postgres database.
func Migrate(ctx context.Context, db *bun.DB) error {
	statements := []string{
		`CREATE TABLE IF NOT EXISTS rooms (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			created_by TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE TABLE IF NOT EXISTS posts (
			id TEXT PRIMARY KEY,
			room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
			author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			category TEXT NOT NULL,
			body TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE TABLE IF NOT EXISTS comments (
			id TEXT PRIMARY KEY,
			post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
			author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			body TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE TABLE IF NOT EXISTS likes (
			post_id TEXT NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
			user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			PRIMARY KEY (post_id, user_id)
		)`,
		`CREATE TABLE IF NOT EXISTS clubs (
			id TEXT PRIMARY KEY,
			name TEXT NOT NULL,
			description TEXT NOT NULL DEFAULT '',
			category TEXT NOT NULL DEFAULT '',
			leader_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE TABLE IF NOT EXISTS club_members (
			club_id TEXT NOT NULL REFERENCES clubs(id) ON DELETE CASCADE,
			user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			PRIMARY KEY (club_id, user_id)
		)`,
		`CREATE TABLE IF NOT EXISTS polls (
			id TEXT PRIMARY KEY,
			post_id TEXT NOT NULL UNIQUE REFERENCES posts(id) ON DELETE CASCADE,
			question TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE TABLE IF NOT EXISTS poll_options (
			id TEXT PRIMARY KEY,
			poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
			label TEXT NOT NULL,
			position INTEGER NOT NULL DEFAULT 0
		)`,
		`CREATE TABLE IF NOT EXISTS poll_votes (
			poll_id TEXT NOT NULL REFERENCES polls(id) ON DELETE CASCADE,
			option_id TEXT NOT NULL REFERENCES poll_options(id) ON DELETE CASCADE,
			user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			PRIMARY KEY (poll_id, user_id)
		)`,
		`CREATE TABLE IF NOT EXISTS blocks (
			blocker_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			blocked_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			PRIMARY KEY (blocker_id, blocked_id),
			CHECK (blocker_id != blocked_id)
		)`,
		`CREATE TABLE IF NOT EXISTS friendships (
			requester_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			addressee_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			status TEXT NOT NULL DEFAULT 'pending',
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			PRIMARY KEY (requester_id, addressee_id),
			CHECK (requester_id != addressee_id)
		)`,
		`CREATE TABLE IF NOT EXISTS room_members (
			room_id TEXT NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
			user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			PRIMARY KEY (room_id, user_id)
		)`,
		`CREATE TABLE IF NOT EXISTS stories (
			id TEXT PRIMARY KEY,
			author_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			media_key TEXT NOT NULL,
			media_type TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			expires_at TIMESTAMPTZ NOT NULL
		)`,
		`CREATE TABLE IF NOT EXISTS notifications (
			id TEXT PRIMARY KEY,
			user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			kind TEXT NOT NULL,
			actor_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
			actor_name TEXT NOT NULL,
			post_id TEXT,
			read_at TIMESTAMPTZ,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`,
		`CREATE INDEX IF NOT EXISTS notifications_user_id_created_at_idx
			ON notifications (user_id, created_at DESC)`,
	}

	for _, stmt := range statements {
		if _, err := db.ExecContext(ctx, stmt); err != nil {
			return fmt.Errorf("migrate: %w", err)
		}
	}
	return nil
}
