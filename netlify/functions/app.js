// netlify/functions/app.js
const express = require("express");
const serverless = require("serverless-http");
const path = require("path");
const createError = require("http-errors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const axios = require("axios");
const indexRouter = require("../../routes/index");

const app = express();

// Middleware
app.use(cors({ origin: "*" }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../../public")));

// Routes
app.use("/", indexRouter);

// Error handling for 404
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(`
    <h1>Error</h1>
    <p>${err.message}</p>
  `);
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

module.exports.handler = serverless(app);
