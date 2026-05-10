export declare enum RiscoChurn {
    SEM_RISCO = "SEM_RISCO",
    RISCO_BAIXO = "RISCO_BAIXO",
    RISCO_MEDIO = "RISCO_MEDIO",
    RISCO_ALTO = "RISCO_ALTO"
}
export declare enum TipoUsuario {
    ADMIN = "ADMIN",
    ACADEMIA = "ACADEMIA",
    ALUNO = "ALUNO"
}
export declare enum StatusDesafio {
    RASCUNHO = "RASCUNHO",
    ATIVO = "ATIVO",
    FINALIZADO = "FINALIZADO",
    CANCELADO = "CANCELADO"
}
export declare enum StatusResgate {
    PENDENTE = "PENDENTE",
    APROVADO = "APROVADO",
    REJEITADO = "REJEITADO",
    ENTREGUE = "ENTREGUE"
}
export declare enum TipoReacao {
    CORAGEM = "CORAGEM",
    FOGO = "FOGO",
    TROFEU = "TROFEU"
}
export declare const PONTOS_BASE_CHECKIN = 10;
export declare const PONTOS_BONUS_PRIMEIRO_SEMANA = 5;
export declare const PONTOS_BONUS_SEMANA_PERFEITA = 15;
export declare const PONTOS_BONUS_FORA_PICO = 3;
export declare const MAX_CHECKINS_DIA = 1;
export declare const QR_CODE_EXPIRACAO_SEGUNDOS = 60;
export declare const CHURN_DIAS_RISCO_BAIXO = 7;
export declare const CHURN_DIAS_RISCO_MEDIO = 14;
export declare const CHURN_DIAS_RISCO_ALTO = 21;
export declare const SISTEMA_ID = "e416ae5e-fad9-43ac-a6a2-00fde07c744a";
