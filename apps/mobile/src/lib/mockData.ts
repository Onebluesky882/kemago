export type Category = "General" | "Recommendations" | "Lost & Found" | "Safety";

export type Post = {
  id: string;
  authorId: string;
  author: string;
  authorVerified: boolean;
  neighborhood: string;
  category: Category;
  body: string;
  postedAt: string;
  likeCount: number;
  replyCount: number;
  hasPoll?: boolean;
};

export type LocalEvent = {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  goingCount: number;
  host: string;
  hostVerified: boolean;
};

export type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  timeLabel: string;
  unread: boolean;
};

export type JobKind = "Job" | "Announcement";

export type JobPost = {
  id: string;
  title: string;
  kind: JobKind;
  posterName: string;
  posterVerified: boolean;
  location: string;
  postedAt: string;
};

export type SportActivity = {
  id: string;
  title: string;
  sport: string;
  dateLabel: string;
  location: string;
  hostName: string;
  hostVerified: boolean;
  spotsLeft: number;
};

export type Club = {
  id: string;
  name: string;
  category: string;
  memberCount: number;
  description: string;
  joined: boolean;
};

export const currentUser = {
  id: "u_0",
  name: "Jordan Lee",
  neighborhood: "Elm Street",
  initials: "JL",
  postCount: 12,
  eventCount: 3,
  verified: true,
};

export const posts: Post[] = [
  {
    id: "p_1",
    authorId: "u_mock_1",
    author: "Sarah T.",
    authorVerified: true,
    neighborhood: "Elm Street",
    category: "Lost & Found",
    body: "Found a gray tabby cat near the corner of Elm and 3rd this morning. No collar. He's friendly and safe with me for now — message if he's yours!",
    postedAt: "1h ago",
    likeCount: 14,
    replyCount: 6,
  },
  {
    id: "p_2",
    authorId: "u_mock_2",
    author: "Marcus O.",
    authorVerified: true,
    neighborhood: "Elm Street",
    category: "Recommendations",
    body: "Anyone know a reliable plumber for a slow kitchen drain? Used someone from the app before but lost the number.",
    postedAt: "3h ago",
    likeCount: 3,
    replyCount: 9,
  },
  {
    id: "p_3",
    authorId: "u_mock_3",
    author: "Priya K.",
    authorVerified: true,
    neighborhood: "Elm Street",
    category: "Safety",
    body: "Heads up — porch package theft reported on Maple Ave last night. Ring camera footage shared with local PD. Keep an eye out.",
    postedAt: "5h ago",
    likeCount: 27,
    replyCount: 11,
  },
  {
    id: "p_4",
    authorId: "u_mock_4",
    author: "Dan W.",
    authorVerified: false,
    neighborhood: "Elm Street",
    category: "General",
    body: "The farmers market is back this Saturday at the park entrance, 8am–1pm. First one of the season!",
    postedAt: "1d ago",
    likeCount: 41,
    replyCount: 4,
  },
];

export const events: LocalEvent[] = [
  {
    id: "e_1",
    title: "Neighborhood Cleanup Day",
    dateLabel: "Sat, Aug 29 · 9:00 AM",
    location: "Elm Street Park",
    goingCount: 23,
    host: "Elm Street Association",
    hostVerified: true,
  },
  {
    id: "e_2",
    title: "Summer Block Party",
    dateLabel: "Sun, Sep 6 · 4:00 PM",
    location: "Maple Ave (closed to traffic)",
    goingCount: 58,
    host: "Priya K.",
    hostVerified: true,
  },
  {
    id: "e_3",
    title: "Kids' Bike Safety Class",
    dateLabel: "Sat, Sep 12 · 10:00 AM",
    location: "Community Center",
    goingCount: 9,
    host: "Elm Street PTA",
    hostVerified: true,
  },
];

export const jobPosts: JobPost[] = [
  {
    id: "j_1",
    title: "Part-time dog walker needed, weekday mornings",
    kind: "Job",
    posterName: "Priya K.",
    posterVerified: true,
    location: "Elm Street",
    postedAt: "2h ago",
  },
  {
    id: "j_2",
    title: "Community center front desk volunteer (Sat only)",
    kind: "Announcement",
    posterName: "Elm Street Association",
    posterVerified: true,
    location: "Community Center",
    postedAt: "6h ago",
  },
  {
    id: "j_3",
    title: "Looking for a math tutor for a 9th grader",
    kind: "Job",
    posterName: "Dan W.",
    posterVerified: false,
    location: "Maple Ave",
    postedAt: "1d ago",
  },
  {
    id: "j_4",
    title: "Street parking permit renewal deadline moved to Sep 15",
    kind: "Announcement",
    posterName: "Elm Street Association",
    posterVerified: true,
    location: "Elm Street",
    postedAt: "2d ago",
  },
];

export const sportActivities: SportActivity[] = [
  {
    id: "s_1",
    title: "Sunday morning 5-a-side football",
    sport: "Football",
    dateLabel: "Sun, Aug 30 · 7:00 AM",
    location: "Elm Street Park Field",
    hostName: "Marcus O.",
    hostVerified: true,
    spotsLeft: 3,
  },
  {
    id: "s_2",
    title: "Beginner-friendly badminton meetup",
    sport: "Badminton",
    dateLabel: "Wed, Sep 2 · 6:30 PM",
    location: "Community Center Gym",
    hostName: "Sarah T.",
    hostVerified: true,
    spotsLeft: 6,
  },
  {
    id: "s_3",
    title: "Weekend cycling group, 20km loop",
    sport: "Cycling",
    dateLabel: "Sat, Sep 5 · 8:00 AM",
    location: "Elm Street Park Entrance",
    hostName: "Jordan Lee",
    hostVerified: true,
    spotsLeft: 10,
  },
];

export const clubs: Club[] = [
  {
    id: "cl_1",
    name: "Elm Street Runners",
    category: "Sport & Fitness",
    memberCount: 42,
    description: "Casual running club, meets three times a week around the park loop.",
    joined: true,
  },
  {
    id: "cl_2",
    name: "Neighborhood Garden Club",
    category: "Hobby",
    memberCount: 18,
    description: "Sharing tips, seeds, and produce from our community garden plots.",
    joined: false,
  },
  {
    id: "cl_3",
    name: "Elm Street Book Circle",
    category: "Hobby",
    memberCount: 27,
    description: "Monthly meetup to discuss a new book, rotating houses each time.",
    joined: true,
  },
];

export const conversations: Conversation[] = [
  {
    id: "c_1",
    name: "Elm Street Neighbors",
    lastMessage: "Marcus: Thanks, calling them tomorrow",
    timeLabel: "9:41 AM",
    unread: true,
  },
  {
    id: "c_2",
    name: "Sarah T.",
    lastMessage: "You: Sounds good, see you at 6",
    timeLabel: "Yesterday",
    unread: false,
  },
  {
    id: "c_3",
    name: "Cleanup Day Volunteers",
    lastMessage: "Priya: Bringing extra gloves, who needs some?",
    timeLabel: "Yesterday",
    unread: true,
  },
];
