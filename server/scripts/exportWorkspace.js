import dotenv from "dotenv";
import fs from "fs/promises";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/db.js";
import { Workspace } from "../src/models/Workspace.js";

dotenv.config();

async function exportWorkspace() {
  await connectToDatabase(process.env.MONGODB_URI);
  const workspace = await Workspace.findOne().lean();

  if (!workspace) {
    console.error("No workspace found to export.");
    process.exit(1);
  }

  const output = JSON.stringify(workspace, null, 2);
  const filePath = process.argv[2];

  if (filePath) {
    await fs.writeFile(filePath, output, "utf-8");
    console.log(`Exported workspace to ${filePath}`);
    return;
  }

  console.log(output);
}

exportWorkspace()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to export workspace", error);
    await mongoose.disconnect();
    process.exit(1);
  });
