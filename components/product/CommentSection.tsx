"use client";

import { useEffect, useState } from "react";
import { Form, Input, Button, List, Avatar, Card, Rate, Row, Col, Statistic, Progress } from "antd";
import commentSvc, { IComment, IRatingStats } from "@/lib/comment.service";
import { AiOutlineUser } from "react-icons/ai";
import { useAuth } from "@/context/AuthContext";

const { TextArea } = Input;

export default function CommentSection({ productId }: { productId: string }) {
  const [comments, setComments] = useState<IComment[]>([]);
  const [ratingStats, setRatingStats] = useState<IRatingStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComments, setTotalComments] = useState(0);
  const { loggedInUser } = useAuth();

  useEffect(() => {
    fetchComments();
    fetchRatingStats();
  }, [productId]);

  const fetchComments = async (page = 1) => {
    setLoading(true);
    try {
      const response = await commentSvc.getComments(productId, page);
      setComments(response.data);
      setTotalComments(response.options.pagination.total);
      setCurrentPage(page);
    } catch (err) {
      console.error("Failed to load comments", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatingStats = async () => {
    try {
      const response = await commentSvc.getRatingStats(productId);
      setRatingStats(response.data);
    } catch (err) {
      console.error("Failed to load rating stats", err);
    }
  };

  const onFinish = async (values: { comment: string; rating: number }) => {
    if (!loggedInUser?.token) {
      alert("Please log in to submit a comment");
      return;
    }
    const token = loggedInUser.token || localStorage.getItem("token");

      if (!token) {
    alert("Session expired. Please log in again.");
    return;
  }

    setSubmitting(true);
    try {
      const newComment = await commentSvc.addComment(
        productId,
        values,
        token 
      );
      setComments([newComment.data, ...comments]);
      await fetchRatingStats();
      form.resetFields();
    } catch (err: any) {
      console.error("Failed to add comment:", err.message);
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const [form] = Form.useForm();

  // Calculate rating distribution
  const ratingDistribution = ratingStats?.ratingDistribution.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>) || {};

  return (
    <div className="mt-16 w-full">
      <Card
        title={<h2 className="text-2xl font-bold">Customer Reviews</h2>}
        variant="borderless" // Changed from bordered={false}
        className="shadow-md rounded-lg"
      >
        {/* Rating Overview */}
        {ratingStats && (
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <Row gutter={24}>
              <Col xs={24} sm={8} className="text-center">
                <div className="mb-2">
                  <span className="text-4xl font-bold">{ratingStats.averageRating.toFixed(1)}</span>
                  <span className="text-lg text-gray-500">/5</span>
                </div>
                <Rate disabled value={ratingStats.averageRating} allowHalf className="text-xl" />
                <p className="mt-2 text-gray-600">{ratingStats.totalReviews} reviews</p>
              </Col>
              <Col xs={24} sm={16}>
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center mb-2">
                    <span className="w-12 text-sm text-gray-600">{star} stars</span>
                    <Progress
                      percent={
                        ratingStats.totalReviews > 0
                          ? Math.round(((ratingDistribution[star] || 0) / ratingStats.totalReviews) * 100)
                          : 0
                      }
                      showInfo={false}
                      className="flex-1 mx-2"
                      strokeColor="#fadb14"
                    />
                    <span className="w-12 text-sm text-gray-600">
                      {ratingDistribution[star] || 0}
                    </span>
                  </div>
                ))}
              </Col>
            </Row>
          </div>
        )}

        {/* Comment Form */}
        <Form form={form} onFinish={onFinish} layout="vertical" className="mb-8">
          <Form.Item
            name="rating"
            label="Your Rating"
            rules={[{ required: true, message: "Please select a rating" }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item
            name="comment"
            label="Your Review"
            rules={[{ required: true, message: "Please write your review" }]}
          >
            <TextArea
              rows={4}
              placeholder="Share your experience with this product..."
              className="rounded-lg"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={submitting}>
              Submit Review
            </Button>
          </Form.Item>
        </Form>

        {/* Comment List */}
        <div>
          <h3 className="text-xl font-semibold mb-4">
            Customer Reviews ({totalComments})
          </h3>
          <List
            itemLayout="vertical"
            dataSource={comments}
            loading={loading}
            pagination={{
              onChange: (page) => {
                fetchComments(page);
              },
              pageSize: 10,
              total: totalComments,
              current: currentPage,
              showSizeChanger: false,
            }}
            renderItem={(comment) => (
              <List.Item key={comment._id} className="px-0 py-6 border-b">
                <List.Item.Meta
                  avatar={
                    <Avatar
                      size={48}
                      src={comment.user.image}
                      icon={!comment.user.image && <AiOutlineUser />}
                    />
                  }
                  title={
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold">{comment.user.name}</span>
                      <div className="flex items-center">
                        <Rate disabled value={comment.rating} className="text-sm" />
                        <span className="ml-2 text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  }
                  description={<p className="text-gray-700 mt-2">{comment.comment}</p>}
                />
              </List.Item>
            )}
            locale={{ emptyText: "No reviews yet. Be the first to review this product!" }}
          />
        </div>
      </Card>
    </div>
  );
}