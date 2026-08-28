package db

import (
	"context"

	"github.com/uptrace/bun"
)

// UpsertVerifiedUser creates the user row for phone if it doesn't exist,
// or marks an existing one verified — called right after a successful OTP
// verify (see internal/handlers/otp.go).
func UpsertVerifiedUser(ctx context.Context, bunDB *bun.DB, phone string) (*User, error) {
	user := &User{Phone: phone, Verified: true, IsPublic: true}

	_, err := bunDB.NewInsert().
		Model(user).
		On("CONFLICT (phone) DO UPDATE").
		Set("verified = EXCLUDED.verified").
		Returning("*").
		Exec(ctx)
	if err != nil {
		return nil, err
	}

	return user, nil
}
