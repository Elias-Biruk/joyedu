import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../../common/guards/ws-auth.guard';
import { JwtPayload } from '../../common/decorators/current-user.decorator';

@WebSocketGateway({
  cors: {
    origin: process.env.CORS_ORIGIN?.split(',') || [
      'http://localhost',
      'http://localhost:3000',
      'http://127.0.0.1',
      'http://127.0.0.1:3000',
    ],
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger(NotificationsGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('join')
  @UseGuards(WsAuthGuard)
  handleJoin(@ConnectedSocket() client: Socket, @MessageBody() _userId: string) {
    const user = (client as Socket & { user: JwtPayload }).user;
    client.join(`user:${user.sub}`);
    this.logger.log(`User ${user.sub} joined notifications room`);
  }

  sendNotification(userId: string, notification: Record<string, unknown>) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}
