import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import stateRouter from "./routes/state.js";
import { connectToDatabase } from "./db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5050;

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/state", stateRouter);

async function startServer() {
  try {
    await connectToDatabase(process.env.MONGODB_URI);
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server", error);
    process.exit(1);
  }
}

startServer();
