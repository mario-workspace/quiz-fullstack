import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import * as chatService from '../services/chat.service';

export async function chatRoutes(app: FastifyInstance) {
  app.post('/chat', async (request, reply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    const body = z.object({ message: z.string().min(1).max(2000) }).parse(request.body);
    const replyText = await chatService.answerQuestion(body.message, request.user);
    return { reply: replyText };
  });
}
