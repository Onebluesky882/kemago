// Package sms — SMSMKT (Clicknext) plain SMS send API, used as an
// alternative transport to ThaiBulkSMS. Deliberately NOT using their
// managed OTP product (POST /api/otp-send + /api/otp-validate) — that
// would replace internal/otp's own generate/store/verify logic and
// couple auth to this one vendor's token/ref_code flow, which is exactly
// what internal/otp's Sender abstraction exists to avoid.
//
// Contract confirmed from developers.smsmkt.com/api-reference:
//   - URL: https://portal-otp.smsmkt.com/api/send-message, method POST
//   - Auth: api_key + secret_key headers
//   - Body (JSON): message, phone, sender (+ optional scheduling/tracking params)
package sms

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

const smsmktSendURL = "https://portal-otp.smsmkt.com/api/send-message"

type SMSMKTClient struct {
	apiKey     string
	secretKey  string
	sender     string
	httpClient *http.Client
}

func NewSMSMKTClient(apiKey, secretKey, sender string) *SMSMKTClient {
	return &SMSMKTClient{
		apiKey:     apiKey,
		secretKey:  secretKey,
		sender:     sender,
		httpClient: &http.Client{},
	}
}

type smsmktSendRequest struct {
	Message string `json:"message"`
	Phone   string `json:"phone"`
	Sender  string `json:"sender"`
}

type smsmktResult struct {
	TransactionID string `json:"transaction_id"`
	UsedCredit    int    `json:"usedcredit"`
	SumPhone      int    `json:"sumphone"`
	Duplicate     int    `json:"duplicate"`
	Blacklist     int    `json:"blacklist"`
}

type smsmktResponse struct {
	Code   string        `json:"code"`
	Detail string        `json:"detail"`
	Result *smsmktResult `json:"result"`
}

// Send satisfies the Sender interface (see sender.go).
func (c *SMSMKTClient) Send(ctx context.Context, msisdn, message string) error {
	payload, err := json.Marshal(smsmktSendRequest{Message: message, Phone: msisdn, Sender: c.sender})
	if err != nil {
		return fmt.Errorf("smsmkt: encode request: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, smsmktSendURL, bytes.NewReader(payload))
	if err != nil {
		return fmt.Errorf("smsmkt: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api_key", c.apiKey)
	req.Header.Set("secret_key", c.secretKey)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("smsmkt: request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("smsmkt: read response: %w", err)
	}

	var result smsmktResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("smsmkt: decode response: %w", err)
	}

	// SMSMKT's get-credit endpoint uses "000" for success (confirmed live);
	// assuming send-message follows the same convention since their docs
	// don't show an explicit error-code table for this endpoint.
	if result.Code != "000" {
		return fmt.Errorf("smsmkt: %s (code %s)", result.Detail, result.Code)
	}

	if result.Result != nil {
		log.Printf("smsmkt: sent to %s, transaction_id=%s used_credit=%d", msisdn, result.Result.TransactionID, result.Result.UsedCredit)
	}

	return nil
}
