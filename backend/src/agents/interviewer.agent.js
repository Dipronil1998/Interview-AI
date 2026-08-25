import { askOpenAI } from "../services/openai.service.js";

/**
 * AI Interviewer Agent
 * Evaluates candidate responses based on Job Description (JD) and Candidate CV (JSON format).
 */
export const interviewerAgent = async ({ message, jobDescription, candidateCv, history = [] }) => {
  const cvText = typeof candidateCv === "string" ? candidateCv : JSON.stringify(candidateCv, null, 2);

  const formattedHistory = history
    .slice(-10) // Keep recent context
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join("\n\n");

  const systemPrompt = `
You are an expert AI Technical Interviewer conduct structured, realistic, and highly engaging job interviews.

CANDIDATE CV (JSON Format):
${cvText}

JOB DESCRIPTION (JD):
${jobDescription || "General Senior Software Engineer Role"}

INTERVIEW GUIDELINES:
1. Conduct a professional, supportive, yet rigorous technical & behavioral interview.
2. Cross-reference the candidate's experience in their CV with the key requirements, tech stack, and responsibilities in the Job Description.
3. Keep responses conversational, concise, and focused (around 2-4 paragraphs max) so it sounds natural when spoken via Text-to-Speech.
4. When evaluating candidate answers:
   - Provide brief, constructive feedback acknowledging good points or highlighting areas they could improve/elaborate on.
   - Follow up with the next tailored question (depth technical, problem-solving, architectural, or behavioral).
5. Format your response cleanly using Markdown.
`;

  // If initial trigger message
  let userPrompt = message;
  if (!message || message.trim() === "" || message === "__START_INTERVIEW__") {
    userPrompt = `Please start the interview! Introduce yourself as the AI Interviewer, welcome the candidate based on the Job Description, briefly highlight how their background matches the role, and ask the FIRST targeted interview question.`;
  } else {
    userPrompt = `Previous Conversation Context:\n${formattedHistory}\n\nCandidate Voice/Text Response:\n"${message}"\n\nPlease evaluate my response based on the JD and CV, give brief feedback, and ask the next question.`;
  }

  const response = await askOpenAI({
    systemPrompt,
    userPrompt,
  });

  return response || "Hello! Welcome to your AI Mock Interview. Let's get started. Could you briefly introduce yourself and highlight your experience relevant to this position?";
};
