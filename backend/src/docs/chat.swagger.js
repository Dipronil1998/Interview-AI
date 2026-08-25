/**
 * @swagger
 * tags:
 *   - name: Chat
 *     description: AI Interviewer Chat Endpoints
 *   - name: Threads
 *     description: Conversation Thread Management Endpoints
 */

/**
 * @swagger
 * /api/chat:
 *   post:
 *     summary: Send message to AI Interviewer
 *     description: Evaluates candidate answers and responds via AI Interviewer Agent. Pass optional threadId to continue an existing thread.
 *     tags:
 *       - Chat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               threadId:
 *                 type: string
 *                 description: Optional conversation thread ID. If omitted, a new thread is generated.
 *                 example: "a8d29837-1234-4b56-7890-abcdef123456"
 *               message:
 *                 type: string
 *                 description: Candidate voice/text answer
 *                 example: "I have 5 years of experience with React and Node.js..."
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 threadId:
 *                   type: string
 *                   example: "a8d29837-1234-4b56-7890-abcdef123456"
 *                 title:
 *                   type: string
 *                   example: "Technical Interview Session"
 *                 agent:
 *                   type: string
 *                   example: "interviewer"
 *                 response:
 *                   type: string
 *                   example: "Great answer! Can you elaborate on how you handle state management?"
 *       400:
 *         description: Bad Request - Missing required field 'message'
 *       404:
 *         description: Thread not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/threads:
 *   get:
 *     summary: Get all conversation threads
 *     description: Retrieves a list of all active conversation threads sorted by last updated time.
 *     tags:
 *       - Threads
 *     responses:
 *       200:
 *         description: List of conversation threads retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 threads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       threadId:
 *                         type: string
 *                         example: "a8d29837-1234-4b56-7890-abcdef123456"
 *                       title:
 *                         type: string
 *                         example: "Write a React component for a data table"
 *                       messageCount:
 *                         type: integer
 *                         example: 2
 *                       createdAt:
 *                         type: string
 *                         example: "2026-08-18T20:45:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         example: "2026-08-18T20:45:10.000Z"
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/thread/{threadId}:
 *   get:
 *     summary: Get message history for a specific thread
 *     description: Retrieves full message history and metadata for the given threadId.
 *     tags:
 *       - Threads
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique conversation thread ID
 *         example: "a8d29837-1234-4b56-7890-abcdef123456"
 *     responses:
 *       200:
 *         description: Thread messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 threadId:
 *                   type: string
 *                   example: "a8d29837-1234-4b56-7890-abcdef123456"
 *                 title:
 *                   type: string
 *                   example: "Write a React component for a data table"
 *                 messages:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       role:
 *                         type: string
 *                         example: "user"
 *                       content:
 *                         type: string
 *                         example: "Write a React component for a data table"
 *                       agent:
 *                         type: string
 *                         example: "code"
 *       404:
 *         description: Thread not found
 *       500:
 *         description: Internal Server Error
 *   delete:
 *     summary: Delete a specific thread by threadId
 *     description: Permanently deletes the conversation thread and all associated messages.
 *     tags:
 *       - Threads
 *     parameters:
 *       - in: path
 *         name: threadId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique conversation thread ID to delete
 *         example: "a8d29837-1234-4b56-7890-abcdef123456"
 *     responses:
 *       200:
 *         description: Thread deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Thread a8d29837-1234-4b56-7890-abcdef123456 deleted successfully"
 *       404:
 *         description: Thread not found
 *       500:
 *         description: Internal Server Error
 */
