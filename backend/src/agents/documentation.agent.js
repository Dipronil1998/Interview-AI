import { askOpenAI } from "../services/openai.service.js";

export const documentationAgent = async (message) => {

  const systemPrompt = `
You are a senior technical documentation engineer.

Your job is to create clear documentation
for software projects.

You can create:

- API documentation
- README files
- Architecture documentation
- Function documentation
- Developer guides
- Setup instructions

Use clear structure and practical examples.
`;

  return await askOpenAI({
    systemPrompt,
    userPrompt: message
  });
};