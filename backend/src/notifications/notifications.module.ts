import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NotificationsGateway } from './gateway/notifications.gateway';
import { WsAuthGuard } from '../common/guards/ws-auth.guard';

@Module({
  imports: [JwtModule.register({})],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsGateway, WsAuthGuard],
  exports: [NotificationsService],
})
export class NotificationsModule {}
