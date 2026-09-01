package feed

import "testing"

// fakeResult is a minimal sql.Result for testing isNewLike without a real
// database round-trip.
type fakeResult struct {
	rowsAffected int64
	err          error
}

func (f fakeResult) LastInsertId() (int64, error) { return 0, nil }
func (f fakeResult) RowsAffected() (int64, error) { return f.rowsAffected, f.err }

// Regression test for the bug where likePost pushed a notification even
// when the like INSERT hit its ON CONFLICT DO NOTHING (i.e. the like
// already existed), spamming duplicate notifications on retries/double-taps.
func TestIsNewLike(t *testing.T) {
	cases := []struct {
		name string
		res  fakeResult
		want bool
	}{
		{"new like inserts exactly one row", fakeResult{rowsAffected: 1}, true},
		{"duplicate like (ON CONFLICT DO NOTHING) affects zero rows", fakeResult{rowsAffected: 0}, false},
		{"RowsAffected error is treated as no new like", fakeResult{rowsAffected: 0, err: errBoom}, false},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := isNewLike(tc.res); got != tc.want {
				t.Fatalf("isNewLike(%+v) = %v, want %v", tc.res, got, tc.want)
			}
		})
	}
}

var errBoom = &testError{"boom"}

type testError struct{ msg string }

func (e *testError) Error() string { return e.msg }
