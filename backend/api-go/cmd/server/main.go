package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/coder/websocket"

	"github.com/onebluesky882/kemago/backend/api-go/internal/blocks"
	"github.com/onebluesky882/kemago/backend/api-go/internal/clubs"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
	"github.com/onebluesky882/kemago/backend/api-go/internal/feed"
	"github.com/onebluesky882/kemago/backend/api-go/internal/friends"
	"github.com/onebluesky882/kemago/backend/api-go/internal/hub"
	"github.com/onebluesky882/kemago/backend/api-go/internal/polls"
)

// withCORS is Bearer-only, same reasoning as backend/better-auth's
// disableCSRFCheck — no cookies anywhere, so a wildcard origin has no
// credential-leak surface.
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func main() {
	port := os.Getenv("WS_PORT")
	if port == "" {
		port = "3001"
	}

	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	database := dbpkg.Open(databaseURL)
	if err := dbpkg.Migrate(context.Background(), database); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	h := hub.New()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	feed.Register(mux, database)
	clubs.Register(mux, database)
	polls.Register(mux, database)
	blocks.Register(mux, database)
	friends.Register(mux, database)

	// TODO(stage-10-chat): room currently comes from an unauthenticated
	// query param — once Bearer auth exists, verify the token and derive
	// room membership from the user's actual conversations instead of
	// trusting whatever ?room= the client sends.
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		room := r.URL.Query().Get("room")
		if room == "" {
			http.Error(w, "missing ?room=", http.StatusBadRequest)
			return
		}

		conn, err := websocket.Accept(w, r, nil)
		if err != nil {
			log.Printf("ws: accept failed: %v", err)
			return
		}
		defer conn.CloseNow()

		h.Join(r.Context(), conn, room)
	})

	log.Printf("api-go listening on :%s", port)
	if err := http.ListenAndServe(":"+port, withCORS(mux)); err != nil {
		log.Fatalf("listen: %v", err)
	}
}
