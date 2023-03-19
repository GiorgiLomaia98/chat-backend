const express = require("express");
const router = express.Router();
const {contactUs} = require("../controllers/contactUs")
const protectFromUnAuthroziedAttack =  require("../middleWare/authMiddleWare");

router.post("/contact",protectFromUnAuthroziedAttack,contactUs);


module.exports = router;