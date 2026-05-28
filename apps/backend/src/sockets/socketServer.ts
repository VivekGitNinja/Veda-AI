import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import { redisClient } from '../config/db';

// Map to track active subscriptions: assignmentId -> Set of WebSockets
const subscriptions = new Map<string, Set<WebSocket>>();

export const initSocketServer = (server: http.Server) => {
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  });

  // Setup Redis Pub/Sub subscription for progress updates
  const redisSubClient = redisClient.duplicate();
  redisSubClient.on('error', (err) => {
    console.error('Redis Sub client error:', err);
  });
  
  redisSubClient.connect().then(() => {
    console.log('Redis Sub client connected for WebSocket updates');
    redisSubClient.subscribe('assignment-updates', (message) => {
      try {
        const data = JSON.parse(message);
        const clients = subscriptions.get(data.assignmentId);
        if (clients && clients.size > 0) {
          const payload = JSON.stringify({
            type: 'progress',
            assignmentId: data.assignmentId,
            status: data.status,
            progress: data.progress,
            ...data.additionalData,
          });
          console.log(`Broadcasting progress from Redis Sub for ${data.assignmentId}: status=${data.status}, progress=${data.progress}`);
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(payload);
            }
          });
        }
      } catch (err) {
        console.error('Error handling Redis Pub/Sub message:', err);
      }
    });
  }).catch(err => {
    console.error('Failed to connect Redis Sub client:', err);
  });

  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');

    // Keep track of what this socket subscribed to so we can clean up
    let subscribedId: string | null = null;

    ws.on('message', (message: string) => {
      try {
        const data = JSON.parse(message.toString());
        if (data.type === 'subscribe' && data.assignmentId) {
          const id = data.assignmentId;

          // Remove from previous subscription if any
          if (subscribedId && subscriptions.has(subscribedId)) {
            subscriptions.get(subscribedId)?.delete(ws);
          }

          subscribedId = id;
          if (!subscriptions.has(id)) {
            subscriptions.set(id, new Set());
          }
          subscriptions.get(id)!.add(ws);
          console.log(`Socket subscribed to updates for assignment: ${id}`);

          // Acknowledge subscription
          ws.send(JSON.stringify({ type: 'subscribed', assignmentId: id }));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
      if (subscribedId && subscriptions.has(subscribedId)) {
        subscriptions.get(subscribedId)?.delete(ws);
        if (subscriptions.get(subscribedId)?.size === 0) {
          subscriptions.delete(subscribedId);
        }
      }
    });

    ws.on('error', (err) => {
      console.error('WebSocket client error:', err);
    });
  });

  console.log('WebSocket server initialized');
};

export const broadcastProgress = async (
  assignmentId: string,
  status: string,
  progress: number,
  additionalData: Record<string, any> = {}
) => {
  // 1. Publish progress to Redis Pub/Sub channel
  try {
    if (redisClient.isOpen) {
      await redisClient.publish(
        'assignment-updates',
        JSON.stringify({
          assignmentId,
          status,
          progress,
          additionalData,
        })
      );
    }
  } catch (err) {
    console.error('Failed to publish progress update to Redis Pub/Sub:', err);
  }

  // 2. Also broadcast directly to local connection clients
  const clients = subscriptions.get(assignmentId);
  if (clients && clients.size > 0) {
    const payload = JSON.stringify({
      type: 'progress',
      assignmentId,
      status,
      progress,
      ...additionalData,
    });
    console.log(`Broadcasting progress locally for ${assignmentId}: status=${status}, progress=${progress}`);
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }
};

export default initSocketServer;
