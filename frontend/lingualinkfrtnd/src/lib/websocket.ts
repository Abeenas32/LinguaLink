type MessageHandler = (data: WebSocketMessage) => void;

export interface WebSocketMessage {
  type: string;
  [key: string]: unknown;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private handlers: Map<string, Set<MessageHandler>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      if (this.isConnecting) {
        reject(new Error('Already connecting'));
        return;
      }

      this.isConnecting = true;

      try {
        this.ws = new WebSocket(`ws://localhost:3000/chat?token=${token}`);

        this.ws.onopen = () => {
          console.log('[WS] Connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketMessage;
            console.log('[WS] Received:', data.type, data);
            if (data.type === 'error') {
              console.error('[WS] Error received:', data);
            }
            this.emit(data.type, data);
          } catch (err) {
            console.error('[WS] Parse error:', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('[WS] Error:', error);
          this.isConnecting = false;
        };

        this.ws.onclose = () => {
          console.log('[WS] Disconnected');
          this.isConnecting = false;
          this.emit('disconnected', { type: 'disconnected' });
          this.attemptReconnect(token);
        };
      } catch (err) {
        this.isConnecting = false;
        reject(err);
      }
    });
  }

  private attemptReconnect(token: string) {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('[WS] Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      this.connect(token).catch(console.error);
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(message: WebSocketMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('[WS] Sending:', message.type);
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('[WS] Cannot send - not connected');
    }
  }

  on(type: string, handler: MessageHandler) {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set());
    }
    this.handlers.get(type)!.add(handler);
  }

  off(type: string, handler: MessageHandler) {
    this.handlers.get(type)?.delete(handler);
  }

  private emit(type: string, data: WebSocketMessage) {
    this.handlers.get(type)?.forEach(handler => handler(data));
    this.handlers.get('*')?.forEach(handler => handler(data));
  }

  get isConnected() {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsManager = new WebSocketManager();
