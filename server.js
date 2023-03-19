const dotenv = require('dotenv').config();
const express = require('express');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const http = require('http');
const socketio = require('socket.io');

const userRoutes = require("./routes/userRoutes");
const contactUsRoutes = require("./routes/contactUsRoute");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const errorHandler = require("./middleWare/errorHandler");

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: ["http://localhost:3000", "https://blabbing-free.vercel.app"],
        credentials: true,
        methods: ["GET", "POST","DELETE", "PATCH","PUT", "OPTIONS"]
    }
});

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URI;

// connect to mongo
mongoose.set('strictQuery',false);

// middlwares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors({
    origin: ["http://localhost:3000", "https://blabbing-free.vercel.app"],
    credentials: true
}));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
    res.header("Access-Control-Allow-Credentials", "true");
    next();
});

// upload folder directory
app.use("/uploads",express.static(path.join(__dirname,"uploads")));

// Routes middleware
app.use("/api/users",userRoutes);
app.use("/api/contactus", contactUsRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages",messageRoutes)

app.get("/",(req,res)=>{
     res.send("Home Page")
});

// Error middleware
app.use(errorHandler);

// Socket.io setup
io.on('connection', (socket) => {
    console.log(`User ${socket.id} connected`);
    socket.on("setup", (userData) => {
        socket.join(userData?._id);
        console.log(userData?._id)
        socket.emit("connected")
    });
    socket.on("Join chat", (room) => {
        socket.join(room);
        console.log("user just joined", room)
    });
    socket.on("typing", (room) => socket.in(room).emit("typing"));
    socket.on("stop-typing", (room) => socket.in(room).emit("stop-typing"));
    socket.on("new mesaage", (newMEssageRecived) => {
        var chat = newMEssageRecived?.chat;
       
        if (!chat?.users) {
            return console.log("no cat.users")
        };

        chat?.users.forEach(user => {
            if (user?._id === newMEssageRecived?.sender?._id) {
                return;
            };
            io.to(user?._id).emit("new message received", newMEssageRecived);

            console.log(user?._id, "user id", newMEssageRecived)
            
        });
    });


});

mongoose
.connect(MONGO_URL)
.then(()=>{
    server.listen(PORT,()=>{
        console.log(`server is connected to port ${PORT}`)
    })
})
.catch(err=>{
    console.log(err)
});
