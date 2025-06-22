import React from 'react';

interface Post {
  author: {username: string};
  avatar?: string;
  createdAt: string;
  image: string;
  content: string;
}

interface PostCardProps {
  post: Post;
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <div className="card mb-4 shadow-sm">
      {/* Header */}
      <div className="card-header d-flex align-items-center">
        <img
          src={post.avatar || 'https://via.placeholder.com/40x40?text=U'}
          alt="avatar"
          className="rounded-circle me-3"
          width="40"
          height="40"
        />
        <div>
          <h6 className="mb-0">{"username"}</h6>
          <small className="text-muted">{post.createdAt}</small>
        </div>
      </div>

      {/* Image */}
      {post.image && (
        <img
          src={post.image}
          alt="Post content"
          className="card-img-top"
          style={{ objectFit: 'cover', maxHeight: '500px' }}
        />
      )}

      {/* Caption */}
      <div className="card-body">
        <p className="card-text">{post.content}</p>
      </div>

      {/* Actions */}
      <div className="card-footer bg-white d-flex gap-3">
        <button className="btn btn-outline-primary btn-sm">
          👍 Like
        </button>
        <button className="btn btn-outline-secondary btn-sm">
          💬 Comment
        </button>
      </div>
    </div>
  );
};

export default PostCard;
