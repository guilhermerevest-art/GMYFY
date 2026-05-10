export enum RiscoChurn {
  SEM_RISCO = 'SEM_RISCO',
  RISCO_BAIXO = 'RISCO_BAIXO',
  RISCO_MEDIO = 'RISCO_MEDIO',
  RISCO_ALTO = 'RISCO_ALTO',
}

export enum TipoUsuario {
  ADMIN = 'ADMIN',
  ACADEMIA = 'ACADEMIA',
  ALUNO = 'ALUNO',
}

export enum StatusDesafio {
  RASCUNHO = 'RASCUNHO',
  ATIVO = 'ATIVO',
  FINALIZADO = 'FINALIZADO',
  CANCELADO = 'CANCELADO',
}

export enum StatusResgate {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
  ENTREGUE = 'ENTREGUE',
}

export enum TipoReacao {
  CORAGEM = 'CORAGEM',
  FOGO = 'FOGO',
  TROFEU = 'TROFEU',
}

export const PONTOS_BASE_CHECKIN = 10;
export const PONTOS_BONUS_PRIMEIRO_SEMANA = 5;
export const PONTOS_BONUS_SEMANA_PERFEITA = 15;
export const PONTOS_BONUS_FORA_PICO = 3;
export const MAX_CHECKINS_DIA = 1;
export const QR_CODE_EXPIRACAO_SEGUNDOS = 60;
export const CHURN_DIAS_RISCO_BAIXO = 7;
export const CHURN_DIAS_RISCO_MEDIO = 14;
export const CHURN_DIAS_RISCO_ALTO = 21;
export const SISTEMA_ID = 'e416ae5e-fad9-43ac-a6a2-00fde07c744a';
