const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const userRoute = require("./routes/user");
const repositoryRoute = require("./routes/repository");
const commentRoute = require("./routes/comment");

// settings
const app = express();
const port = process.env.PORT || 9000;

// middlewares
app.use(cors());
app.use(express.json());
app.use("/api", userRoute);
app.use("/api", repositoryRoute);
app.use("/api", commentRoute);

// routes
app.get("/", (req, res) => {
  res.send("Welcome to my API");
});

// mongodb connection
mongoose
  //.connect(process.env.MONGODB_URI)
  .connect('mongodb://localhost:27017/stare')
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((error) => console.error(error));

// server listening
app.listen(port, () => console.log("Server listening to", port));
