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
const dbModel_js_1 = require("../models/dbModel.js");
const authenticateToken_1 = __importDefault(require("../auth/authenticateToken"));
require("dotenv").config();
const router = express_1.default.Router();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.body;
    const admin = yield dbModel_js_1.Admin.findOne({ username });
    if (admin) {
        res.status(403).send({ message: "Admin already exists" });
    }
    else {
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newAdmin = new dbModel_js_1.Admin({ username, password: hashedPassword });
        yield newAdmin.save();
        const accessToken = jsonwebtoken_1.default.sign({ id: newAdmin._id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
        res.send({
            message: "Admin created sucessfully",
            accessToken,
        });
    }
}));
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password } = req.headers;
    const admin = yield dbModel_js_1.Admin.findOne({ username });
    if (admin) {
        const validPass = yield bcrypt_1.default.compare(password, admin.password);
        if (validPass) {
            const accessToken = jsonwebtoken_1.default.sign({ id: admin._id, role: "admin" }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1h" });
            res.send({ message: "Admin logged in sucessfully", accessToken });
        }
        else {
            res.status(403).send({ message: "Invalid password!" });
        }
    }
    else {
        res.status(403).send({ message: "Admin not found" });
    }
}));
router.get("/me", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.headers["id"];
    const admin = yield dbModel_js_1.Admin.findById(id);
    if (!admin) {
        res.status(403).json({ msg: "Admin doesnt exist" });
        return;
    }
    res.json(admin);
}));
router.post("/courses", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = new dbModel_js_1.Course(req.body);
    yield course.save();
    res.json({ message: "Course created successfully", courseId: course.id });
}));
router.put("/courses/:courseId", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const course = yield dbModel_js_1.Course.findById(req.params.courseId);
    console.log("here");
    if (course) {
        const updatedCourse = yield dbModel_js_1.Course.findByIdAndUpdate(req.params.courseId, req.body, {
            new: true,
        });
        res.json({ message: "Course updated successfully", updatedCourse });
    }
    else {
        res.status(404).json({ message: "Course not found" });
    }
}));
router.get("/courses", authenticateToken_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const courses = yield dbModel_js_1.Course.find({});
    res.json(courses);
}));
exports.default = router;
