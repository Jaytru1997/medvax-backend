const Blog = require("../models/Blog");
const { saveFile } = require("../utils/file");
const fs = require("fs");

// Create a new blog post
exports.createPost = async (req, res) => {
  try {
    const { title, content, category, language, excerpt } = req.body;
    const file = req.files.banner;
    //save file to public folder then return string
    const banner = await saveFile(file, "blog-banners");
    console.log(banner);

    const author = req.user.id;
    const newPost = new Blog({
      title,
      content,
      author,
      category: category.toLowerCase() || "other",
      excerpt,
      banner,
      language: language.toLowerCase() || "en",
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
    const { title, content, category, language, excerpt } = req.body;
    const file = req.files.banner;
    // delete old banner if it exists
    const oldPost = await Blog.findById(req.params.id);
    if (oldPost.banner) {
      fs.unlinkSync(oldPost.banner);
    }
    const banner = await saveFile(file, "blog-banners");

    const updatedPost = await Blog.findByIdAndUpdate(
      req.params.id,
      { title, content, category, language, excerpt, updatedAt: Date.now() },
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
