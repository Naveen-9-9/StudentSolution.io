export interface Tool {
  _id: string;
  name: string;
  url: string;
  category: string;
  description: string;
  upvoteCount: number;
  averageRating: number;
  reviewCount: number;
  submittedBy: {
    _id: string;
    name: string;
  };
  tags: string[];
  createdAt: string;
  updatedAt: string;
  hasUpvoted?: boolean;
}

export interface PaginationData {
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CategoryData {
  _id: string; // Category name
  count: number;
}

export interface Comment {
  _id: string;
  toolId: string;
  userId: {
    _id: string;
    name: string;
  };
  text: string;
  rating?: number | null;
  parentId: string | null;
  upvoteCount: number;
  replies: Comment[];
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommentPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface UserProfile {
  _id: string;
  name: string;
  registeredAt: string;
  totalTools: number;
  totalUpvotes: number;
  impactScore: number;
}
