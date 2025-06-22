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

// Set default provider to Mailtrap for safety
const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "mailtrap";

// Unified email sending function
const sendEmail = async ({
  email,
  subject,
  html,
  attachments,
}: EmailOptions) => {
  console.log("🔧 Using EMAIL_PROVIDER:", EMAIL_PROVIDER);

  // --- SENDGRID ---
  if (EMAIL_PROVIDER === "sendgrid") {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    const msg = {
      to: email,
      from: "paul@paul172v-portfolio.co.uk", // MUST be verified in SendGrid
      subject,
      html,
      // If you want to enable attachments later:
      // attachments: attachments
      //   ? attachments.map((att) => ({
      //       filename: att.filename,
      //       content: fs.readFileSync(att.path).toString("base64"),
      //       cid: att.cid,
      //     }))
      //   : [],
    };

    try {
      await sgMail.send(msg);
      console.log("✅ Email sent via SendGrid");
    } catch (error: any) {
      console.error("❌ SendGrid Error (raw):", error);

      if (error.response) {
        console.error("❌ SendGrid Status:", error.code || error.statusCode);
        console.error("❌ SendGrid Response Body:", error.response.body);
      }

      try {
        console.error(
          "❌ SendGrid Error (JSON):",
          JSON.stringify(error, null, 2)
        );
      } catch (jsonErr) {
        console.error("❌ Could not stringify SendGrid error:", jsonErr);
      }

      throw error;
    }

    // --- MAILTRAP ---
  } else {
    const transporter = nodemailer.createTransport({
      host: process.env.MAILTRAP_HOST || "smtp.mailtrap.io",
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
      // Optional attachments, if needed again later
      // attachments: attachments || [],
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("✅ Email sent via Mailtrap");
    } catch (error: any) {
      console.error("❌ Mailtrap Error (raw):", error);
      try {
        console.error(
          "❌ Mailtrap Error (JSON):",
          JSON.stringify(error, null, 2)
        );
      } catch (jsonErr) {
        console.error("❌ Could not stringify Mailtrap error:", jsonErr);
      }
      throw error;
    }
  }
};

export default sendEmail;
