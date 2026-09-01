package chat

import "testing"

// Regression test for the invariant the whole DM-dedup mechanism depends
// on: dmKey(A, B) and dmKey(B, A) must produce the same key, or two users
// opening a DM with each other in "opposite order" (e.g. two different
// clients hitting POST /api/conversations at once) would each pass the
// partial-unique-index check and end up with two separate conversations
// instead of sharing one.
func TestDMKeyIsOrderIndependent(t *testing.T) {
	a, b := "user_alice", "user_bob"

	forward := dmKey(a, b)
	backward := dmKey(b, a)

	if forward != backward {
		t.Fatalf("dmKey(a, b) = %q, dmKey(b, a) = %q — want equal", forward, backward)
	}
	if forward == "" {
		t.Fatal("dmKey returned empty string")
	}
}

func TestDMKeyDiffersForDifferentPairs(t *testing.T) {
	k1 := dmKey("user_alice", "user_bob")
	k2 := dmKey("user_alice", "user_carol")

	if k1 == k2 {
		t.Fatalf("dmKey collided for different pairs: %q", k1)
	}
}
