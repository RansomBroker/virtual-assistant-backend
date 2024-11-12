// netlify/functions/app.js
const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");
const app = express();
const textToSpeech = require("./helpers/tts");

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple Route for /talk
app.post("/talk", (req, res) => {
  const { text, language } = req.body;
  textToSpeech(req.body.text, req.body.language)
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json({});
    });

  // For demonstration, simply respond with the text and language received
  res.json({
    message: "Received your request",
    text: text,
    language: language,
  });
});

// Error handling for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Export handler for Netlify
module.exports.handler = serverless(app);
