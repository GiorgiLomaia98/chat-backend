const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel")
// send message
const sendMessage = asyncHandler(async (req, res, next) => {

    const { chatId, content } = req.body;

    const chat = await Chat.findById(chatId)

    if (!chat) {
        res.status(400);
        throw new Error("No chat was found")
        
    };

    if (chat.users.indexOf(req.user._id)  === -1  ) {
        res.status(400);
        throw new Error("your are not part of this chat")
    }

   

    try {
        let message = await Message.create({ sender: req.user._id, content, chat: chat._id });

        message = await (
          await message.populate("sender", "name profilePicture")
        ).populate({
          path: "chat",
          select: "chatName isGroupChat users",
          model: "Chat",
          populate: { path: "users", select: "name email picture", model: "User" },
        });

        chat.latestMessage = message;

        await chat.save();

        

        res.status(200).json(message)
        
    } catch (error) {

        console.log(error.message)
        
    }

    
    
});

// fetch user messages 

const allMessages = asyncHandler(async (req, res, next) => {
    const chatId = req.params.chatId; 
    try {

        const chat = await Chat.findById(chatId);

        if (!chat) {
            res.status(400)
            throw new Error("no chat was found")
        }

        const messages = await Message.find({chat: chat._id})
            .populate("sender", "name email picture")
            .populate("chat");

        res.status(200).json(messages)
        
    } catch (error) {

        console.log(error)
        
    }
})

module.exports = {
    sendMessage,
    allMessages
}