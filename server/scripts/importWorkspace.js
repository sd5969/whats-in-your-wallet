import dotenv from "dotenv";
import fs from "fs/promises";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/db.js";
import { Workspace } from "../src/models/Workspace.js";

dotenv.config();

async function readInput() {
  const filePath = process.argv[2];
  if (!filePath) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf-8");
  }

  return fs.readFile(filePath, "utf-8");
}

async function importWorkspace() {
  await connectToDatabase(process.env.MONGODB_URI);
  const raw = await readInput();
  const data = JSON.parse(raw);

  const workspace = await Workspace.findOneAndUpdate({}, data, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true
  }).lean();

  console.log(`Imported workspace ${workspace?._id || ""}`.trim());
}

importWorkspace()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to import workspace", error);
    await mongoose.disconnect();
    process.exit(1);
  });
