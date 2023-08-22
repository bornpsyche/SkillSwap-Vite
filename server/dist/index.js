"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_1 = __importDefault(require("./routes/admin"));
const user_1 = __importDefault(require("./routes/user"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv").config();
const { DB_CONNECT, PORT } = process.env;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    credentials: true,
    origin: "http://localhost:5173",
}));
app.use("/admin", admin_1.default);
app.use("/user", user_1.default);
mongoose_1.default
    .connect(DB_CONNECT)
    .then(() => {
    console.log("Connected to DB!");
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
