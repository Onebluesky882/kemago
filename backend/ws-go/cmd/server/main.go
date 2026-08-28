package main

import (
	"log"
	"net/http"
	"os"

	"github.com/coder/websocket"

	"github.com/onebluesky882/coarea/backend/ws-go/internal/hub"
)

func main() {
	port := os.Getenv("WS_PORT")
	if port == "" {
		port = "3001"
	}

	h := hub.New()

	mux := http.NewServeMux()

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

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

	log.Printf("ws-go listening on :%s", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatalf("listen: %v", err)
	}
}
