package db

import (
	"context"

	"github.com/uptrace/bun"
)

// UpsertVerifiedUser creates the user row for identifier if it doesn't
// exist, or marks an existing one verified — called right after a
// successful OTP verify (see internal/handlers/otp.go).
func UpsertVerifiedUser(ctx context.Context, bunDB *bun.DB, identifier string) (*User, error) {
	user := &User{Identifier: identifier, Verified: true, IsPublic: true}

	_, err := bunDB.NewInsert().
		Model(user).
		On("CONFLICT (identifier) DO UPDATE").
		Set("verified = EXCLUDED.verified").
		Returning("*").
		Exec(ctx)
	if err != nil {
		return nil, err
	}

	return user, nil
}
