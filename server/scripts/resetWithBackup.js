import dotenv from "dotenv";
import fs from "fs/promises";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/db.js";
import { Workspace } from "../src/models/Workspace.js";

dotenv.config();

async function resetWithBackup() {
  await connectToDatabase(process.env.MONGODB_URI);

  const workspace = await Workspace.findOne().lean();
  if (!workspace) {
    throw new Error("No workspace found to export.");
  }

  const output = JSON.stringify(workspace, null, 2);
  const filePath = process.argv[2] || "workspace-backup.json";

  await fs.writeFile(filePath, output, "utf-8");
  console.log(`Exported workspace to ${filePath}`);

  const result = await Workspace.deleteMany({});
  console.log(`Deleted ${result.deletedCount} workspace document(s).`);

  const data = JSON.parse(output);
  const restored = await Workspace.findOneAndUpdate({}, data, {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true
  }).lean();

  console.log(`Reimported workspace ${restored?._id || ""}`.trim());
}

resetWithBackup()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to reset with backup", error);
    await mongoose.disconnect();
    process.exit(1);
  });
