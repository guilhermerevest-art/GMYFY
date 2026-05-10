import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RankingService } from './ranking.service';

@WebSocketGateway({ namespace: '/ranking', cors: { origin: '*' } })
export class RankingGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(private rankingService: RankingService) {}

  handleConnection(client: Socket) {
    const academiaId = client.handshake.query['academiaId'] as string;
    if (academiaId) {
      client.join(`ranking:${academiaId}`);
    }
  }

  @SubscribeMessage('getRanking')
  async handleGetRanking(client: Socket, payload: { academiaId: string; periodo?: string }) {
    const ranking = await this.rankingService.getRanking(payload.academiaId, payload.periodo);
    client.emit('rankingUpdate', ranking);
  }

  async notificarAtualizacao(academiaId: string) {
    const ranking = await this.rankingService.getRanking(academiaId);
    this.server.to(`ranking:${academiaId}`).emit('rankingUpdate', ranking);
  }
}
