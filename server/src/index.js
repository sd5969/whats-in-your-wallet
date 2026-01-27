import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import session from "express-session";
import stateRouter from "./routes/state.js";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const sessionCookieName = "cvs.sid";
const port = process.env.PORT || 5050;

app.set("trust proxy", 1);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
    credentials: true
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(
  session({
    name: sessionCookieName,
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax",
      secure: isProduction
    }
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/state", stateRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
