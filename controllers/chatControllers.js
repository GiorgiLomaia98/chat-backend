const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const Message = require("../models/messageModel");


// accesing one to one chat with specific user

const accesChat = asyncHandler(async (req, res, next) => {
    
    const userId = req.body.userId

    const user = await User.findOne({_id: userId});

    // if (!user) {
    //     res.status(400);
    //     throw new Error("User doesn't exist")
    // };

    var isChat = await Chat.find({
        isGroupChat: false,
        $and: [
            { users: { $elemMatch: { $eq: req.user._id } } },
            { users: { $elemMatch: { $eq: user._id } } },
        ],
    }).populate("users", "-password").populate("latestMessage");

    isChat = await User.populate(isChat, {
        path: "latestMessage.sender",
        select: "name picture email"
    });

    if (isChat.length > 0) {
        res.status(200).json(isChat)
    } else {
        
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        };

        try {
            const newLyCReatedChat = await Chat.create(chatData);

            const fullCaht = await Chat.findById({ _id: newLyCReatedChat._id }).populate("users", "-password");

            res.status(200).json(fullCaht)
            
        } catch (error) {

            console.log(error.message)
            
        }
    }

});

// Fetching All chats user has

const fetchAllChatUserHas = asyncHandler(async (req, res, next) => {
    
    try {
      
        await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate("users", "-password")
            .populate("groupAdmin", "-password")
            .populate("latestMessage")
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results,{
                    path: "latestMessage.sender",
                    select: "name pic email"
                })
                res.status(200).json(results)
        })
        
    } catch (error) {

        console.log(error.message)
        
    }
    
})

// create group chat

const createGroupChat = asyncHandler(async (req, res, next) => {


    const name = req.body.name

    var users = JSON.parse(req.body.users);

    users.push(req.user._id);

    if (users.length < 3) {
        res.status(400)
        throw new Error("You need more than two people to create a group chat")
    };

    try {

        const groupChat = await Chat.create({
            chatName: name ? name : "GroupChat",
            isGroupChat: true,
            users: users,
            groupAdmin: req?.user?._id,
        });

        

        const fullGroupChat = await Chat.findById({ _id: groupChat._id }).populate("users", "-password").populate("groupAdmin", "-password");

        res.status(200).json(fullGroupChat)
        
    } catch (error) {

        console.log(error.message)
        
    }
    
})
// rename GroupChat
const renameGroupChat = asyncHandler(async (req, res, next) => {
    const { chatId, name } = req.body;

    const groupChat = await Chat.findById(chatId);

    if (!groupChat) {
        res.status(400);
        throw new Error("No group chat was found");
    }

    // // Ensure that only the group admin can rename the group chat
    // if (groupChat.groupAdmin !== req.user.id) {
    //     res.status(401);
    //     throw new Error("Only the group admin can add changes to the groupchat");
    // }

    groupChat.chatName = name;
    
    await groupChat.save();

    res.status(201).json(groupChat)
});


// add new member to the group Chat
const addToGroupChat = asyncHandler(async (req, res, next) => {
    const { chatId, userId} = req.body;

    const groupChat = await Chat.findById(chatId);
    const user = await User.findById(userId);

    if (!groupChat) {
        res.status(400);
        throw new Error("No group chat was found")
    };
    if (!user) {
        res.status(400);
        throw new Error("No user was found")
    };

    if (groupChat.users.indexOf(user._id) !== -1 ) {
        res.status(400)
        throw new Error(`${user.name} is already in ${groupChat.chatName}`)
    };

    //  // Ensure that only the group admin can rename the group chat
    //  if (groupChat.groupAdmin !== req.user._id) {
    //     res.status(401);
    //     throw new Error("Only the group admin can add changes to the groupchat");
    // }

    if (groupChat.users.indexOf(user._id) === -1 ) {
        const added = await Chat.findByIdAndUpdate(
            chatId,
            {
                $push: { users: userId }
            },
            {
                new: true
            }
        ).populate("users", "-password")
         .populate("groupAdmin", "-password");
        res.status(200).json(added)
        
    }

    
})

// remove member to the group Chat
const removeFromGroupChat = asyncHandler(async (req, res, next) => {
    const { chatId, userId} = req.body;

    const groupChat = await Chat.findById(chatId);
    const user = await User.findById(userId);

    if (!groupChat) {
        res.status(400);
        throw new Error("No group chat was found")
    };
    if (!user) {
        res.status(400);
        throw new Error("No user was found")
    };

    if (groupChat.users.indexOf(user._id) === -1 ) {
        res.status(400)
        throw new Error(`${user.name} is not in a ${groupChat.chatName}`)
        
    };

    //  // Ensure that only the group admin can rename the group chat
    //  if (groupChat.groupAdmin !== req.user._id) {
    //     res.status(401);
    //     throw new Error("Only the group admin can add changes to the groupchat");
    // }

    if (groupChat.users.indexOf(user._id) !== -1 ) {
       
        const removed = await Chat.findByIdAndUpdate(
            chatId,
            {
                $pull: { users: userId }
            },
            {
                new: true
            }
        ).populate("users", "-password")
         .populate("groupAdmin", "-password");

        res.status(200).json(removed)
    }

    
})




module.exports = {
    accesChat,
    fetchAllChatUserHas,
    createGroupChat,
    renameGroupChat,
    addToGroupChat,
    removeFromGroupChat
}