import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    purchasedCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Courses" }],
});

const courseSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageLink: String,
  published: Boolean,
});

export const Admin = mongoose.model("Admins", adminSchema);
export const User = mongoose.model("Users", userSchema);
export const Course = mongoose.model("Courses", courseSchema);