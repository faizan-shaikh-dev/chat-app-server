import Message from "../models/message.Models.js";
import Chat from "../models/chat.Models.js";
//Create message
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.user;
    const { chatId } = req.params;
    const { content, messageType = "text" } = req.body;

    if (!chatId || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const message = await Message.create({
      senderId: id,
      chatId,
      content,
      messageType,
    });

    // Update lastMessage fields
    await Chat.findByIdAndUpdate(chatId, { lastMessage: message });

    //Populate fileds
    const fullMessage = await Message.findById(message._id).populate(
      "senderId",
      "name profileImage phone"
    );

    req.io.to(chatId).emit("emit_message", fullMessage);

    return res
      .status(201)
      .json({ message: "Message sent sucessfully", data: fullMessage });
  } catch (error) {
    console.error("Internal serever error");
    console.log(error);
    return res.status(500).json({ message: error });
  }
};

//Get Message

export const getMessage = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { id } = req.user;

    const message = await Message.find({ chatId, deleteFor: { $ne: id } })
      .populate("senderId", "name, phone")
      .sort({ createdAt: 1 });

    return res.status(200).json({
      message: "Message fetched Successfully",
      message,
    });
  } catch (error) {
    console.error("Inetrnal server error");

    return res.status(500).json({ error });
  }
};

//Delete For me
export const deleteForMe = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { id } = req.user;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deleteFor: id },
    });

    return res.status(200).json({
      message: "Message delete for you",
    });
  } catch (error) {
    console.error("Internal server error");
    return res.status(500).json({ error });
  }
};


//DeleteFor EveryOne

export const deleteForEveryOne = async (req, res) =>{
  try {
    const {messageId} = req.params;
    await Message.findByIdAndUpdate(messageId, {
      content: "This message is deleted for everyone",
      mediaUrl: null,
    });

    return res.status(200).json({
      message: "Message deleted"
    });

    
  } catch (error) {
    console.error("Inetrnal server error");
    return res.status(500).json({error});
    
  }
};