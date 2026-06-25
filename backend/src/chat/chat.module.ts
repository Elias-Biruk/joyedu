import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './gateway/chat.gateway';
import { WsAuthGuard } from '../common/guards/ws-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway, WsAuthGuard],
  exports: [ChatService],
})
export class ChatModule {}
