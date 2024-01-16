import express from "express";
import jwt from "jsonwebtoken";
import Post from "../models/post.model";

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authToken = req.cookies.authToken;
  const refreshToken = req.cookies.refreshToken;
  if (!authToken && !refreshToken) {
    return res.status(401).json({
      message: "Authentication failed: No authToken or refreshToken provided..."
    });
  }
  jwt.verify(
    authToken,
    process.env.JWT_SECRET_KEY || "",
    (err: any, decoded: any) => {
      if (err) {
        // Auth token has expired, check the refresh token
        jwt.verify(
          refreshToken,
          process.env.JWT_REFRESH_SECRET_KEY || "",
          (refreshErr: any, refreshDecoded: any) => {
            // Both tokens are invalid, send an error message and prompt for login
            if (refreshErr) {
              // Both tokens are invalid, send an error message and prompt for login
              return res.status(401).json({
                message: "Authentication failed: Both tokens are invalid...",
                ok: false,
              });
            } else {
              // Generate new auth and refresh tokens
              const newAuthToken = jwt.sign(
                { userId: refreshDecoded.userId },
                process.env.JWT_SECRET_KEY || "",
                { expiresIn: "40m" }
              );
              const newRefreshToken = jwt.sign(
                { userId: refreshDecoded.userId },
                process.env.JWT_REFRESH_SECRET_KEY || "",
                { expiresIn: "1d" }
              );

              // Set the new tokens as cookies in the response
              res.cookie("authToken", newAuthToken, { httpOnly: true });
              res.cookie("refreshToken", newRefreshToken, { httpOnly: true });
              // Continue processing the request with the new auth token
              Object.assign(req, { userId: refreshDecoded?.userId });
              Object.assign(req, { ok: true });
              next();
            }
          }
        );
      } else {
        Object.assign(req, { userId: decoded?.userId });
        next();
      }
    }
  );
};

export const isOwner = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const authToken = req.cookies.authToken;
    const decodedToken = jwt.verify(authToken, process.env.JWT_SECRET_KEY || "") as {
      userId: string;
    };
    const userId = decodedToken.userId;
    if (!userId) {
      return res.status(400).json({
        message: "Invalid User ID..."
      });
    }
    if (userId !== id) {
      return res.status(403).json({
        message: "You are not allowed to perform this operation..."
      });
    }
    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const checkPostOwnership = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }
    if (post.owner.toString() !== req.userId) {
      return res.status(403).json({
        message: "Permission denied: You do not own this post...",
      });
    }

    req.post = post;
    next();
  } catch (err) {
    res.status(500).json({
        message: "Error fetching post ownership..."
    });
  }
};
