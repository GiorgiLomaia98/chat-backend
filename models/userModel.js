const mongoose =  require('mongoose');
const {Schema} = mongoose;
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
     name : {
        type: String,
        required: [true, "please enter your name"]
    },
    lastName : {
        type: String,
        required: [true, "please enter your last name"]
     },
     email: {
        type: String,
        required: [ true, "email is required, please enter"],
        unique: true,
        trim:true,
        match:[/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "please enter valid email adress"]
     },
     password: {
        type: String,
        required: [true, "please enter your password"],
        minLength: [6,"password must be up to 6 charachters long"],
    },
    picture: {
        type: Object,
        default: {}
    },
    phone: {
        type: String,
        default: "+995"
    },
    bio: {
        type: String,
        maxLenth: [250, "password must be shorter than 251 charachetrs"],
        default:"bio"
    }
    

},{timestamps:true});

 UserSchema.pre("save", async function (next){
    if(! this.isModified("password")){
       return next()
    }

    // Encrypt the Password before saving it to Databse
     const salt = await bcrypt.genSalt(12);
     const hashedPassword = await bcrypt.hash(this.password,salt);
     this.password = hashedPassword;
     next()
 })


const User =  mongoose.model("User", UserSchema);
module.exports = User