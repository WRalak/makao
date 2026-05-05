import { NextApiRequest, NextApiResponse } from 'next';
import { Server as NetServer } from 'http';
import { initSocket } from '@/lib/socket';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if ((res.socket as any) && (res.socket as any).server && !(res.socket as any).server.io) {
    console.log('Initializing Socket.io server...');
    
    // Initialize Socket.io server
    const socketService = initSocket((res.socket as any).server);
    (res.socket as any).server.io = socketService;
  }
  
  res.end();
}
