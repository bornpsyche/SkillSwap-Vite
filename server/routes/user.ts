import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User, Course } from "../models/dbModel";
import authenticateToken from "../auth/authenticateToken";
require("dotenv").config();

const router = express.Router();


router.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (user) {
    res.status(404).send({ message: "User already exists" });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    const accessToken = jwt.sign(
      { id: newUser._id, role: "user" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );
    res.send({ message: "User created sucessfully", accessToken });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.headers;
  const user = await User.findOne({ username });
  if (user) {
    const validPass = await bcrypt.compare(password as string, user.password as string);
    if (validPass) {
      const accessToken = jwt.sign(
        { id:user._id, role: "user" },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );
      res.send({ message: "User logged in sucessfully", accessToken });
    } else {
      res.status(403).send({ message: "Invalid password!" });
    }
  } else {
    res.status(403).send({ message: "User not found!" });
  }
});

router.get("/courses", authenticateToken, async (req, res) => {
  const courses = await Course.find({ published: true });
  res.json({ courses });
});

router.post("/courses/:courseId", authenticateToken, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  const id = req.headers["id"];
  if (course) {
    const user = await User.findById(id);
    if (user) {
      user.purchasedCourses.push(course._id);
      await user.save();
      res.json({ message: "Course purchased successfully" });
    } else {
      res.status(403).json({ message: "User not found" });
    }
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/purchasedCourses", authenticateToken, async (req, res) => {
  const id = req.headers["id"];
  const user = await User.findById(id).populate(
    "purchasedCourses"
  );
// const user = await User.findById(id)
  console.log(user);
  if (user) {
    res.json({ purchasedCourses: user.purchasedCourses || [] });
  } else {
    res.status(403).json({ message: "User not found" });
  }
});

export default router;
