import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface WhatsAppMessage {
  number: string;
  text: string;
}

export interface EvolutionResponse {
  key: { id: string };
  message: Record<string, unknown>;
  messageTimestamp: number;
  status: string;
}

@Injectable()
export class WhatsAppService {
  private readonly logger = new Logger(WhatsAppService.name);

  constructor(private config: ConfigService) {}

  private get baseUrl(): string {
    return this.config.get<string>('EVOLUTION_API_URL', '');
  }

  private get apiKey(): string {
    return this.config.get<string>('EVOLUTION_API_KEY', '');
  }

  private get instance(): string {
    return this.config.get<string>('EVOLUTION_INSTANCE', 'gymfy');
  }

  private isConfigured(): boolean {
    return !!(this.baseUrl && this.apiKey);
  }

  async enviarMensagem(numero: string, texto: string): Promise<EvolutionResponse | null> {
    if (!this.isConfigured()) {
      this.logger.warn('Evolution API não configurada — mensagem não enviada');
      return null;
    }

    const numeroFormatado = this.formatarNumero(numero);

    try {
      const res = await fetch(`${this.baseUrl}/message/sendText/${this.instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: numeroFormatado,
          options: { delay: 1200, presence: 'composing' },
          textMessage: { text: texto },
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        this.logger.error(`Evolution API erro ${res.status}: ${err}`);
        return null;
      }

      return res.json() as Promise<EvolutionResponse>;
    } catch (err) {
      this.logger.error('Falha ao enviar WhatsApp', err);
      return null;
    }
  }

  async enviarImagem(numero: string, imageUrl: string, legenda?: string): Promise<EvolutionResponse | null> {
    if (!this.isConfigured()) return null;

    const numeroFormatado = this.formatarNumero(numero);

    try {
      const res = await fetch(`${this.baseUrl}/message/sendMedia/${this.instance}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: this.apiKey,
        },
        body: JSON.stringify({
          number: numeroFormatado,
          options: { delay: 1200 },
          mediaMessage: {
            mediatype: 'image',
            media: imageUrl,
            caption: legenda ?? '',
          },
        }),
      });

      if (!res.ok) return null;
      return res.json() as Promise<EvolutionResponse>;
    } catch {
      return null;
    }
  }

  async verificarConexao(): Promise<{ connected: boolean; state?: string }> {
    if (!this.isConfigured()) return { connected: false, state: 'not_configured' };

    try {
      const res = await fetch(`${this.baseUrl}/instance/connectionState/${this.instance}`, {
        headers: { apikey: this.apiKey },
      });

      if (!res.ok) return { connected: false };

      const data = (await res.json()) as { instance?: { state?: string } };
      const state = data?.instance?.state ?? 'unknown';
      return { connected: state === 'open', state };
    } catch {
      return { connected: false };
    }
  }

  async obterQrCode(): Promise<{ qrcode?: string; base64?: string } | null> {
    if (!this.isConfigured()) return null;

    try {
      const res = await fetch(`${this.baseUrl}/instance/connect/${this.instance}`, {
        headers: { apikey: this.apiKey },
      });

      if (!res.ok) return null;
      return res.json() as Promise<{ qrcode?: string; base64?: string }>;
    } catch {
      return null;
    }
  }

  // Templates de mensagem

  mensagemChurnRiscoMedio(nomeAluno: string, nomeAcademia: string, dias: number): string {
    return (
      `Olá, ${nomeAluno}! 👋\n\n` +
      `Sentimos sua falta na *${nomeAcademia}*! Faz ${dias} dias que você não aparece por aqui.\n\n` +
      `Que tal retomar seus treinos hoje? Sua sequência está esperando por você! 💪\n\n` +
      `_Gymfy — Gamificação para academias_`
    );
  }

  mensagemChurnRiscoAlto(nomeAluno: string, nomeAcademia: string, dias: number): string {
    return (
      `Oi, ${nomeAluno}! 😢\n\n` +
      `Já faz *${dias} dias* que você não treina na *${nomeAcademia}*. Estamos com saudades!\n\n` +
      `Sabemos que a rotina pode ser difícil, mas cada treino conta. Que tal dar o primeiro passo hoje?\n\n` +
      `Entre em contato com a academia — temos uma surpresa especial para te receber de volta! 🎁\n\n` +
      `_Gymfy — Gamificação para academias_`
    );
  }

  mensagemCheckinConfirmado(nomeAluno: string, pontos: number, posicaoRanking?: number): string {
    let msg =
      `✅ *Check-in confirmado!*\n\n` +
      `Parabéns, ${nomeAluno}! Você ganhou *${pontos} pontos* neste treino.\n`;

    if (posicaoRanking) {
      msg += `\n🏆 Você está em *${posicaoRanking}º lugar* no ranking do mês!\n`;
    }

    msg += `\nContinue assim! 💪\n\n_Gymfy_`;
    return msg;
  }

  mensagemConquista(nomeAluno: string, nomeConquista: string, descricao: string): string {
    return (
      `🏅 *Nova conquista desbloqueada!*\n\n` +
      `Parabéns, ${nomeAluno}!\n\n` +
      `Você conquistou: *${nomeConquista}*\n` +
      `_${descricao}_\n\n` +
      `Continue treinando para desbloquear mais conquistas! 🚀\n\n` +
      `_Gymfy_`
    );
  }

  mensagemResgateAprovado(nomeAluno: string, nomePremio: string): string {
    return (
      `🎁 *Resgate aprovado!*\n\n` +
      `Oi, ${nomeAluno}! Seu resgate de *${nomePremio}* foi aprovado pela academia.\n\n` +
      `Apresente este comprovante na recepção para retirar seu prêmio. 😊\n\n` +
      `_Gymfy_`
    );
  }

  mensagemDesafioIniciado(nomeAluno: string, nomeDesafio: string, fimEm: Date): string {
    const dataFim = fimEm.toLocaleDateString('pt-BR');
    return (
      `🏋️ *Novo desafio disponível!*\n\n` +
      `Oi, ${nomeAluno}! Um novo desafio foi lançado na sua academia:\n\n` +
      `*${nomeDesafio}*\n` +
      `📅 Termina em: ${dataFim}\n\n` +
      `Abra o app Gymfy para participar! 🎯\n\n` +
      `_Gymfy_`
    );
  }

  mensagemPersonalizada(nomeAluno: string, texto: string, nomeAcademia: string): string {
    return `Olá, ${nomeAluno}! 👋\n\n${texto}\n\n_${nomeAcademia} via Gymfy_`;
  }

  private formatarNumero(numero: string): string {
    // Remove tudo que não é dígito
    const digits = numero.replace(/\D/g, '');

    // Se já tem código do país (55 para Brasil), retorna como está
    if (digits.startsWith('55') && digits.length >= 12) return digits;

    // Adiciona código do Brasil
    return `55${digits}`;
  }
}
