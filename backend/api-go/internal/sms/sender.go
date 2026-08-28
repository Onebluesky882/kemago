package sms

import "context"

// Sender is the SMS transport abstraction internal/otp depends on — this
// is what makes swapping providers a one-line change in main.go instead of
// touching auth logic. Both Client (ThaiBulkSMS) and SMSMKTClient
// implement it.
type Sender interface {
	Send(ctx context.Context, msisdn, message string) error
}
