import User from "../models/user.Model.js";
import Chat from "../models/chat.Models.js";

//Create new Chat
export const createChat = async (req, res) => {
  try {
    const { id } = req.user;
    const { otherUserPhone } = req.body;

    if (!otherUserPhone) {
      return res.status(400).json({ message: "This field is required" });
    }

    const otherUser = await User.findOne({ phone: otherUserPhone });

    if (!otherUser) {
      return res
        .status(404)
        .json({ message: "User not found with this Phone Number" });
    }

    if (otherUser._id.toString() === id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot create a chat with yourself" });
    }

    const existingChat = await Chat.findOne({
      isGroup: false,
      participants: { $all: [otherUser._id, id] }, //$all covers all the id of the queary
    });

    if (existingChat) {
      return res
        .status(400)
        .json({ message: "Chat Alredy exists", chat: existingChat });
    }

    const chat = await Chat.create({
      isGroup: false,
      participants: [otherUser._id, id],
    });

    const fullChatDetails = await Chat.findById(chat._id).populate(
      "participants",
      "name about profileImage phone"
    );

    return res
      .status(201)
      .json({ message: "Chat Created", chat: fullChatDetails });
  } catch (error) {
    console.error("Internal server error");
    return res.status(500).json({ error });
  }
};

//getMyChats
export const getMyChats = async (req, res) => {
  try {
    const { id } = req.user;

    const chats = await Chat.find({
      participants: id,
    })
      .populate("participants", "name about profileImage phone")
      .populate("lastMessage")
      // .populate({
      //   path: "lastMessage",
      //   populate: { path: "senderId", select: "name profileImage" },
      // })
      .sort({ updatedAt: -1 });

    return res.status(200).json({ message: "Fetched Successfully", chats });
  } catch (error) {
    console.error("Internal Server error");
    return res.status(500).json(error);
  }
};


//GetChatById
export const getChatById = async (req, res) => {
  try {
    const { id } = req.user;
    const { otherUserPhone } = req.params;

    const otherUser = await User.findOne({ phone: otherUserPhone });

    if (!otherUser) {
      return res
        .status(404)
        .json({ message: "User not found with this phone number" });
    }

    const chat = await Chat.findOne({
      isGroup: false,
      participants: {
        $all: [id, otherUser._id],
      },
    })
    .populate("participants", "name about profileImage phone")
      .populate("lastMessage")

    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json({ message: "Chat fetched succesfully", chat });
  } catch (error) {
    console.error("Internal server error");
    return res.status(500).json({ error });
  }
};
