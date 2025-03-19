const Blog = require("../models/Blog");

// Create a new blog post
exports.createPost = async (req, res) => {
  try {
    const { title, content, categories, tags, language } = req.body;
    const author = req.user.id;
    const newPost = new Blog({
      title,
      content,
      author,
      categories,
      tags,
      language,
    });

    await newPost.save();
    res.status(201).json({ message: "Blog post created", post: newPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all blog posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Blog.find().populate("author", "name email");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a single blog post
exports.getPostById = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id).populate(
      "author",
      "name email"
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a blog post
exports.updatePost = async (req, res) => {
  try {
    const { title, content, categories, tags, language } = req.body;
    const updatedPost = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, categories, tags, language, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ message: "Post updated", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a blog post
exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Blog.findByIdAndDelete(req.params.id);
    if (!deletedPost)
      return res.status(404).json({ message: "Post not found" });

    res.status(200).json({ message: "Post deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Add a comment to a blog post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({ user: req.user.id, text });
    await post.save();

    res.status(201).json({ message: "Comment added", post });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// Get comments for a post
exports.getComments = async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    res.status(200).json(post.comments);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
