import dotenv from "dotenv";
import { resolve } from "path";
import app from "./app";
import mongoose from "mongoose";
import sgMail from "@sendgrid/mail";

dotenv.config({ path: resolve("./config.env") });

const DB = process.env.DB_URL!.replace("<PASSWORD>", process.env.DB_PASSWORD!);

mongoose.connect(DB).then(() => console.log("✅ Connected to database"));

const port = process.env.PORT || 3000;

app.listen(port, () => console.log(`Listening on port... ${port}`));

sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbXBsb3llZUlkIjoiNjdkOGJmM2U3YmZiNDI5MzY1MmJjMmM3IiwiaWF0IjoxNzQyMjU4NzU5LCJleHAiOjE3NDIyNjIzNTl9.DERAsly_OfmfSLaP67UyeLTXJOCbgpjSeBNoxtXDABs
