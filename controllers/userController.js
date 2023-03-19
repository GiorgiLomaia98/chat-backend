
const asyncHandler =  require("express-async-handler");
const User =  require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Token = require("../models/tokenModel");
const crypto = require("crypto");
const sendEmail = require("../util/sendMail");
const {fileSizeFormater} = require("../util/fileUpload");
const cloudinary = require("cloudinary").v2;




const generateToken =  (id)=> {
    return jwt.sign({id}, "secret", {expiresIn: "1d"})
}


// User Registration

const registerUser = asyncHandler(  async (req,res,next) => {
   
    const {name,lastName,email,password} = req.body;

    // check if user don't leaves any of required fields
    if(!name || !email || !password){
       res.status(400);
       throw new Error("Please enter all required fields")
    };

    // cheking user's password length
    if(password.length < 6 ){
        res.status(400);
        throw new Error("Your password is too short")
    };
    if(password.length > 23 ){
        res.status(400);
        throw new Error("Your password is too long");
    };

    // cheking if user with provided email adress already exists or not
    const existingUser = await User.findOne({email});

    if(existingUser){
        res.status(400);
        throw new Error(`User with email: ${email} already exists`);
    };

    let fileData = {}

    if(req.file){
        // Upload file to cloudinary 
        let uploadedFile;

        try {
          uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Chat App", resource_type: "image"})
            
        } catch (error) {
            res.status(500);
            throw new Error(error)
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormater(req.file.size,2)

        }

    }

    // creating new user

     const  user = await User.create({
         name,
        lastName,
        email,
        password,
        picture: fileData
      });

    //   Generate token for the user

     const token = generateToken(user._id)
    
    //  Sending cookie

    res.cookie("token", token, {
        path: "/",
        httpOnly:true,
       expires: new Date(Date.now() + 1000 * 86400), 
       sameSite: "none",
       secure: true
    });
  
    if(user){
        const {_id, name, password, email, picture, phone,bio} = user
        res.status(201).json({_id,name,email,password,picture,phone, bio, token})
    }else{
        res.status(400);
        throw new Error("User was not created")
    }

});


// User Login

const loginUser = asyncHandler( async (req,res,next)=> {
     const {email,password} = req.body;
  
    // Validate inputs

     if(!email || !password) {
        res.status(400);
        throw new Error("Please fiel empty fields");
     };

    //  Check if user  exists or not
    const user = await User.findOne({email});

    if(!user){
        res.status(400);
        throw new Error(`user with email: ${email} does not exist, please signup.`)
    };
    
    // user exists but now check the password
    const passwordIsCorrect = await bcrypt.compare(password,user.password);

     //   Generate token for the user

     const token = generateToken(user._id)
    
    //  Sending cookie

    if(passwordIsCorrect){
        res.cookie("token", token, {
            path: "/",
            httpOnly:true,
           expires: new Date(Date.now() + 1000 * 86400), 
           sameSite: "none",
           secure: true
        })
    }


    if(user && passwordIsCorrect){
        const {_id,name, email,password,bio,phone,picture} = user;
        res.status(200).json({ _id,name, email,password,bio,phone,picture,token});
    }else{
        res.status(400);
        throw new Error("Invalid email or password")
    }

});

// log out user


const logoutUser = asyncHandler(async (req,res,next)=>{
    res.cookie("token", "", {
        path: "/",
        httpOnly:true,
        expires: new Date(0), 
       sameSite: "none",
       secure: true
    })

    return res.status(200).json({message: "Successfully logged out"})

});

// Get the user

const getUser = asyncHandler(async (req,res, next)=> {
        
    const user = await User.findById(req.user._id);

    if(user ){
        const {name, email,bio,phone,picture,lastName,_id} = user;
        res.status(200).json({ name, email,bio,phone,picture,lastName,_id});
    }else{
        res.status(401);
        throw new Error("user was not found")
    }


});

// Get Loggedin Status

const getLoginStatus =  asyncHandler(async (req,res,next)=> {
      const token = req.cookies.token;

      if(!token){
        return res.json(false);
      };

    //   verfie token

    const verfiedToken = jwt.verify(token,"secret");

    if(verfiedToken){
        return res.json(true);
    };

    return res.json(false)

});

// Upadate User

const updateuser =  asyncHandler(async (req,res,next)=> {
     const user = await User.findById(req.user._id);

       // Handle image upload

    let fileData = {}

    if(req.file){
        // Upload file to cloudinary 
        let uploadedFile;

        try {
          uploadedFile = await cloudinary.uploader.upload(req.file.path, {folder: "Chat App", resource_type: "image"})
            
        } catch (error) {
            res.status(500);
            throw new Error(error)
        }
        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormater(req.file.size,2)

        }

    }


     
     if(user){
        const {name, picture,phone,email,bio} = user;
        user.email = email;
        user.name = req.body.name || name;
        user.picture = Object.keys(fileData).length === 0 ? picture : fileData
        user.phone = req.body.phone || phone;
        user.bio = req.body.bio || bio;

      const updateuser =  await user.save();

        res.status(200).json({
            _id: updateuser._id,
            name: updateuser.name,
            phone: updateuser.phone,
            bio: updateuser.bio,
            picture:updateuser.picture,
            email: updateuser.email,
        });

     } else {
        res.status(401);
        throw new Error("User not found")
     }
});

// Change password

const changePassword = asyncHandler(async (req,res, next) => {
    const user = await User.findById(req.user._id);

    const {oldPassword, newPassword} = req.body

    // validate parameters

    if(!user){
        res.status(400);
        throw new Error("User not found, please login or signup")
    };

    if(!oldPassword || !newPassword){
        res.status(400);
        throw new Error("Fields are required! please fiel")
    };

    // check if oldPassword matches the user's current password

    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);

    if(!passwordIsCorrect){
        res.status(400);
        throw new Error("Passowrd is incorrect, please enter correct current password");
    };

    if(passwordIsCorrect && user){
        user.password = newPassword;
        
        await user.save();

        res.status(200).json({msg: `Password changed successfully. New Password is - ${newPassword}`})
    } else{
        res.status(400);
        throw new Error("An unknown error occured");
    }
});

// Forgot password

const forgotPassword =  asyncHandler(async (req,res,next)=> {
    const {email} = req.body;

    // Find user with provided email

    const user = await User.findOne({email});

    if(!user){
        res.status(404);
        throw new Error("No user was found with provided email")
    };

    // Delete token if it already exists in database

    let token = await Token.findOne({userId: user._id});

    if(token){
        await token.deleteOne()
    }

    // Create reset Token if user exists

    // let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
    let resetToken = crypto.randomBytes(32).toString("hex") + user._id
     
    //  Hash the resetToken

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // save hashed Token to database

    await new Token(
        {
           userId: user._id,
           token: hashedToken,
           createdAt: Date.now(),
           expiresAt: Date.now() + 30 * (60 *1000)
        }
    ).save();

    // Constract reset Url

    const resetUrl = `http://localhost:3000/resetpassword/${resetToken}`;

    // constract message

    const message = `
            
      <h2>Hello ${user.name}</h2>
      <p>This is your reset token which please note expires in 30 minutes</p>

      <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

    `;

    const subject = "password reset request";
    const send_to = user.email;
    const sent_from = `shoppergl1998@outlook.com`;

    try {
        await sendEmail(subject,message,send_to,sent_from);
        res.status(200).json({success: true, message: "reset email sent"})
        
    } catch (error) {
         res.status(400);
         throw new Error(error.message)
    }


});

// Reset password

const resetPassword = asyncHandler(async (req,res,next) => {
     const {password} = req.body;
     const {resetToken} =  req.params;

    //  Find the token inside the Database and compare

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    console.log(hashedToken)

    const userToken = await Token.findOne({
        token : resetToken,
        expiresAt: {$gt: Date.now()}
    });

    if(!userToken){
        res.status(404);
        throw new Error("invalid or expired token")
    };

    // Find the user now

    const user = await User.findOne({_id: userToken.userId});

    if(!user){
        res.status(404);
        throw new Error("User not found")
    };

    user.password = password;

    await user.save();

    res.status(200).json({success: `password updated successfully, new password:${password}`})

})


// get users by search query

const searchUser = asyncHandler(async (req, res, next) => {
    
    const keyWord = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};

    const users = await User.find(keyWord).find({ _id: { $ne: req.user._id } });

    res.send(users)

    console.log(keyWord)

})

module.exports = {
     registerUser, 
    loginUser,
    logoutUser,
     getUser, 
     getLoginStatus,
     updateuser
     ,changePassword,
      forgotPassword,
    resetPassword,
    searchUser
}