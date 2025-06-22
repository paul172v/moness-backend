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

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || "mailtrap";

const sendEmail = async ({
  email,
  subject,
  html,
  attachments,
}: EmailOptions) => {
  if (EMAIL_PROVIDER === "sendgrid") {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY as string);

    const msg = {
      to: email,
      from: "paul@paul172v-portfolio.co.uk",
      subject: subject,
      html: html,
      attachments: attachments
        ? attachments.map((att) => ({
            filename: att.filename,
            content: fs.readFileSync(att.path).toString("base64"),
            cid: att.cid,
          }))
        : [],
    };

    try {
      await sgMail.send(msg);
      console.log("✅ Email sent via SendGrid");
    } catch (error: any) {
      console.error("❌ SendGrid Error:", error);
      if (error.response) {
        console.error("❌ SendGrid Response Body:", error.response.body);
      }
      throw error; // ⬅️ This is critical
    }
  } else {
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
      console.log("✅ Email sent via Mailtrap");
    } catch (error: any) {
      console.error("❌ Mailtrap Error:", error);
      throw error; // ⬅️ This is critical
    }
  }
};

export default sendEmail;
