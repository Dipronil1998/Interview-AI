import express from "express";

import {
  chat,
  startInterview,
  getCandidateCv,
  updateCandidateCv,
  getAllThreads,
  getThreadMessages,
  deleteThread,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/chat", chat);
router.post("/interview/start", startInterview);
router.get("/cv", getCandidateCv);
router.put("/cv", updateCandidateCv);

router.get("/threads", getAllThreads);
router.get("/thread/:threadId", getThreadMessages);
router.delete("/thread/:threadId", deleteThread);

export default router;