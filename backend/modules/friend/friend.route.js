const express = require("express");
const router = express.Router();
const friendController = require("./friend.controller");
const  {expressAuthMiddleware}  = require("../../middleware/auth");

router.post("/add",  expressAuthMiddleware , friendController.add);
router.post("/accept",  expressAuthMiddleware , friendController.accept);
router.post("/decline",  expressAuthMiddleware , friendController.decline);
router.post("/remove",  expressAuthMiddleware , friendController.remove);

module.exports = router;
