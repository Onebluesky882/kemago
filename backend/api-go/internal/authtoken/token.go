// Package authtoken issues and verifies the Bearer/JWT tokens used across
// Coarea per SECURITY_RULES.md (Bearer-only, no cookies). This is a
// deliberately minimal HS256 implementation — not Authula's jwt plugin,
// which requires adopting its session plugin + JWKS key rotation +
// migration set too. Revisit if refresh tokens or key rotation become a
// real requirement; until then this is enough to protect routes.
package authtoken

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type Claims struct {
	UserID     int64  `json:"user_id"`
	Identifier string `json:"identifier"`
	jwt.RegisteredClaims
}

type Issuer struct {
	secret []byte
	ttl    time.Duration
}

func NewIssuer(secret string, ttl time.Duration) *Issuer {
	return &Issuer{secret: []byte(secret), ttl: ttl}
}

func (i *Issuer) Issue(userID int64, identifier string) (string, error) {
	now := time.Now()
	claims := Claims{
		UserID:     userID,
		Identifier: identifier,
		RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(now),
			ExpiresAt: jwt.NewNumericDate(now.Add(i.ttl)),
		},
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(i.secret)
}

func (i *Issuer) Verify(tokenString string) (*Claims, error) {
	claims := &Claims{}
	token, err := jwt.ParseWithClaims(tokenString, claims, func(t *jwt.Token) (any, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, errors.New("authtoken: unexpected signing method")
		}
		return i.secret, nil
	})
	if err != nil {
		return nil, err
	}
	if !token.Valid {
		return nil, errors.New("authtoken: invalid token")
	}
	return claims, nil
}
