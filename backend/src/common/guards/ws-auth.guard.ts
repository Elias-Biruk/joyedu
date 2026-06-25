import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtPayload } from '../decorators/current-user.decorator';

@Injectable()
export class WsAuthGuard implements CanActivate {
  private logger = new Logger(WsAuthGuard.name);

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractToken(client);

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      (client as Socket & { user: JwtPayload }).user = payload;
      return true;
    } catch {
      this.logger.warn(`WebSocket auth failed for client ${client.id}`);
      throw new WsException('Invalid authentication token');
    }
  }

  private extractToken(client: Socket): string | null {
    const authHeader = client.handshake?.auth?.token
      || client.handshake?.headers?.authorization;

    if (!authHeader) return null;

    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return authHeader as string;
  }
}
