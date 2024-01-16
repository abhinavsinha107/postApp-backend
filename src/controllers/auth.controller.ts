import express from "express";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { userName, email, password, fullName } = req.body;
    if (!userName || !email || !password || !fullName) {
      return res.status(400).json({
        message: "Please provide all credentials...",
      });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists...",
      });
    }
    const expression: RegExp = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    const pass: RegExp =
      /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{7,15}$/;
    if (!pass.test(password.toString())) {
      return res.status(400).json({
        message: "Enter valid password with uppercase, lowercase, number & @",
      });
    }
    if (!expression.test(email.toString())) {
      return res.status(400).json({ message: "Invalid email address" });
    }
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const user = new User({
      userName,
      email,
      password: hashedPassword,
      fullName,
    });
    await user.save();
    return res.status(200).json({
        message: "User registered successfully..."
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide all credentials...",
      });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "User does not exist...",
      });
    }
    const validPassword = bcryptjs.compareSync(password, user.password);
    if (!validPassword) {
      return res.status(403).json({
        message: "Wrong Password...",
      });
    }
    const authToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY || "",
      { expiresIn: "40m" }
    );
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET_KEY || "",
      { expiresIn: "1d" }
    );
    res.cookie("authToken", authToken, { httpOnly: true });
    res.cookie("refreshToken", refreshToken, { httpOnly: true });
    res.status(200).json({ message: "Login Successfull...", userId: user._id });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const logout = async (req: express.Request, res: express.Response) => {
  try {
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    return res.status(200).json({
      message: "Logout Successful",
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
