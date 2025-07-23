const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { expressAuthMiddleware } = require("../../middleware/auth");


router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", expressAuthMiddleware, userController.getUserProfile);

module.exports = router;
