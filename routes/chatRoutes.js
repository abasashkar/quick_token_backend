const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifytoken");
const { chatWithBot } = require("../controllers/chatcontroller");

router.post("/",verifyToken, chatWithBot);

module.exports = router;
