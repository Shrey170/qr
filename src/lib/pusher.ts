import Pusher from 'pusher';

export const pusherServer = new Pusher({
  appId: process.env.PUSHER_APP_ID || 'mock-app-id',
  key: process.env.NEXT_PUBLIC_PUSHER_KEY || 'mock-key',
  secret: process.env.PUSHER_SECRET || 'mock-secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});
