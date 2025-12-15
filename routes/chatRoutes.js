import express from "express";
import {
  createChat,
  getChatById,
  getMyChats,
} from "../controllers/chat.Controller.js";

const router = express.Router();

//Create Chat
router.post("/create", createChat);
//Get MyChats
router.get("/my", getMyChats);

//getChatById
router.get(`/:otherUserPhone`, getChatById);
export default router;
