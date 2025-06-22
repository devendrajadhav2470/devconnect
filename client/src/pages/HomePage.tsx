import React, { useState } from 'react';
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

interface UserSuggestion {
  id: string;
  name: string;
  avatarUrl: string;
  title: string;
}

// Mock data for the feed and suggestions, designed for a "DevConnect" platform
const mockPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Jane Doe',
      avatarUrl: 'https://i.pravatar.cc/150?img=47',
      handle: '@janedev',
    },
    timestamp: '2 hours ago',
    content: 'Just finished integrating a new CI/CD pipeline using GitHub Actions! The automation is a game changer for deployment efficiency. Highly recommend exploring it for your projects! #DevOps #GitHubActions #CI/CD',
    likes: 120,
    comments: 15,
    shares: 5,
    hashtags: ['DevOps', 'GitHubActions', 'CI/CD'],
  },
  {
    id: '2',
    author: {
      name: 'John Smith',
      avatarUrl: 'https://i.pravatar.cc/150?img=68',
      handle: '@jsmith_tech',
    },
    timestamp: '5 hours ago',
    content: 'Struggling with a complex React component state management. Thinking about migrating from useState to useReducer for more predictable state transitions. Any tips or best practices? #React #Frontend #JavaScript',
    imageUrl: 'https://via.placeholder.com/600x300/e0e0e0/ffffff?text=React+Code+Snippet', // Example image
    likes: 85,
    comments: 20,
    shares: 3,
    hashtags: ['React', 'Frontend', 'JavaScript'],
  },
  {
    id: '3',
    author: {
      name: 'Alice Wonderland',
      avatarUrl: 'https://i.pravatar.cc/150?img=25',
      handle: '@alice_codes',
    },
    timestamp: '1 day ago',
    content: 'Explored the new features in TypeScript 5.0 today. Decorators and const type parameters are going to make a huge difference in my projects! Loving the improvements. #TypeScript #Programming #WebDev',
    likes: 210,
    comments: 30,
    shares: 10,
    hashtags: ['TypeScript', 'Programming', 'WebDev'],
  },
  {
    id: '4',
    author: {
      name: 'Alex Doe',
      avatarUrl: 'https://i.pravatar.cc/150?img=32', // Matches previous profile page avatar
      handle: '@alexdoe',
    },
    timestamp: '2 days ago',
    content: 'Currently working on improving authentication flow for DevConnect. Implementing JWT refresh tokens for better security and user experience. It\'s a challenging but rewarding task! #Security #Auth #DevConnect',
    likes: 150,
    comments: 25,
    shares: 7,
    hashtags: ['Security', 'Auth', 'DevConnect'],
  },
];

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

  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (postContent.trim()) {
      // In a real application, this would dispatch an action to add the post to the backend
      console.log('New post submitted:', postContent);
      setPostContent(''); // Clear the input
      alert('Post submitted! (frontend only simulation)');
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
            {mockPosts.map((post) => (
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
