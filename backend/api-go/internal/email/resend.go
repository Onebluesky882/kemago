// Package email sends transactional email via Resend — the same provider
// packages/email (the original Cloudflare/Hono template's TS backend)
// already uses. This is a native Go client against Resend's REST API
// directly, since the Go backend can't import a TS package; same
// provider, no new vendor introduced.
//
// Contract confirmed from resend.com/docs/api-reference/emails/send-email:
//   - URL: https://api.resend.com/emails, method POST
//   - Auth: Authorization: Bearer <api key>
//   - Body (JSON): from, to, subject, html
//   - Success response: {"id": "..."}
package email

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const sendURL = "https://api.resend.com/emails"

type Client struct {
	apiKey     string
	from       string
	httpClient *http.Client
}

func NewClient(apiKey, from string) *Client {
	return &Client{apiKey: apiKey, from: from, httpClient: &http.Client{}}
}

type sendRequest struct {
	From    string `json:"from"`
	To      string `json:"to"`
	Subject string `json:"subject"`
	HTML    string `json:"html"`
}

type errorResponse struct {
	Message string `json:"message"`
	Name    string `json:"name"`
}

// Send satisfies otp.EmailSender.
func (c *Client) Send(ctx context.Context, to, subject, html string) error {
	payload, err := json.Marshal(sendRequest{From: c.from, To: to, Subject: subject, HTML: html})
	if err != nil {
		return fmt.Errorf("email: encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, sendURL, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("email: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+c.apiKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("email: request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("email: read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var errResp errorResponse
		if jsonErr := json.Unmarshal(body, &errResp); jsonErr == nil && errResp.Message != "" {
			return fmt.Errorf("resend: %s (%s)", errResp.Message, errResp.Name)
		}
		return fmt.Errorf("resend: unexpected status %d: %s", resp.StatusCode, string(body))
	}

	return nil
}
