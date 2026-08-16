import { Response } from 'express';

const clients = new Set<Response>();

export const addClient = (res: Response) => {
  clients.add(res);
};

export const removeClient = (res: Response) => {
  clients.delete(res);
};

export const broadcastNotification = (notification: Record<string, unknown>) => {
  const payload = `event: notification\ndata: ${JSON.stringify(notification)}\n\n`;
  for (const client of clients) {
    client.write(payload);
  }
};
