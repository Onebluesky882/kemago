// Package sms sends SMS via ThaiBulkSMS API v2.
//
// Contract confirmed from ThaiBulkSMS's own developer manual (API-v2-th.pdf):
//   - URL: https://api-v2.thaibulksms.com/sms, method POST
//   - Auth: HTTP Basic — username = API Key, password = API Secret
//   - Body (application/x-www-form-urlencoded): msisdn, message, sender (+ optional params)
//   - Success response: JSON with remaining_credit, phone_number_list[], bad_phone_number_list[]
//   - Error response: {"error": {"code": int, "name": string, "description": string}}
package sms

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"
)

const sendURL = "https://api-v2.thaibulksms.com/sms"

type Client struct {
	apiKey     string
	apiSecret  string
	sender     string
	httpClient *http.Client
}

func NewClient(apiKey, apiSecret, sender string) *Client {
	return &Client{
		apiKey:     apiKey,
		apiSecret:  apiSecret,
		sender:     sender,
		httpClient: &http.Client{},
	}
}

type sentNumber struct {
	Number     string `json:"number"`
	MessageID  string `json:"message_id"`
	UsedCredit int    `json:"used_credit"`
}

type badNumber struct {
	Message string `json:"message"`
	Number  string `json:"number"`
}

type sendResponse struct {
	RemainingCredit    int          `json:"remaining_credit"`
	TotalUseCredit     int          `json:"total_use_credit"`
	CreditType         string       `json:"credit_type"`
	PhoneNumberList    []sentNumber `json:"phone_number_list"`
	BadPhoneNumberList []badNumber  `json:"bad_phone_number_list"`
}

type errorResponse struct {
	Error struct {
		Code        int    `json:"code"`
		Name        string `json:"name"`
		Description string `json:"description"`
	} `json:"error"`
}

// APIError wraps a ThaiBulkSMS error response (see the "Error Response" /
// "Status Code & Error Code" tables in their developer manual, e.g.
// ERROR_MSISDN=114, ERROR_INSUFFICIENT_CREDIT=116, ERROR_SENDER_NOT_FOUND=111).
type APIError struct {
	HTTPStatus  int
	Code        int
	Name        string
	Description string
}

func (e *APIError) Error() string {
	return fmt.Sprintf("thaibulksms: %s (code %d): %s", e.Name, e.Code, e.Description)
}

// Send sends a single SMS to a Thai phone number (any of the formats
// ThaiBulkSMS accepts: 0812345678, 66812345678, +66812345678). Satisfies
// the Sender interface (see sender.go).
func (c *Client) Send(ctx context.Context, msisdn, message string) error {
	form := url.Values{}
	form.Set("msisdn", msisdn)
	form.Set("message", message)
	form.Set("sender", c.sender)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, sendURL, strings.NewReader(form.Encode()))
	if err != nil {
		return fmt.Errorf("thaibulksms: build request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("Accept", "application/json")
	req.SetBasicAuth(c.apiKey, c.apiSecret)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return fmt.Errorf("thaibulksms: request failed: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return fmt.Errorf("thaibulksms: read response: %w", err)
	}

	if resp.StatusCode >= 400 {
		var errResp errorResponse
		if jsonErr := json.Unmarshal(body, &errResp); jsonErr == nil && errResp.Error.Name != "" {
			return &APIError{
				HTTPStatus:  resp.StatusCode,
				Code:        errResp.Error.Code,
				Name:        errResp.Error.Name,
				Description: errResp.Error.Description,
			}
		}
		return fmt.Errorf("thaibulksms: unexpected status %d: %s", resp.StatusCode, string(body))
	}

	var result sendResponse
	if err := json.Unmarshal(body, &result); err != nil {
		return fmt.Errorf("thaibulksms: decode response: %w", err)
	}
	if len(result.BadPhoneNumberList) > 0 {
		bad := result.BadPhoneNumberList[0]
		return fmt.Errorf("thaibulksms: rejected %s: %s", bad.Number, bad.Message)
	}

	return nil
}
