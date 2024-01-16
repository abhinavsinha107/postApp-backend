import express from "express";
import bcryptjs from "bcryptjs";
import User from "../models/user.model"

export const getAllUsers = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const users = await User.find({}).select("-password");

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    if (req.body.password) {
      req.body.password = bcryptjs.hashSync(req.body.password, 10);
    }
    await User.findByIdAndUpdate(req.params.id, {
      $set: {
        userName: req.body.userName,
        email: req.body.email,
        password: req.body.password,
        fullName: req.body.fullName,
      },
    });
    return res.status(201).json({
        message: "Update Successfull..."
    });
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const deleteUser = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    await User.findOneAndDelete({_id: id});
    res.clearCookie("authToken");
    res.clearCookie("refreshToken");
    return res.status(201).json({message: "User deleted successfully..."});
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};