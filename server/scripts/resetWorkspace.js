import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectToDatabase } from "../src/db.js";
import { Workspace } from "../src/models/Workspace.js";

dotenv.config();

async function resetWorkspace() {
  await connectToDatabase(process.env.MONGODB_URI);
  const result = await Workspace.deleteMany({});
  console.log(`Deleted ${result.deletedCount} workspace document(s).`);
}

resetWorkspace()
  .then(async () => {
    await mongoose.disconnect();
  })
  .catch(async (error) => {
    console.error("Failed to reset workspace", error);
    await mongoose.disconnect();
    process.exit(1);
  });
