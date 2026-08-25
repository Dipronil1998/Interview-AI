import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },

    content: {
      type: String,
      required: true,
    },

    agent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const conversationSchema = new mongoose.Schema(
  {
    threadId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      default: "New Conversation",
      trim: true,
    },

    isInterview: {
      type: Boolean,
      default: false,
    },

    jobDescription: {
      type: String,
      default: "",
    },

    candidateCv: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    roleTitle: {
      type: String,
      default: "Software Engineer",
    },

    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

const Conversation = mongoose.model(
  "Conversation",
  conversationSchema
);

export default Conversation;