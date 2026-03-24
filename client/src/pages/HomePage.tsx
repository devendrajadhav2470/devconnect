import React, { useEffect, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Image,
  ListGroup,
  Row
} from 'react-bootstrap';
import {
  ChatRightText,
  Hash,
  HeartFill,
  PlusCircle,
  Share
} from 'react-bootstrap-icons';
import { apiUrl } from '../config';
import { useAuth } from '../contexts/AuthContext';

// Define TypeScript interfaces for type safety
interface Post {
  id: string;
  author: {
    name: string;
    avatarUrl: string;
    handle: string;
  };
  timestamp: string;
  content: string;
  imageUrl?: string; // Optional image for posts
  likes: number;
  comments: number;
  shares: number;
  hashtags?: string[];
}

type ApiPost = {
  _id: string;
  content: string;
  createdAt: string;
  media?: string[];
  author?: { username?: string; image?: string | null };
  likesCount?: number;
  commentsCount?: number;
};

function mapApiPostToPost(p: ApiPost): Post {
  return {
    id: String(p._id),
    author: {
      name: p.author?.username ?? 'User',
      avatarUrl: p.author?.image || 'https://via.placeholder.com/150?u=1',
      handle: `@${p.author?.username ?? 'user'}`,
    },
    timestamp: new Date(p.createdAt).toLocaleString(),
    content: p.content,
    imageUrl: p.media?.[0],
    likes: p.likesCount ?? 0,
    comments: p.commentsCount ?? 0,
    shares: 0,
  };
}

interface UserSuggestion {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
}

const mockSuggestions: UserSuggestion[] = [
  {
    id: 's1',
    name: 'Sarah Connor',
    avatarUrl: 'https://i.pravatar.cc/150?img=17',
    title: 'Senior DevOps Engineer',
  },
  {
    id: 's2',
    name: 'Michael Jordan',
    avatarUrl: 'https://i.pravatar.cc/150?img=34',
    title: 'Full-Stack Developer',
  },
  {
    id: 's3',
    name: 'Emily White',
    avatarUrl: 'https://i.pravatar.cc/150?img=40',
    title: 'UI/UX Designer',
  },
];

// Post component to render individual feed items
const PostCard: React.FC<{ post: Post }> = ({ post }) => {
  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Body>
        <div className="d-flex align-items-center mb-3">
          <Image src={post.author.avatarUrl} roundedCircle style={{ width: '50px', height: '50px', objectFit: 'cover' }} className="me-3" />
          <div>
            <Card.Title className="mb-0">{post.author.name}</Card.Title>
            <Card.Subtitle className="text-muted small">
              {post.author.handle} &bull; {post.timestamp}
            </Card.Subtitle>
          </div>
        </div>
        <Card.Text>
          {post.content.split(' ').map((word, index) => {
            if (word.startsWith('#')) {
              // Basic hashtag styling, in a real app this would link to a search
              return <span key={index} className="text-primary fw-bold me-1">{word}</span>;
            }
            return <span key={index}>{word} </span>;
          })}
        </Card.Text>
        {post.imageUrl && (
          <Image src={post.imageUrl} fluid className="mt-3 rounded" alt="Post content" />
        )}
        <div className="d-flex justify-content-around mt-3 border-top pt-3">
          <Button variant="light" className="d-flex align-items-center">
            <HeartFill className="me-1" /> {post.likes} Likes
          </Button>
          <Button variant="light" className="d-flex align-items-center">
            <ChatRightText className="me-1" /> {post.comments} Comments
          </Button>
          <Button variant="light" className="d-flex align-items-center">
            <Share className="me-1" /> {post.shares} Shares
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

const HomePage = () => {
  const [postContent, setPostContent] = useState('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [feedError, setFeedError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setFeedLoading(true);
      setFeedError('');
      try {
        const res = await fetch(apiUrl('/api/posts'));
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to load posts');
        if (!cancelled && Array.isArray(data)) {
          setPosts(data.map(mapApiPostToPost));
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setFeedError(err instanceof Error ? err.message : 'Failed to load posts');
        }
      } finally {
        if (!cancelled) setFeedLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = postContent.trim();
    if (!trimmed) return;
    if (!token) {
      alert('Please log in to post.');
      return;
    }
    try {
      const res = await fetch(apiUrl('/api/posts'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to create post');
      setPostContent('');
      setPosts((prev) => [mapApiPostToPost(data as ApiPost), ...prev]);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create post');
    }
  };

  return (
    <div style={{ backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '20px 0' }}>
      <Container>
        <Row>
          {/* Main Content Column (Feed) */}
          <Col lg={8} className="order-lg-1">
            {/* Create Post Area */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <h5 className="mb-3">Share your DevUpdate!</h5>
                <Form onSubmit={handlePostSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="What's on your mind, developer?"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                    />
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button variant="primary" type="submit">
                      <PlusCircle className="me-2" />
                      Post DevUpdate
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>

            {/* Feed of Posts */}
            {feedLoading && (
              <p className="text-muted">Loading feed…</p>
            )}
            {feedError && !feedLoading && (
              <p className="text-danger">{feedError}</p>
            )}
            {!feedLoading && !feedError && posts.length === 0 && (
              <p className="text-muted">No posts yet. Be the first to share a DevUpdate!</p>
            )}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </Col>

          {/* Right Sidebar */}
          <Col lg={4} className="order-lg-2">
            {/* Suggestions Card */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-3">Who to follow</Card.Title>
                <ListGroup variant="flush">
                  {mockSuggestions.map((user) => (
                    <ListGroup.Item key={user.id} className="d-flex align-items-center py-2 px-0 border-0">
                      <Image src={user.avatarUrl} roundedCircle style={{ width: '40px', height: '40px', objectFit: 'cover' }} className="me-3" />
                      <div>
                        <h6 className="mb-0">{user.name}</h6>
                        <small className="text-muted">{user.title}</small>
                      </div>
                      <Button variant="outline-primary" size="sm" className="ms-auto">Follow</Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Trending Hashtags Card */}
            <Card className="mb-4 shadow-sm border-0">
              <Card.Body>
                <Card.Title className="mb-3">Trending DevTags</Card.Title>
                <ListGroup variant="flush">
                  {[
                    '#JavaScript', '#ReactJS', '#NodeJS', '#Python', '#MachineLearning', '#CloudComputing', '#DevOps', '#CyberSecurity'
                  ].map((tag, index) => (
                    <ListGroup.Item key={index} className="d-flex align-items-center py-2 px-0 border-0">
                      <Hash className="me-2 text-muted" />
                      <a href="#" className="text-decoration-none">{tag}</a>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>

            {/* Footer or Quick Links */}
            <div className="text-center text-muted small mt-4">
              <p>&copy; {new Date().getFullYear()} DevConnect. All rights reserved.</p>
              <p>
                <a href="#" className="text-muted text-decoration-none me-2">About</a> |
                <a href="#" className="text-muted text-decoration-none mx-2">Help</a> |
                <a href="#" className="text-muted text-decoration-none ms-2">Privacy</a>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;
