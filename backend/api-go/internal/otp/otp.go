// Package otp implements phone verification: generate a 6-digit code, send
// it via SMS, hold it in Redis with a short TTL, and verify what the user
// types back. ThaiBulkSMS (see internal/sms) only delivers the SMS — this
// package owns the actual OTP lifecycle, so swapping SMS providers later
// doesn't touch auth logic.
package otp

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/onebluesky882/coarea/backend/api-go/internal/sms"
)

const (
	codeTTL           = 5 * time.Minute
	requestCooldown   = 60 * time.Second
	maxAttempts       = 5
	codeKeyPrefix     = "otp:code:"
	cooldownKeyPrefix = "otp:cooldown:"
	attemptsKeyPrefix = "otp:attempts:"
)

var (
	ErrCooldown        = errors.New("otp: request too soon, wait before retrying")
	ErrNotFound        = errors.New("otp: no pending code for this phone (expired or never requested)")
	ErrTooManyAttempts = errors.New("otp: too many failed attempts, request a new code")
	ErrIncorrectCode   = errors.New("otp: incorrect code")
)

type Service struct {
	redis     *redis.Client
	smsClient *sms.Client
}

func NewService(redisClient *redis.Client, smsClient *sms.Client) *Service {
	return &Service{redis: redisClient, smsClient: smsClient}
}

// Request generates a new OTP, stores it in Redis, and sends it via SMS.
// Returns ErrCooldown if called again for the same phone within
// requestCooldown — this is the "max 1 request/60s per phone" abuse guard;
// pair it with a daily-count limit at the HTTP handler/middleware layer.
func (s *Service) Request(ctx context.Context, phone string) error {
	cooldownKey := cooldownKeyPrefix + phone
	set, err := s.redis.SetNX(ctx, cooldownKey, "1", requestCooldown).Result()
	if err != nil {
		return fmt.Errorf("otp: cooldown check: %w", err)
	}
	if !set {
		return ErrCooldown
	}

	code, err := generateCode()
	if err != nil {
		return fmt.Errorf("otp: generate code: %w", err)
	}

	codeKey := codeKeyPrefix + phone
	if err := s.redis.Set(ctx, codeKey, code, codeTTL).Err(); err != nil {
		return fmt.Errorf("otp: store code: %w", err)
	}
	s.redis.Del(ctx, attemptsKeyPrefix+phone)

	message := fmt.Sprintf("Coarea verification code: %s (valid %d min)", code, int(codeTTL.Minutes()))
	if _, err := s.smsClient.Send(ctx, phone, message); err != nil {
		// Roll back the stored code so the user isn't locked into a code
		// that was never actually delivered.
		s.redis.Del(ctx, codeKey)
		return fmt.Errorf("otp: send sms: %w", err)
	}

	return nil
}

// Verify checks a user-submitted code against the one stored in Redis.
// On success, the code is deleted (single use). On failure, it increments
// an attempt counter and returns ErrTooManyAttempts once maxAttempts is hit
// (guards the 6-digit / 1M-combination space against brute force).
func (s *Service) Verify(ctx context.Context, phone, submittedCode string) error {
	attemptsKey := attemptsKeyPrefix + phone
	attempts, err := s.redis.Incr(ctx, attemptsKey).Result()
	if err != nil {
		return fmt.Errorf("otp: attempts check: %w", err)
	}
	if attempts == 1 {
		s.redis.Expire(ctx, attemptsKey, codeTTL)
	}
	if attempts > maxAttempts {
		return ErrTooManyAttempts
	}

	codeKey := codeKeyPrefix + phone
	storedCode, err := s.redis.Get(ctx, codeKey).Result()
	if errors.Is(err, redis.Nil) {
		return ErrNotFound
	}
	if err != nil {
		return fmt.Errorf("otp: fetch code: %w", err)
	}

	if storedCode != submittedCode {
		return ErrIncorrectCode
	}

	s.redis.Del(ctx, codeKey, attemptsKey)
	return nil
}

func generateCode() (string, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(1_000_000))
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}
