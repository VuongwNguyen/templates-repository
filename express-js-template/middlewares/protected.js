const { errorResponse } = require("../util/responseHandle");
const jwt = require("jsonwebtoken");
const { Account } = require("../models");
require("dotenv").config();

const protected = (req, res, next) => {
  const token = req?.headers?.authorization?.split(" ")[1];
  if (!token)
    throw new errorResponse({
      message: "Unauthorized",
      statusCode: 401,
    });

  jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, decoded) => {
    if (err)
      throw new errorResponse({
        message: err.message,
        statusCode: 401,
      });

    req.body.user_id = decoded.user_id;
  });

  next();
};

const adminVerify = async (req, res, next) => {
  const { user_id } = req.body;
  const user = await Account.findByPk(user_id);

  if (user?.role != "admin")
    return next(
      new errorResponse({
        message: "You are not authorized to access this route",
        statusCode: 403,
      })
    );

  next();
};

module.exports = { protected, adminVerify };
