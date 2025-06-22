const Post = require('../models/Post');

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { content, media } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Post content is required.' });
    }
    const post = new Post({
      content,
      media: media || [],
      author: req.user.userId
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Get all posts (public feed)
exports.getAllPosts = async (req, res) => {
  console.log("getAllPosts");
  try {
    const posts = await Post.find()
      .populate('author', 'username email')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, media } = req.body;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }
    if (content) post.content = content;
    if (media) post.media = media;
    await post.save();
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.author.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized.' });
    }
    await post.remove();
    res.json({ message: 'Post deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Like a post
exports.likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.userId;
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: 'Post already liked.' });
    }
    post.likes.push(userId);
    await post.save();
    res.json({ message: 'Post liked.', likesCount: post.likes.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { content } = req.body;
    if (!content || content.trim() === '') {
      return res.status(400).json({ message: 'Comment content is required.' });
    }
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found.' });
    }
    const comment = {
      author: req.user.userId,
      content
    };
    post.comments.push(comment);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
};
