package otp

import "context"

// Provider generates/delivers and later validates the actual OTP code.
// Service owns the cross-cutting concerns (request cooldown, attempt
// limiting) that apply no matter which provider is active — that's what
// keeps swapping providers a one-line change in main.go.
type Provider interface {
	// Send triggers an OTP to be delivered to phone. Returns opaque
	// session data that must be stored (Service puts it in Redis) and
	// passed back into Validate later.
	Send(ctx context.Context, phone string) (session string, err error)
	// Validate checks a user-submitted code against the session data
	// from Send.
	Validate(ctx context.Context, session, code string) (bool, error)
}
