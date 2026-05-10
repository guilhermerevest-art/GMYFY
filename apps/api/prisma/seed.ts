import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();
const SISTEMA_ID = "e416ae5e-fad9-43ac-a6a2-00fde07c744a";

async function main() {
  console.log("Seeding database...");

  const academia = await prisma.gymfyAcademia.upsert({
    where: { email: "contato@academiafit.com.br" },
    update: {},
    create: {
      sistemaId: SISTEMA_ID,
      nome: "Academia FitLife",
      slug: "fitlife-uberlandia",
      email: "contato@academiafit.com.br",
      telefone: "(34) 99999-0001",
      endereco: "Av. Rondon Pacheco, 1234 - Uberlandia/MG",
    },
  });
  console.log("Academia criada:", academia.nome);

  await prisma.gymfyConfiguracaoAcademia.upsert({
    where: { academiaId: academia.id },
    update: {},
    create: {
      academiaId: academia.id,
      horarioPicoInicio: "07:00",
      horarioPicoFim: "09:00",
      minimoCheckinsSemana: 3,
    },
  });

  const senhaHash = await bcrypt.hash("Gymfy@2025!", 10);

  await prisma.gymfyUsuario.upsert({
    where: { email: "admin@academiafit.com.br" },
    update: {},
    create: {
      sistemaId: SISTEMA_ID,
      nome: "Carlos Administrador",
      email: "admin@academiafit.com.br",
      senhaHash,
      tipo: "ACADEMIA",
      academiaId: academia.id,
    },
  });
  console.log("Admin criado: admin@academiafit.com.br");

  const alunosData = [
    { nome: "Ana Silva", email: "ana.silva@email.com" },
    { nome: "Bruno Costa", email: "bruno.costa@email.com" },
    { nome: "Carla Mendes", email: "carla.mendes@email.com" },
    { nome: "Diego Ferreira", email: "diego.ferreira@email.com" },
    { nome: "Elena Rodrigues", email: "elena.rodrigues@email.com" },
    { nome: "Felipe Santos", email: "felipe.santos@email.com" },
    { nome: "Gabriela Lima", email: "gabriela.lima@email.com" },
    { nome: "Henrique Oliveira", email: "henrique.oliveira@email.com" },
  ];

  const alunos = [];
  for (const dados of alunosData) {
    const aluno = await prisma.gymfyUsuario.upsert({
      where: { email: dados.email },
      update: {},
      create: {
        sistemaId: SISTEMA_ID,
        nome: dados.nome,
        email: dados.email,
        senhaHash,
        tipo: "ALUNO",
        academiaId: academia.id,
      },
    });
    await prisma.gymfyAlunoAcademia.upsert({
      where: { alunoId_academiaId: { alunoId: aluno.id, academiaId: academia.id } },
      update: {},
      create: { alunoId: aluno.id, academiaId: academia.id },
    });
    alunos.push(aluno);
  }
  console.log(`${alunos.length} alunos criados`);

  const hoje = new Date();
  for (const aluno of alunos) {
    const numCheckins = Math.floor(Math.random() * 18) + 5;
    const diasUsados = new Set<number>();
    for (let i = 0; i < numCheckins; i++) {
      let diasAtras = Math.floor(Math.random() * 30);
      while (diasUsados.has(diasAtras)) diasAtras = Math.floor(Math.random() * 30);
      diasUsados.add(diasAtras);

      const data = new Date(hoje);
      data.setDate(data.getDate() - diasAtras);
      data.setHours(Math.floor(Math.random() * 14) + 6, 0, 0, 0);

      const checkin = await prisma.gymfyCheckIn.create({
        data: { alunoId: aluno.id, academiaId: academia.id, pontosGanhos: 10, criadoEm: data },
      });

      await prisma.gymfyPonto.create({
        data: { alunoId: aluno.id, academiaId: academia.id, checkInId: checkin.id, quantidade: 10, descricao: "Check-in", criadoEm: data },
      });
    }
  }
  console.log("Check-ins e pontos criados");

  const conquistas = await prisma.gymfyConquista.findMany({ take: 2 });
  for (const aluno of alunos.slice(0, 4)) {
    for (const conquista of conquistas) {
      await prisma.gymfyConquistaAluno.upsert({
        where: { alunoId_conquistaId: { alunoId: aluno.id, conquistaId: conquista.id } },
        update: {},
        create: { alunoId: aluno.id, conquistaId: conquista.id },
      });
    }
  }
  console.log("Conquistas atribuidas");

  const desafio = await prisma.gymfyDesafio.create({
    data: {
      academiaId: academia.id,
      nome: "Desafio Maio Fitness",
      descricao: "Treine pelo menos 16 vezes em maio e ganhe desconto na mensalidade!",
      metaCheckins: 16,
      pontosBonus: 100,
      inicioEm: new Date("2026-05-01"),
      fimEm: new Date("2026-05-31"),
      status: "ATIVO",
    },
  });

  for (const aluno of alunos) {
    await prisma.gymfyDesafioParticipante.create({
      data: {
        desafioId: desafio.id,
        alunoId: aluno.id,
        progresso: Math.floor(Math.random() * 16),
      },
    });
  }
  console.log("Desafio criado com participantes");

  await prisma.gymfyPremio.createMany({
    data: [
      {
        academiaId: academia.id,
        nome: "Desconto R$30 na mensalidade",
        descricao: "Resgate 300 pontos e ganhe R$30 de desconto.",
        pontosNecessarios: 300,
        estoque: 10,
      },
      {
        academiaId: academia.id,
        nome: "Camiseta FitLife",
        descricao: "Camiseta exclusiva para os alunos mais dedicados.",
        pontosNecessarios: 500,
        estoque: 5,
      },
    ],
  });
  console.log("Premios criados");

  await prisma.gymfyAlertaChurn.create({
    data: {
      alunoId: alunos[alunos.length - 1].id,
      academiaId: academia.id,
      risco: "RISCO_ALTO",
      diasSemCheckin: 22,
    },
  });

  await prisma.gymfyAlertaChurn.create({
    data: {
      alunoId: alunos[alunos.length - 2].id,
      academiaId: academia.id,
      risco: "RISCO_MEDIO",
      diasSemCheckin: 15,
    },
  });
  console.log("Alertas de churn criados");

  for (const aluno of alunos.slice(0, 3)) {
    await prisma.gymfyFeedPost.create({
      data: {
        autorId: aluno.id,
        academiaId: academia.id,
        conteudo: `${aluno.nome} completou mais um treino!`,
      },
    });
  }
  console.log("Feed posts criados");

  console.log("\n Seed concluido!");
  console.log("Login admin:  admin@academiafit.com.br");
  console.log("Login aluno:  ana.silva@email.com");
  console.log("Senha:        Gymfy@2025!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());