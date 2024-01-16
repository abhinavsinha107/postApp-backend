import express from "express";
import { deleteUser, getAllUsers, updateUser } from "../controllers/user.controller";
import { isAuthenticated, isOwner } from "../middlewares";

const router = express.Router();

router.get("/getAllUsers", isAuthenticated, getAllUsers);
router.post("/updateUser/:id", isAuthenticated, isOwner, updateUser);
router.delete("/deleteUser/:id", isAuthenticated, isOwner, deleteUser);

export default router;
