// SMSMKTOTPProvider uses SMSMKT's managed OTP product (not the plain
// send-message API — see internal/sms/smsmkt.go for that path instead).
// This is a deliberate exception to the "keep OTP logic ours" preference:
// the client chose this explicitly for fast, immediate real-SMS testing
// (the plain-SMS path was blocked on a sender-name approval process; this
// OTP Project was already approved and ready). Swapping back to
// SelfGenProvider is a one-line change in main.go.
//
// Contract confirmed from developers.smsmkt.com/api-reference:
//   - Send:     POST https://portal-otp.smsmkt.com/api/otp-send
//     headers api_key/secret_key, body {project_key, phone} -> {code, result: {token, ref_code}}
//   - Validate: POST https://portal-otp.smsmkt.com/api/otp-validate
//     headers api_key/secret_key, body {token, otp_code} -> {code, result: {status}}
package otp

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

const (
	smsmktOTPSendURL     = "https://portal-otp.smsmkt.com/api/otp-send"
	smsmktOTPValidateURL = "https://portal-otp.smsmkt.com/api/otp-validate"
)

type SMSMKTOTPProvider struct {
	apiKey     string
	secretKey  string
	projectKey string
	httpClient *http.Client
}

func NewSMSMKTOTPProvider(apiKey, secretKey, projectKey string) *SMSMKTOTPProvider {
	return &SMSMKTOTPProvider{
		apiKey:     apiKey,
		secretKey:  secretKey,
		projectKey: projectKey,
		httpClient: &http.Client{},
	}
}

type smsmktOTPSendResult struct {
	Token string `json:"token"`
	// Unused (we don't correlate on ref_code) and typed loosely — SMSMKT's
	// docs show this as a bare int (0) but live responses return it as a
	// string, so accept either shape rather than fail decoding over a
	// field we never read.
	RefCode json.RawMessage `json:"ref_code"`
}

type smsmktOTPSendResponse struct {
	Code   string               `json:"code"`
	Detail string               `json:"detail"`
	Result *smsmktOTPSendResult `json:"result"`
}

func (p *SMSMKTOTPProvider) Send(ctx context.Context, phone string) (string, error) {
	payload, err := json.Marshal(map[string]string{
		"project_key": p.projectKey,
		"phone":       phone,
	})
	if err != nil {
		return "", fmt.Errorf("smsmkt otp: encode request: %w", err)
	}

	result, err := p.doRequest(ctx, smsmktOTPSendURL, payload)
	if err != nil {
		return "", err
	}

	var parsed smsmktOTPSendResponse
	if err := json.Unmarshal(result, &parsed); err != nil {
		return "", fmt.Errorf("smsmkt otp: decode send response: %w", err)
	}
	if parsed.Code != "000" {
		return "", fmt.Errorf("smsmkt otp: %s (code %s)", parsed.Detail, parsed.Code)
	}
	if parsed.Result == nil || parsed.Result.Token == "" {
		return "", fmt.Errorf("smsmkt otp: send succeeded but no token in response")
	}

	return parsed.Result.Token, nil
}

type smsmktOTPValidateResult struct {
	Status bool `json:"status"`
}

type smsmktOTPValidateResponse struct {
	Code   string                   `json:"code"`
	Detail string                   `json:"detail"`
	Result *smsmktOTPValidateResult `json:"result"`
}

func (p *SMSMKTOTPProvider) Validate(ctx context.Context, session, code string) (bool, error) {
	payload, err := json.Marshal(map[string]string{
		"token":    session,
		"otp_code": code,
	})
	if err != nil {
		return false, fmt.Errorf("smsmkt otp: encode request: %w", err)
	}

	result, err := p.doRequest(ctx, smsmktOTPValidateURL, payload)
	if err != nil {
		return false, err
	}

	var parsed smsmktOTPValidateResponse
	if err := json.Unmarshal(result, &parsed); err != nil {
		return false, fmt.Errorf("smsmkt otp: decode validate response: %w", err)
	}
	// A wrong code is an expected outcome, not a transport error — only
	// code "000" with result.status is treated as authoritative; anything
	// else (bad/expired token, wrong code) reports as "not valid" rather
	// than surfacing SMSMKT's error detail as a Go error.
	if parsed.Code != "000" || parsed.Result == nil {
		return false, nil
	}

	return parsed.Result.Status, nil
}

func (p *SMSMKTOTPProvider) doRequest(ctx context.Context, url string, payload []byte) ([]byte, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, fmt.Errorf("smsmkt otp: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api_key", p.apiKey)
	req.Header.Set("secret_key", p.secretKey)

	resp, err := p.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("smsmkt otp: request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("smsmkt otp: read response: %w", err)
	}

	return body, nil
}
