import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from './routes/messageRoutes.js'
import { chekAuth } from "./middleware/auth.middle.js";
import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
connectDB();

const app = express();
//create New server
const httpServer = createServer(app);

//create io server
const io = new Server(httpServer, {
  cors: { origin: ["http://localhost:3000"], methods: ["GET", "POST"] },
});

//create middleware
app.use((req, res, next) => {
  req.io = io;
  next();
});

//Creating connections
io.on("connection", (socket) => {
  console.log(`Client connected on socket ID: ${socket.id}`);

  //socket for joining room
  socket.on("Join_room", (chatId) => {
    socket.join(chatId);
    console.log(`User join chat : ${chatId}`);
  });

  //Socket for typing...
  socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing...");
  });

  //Socket for stop typing
  socket.on("stop_socket", (chatId) => {
    socket.to(chatId).emit("stop_typing");
  });

  //Socket for disconnecting
  socket.on("disconnect", () => {
    console.log(`User disconnected`);
  });
});

app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(express.json());
app.use(cookieParser());

//Base URL
app.get("/", (req, res) => {
  res.send("Server is running");
});

//Auth Base Route
app.use("/api/auth", authRoutes);

//Chat Base Route
app.use("/api/chats", chekAuth, chatRoutes);

//Message Base Route
app.use('/api/message', chekAuth, messageRoutes)

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
