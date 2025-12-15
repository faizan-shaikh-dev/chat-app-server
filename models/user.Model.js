import mongoose, { Schema } from "mongoose";

const userSchema = Schema({
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    profileImage: {
      type: String,
      default: "",
    },

    about: {
      type: String,
      default: "Hey there i am using NexChat",
    },

    refreshToken: {
      type: String,
      default: null,
    },
  },{timestamps : true}
);

export default mongoose.model("User", userSchema);