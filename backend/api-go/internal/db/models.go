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

type Club struct {
	bun.BaseModel `bun:"table:clubs"`

	ID          string    `bun:"id,pk"`
	Name        string    `bun:"name,notnull"`
	Description string    `bun:"description,notnull,default:''"`
	Category    string    `bun:"category,notnull,default:''"`
	LeaderID    string    `bun:"leader_id,notnull"`
	CreatedAt   time.Time `bun:"created_at,notnull,default:now()"`
}

type ClubMember struct {
	bun.BaseModel `bun:"table:club_members"`

	ClubID   string    `bun:"club_id,pk"`
	UserID   string    `bun:"user_id,pk"`
	JoinedAt time.Time `bun:"joined_at,notnull,default:now()"`
}

// Poll attaches a single question to an existing post — one poll per post
// (post_id is UNIQUE), enforced at the DB level.
type Poll struct {
	bun.BaseModel `bun:"table:polls"`

	ID        string    `bun:"id,pk"`
	PostID    string    `bun:"post_id,notnull,unique"`
	Question  string    `bun:"question,notnull"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}

// PollOption is one vote-able choice on a Poll, ordered by Position.
type PollOption struct {
	bun.BaseModel `bun:"table:poll_options"`

	ID       string `bun:"id,pk"`
	PollID   string `bun:"poll_id,notnull"`
	Label    string `bun:"label,notnull"`
	Position int    `bun:"position,notnull,default:0"`
}

// PollVote is one user's current choice on a poll — the composite PK
// (poll_id, user_id) is what makes voting again an upsert instead of a
// second row: PK(pollId, userId) means one user can only ever have one
// vote per poll.
type PollVote struct {
	bun.BaseModel `bun:"table:poll_votes"`

	PollID    string    `bun:"poll_id,pk"`
	OptionID  string    `bun:"option_id,notnull"`
	UserID    string    `bun:"user_id,pk"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}

// Block records that BlockerID has blocked BlockedID. Feed-listing queries
// filter out posts authored by anyone in the caller's block list, via
// internal/blocks.BlockedIDs.
type Block struct {
	bun.BaseModel `bun:"table:blocks"`

	BlockerID string    `bun:"blocker_id,pk"`
	BlockedID string    `bun:"blocked_id,pk"`
	CreatedAt time.Time `bun:"created_at,notnull,default:now()"`
}

// Friendship is a directed request row: RequesterID sent it, AddresseeID
// receives it. Status starts "pending"; becomes "accepted" once the
// addressee accepts (declines just delete the row — no history kept).
// Mutual requests (both sides request each other before either accepts)
// auto-resolve to "accepted" — see internal/friends.
type Friendship struct {
	bun.BaseModel `bun:"table:friendships"`

	RequesterID string    `bun:"requester_id,pk"`
	AddresseeID string    `bun:"addressee_id,pk"`
	Status      string    `bun:"status,notnull,default:'pending'"`
	CreatedAt   time.Time `bun:"created_at,notnull,default:now()"`
	UpdatedAt   time.Time `bun:"updated_at,notnull,default:now()"`
}

// RoomMember tracks who belongs to a room — rooms previously had no
// membership concept at all (only CreatedBy), same gap Club/ClubMember
// filled for clubs.
type RoomMember struct {
	bun.BaseModel `bun:"table:room_members"`

	RoomID   string    `bun:"room_id,pk"`
	UserID   string    `bun:"user_id,pk"`
	JoinedAt time.Time `bun:"joined_at,notnull,default:now()"`
}
