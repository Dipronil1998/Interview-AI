import { askOpenAI } from "../services/openai.service.js";

import { codeAgent } from "./code.agent.js";
import { debugAgent } from "./debug.agent.js";
import { databaseAgent } from "./database.agent.js";
import {
  documentationAgent
} from "./documentation.agent.js";

export const detectAgent = async (message) => {
  const systemPrompt = `
You are the router of a Multi-Agent Developer Assistant system.
Analyze the user's input and classify which specialized agent should handle it.
Respond with EXACTLY ONE word from these options:
- CODE (for writing code, refactoring, implementation logic)
- DEBUG (for errors, bugs, stack traces, troubleshooting)
- DATABASE (for SQL, NoSQL, MongoDB, schemas, queries)
- DOCUMENTATION (for READMEs, API docs, inline comments)
- GENERAL (for general questions or other topics)
`;

  const response = await askOpenAI({
    systemPrompt,
    userPrompt: message
  });

  return response ? response.trim() : "GENERAL";
};

export const orchestratorAgent = async (message) => {

  const agent = await detectAgent(message);

  const selectedAgent = agent
    .trim()
    .toUpperCase();

  switch (selectedAgent) {

    case "CODE":
      return {
        agent: "code",
        response: await codeAgent(message)
      };

    case "DEBUG":
      return {
        agent: "debug",
        response: await debugAgent(message)
      };

    case "DATABASE":
      return {
        agent: "database",
        response: await databaseAgent(message)
      };

    case "DOCUMENTATION":
      return {
        agent: "documentation",
        response: await documentationAgent(message)
      };

    default:
      return {
        agent: "general",
        response: await askOpenAI({
          systemPrompt: `
You are a helpful software development assistant.
Answer the user's programming question clearly.
`,
          userPrompt: message
        })
      };
  }
};