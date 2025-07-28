import express from "express";
import nodemailer from "nodemailer";
import { google } from "googleapis";
import dotenv from "dotenv";
import sendResponse from "../utils/sendResponse.js";

dotenv.config();

const router = express.Router();

// Initialize OAuth2 client with Google API credentials and redirect URI
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.EMAIL_REDIRECT_URI
);

// Set OAuth2 credentials with the stored refresh token
oAuth2Client.setCredentials({
  refresh_token: process.env.EMAIL_REFRESH_TOKEN,
});

/**
 * POST /send-emails
 * Sends emails to a list of recipients with a repository link.
 * Body expects:
 * - emails: array of email strings
 * - repositoryLink: string URL
 */
router.post("/send-emails", async (req, res) => {
  const { emails, repositoryLink } = req.body;

  // Validate input presence
  if (!emails?.length || !repositoryLink) {
    return sendResponse(
      res,
      400,
      "Missing email list or repository link."
    );
  }

  try {
    // Obtain fresh access token from refresh token
    const accessTokenResponse = await oAuth2Client.getAccessToken();
    const accessToken = accessTokenResponse?.token;

    // Fail early if no access token could be retrieved
    if (!accessToken) {
      return sendResponse(
        res,
        500,
        "Failed to retrieve access token"
      );
    }

    // Configure Nodemailer transporter with OAuth2 credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_REFRESH_TOKEN,
        accessToken,
      },
    });

    // Send emails concurrently to all recipients
    const results = await Promise.allSettled(
      emails.map((email) => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: email,
          subject: "SELECCIONADO Revisión Stare.js",
          text: `¡Hola! Has sido seleccionado aleatoriamente para revisar un repositorio.\n\nLink: ${repositoryLink}`,
        };
        return transporter.sendMail(mailOptions);
      })
    );

    // Calculate counts of successful and failed sends
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected");

    // Respond with summary of results, including error messages for failures
    return sendResponse(
      res,
      200,
      `Emails sent: ${successful}, Failed: ${failed.length}`,
      { failures: failed.map((f) => f.reason?.message) }
    );
  } catch (err) {
    console.error("Unexpected error while sending emails:", err);
    return sendResponse(res, 500, "Internal server error.", err);
  }
});

export default router;
