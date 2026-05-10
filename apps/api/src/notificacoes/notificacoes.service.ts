import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificacoesService {
  constructor(private prisma: PrismaService) {}

  async criar(usuarioId: string, titulo: string, corpo: string) {
    return this.prisma.gymfyNotificacao.create({
      data: { usuarioId, titulo, corpo },
    });
  }

  async getMinhas(usuarioId: string) {
    return this.prisma.gymfyNotificacao.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      take: 50,
    });
  }

  async marcarLida(id: string) {
    return this.prisma.gymfyNotificacao.update({ where: { id }, data: { lida: true } });
  }

  async marcarTodasLidas(usuarioId: string) {
    return this.prisma.gymfyNotificacao.updateMany({
      where: { usuarioId, lida: false },
      data: { lida: true },
    });
  }

  async enviarPush(fcmToken: string, titulo: string, corpo: string) {
    const fcmKey = process.env['FCM_SERVER_KEY'];
    if (!fcmKey || !fcmToken) return;

    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${fcmKey}`,
      },
      body: JSON.stringify({
        to: fcmToken,
        notification: { title: titulo, body: corpo },
      }),
    });
  }
}
