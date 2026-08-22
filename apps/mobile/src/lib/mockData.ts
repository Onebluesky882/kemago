export type Category = "General" | "Recommendations" | "Lost & Found" | "Safety";

export type Post = {
  id: string;
  author: string;
  neighborhood: string;
  category: Category;
  body: string;
  postedAt: string;
  likeCount: number;
  replyCount: number;
};

export type LocalEvent = {
  id: string;
  title: string;
  dateLabel: string;
  location: string;
  goingCount: number;
  host: string;
};

export type Conversation = {
  id: string;
  name: string;
  lastMessage: string;
  timeLabel: string;
  unread: boolean;
};

export const currentUser = {
  id: "u_0",
  name: "Jordan Lee",
  neighborhood: "Elm Street",
  initials: "JL",
  postCount: 12,
  eventCount: 3,
};

export const posts: Post[] = [
  {
    id: "p_1",
    author: "Sarah T.",
    neighborhood: "Elm Street",
    category: "Lost & Found",
    body: "Found a gray tabby cat near the corner of Elm and 3rd this morning. No collar. He's friendly and safe with me for now — message if he's yours!",
    postedAt: "1h ago",
    likeCount: 14,
    replyCount: 6,
  },
  {
    id: "p_2",
    author: "Marcus O.",
    neighborhood: "Elm Street",
    category: "Recommendations",
    body: "Anyone know a reliable plumber for a slow kitchen drain? Used someone from the app before but lost the number.",
    postedAt: "3h ago",
    likeCount: 3,
    replyCount: 9,
  },
  {
    id: "p_3",
    author: "Priya K.",
    neighborhood: "Elm Street",
    category: "Safety",
    body: "Heads up — porch package theft reported on Maple Ave last night. Ring camera footage shared with local PD. Keep an eye out.",
    postedAt: "5h ago",
    likeCount: 27,
    replyCount: 11,
  },
  {
    id: "p_4",
    author: "Dan W.",
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
  },
  {
    id: "e_2",
    title: "Summer Block Party",
    dateLabel: "Sun, Sep 6 · 4:00 PM",
    location: "Maple Ave (closed to traffic)",
    goingCount: 58,
    host: "Priya K.",
  },
  {
    id: "e_3",
    title: "Kids' Bike Safety Class",
    dateLabel: "Sat, Sep 12 · 10:00 AM",
    location: "Community Center",
    goingCount: 9,
    host: "Elm Street PTA",
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
