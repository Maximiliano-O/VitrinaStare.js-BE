import express from "express";
import axios from "axios";
import sendResponse from "../utils/sendResponse.js";

const router = express.Router();

/**
 * Extracts GitHub username from a valid GitHub profile URL.
 */
function extractUsername(url) {
  try {
    const parsed = new URL(decodeURIComponent(url));
    if (parsed.hostname !== "github.com") return null;
    return parsed.pathname.split("/")[1] || null;
  } catch {
    return null;
  }
}

/**
 * Extracts GitHub repository name from a repo URL and username.
 */
function extractRepoName(url, username) {
  try {
    const parsed = new URL(decodeURIComponent(url));
    if (parsed.hostname !== "github.com") return null;
    const pathParts = parsed.pathname.split("/");
    return pathParts.length >= 3 && pathParts[1] === username ? pathParts[2] : null;
  } catch {
    return null;
  }
}

// Check if GitHub user exists
router.get("/checkUserExists/:userUrl", async (req, res) => {
  const username = extractUsername(req.params.userUrl);

  if (!username) {
    return sendResponse(res, 400, "Invalid GitHub user URL.", { success: false });
  }

  try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    return sendResponse(res, 200, "The user exists.", { success: true, exists: true, userData: response.data });
  } catch (error) {
    if (error.response?.status === 404) {
      return sendResponse(res, 200, "User not found/doesn't exist",{ success: true, exists: false });
    }
    return sendResponse(res, 500, { success: false, message: error.message });
  }
});

// Check if GitHub repo exists and belongs to user
router.get("/checkRepoExistsAndMatchesUser/:userUrl/:repoUrl", async (req, res) => {
  const username = extractUsername(req.params.userUrl);
  const repoName = extractRepoName(req.params.repoUrl, username);

  if (!username || !repoName) {
    return sendResponse(res, 400, "Invalid GitHub user or repository URL.", { success: false });
  }

  try {
    const response = await axios.get(`https://api.github.com/repos/${username}/${repoName}`);
    return sendResponse(res, 200, "User is owner of the repository." ,{ success: true, exists: true, repoData: response.data });
  } catch (error) {
    if (error.response?.status === 404) {
      return sendResponse(res, 200, "User is not owner of the repo.",{ success: true, exists: false });
    }
    return sendResponse(res, 500, "Failed to check repository existance and owner.",{ success: false, message: error.message });
  }
});

export default router;
