const express = require("express");
const router = express.Router();
const {registerUser,loginUser,logoutUser, getUser,getLoginStatus, updateuser, changePassword, forgotPassword, resetPassword,searchUser } = require("../controllers/userController");
const {upload} = require("../util/fileUpload")


const protectFromUnAuthroziedAttack = require("../middleWare/authMiddleWare")

router.get('/', protectFromUnAuthroziedAttack,searchUser)

router.post("/register",upload.single("picture"), registerUser);

router.patch("/updateuser",protectFromUnAuthroziedAttack,upload.single("picture") ,updateuser);

router.post("/login", loginUser);

router.get("/logout", logoutUser);

router.get("/getuser",protectFromUnAuthroziedAttack, getUser);

router.get("/loggedin",getLoginStatus);


router.patch("/changepassword", protectFromUnAuthroziedAttack, changePassword);

router.post("/forgotpassword", forgotPassword);

router.put("/resetpassword/:resetToken", resetPassword);





module.exports = router