import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import expressSession from "express-session";
import path, { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import connectToDB from "./DB/DB.js";
import UserRouter from "./routes/user.router.js";
import AdminRouter from "./routes/admin.routes.js";
import DepositRouter from "./routes/deposit.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
const app = express();
app.use("/uploads", express.static(join(__dirname, "uploads")));

const allowedOrigins = [
  "https://refferx.com",
  "https://www.refferx.com",
  "http://localhost:3005",
  " ",
];

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
app.use(morgan("dev"));

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  }),
);

app.use("/api/users", UserRouter);
app.use("/api/deposit", DepositRouter);
app.use("/api/admin", AdminRouter);

connectToDB()
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    import("./utils/cronJobs.js");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1);
  });
