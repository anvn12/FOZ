export interface User {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface Reply {
  id: string;
  content: string;
  likeCount: number;
  createdAt: string;
  author: User;
  likedByMe: boolean;
}

export interface Thread {
  id: string;
  content: string;
  imageUrl: string | null;
  likeCount: number;
  replyCount: number;
  createdAt: string;
  author: User;
  replies: Reply[];
  likedByMe: boolean;
  followingAuthor: boolean;
}

export interface FeedPage {
  threads: Thread[];
  nextCursor: string | null;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiErrorBody {
  error: {
    message: string;
    code: string;
  };
}
