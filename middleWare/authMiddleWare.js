const asyncHandler =  require("express-async-handler");
const User =  require("../models/userModel");
const jwt = require("jsonwebtoken");


const protectFromUnAuthroziedAttack = asyncHandler( async( req,res,next)=> {
     
    try{
        
        const token =  req.cookies.token ;
        

        if(!token){
            res.status(401);
            throw new Error("Unauthrozied session, please log in");
        };

        // check token validity

        const verifiedToken = jwt.verify(token,"secret");

        // Find User Id by verfied token
         const user = await User.findById(verifiedToken.id).select("-password");

        if(!user){
            res.status(401);
            throw new Error("User was not found");
        };

        req.user = user;
        next()

    }catch(err){
        res.status(404);
        throw new Error(err.message)
    }

});


module.exports = protectFromUnAuthroziedAttack;