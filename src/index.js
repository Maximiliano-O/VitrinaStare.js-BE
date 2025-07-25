const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const commentRoute = require("./routes/comment");
const emailRouter = require("./routes/emailRouter");
const statusRoute = require("./routes/status");
const releaseRoute = require("./routes/release");
const repoV2Route = require("./routes/repoV2");
const userV2Route = require("./routes/userV2");
const githubRoute = require("./routes/github");


// settings
const app = express();
const port = process.env.PORT || 9000;

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api", commentRoute);
app.use("/api", emailRouter);
app.use("/api", statusRoute);
app.use("/api", releaseRoute);
app.use("/api", repoV2Route);
app.use("/api", userV2Route);
app.use("/api", githubRoute);

app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  next();
});


// routes
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

// mongodb connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error(error));

// server listening
app.listen(port, () => console.log("Server listening to", port));
