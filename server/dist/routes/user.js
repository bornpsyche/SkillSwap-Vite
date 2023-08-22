"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const dbModel_1 = require("../models/dbModel");
const authenticateToken_1 = __importDefault(require("../auth/authenticateToken"));
require("dotenv").config();
const router = express_1.default.Router();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const user = yield dbModel_1.User.findOne({ username });
    if (user) {
        res.status(404).send({ message: "User already exists" });
    }
    else {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new dbModel_1.User({ username, password: hashedPassword });
        yield newUser.save();
        const accessToken = jsonwebtoken_1.default.sign({ id: newUser._id, role: "user" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.send({ message: "User created sucessfully", accessToken });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const user = yield dbModel_1.User.findOne({ username });
    if (user) {
        const validPass = yield bcrypt_1.default.compare(password, user.password);
        if (validPass) {
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id, role: "user" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
            res.send({ message: "User logged in sucessfully", accessToken });
        }
        else {
            res.status(403).send({ message: "Invalid password!" });
        }
    }
    else {
        res.status(403).send({ message: "User not found!" });
    }
}));
router.get("/courses", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield dbModel_1.Course.find({ published: true });
    res.json({ courses });
}));
router.post("/courses/:courseId", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield dbModel_1.Course.findById(req.params.courseId);
    const id = req.headers["id"];
    if (course) {
        const user = yield dbModel_1.User.findById(id);
        if (user) {
            user.purchasedCourses.push(course._id);
            yield user.save();
            res.json({ message: "Course purchased successfully" });
        }
        else {
            res.status(403).json({ message: "User not found" });
        }
    }
    else {
        res.status(404).json({ message: "Course not found" });
    }
}));
router.get("/purchasedCourses", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.headers["id"];
    const user = yield dbModel_1.User.findById(id).populate("purchasedCourses");
    // const user = await User.findById(id)
    console.log(user);
    if (user) {
        res.json({ purchasedCourses: user.purchasedCourses || [] });
    }
    else {
        res.status(403).json({ message: "User not found" });
    }
}));
exports.default = router;
