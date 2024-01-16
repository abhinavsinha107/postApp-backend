import express from "express";
import Post from "../models/post.model";
import User from "../models/user.model"

export const createPost = async (req: express.Request, res: express.Response) => {
  try {
    const { title, description, imageUrl } = req.body;
    const post = new Post({
      title,
      description,
      imageUrl,
      owner: req.userId,
    });
    await post.save();
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found...",
      });
    }
    user.posts.push(post._id);
    await user.save();
    res.status(201).json({
      message: "Post created successfully...",
      post
    });
  } catch (err) {
    res.status(500).json({
        message: "Error creating post..."
    });
  }
};

export const getAllPosts = async (req: express.Request, res: express.Response) => {
  try {
    const search = req.body.search || ""; // Default to an empty string if 'search' is not provided
    const page = parseInt(req.body.page) || 1; // Default to page 1 if 'page' is not provided or is invalid
    const perPage = 10; // Number of posts per page
    // Build the search query using regular expressions for case-insensitive search
    const searchQuery = new RegExp(search, "i");
    // Count the total number of posts that match the search query
    const totalPosts = await Post.countDocuments({ title: searchQuery });
    // Calculate the total number of pages
    const totalPages = Math.ceil(totalPosts / perPage);
    // Ensure 'page' is within valid range
    if (page < 1 || page > totalPages) {
      return res.status(400).json({
        message: "Invalid page number",
      });
    }
    // Calculate the number of posts to skip
    const skip = (page - 1) * perPage;
    // Fetch the posts that match the search query for the specified page
    const posts = await Post.find({ title: searchQuery })
      .sort({ createdAt: -1 }) // Sort by the latest posts
      .skip(skip)
      .limit(perPage);
    res.status(200).json({
      message: "Posts fetched successfully...",
      posts,
      totalPages,
      currentPage: page,
    });
  } catch (err) {
    res.status(500).json({
        message: "Error fetching posts...",
    });
  }
};

export const getPostById = async (req: express.Request, res: express.Response) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found...",
      });
    }
    res.status(200).json({ message: "Blog fetched successfully", post });
  } catch (err) {
    res.status(500).json({
        message: "Error fetching post by id..."
    });
  }
};

export const updatePostById = async (req: express.Request, res: express.Response) => {
  try {
    const { title, description, imageUrl } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { title, description, imageUrl },
      { new: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        message: "Post not found...",
      });
    }

    res.status(200).json({
      message: "Post updated successfully...",
      updatedPost
    });
  } catch (err) {
    res.status(500).json({
        message: "Error updating post..."
    });
  }
};

export const deletePostById = async (req: express.Request, res: express.Response) => {
  try {
    // Find the post by ID and delete it
    const deletedPost = await Post.findByIdAndDelete(req.params.id);

    if (!deletedPost) {
      return res.status(404).json({
        message: "Post not found...",
      });
    }
    // Remove the deleted post ID from the user's posts array
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found...",
      });
    }
    const postIndex = user.posts.indexOf(req.params.id);
    if (postIndex !== -1) {
      user.posts.splice(postIndex, 1);
      await user.save();
    }

    res.status(200).json({
      message: "Post deleted successfully...",
    });
  } catch (err) {
    res.status(500).json({
        message: "Error deleting post"
    });
  }
};