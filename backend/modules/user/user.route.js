const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const { expressAuthMiddleware } = require("../../middleware/auth");
const upload = require("../../middleware/upload");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", expressAuthMiddleware, userController.getUserProfile);
router.get("/profile/:id",expressAuthMiddleware,userController.getUserProfileById);
router.post("/upload-avatar", expressAuthMiddleware, upload.single("avatar"), userController.uploadAvatar);
router.patch("/profile", expressAuthMiddleware, userController.updateUserProfile);
router.get("/search",expressAuthMiddleware,userController.searchUsers);



module.exports = router;
