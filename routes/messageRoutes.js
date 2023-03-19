const express = require("express");
const protectFromUnAuthroziedAttack = require("../middleWare/authMiddleWare");
const {sendMessage,allMessages} = require("../controllers/messageControllers")

const router = express.Router();

router.post("/", protectFromUnAuthroziedAttack, sendMessage);
router.get("/:chatId", protectFromUnAuthroziedAttack, allMessages)


module.exports = router