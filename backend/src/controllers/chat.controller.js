import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import Conversation from "../models/Conversation.js";
import { orchestratorAgent } from "../agents/orchestrator.agent.js";
import { interviewerAgent } from "../agents/interviewer.agent.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cvFilePath = path.join(__dirname, "../config/candidate_cv.json");

/**
 * Helper to get default candidate CV JSON from file
 */
const getDefaultCv = () => {
  try {
    if (fs.existsSync(cvFilePath)) {
      const data = fs.readFileSync(cvFilePath, "utf8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading candidate_cv.json:", err);
  }
  return {
    basics: { name: "", label: "", email: "", phone: "", location: "", summary: "" },
    skills: [],
    experience: [],
    projects: [],
    education: [],
  };
};

/**
 * Get current Candidate CV JSON
 * GET /api/cv
 */
export const getCandidateCv = async (req, res) => {
  try {
    const cv = getDefaultCv();
    return res.json({
      success: true,
      cv,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to load CV" });
  }
};

/**
 * Save updated Candidate CV JSON
 * PUT /api/cv
 */
export const updateCandidateCv = async (req, res) => {
  try {
    const { cv } = req.body;
    if (!cv) {
      return res.status(400).json({ success: false, message: "CV payload required" });
    }
    fs.writeFileSync(cvFilePath, JSON.stringify(cv, null, 2), "utf8");
    return res.json({ success: true, cv });
  } catch (error) {
    console.error("Failed to update CV:", error);
    return res.status(500).json({ success: false, message: "Failed to update CV" });
  }
};

/**
 * Start a new AI Interview Session
 * POST /api/interview/start
 */
export const startInterview = async (req, res) => {
  try {
    const { jobDescription, roleTitle, candidateCv } = req.body;

    if (!jobDescription || jobDescription.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Job description is required to start an interview session.",
      });
    }

    const cvData = candidateCv || getDefaultCv();
    const targetRole = roleTitle || "AI Mock Interview";
    const threadId = randomUUID();

    const title = roleTitle ? `Interview: ${roleTitle.substring(0, 30)}` : `Interview Session`;

    const conversation = await Conversation.create({
      threadId,
      title,
      isInterview: true,
      jobDescription,
      candidateCv: cvData,
      roleTitle: targetRole,
      messages: [],
    });

    // Generate initial AI opening question
    const responseText = await interviewerAgent({
      message: "__START_INTERVIEW__",
      jobDescription,
      candidateCv: cvData,
      history: [],
    });

    conversation.messages.push({
      role: "assistant",
      content: responseText,
      agent: "interviewer",
    });

    await conversation.save();

    return res.json({
      success: true,
      threadId: conversation.threadId,
      title: conversation.title,
      isInterview: true,
      roleTitle: conversation.roleTitle,
      agent: "interviewer",
      response: responseText,
      messages: conversation.messages,
    });
  } catch (error) {
    console.error("Start interview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to start AI interview session",
    });
  }
};

/**
 * Send chat message (handles general dev chat OR active interview follow-up)
 * POST /api/chat
 */
export const chat = async (req, res) => {
  try {
    const { threadId, message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: "message is required",
      });
    }

    let conversation;
    const autoTitle = message.length > 50 ? message.substring(0, 50) + "..." : message;

    if (threadId) {
      conversation = await Conversation.findOne({ threadId });
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Thread not found",
        });
      }
    } else {
      const newThreadId = randomUUID();
      conversation = await Conversation.create({
        threadId: newThreadId,
        title: autoTitle,
        messages: [],
      });
    }

    // Append user message
    conversation.messages.push({
      role: "user",
      content: message,
    });

    let result;

    // Check if this thread is an AI Interview session
    if (conversation.isInterview) {
      const responseText = await interviewerAgent({
        message,
        jobDescription: conversation.jobDescription,
        candidateCv: conversation.candidateCv || getDefaultCv(),
        history: conversation.messages,
      });

      result = {
        agent: "interviewer",
        response: responseText,
      };
    } else {
      // Standard Multi-Agent System
      result = await orchestratorAgent(message);
    }

    conversation.messages.push({
      role: "assistant",
      content: result.response,
      agent: result.agent,
    });

    await conversation.save();

    return res.json({
      success: true,
      threadId: conversation.threadId,
      title: conversation.title,
      isInterview: conversation.isInterview || false,
      roleTitle: conversation.roleTitle || null,
      agent: result.agent,
      response: result.response,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong",
    });
  }
};

/**
 * Get all conversation threads
 * GET /api/threads
 */
export const getAllThreads = async (req, res) => {
  try {
    const threads = await Conversation.find()
      .select("threadId title isInterview roleTitle messages createdAt updatedAt")
      .sort({ updatedAt: -1 });

    const threadList = threads.map((t) => ({
      threadId: t.threadId,
      title: t.title || "Untitled Conversation",
      isInterview: t.isInterview || false,
      roleTitle: t.roleTitle || null,
      messageCount: t.messages.length,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }));

    return res.json({
      success: true,
      count: threadList.length,
      threads: threadList,
    });
  } catch (error) {
    console.error("Get all threads error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve threads",
    });
  }
};

/**
 * Get messages by threadId
 * GET /api/thread/:threadId
 */
export const getThreadMessages = async (req, res) => {
  try {
    const { threadId } = req.params;

    const conversation = await Conversation.findOne({ threadId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    return res.json({
      success: true,
      threadId: conversation.threadId,
      title: conversation.title,
      isInterview: conversation.isInterview || false,
      roleTitle: conversation.roleTitle || null,
      jobDescription: conversation.jobDescription || "",
      candidateCv: conversation.candidateCv || null,
      messages: conversation.messages,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    });
  } catch (error) {
    console.error("Get thread messages error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve thread messages",
    });
  }
};

/**
 * Delete thread by threadId
 * DELETE /api/thread/:threadId
 */
export const deleteThread = async (req, res) => {
  try {
    const { threadId } = req.params;
    const conversation = await Conversation.findOneAndDelete({ threadId });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Thread not found",
      });
    }

    return res.json({
      success: true,
      message: `Thread ${threadId} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete thread error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete thread",
    });
  }
};