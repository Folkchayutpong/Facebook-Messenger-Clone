const express = require("express");
const router = express.Router();
const { expressAuthMiddleware } = require("../../middleware/auth");
const friendController = require("./friend.controller");

router.post("/add", expressAuthMiddleware, friendController.add);
router.post("/accept", expressAuthMiddleware, friendController.accept);
router.post("/decline", expressAuthMiddleware, friendController.decline);
router.post("/remove", expressAuthMiddleware, friendController.remove);
router.get("/list", expressAuthMiddleware, friendController.getFriend);
router.get("/inbound", expressAuthMiddleware, friendController.getInbound);
router.get("/outbound", expressAuthMiddleware, friendController.getOutbound);

module.exports = router;
