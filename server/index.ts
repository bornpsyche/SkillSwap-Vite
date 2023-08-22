import express, { Request, Response, NextFunction, Router } from "express";
import adminRouter from "./routes/admin";
import userRouter from "./routes/user"
import cors from "cors";
import mongoose from "mongoose";
require("dotenv").config();
const { DB_CONNECT, PORT } = process.env;

const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

app.use("/admin", adminRouter);
app.use("/user", userRouter);

mongoose
  .connect(DB_CONNECT as string)
  .then(() => {
    console.log("Connected to DB!");
  });

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
