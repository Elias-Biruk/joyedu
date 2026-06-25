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
import { ChatService } from '../chat.service';
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
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger(ChatGateway.name);

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    this.logger.log(`Chat client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage('joinChat')
  @UseGuards(WsAuthGuard)
  handleJoinChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.join(`chat:${chatId}`);
    this.logger.log(`Client ${client.id} joined chat:${chatId}`);
  }

  @SubscribeMessage('leaveChat')
  @UseGuards(WsAuthGuard)
  handleLeaveChat(@ConnectedSocket() client: Socket, @MessageBody() chatId: string) {
    client.leave(`chat:${chatId}`);
  }

  @SubscribeMessage('sendMessage')
  @UseGuards(WsAuthGuard)
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; content: string },
  ) {
    const user = (client as Socket & { user: JwtPayload }).user;
    const message = await this.chatService.sendMessage(user.sub, {
      chatId: data.chatId,
      content: data.content,
    });
    this.server.to(`chat:${data.chatId}`).emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('typing')
  @UseGuards(WsAuthGuard)
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    const user = (client as Socket & { user: JwtPayload }).user;
    client.to(`chat:${data.chatId}`).emit('userTyping', {
      userId: user.sub,
      isTyping: data.isTyping,
    });
  }
}
