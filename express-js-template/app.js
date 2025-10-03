var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var cors = require("cors");
var helmet = require("helmet");
var logger = require("morgan");
var app = express();
// const fs = require("fs");
var winston = require("winston");

// Import security middlewares
const SanitizationMiddleware = require("./middlewares/sanitization.middleware");
const RateLimitMiddleware = require("./middlewares/rateLimit.middleware");

// Import Swagger configuration
const { specs, swaggerUi, options: swaggerOptions } = require('./docs/swagger.config');

// Connect to database

// logger setting
const Logger = winston.createLogger({
  level: "error",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [new winston.transports.File({ filename: "logs/server-log.log" })],
});

// View engine setup
app.use(cors());
app.use(helmet());

// Apply rate limiting
app.use('/api', RateLimitMiddleware.general());

// Apply sanitization middlewares
app.use(...SanitizationMiddleware.all({
  noSQLInjection: true,
  xssProtection: true,
  parameterPollution: true,
  removeEmpty: false,
  normalizeTypes: false
}));

app.use(logger("dev"));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));

// API Documentation redirect
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Routes
app.use("/api", require("./routes"));

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  if (err.status === 404)
    return res.status(404).json({
      status: false,
      message: "Not found",
      statusCode: 404,
    });

  // write error to log file
  if (err.statusCode === 500)
    Logger.error({
      message: err.message,
      status: err.statusCode,
      stack: err.stack,
      timestamp: new Date().toISOString(),
    });

  // Return the error
  res.status(err.statusCode || 500).json({
    statusResponse: err.statusResponse || false,
    message: err.message,
    statusCode: err.statusCode || 500,
  });

  console.log("error: ", err.stack);
});

module.exports = app;
