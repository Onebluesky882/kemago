package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/coder/websocket"

	"github.com/onebluesky882/kemago/backend/api-go/internal/authcheck"
	"github.com/onebluesky882/kemago/backend/api-go/internal/blocks"
	"github.com/onebluesky882/kemago/backend/api-go/internal/clubs"
	dbpkg "github.com/onebluesky882/kemago/backend/api-go/internal/db"
	"github.com/onebluesky882/kemago/backend/api-go/internal/feed"
	"github.com/onebluesky882/kemago/backend/api-go/internal/friends"
	"github.com/onebluesky882/kemago/backend/api-go/internal/hub"
	"github.com/onebluesky882/kemago/backend/api-go/internal/polls"
	"github.com/onebluesky882/kemago/backend/api-go/internal/storage"
	"github.com/onebluesky882/kemago/backend/api-go/internal/stories"
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

	feed.Register(mux, database, h)
	clubs.Register(mux, database)
	polls.Register(mux, database, h)
	blocks.Register(mux, database)
	friends.Register(mux, database, h)

	// Optional — R2/Stories isn't required to run everything else. Skips
	// registration entirely (POST/GET /api/stories* just 404) rather than
	// log.Fatal, since a fresh environment without an R2 bucket set up yet
	// shouldn't be unable to start the whole service over one unfinished
	// feature.
	if r2AccountID := os.Getenv("R2_ACCOUNT_ID"); r2AccountID != "" {
		storageClient := storage.New(storage.Config{
			AccountID:       r2AccountID,
			AccessKeyID:     os.Getenv("R2_ACCESS_KEY_ID"),
			SecretAccessKey: os.Getenv("R2_SECRET_ACCESS_KEY"),
			Bucket:          os.Getenv("R2_BUCKET_NAME"),
			PublicBaseURL:   os.Getenv("R2_PUBLIC_URL"),
		})
		stories.Register(mux, database, storageClient)
		log.Println("stories: R2 configured, routes registered")
	} else {
		log.Println("stories: R2_ACCOUNT_ID not set, /api/stories* disabled")
	}

	// Two ways to connect:
	//   /ws?token=<bearer>   — personal channel, server-derived as
	//                          "user:<id>" from the verified token (never
	//                          trusts a client-supplied user id). Receives
	//                          real-time events pushed by other packages
	//                          via hub.Broadcast (new posts/comments/likes
	//                          on "feed:all", friend requests/accepts on
	//                          "user:<id>").
	//   /ws?room=<room>      — TODO(stage-10-chat): unauthenticated raw
	//                          relay for open group chat rooms, unchanged
	//                          from before. Verify the token here too once
	//                          real chat-room membership exists.
	mux.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		var room string
		if token := r.URL.Query().Get("token"); token != "" {
			user, ok := authcheck.UserForToken(r.Context(), database, token)
			if !ok {
				http.Error(w, "invalid token", http.StatusUnauthorized)
				return
			}
			room = "user:" + user.ID
		} else {
			room = r.URL.Query().Get("room")
			if room == "" {
				http.Error(w, "missing ?token= or ?room=", http.StatusBadRequest)
				return
			}
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
