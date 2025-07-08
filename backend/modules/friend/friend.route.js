const express = require("express");
const router = express.Router();
const friendController = require("./friend.controller");

router.post("/add", friendController.add);
router.post("/accept", friendController.accept);
router.post("/decline", friendController.decline);
router.post("/remove", friendController.remove);

module.exports = router;
