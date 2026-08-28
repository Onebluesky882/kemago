package otp

import (
	"context"
	"crypto/rand"
	"fmt"
	"math/big"
	"time"

	"github.com/onebluesky882/coarea/backend/api-go/internal/sms"
)

// SelfGenProvider generates the 6-digit code ourselves and sends it as
// plain text via any sms.Sender (ThaiBulkSMS, SMSMKT's send-message,
// etc). Session data IS the code itself, so Validate is a plain string
// compare — this is the original stage-12/13 behavior, now behind the
// Provider interface so it can sit next to SMSMKTOTPProvider.
type SelfGenProvider struct {
	sender     sms.Sender
	codeTTLMin int
}

func NewSelfGenProvider(sender sms.Sender, codeTTL time.Duration) *SelfGenProvider {
	return &SelfGenProvider{sender: sender, codeTTLMin: int(codeTTL.Minutes())}
}

func (p *SelfGenProvider) Send(ctx context.Context, phone string) (string, error) {
	code, err := generateCode()
	if err != nil {
		return "", fmt.Errorf("otp: generate code: %w", err)
	}

	message := fmt.Sprintf("Coarea verification code: %s (valid %d min)", code, p.codeTTLMin)
	if err := p.sender.Send(ctx, phone, message); err != nil {
		return "", err
	}

	return code, nil
}

func (p *SelfGenProvider) Validate(_ context.Context, session, code string) (bool, error) {
	return session == code, nil
}

func generateCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}
