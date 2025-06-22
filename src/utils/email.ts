import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config({ path: "./config.env" });

interface EmailOptions {
  email: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    path: string;
    cid: string;
  }>;
}

// Choose email provider dynamically
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "mailtrap"; // Default to Mailtrap for testing

const sendEmail = async ({
  email,
  subject,
  html,
  attachments,
}: EmailOptions) => {
  if (EMAIL_PROVIDER === "sendgrid") {
    // ✅ SendGrid Configuration
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    const msg = {
      to: email,
      from: "paul@paul172v-portfolio.co.uk", // Verified sender for SendGrid
      subject: subject,
      html: html,
      attachments: attachments
        ? attachments.map((att) => ({
            filename: att.filename,
            content: fs.readFileSync(att.path).toString("base64"), // ✅ Read file content as base64
            cid: att.cid,
          }))
        : [],
    };

    try {
      await sgMail.send(msg);
      console.error("✅ Email sent via SendGrid");
    } catch (error: any) {
      console.error("❌ SendGrid Error:", error.message);
      if (error.response) {
        console.error("❌ SendGrid Response:", error.response.body);
      }
    }
  } else {
    // ✅ Mailtrap Configuration
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST,
      port: Number(process.env.MAILTRAP_PORT) || 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: `"Moness Staff Portal" <paul@paul172v-portfolio.co.uk>`,
      to: email,
      subject,
      html,
      attachments: attachments
        ? attachments.map((att) => ({
            filename: att.filename,
            path: att.path,
            cid: att.cid,
          }))
        : [],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.error("✅ Email sent via Mailtrap");
    } catch (error: any) {
      console.error("❌ Mailtrap Error:", error.message);
    }
  }
};

export default sendEmail;

//// Sendgrid
// Sendgrid recovery code
// 6NSMVSJZZP1CED257RGTLAZX
// Username: moness-staff-portal
