// File to generate google tokens for the Admin Email
// Run with: node scripts/generateGoogleMailToken.js

import { google } from "googleapis";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config();

async function main() {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
  } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
    process.exit(1);
  }

  const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    "urn:ietf:wg:oauth:2.0:oob"
  );

  const scopes = ["https://mail.google.com/"];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  });

  console.log("Authorize this URL by opening it in your browser:");
  console.log(authUrl);
  console.log("\nAfter granting access, paste the code here to generate tokens.");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter the authorization code here: ", async (code) => {
    try {
      const { tokens } = await oauth2Client.getToken(code);
      console.log("Tokens received:");
      console.log(tokens);
      console.log("\nSave these tokens securely and update your environment or config accordingly.");
    } catch (error) {
      console.error("Error while trying to retrieve access token", error);
    } finally {
      rl.close();
    }
  });
}

// If run directly, execute main
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1].endsWith("generateGoogleMailToken.js")) {
  main();
} else {
  console.log("Token generator script imported but not executed.");
}
