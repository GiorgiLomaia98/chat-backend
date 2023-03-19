const express = require("express");
const protectFromUnAuthroziedAttack = require("../middleWare/authMiddleWare");

const {accesChat,fetchAllChatUserHas,createGroupChat,renameGroupChat,addToGroupChat,removeFromGroupChat} = require("../controllers/chatControllers")

const router = express.Router();

router.post("/", protectFromUnAuthroziedAttack, accesChat);

router.get("/", protectFromUnAuthroziedAttack, fetchAllChatUserHas);

router.post("/group", protectFromUnAuthroziedAttack, createGroupChat);

router.put("/renamegroup", protectFromUnAuthroziedAttack, renameGroupChat);

router.put("/add-to-group", protectFromUnAuthroziedAttack, addToGroupChat);

router.put("/remove-from-group", protectFromUnAuthroziedAttack, removeFromGroupChat)




module.exports = router