const asyncHandler =  require("express-async-handler");
const User =  require("../models/userModel");
const sendEmail = require("../util/sendMail")

// Contuct us

const contactUs = asyncHandler(async (req,res,next)=>{
     const {subject,message} = req.body;

    //  VALIDATION
    if(!subject, !message){
       res.status(400);
       throw new Error("Please fiels subject and email")
    };

    const user = await User.findById(req.user._id);

    if(!user){
        res.status(400);
        throw new Error("No user was found, Please login or signup")
    };

    const send_to = `shoppergl1998@outlook.com`;
    const sent_from = `shoppergl1998@outlook.com`;
    const reply_to = user.email

    try {
        await sendEmail(subject,message,send_to,sent_from,reply_to);
        res.status(200).json({success: true, message: "reset email sent"})
        
    } catch (error) {
         res.status(400);
         throw new Error(error.message)
    }
});

module.exports ={contactUs}