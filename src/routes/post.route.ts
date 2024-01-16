import express from "express";
import { isAuthenticated, checkPostOwnership } from "../middlewares";
import {
  createPost,
  getAllPosts,
  getPostById,
  updatePostById,
  deletePostById,
} from "../controllers/post.controller";

const router = express.Router();

router.post("/", isAuthenticated, createPost);
router.get("/", getAllPosts);
router.get("/:id", getPostById);
router.patch("/:id", isAuthenticated, checkPostOwnership, updatePostById);
router.delete("/:id", isAuthenticated, checkPostOwnership, deletePostById);

export default router;
