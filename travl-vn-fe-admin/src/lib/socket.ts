import { io, Socket } from 'socket.io-client';

type DefaultEvents = 'connect' | 'disconnect' | string;
type Handler = (...args: any[]) => void;

class SocketService {
  private socket: Socket | null = null;

  connect(url: string = import.meta.env.VITE_SOCKET_URL): Socket {
    if (!this.socket) {
      this.socket = io(url);

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
      });
    }
    return this.socket;
  }

  on(event: DefaultEvents, handler: Handler): void {
    if (this.socket) {
      this.socket.on(event, handler);
    }
  }

  off(event: DefaultEvents, handler: Handler): void {
    if (this.socket) {
      this.socket.off(event, handler);
    }
  }

  emit(event: DefaultEvents, data?: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

const socketService = new SocketService();
export default socketService;
