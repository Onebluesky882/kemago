package db

import (
	"time"

	"github.com/uptrace/bun"
)

type Room struct {
	bun.BaseModel `bun:"table:rooms"`

	ID        string    `bun:"id,pk"`
	Name      string    `bun:"name,notnull"`
	CreatedBy string    `bun:"created_by,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}

type Post struct {
	bun.BaseModel `bun:"table:posts"`

	ID        string    `bun:"id,pk"`
	RoomID    string    `bun:"room_id,notnull"`
	AuthorID  string    `bun:"author_id,notnull"`
	Category  string    `bun:"category,notnull"`
	Body      string    `bun:"body,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}

type Comment struct {
	bun.BaseModel `bun:"table:comments"`

	ID        string    `bun:"id,pk"`
	PostID    string    `bun:"post_id,notnull"`
	AuthorID  string    `bun:"author_id,notnull"`
	Body      string    `bun:"body,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}

type Like struct {
	bun.BaseModel `bun:"table:likes"`

	PostID    string    `bun:"post_id,pk"`
	UserID    string    `bun:"user_id,pk"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}
