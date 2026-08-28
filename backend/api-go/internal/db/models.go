package db

import (
	"context"
	"time"

	"github.com/uptrace/bun"
)

// User mirrors the "verified" / "isPublic" fields already mocked in
// apps/mobile/src/lib/mockData.ts — this is the real row those fields will
// eventually read from once the mobile app wires up to this API.
//
// Identifier is whatever the active otp.Provider verified — an email
// address today (otp.EmailOTPProvider), a phone number when that's
// swapped back in (see main.go). Deliberately not split into separate
// email/phone columns until both need to coexist on one account.
type User struct {
	bun.BaseModel `bun:"table:users,alias:u"`

	ID         int64     `bun:"id,pk,autoincrement"`
	Identifier string    `bun:"identifier,unique,notnull"`
	Verified   bool      `bun:"verified,notnull,default:false"`
	IsPublic   bool      `bun:"is_public,notnull,default:true"`
	CreatedAt  time.Time `bun:"created_at,notnull,default:current_timestamp"`
}

// Migrate creates tables if they don't exist yet. This is a plain
// CREATE TABLE IF NOT EXISTS bootstrap, not a full migration framework —
// swap for bun/migrate (versioned .sql/.go migrations) once schema changes
// need to be tracked across environments.
func Migrate(ctx context.Context, db *bun.DB) error {
	_, err := db.NewCreateTable().
		Model((*User)(nil)).
		IfNotExists().
		Exec(ctx)
	return err
}
