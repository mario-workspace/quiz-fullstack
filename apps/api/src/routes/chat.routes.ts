import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as chatService from '../services/chat.service';

const chatTurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
});

export async function chatRoutes(app: FastifyInstance) {
  app.post('/chat', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = z
      .object({
        message: z.string().min(1).max(2000),
        history: z.array(chatTurnSchema).max(20).optional(),
      })
      .parse(request.body);

    const replyText = await chatService.answerQuestion(body.message, request.user, {
      history: body.history,
    });
    return { reply: replyText };
  });
}
