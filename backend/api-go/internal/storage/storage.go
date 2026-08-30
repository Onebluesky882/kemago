// Package storage wraps Cloudflare R2 (S3-compatible) for presigned-URL
// uploads — the client uploads the file bytes directly to R2, never
// through this backend, which only ever signs a short-lived PUT URL. Per
// the client's explicit request: "signurl aws3" (AWS SDK's S3 presign
// client works against any S3-compatible endpoint, R2 included — just
// point BaseEndpoint at R2's account-specific URL instead of AWS's).
package storage

import (
	"context"
	"fmt"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

type Client struct {
	presign    *s3.PresignClient
	bucket     string
	publicBase string // e.g. https://media.kemago.app or an r2.dev dev URL — empty if not configured yet
}

type Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicBaseURL   string
}

func New(cfg Config) *Client {
	awsCfg := aws.Config{
		Region:      "auto", // R2 doesn't use AWS regions — "auto" is R2's documented value
		Credentials: credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
	}
	s3Client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(fmt.Sprintf("https://%s.r2.cloudflarestorage.com", cfg.AccountID))
	})
	return &Client{
		presign:    s3.NewPresignClient(s3Client),
		bucket:     cfg.Bucket,
		publicBase: cfg.PublicBaseURL,
	}
}

// PresignUpload returns a short-lived signed PUT URL for key. The caller
// uploads the raw file bytes directly to this URL (no Authorization header
// needed — the signature in the URL itself is the auth) with a
// Content-Type header matching contentType exactly, since the signature
// covers it.
func (c *Client) PresignUpload(ctx context.Context, key, contentType string) (string, error) {
	req, err := c.presign.PresignPutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(c.bucket),
		Key:         aws.String(key),
		ContentType: aws.String(contentType),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		return "", fmt.Errorf("presign upload: %w", err)
	}
	return req.URL, nil
}

// PublicURL returns how to read key back. If PublicBaseURL isn't
// configured (bucket not yet made public / no custom domain attached),
// falls back to a short-lived presigned GET — good enough to display
// immediately, but not stable to cache long-term.
func (c *Client) PublicURL(ctx context.Context, key string) (string, error) {
	if c.publicBase != "" {
		return c.publicBase + "/" + key, nil
	}
	req, err := c.presign.PresignGetObject(ctx, &s3.GetObjectInput{
		Bucket: aws.String(c.bucket),
		Key:    aws.String(key),
	}, s3.WithPresignExpires(1*time.Hour))
	if err != nil {
		return "", fmt.Errorf("presign get: %w", err)
	}
	return req.URL, nil
}
