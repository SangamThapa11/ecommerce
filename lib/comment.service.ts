export interface IComment {
  _id: string;
  comment: string;
  rating: number;
  user: {
    _id: string;
    name: string;
    email: string;
    image?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ICommentResponse {
  data: IComment[];
  message: string;
  status: string;
  options: {
    pagination: {
      page: number;
      limit: number;
      total: number;
      noOfPages: number;
    };
  };
}

export interface IRatingStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: number[];
  _id?: string;
}

const API_BASE_URL = "http://localhost:9005/api/v1";

class CommentService {
  async getComments(productId: string, page = 1, limit = 10) {
    const response = await fetch(
      `${API_BASE_URL}/comments/product/${productId}?page=${page}&limit=${limit}`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Error ${response.status}`);
    }
    return response.json();
  }

  async addComment(
    productId: string,
    commentData: { comment: string; rating: number },
    token?: string
  ) {
    if (!token) {
      throw new Error("You must be logged in to add a comment");
    }

    const response = await fetch(
      `${API_BASE_URL}/comments/product/${productId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(commentData),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Error ${response.status}`);
    }

    return response.json();
  }

  async getRatingStats(productId: string) {
    const response = await fetch(
      `${API_BASE_URL}/comments/product/${productId}/rating`,
      { headers: { "Content-Type": "application/json" } }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || `Error ${response.status}`);
    }
    return response.json();
  }
}

const commentSvc = new CommentService();
export default commentSvc;