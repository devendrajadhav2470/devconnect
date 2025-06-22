import { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import PostCard from '../components/PostCard';
type Post = {
  _id: string;
  content: string;
  author: { username: string };
  createdAt: string;
  image: string;
  caption: string;
  likes: string[];
};

const Feed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch('http://localhost:3000/api/posts');
        console.log('Fetching posts from API:', res.url);
        console.log("hey");
        // Debugging line
        console.log(res);
        const data = await res.json();
        console.log(data);

        if (!res.ok) throw new Error(data.message || 'Failed to fetch posts');
        setPosts(data);
        
      } catch (err: any) {
        setError(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div>
      <h2 className="mb-4">Public Feed</h2>
      {posts.length === 0 && <div>No posts yet.</div>}
      {posts.map(post => (
        // <Card className="mb-3" key={post._id}>
        //   <Card.Body>
        //     <Card.Title>{post.author?.username || 'Unknown User'}</Card.Title>
        //     <Card.Text>{post.content}</Card.Text>
        //     <small className="text-muted">
        //       {new Date(post.createdAt).toLocaleString()} &middot; {post.likes.length} likes
        //     </small>
        //   </Card.Body>
        // </Card>
        
        <PostCard key={post._id} post={post} />
          // <Card>
          //   <CardHeader className="flex items-center gap-4">
          //     <img src={"https://images.unsplash.com/photo-1749909902516-786d8d846193?q=80&w=1166&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"} className="rounded-full w-10 h-10" />
          //     <div>
          //       <h2 className="font-bold">{"username"}</h2>
          //       <p className="text-sm text-gray-500">
          //         {formatDistanceToNow(new Date(post.createdAt))} ago
          //       </p>
          //     </div>
          //   </CardHeader>
          //   <CardText>{post.content}</CardText>
          //   <CardFooter>
          //     {/* <LikeButton postId={post._id} /> */}
          //     {"👍"}
          //   </CardFooter>
          // </Card>

      ))}
    </div>
  );
};

export default Feed;
