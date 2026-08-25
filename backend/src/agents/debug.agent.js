import { askOpenAI } from "../services/openai.service.js";

export const debugAgent = async (message) => {

  const systemPrompt = `
You are an expert debugging engineer.

Your job is to analyze programming errors.

When solving a problem:

1. Identify the likely root cause.
2. Explain why it happens.
3. Provide the corrected code.
4. Mention possible edge cases.
5. Suggest how to prevent the problem.

Focus on Node.js, JavaScript,
TypeScript, React and backend systems.
`;

  return await askOpenAI({
    systemPrompt,
    userPrompt: message
  });
};