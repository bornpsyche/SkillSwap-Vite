import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Admin, Course } from "../models/dbModel.js";
import authenticateToken from "../auth/authenticateToken";
require("dotenv").config();

const router = express.Router();

router.post("/signup", async (req, res) => {
  const { username, password } : {username: string, password: string} = req.body;
  const admin = await Admin.findOne({ username });
  if (admin) {
    res.status(403).send({ message: "Admin already exists" });
  } else {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ username, password: hashedPassword });
    await newAdmin.save();
    const accessToken = jwt.sign(
      { id: newAdmin._id, role: "admin" },
      process.env.ACCESS_TOKEN_SECRET as string,
      { expiresIn: "1h" }
    );
    res.send({
      message: "Admin created sucessfully",
      accessToken,
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.headers;
  const admin = await Admin.findOne({ username });
  if (admin) {
    const validPass = await bcrypt.compare(password as string, admin.password as string);
    if (validPass) {
      const accessToken = jwt.sign(
        { id: admin._id, role: "admin" },
        process.env.ACCESS_TOKEN_SECRET as string,
        { expiresIn: "1h" }
      );
      res.send({ message: "Admin logged in sucessfully", accessToken });
    } else {
      res.status(403).send({ message: "Invalid password!" });
    }
  } else {
    res.status(403).send({ message: "Admin not found" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
    const id = req.headers["id"];
  const admin = await Admin.findById(id);
  if (!admin) {
    res.status(403).json({ msg: "Admin doesnt exist" });
    return;
  }
  res.json(admin);
});

router.post("/courses", authenticateToken, async (req, res) => {
  const course = new Course(req.body);
  await course.save();
  res.json({ message: "Course created successfully", courseId: course.id });
});

router.put("/courses/:courseId", authenticateToken, async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  console.log("here");
  if (course) {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      {
        new: true,
      }
    );
    res.json({ message: "Course updated successfully", updatedCourse });
  } else {
    res.status(404).json({ message: "Course not found" });
  }
});

router.get("/courses", authenticateToken, async (req, res) => {
  const courses = await Course.find({});
  res.json(courses);
});

export default router;
