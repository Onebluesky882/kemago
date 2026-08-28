package otp

import (
	"context"
	"fmt"
	"time"
)

// EmailSender is the minimal transport EmailOTPProvider needs — satisfied
// by internal/email.Client (Resend), kept as an interface here so the
// email transport can be swapped the same way sms.Sender lets SMS
// transports be swapped.
type EmailSender interface {
	Send(ctx context.Context, to, subject, html string) error
}

// EmailOTPProvider generates the 6-digit code ourselves (same as
// SelfGenProvider) and delivers it by email instead of SMS — chosen as
// the active provider to avoid per-message SMS cost while the product is
// still low-volume; phone OTP (SMSMKTOTPProvider) is still fully built
// and one line away in main.go.
type EmailOTPProvider struct {
	emailer    EmailSender
	codeTTLMin int
}

func NewEmailOTPProvider(emailer EmailSender, codeTTL time.Duration) *EmailOTPProvider {
	return &EmailOTPProvider{emailer: emailer, codeTTLMin: int(codeTTL.Minutes())}
}

func (p *EmailOTPProvider) Send(ctx context.Context, email string) (string, error) {
	code, err := generateCode()
	if err != nil {
		return "", fmt.Errorf("otp: generate code: %w", err)
	}

	subject := "Your Coarea verification code"
	html := fmt.Sprintf(
		"<p>Your Coarea verification code is <strong>%s</strong>.</p><p>It's valid for %d minutes. If you didn't request this, you can ignore this email.</p>",
		code, p.codeTTLMin,
	)
	if err := p.emailer.Send(ctx, email, subject, html); err != nil {
		return "", err
	}

	return code, nil
}

func (p *EmailOTPProvider) Validate(_ context.Context, session, code string) (bool, error) {
	return session == code, nil
}
