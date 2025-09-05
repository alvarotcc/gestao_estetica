import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const seedDatabase = async () => {
  try {
    // Seed Clientes
    const clientesRef = collection(db, "clientes");
    const clientesData = [
      {
        nome: "João Silva",
        telefone: "(11) 99999-1111",
        email: "joao.silva@email.com",
        cpfCnpj: "123.456.789-00",
        aniversario: "1990-05-15",
        observacoes: "Cliente fiel, prefere horários matinais",
        veiculos: 2,
        servicos: 5
      },
      {
        nome: "Maria Santos",
        telefone: "(11) 99999-2222",
        email: "maria.santos@email.com",
        cpfCnpj: "987.654.321-00",
        aniversario: "1985-08-20",
        observacoes: "Cliente VIP, sempre indica amigos",
        veiculos: 1,
        servicos: 8
      }
    ];

    const clienteIds: string[] = [];
    for (const cliente of clientesData) {
      const docRef = await addDoc(clientesRef, cliente);
      clienteIds.push(docRef.id);
    }
    console.log("Clientes adicionados com sucesso!");

    // Seed Veículos
    const veiculosRef = collection(db, "veiculos");
    const veiculosData = [
      {
        clienteId: clienteIds[0],
        marca: "Toyota",
        modelo: "Corolla",
        placa: "ABC-1234"
      },
      {
        clienteId: clienteIds[0],
        marca: "Honda",
        modelo: "Civic",
        placa: "DEF-5678"
      },
      {
        clienteId: clienteIds[1],
        marca: "Ford",
        modelo: "Focus",
        placa: "GHI-9012"
      }
    ];

    const veiculoIds: string[] = [];
    for (const veiculo of veiculosData) {
      const docRef = await addDoc(veiculosRef, veiculo);
      veiculoIds.push(docRef.id);
    }
    console.log("Veículos adicionados com sucesso!");

    // Seed Serviços
    const servicosRef = collection(db, "servicos");
    const servicosData = [
      {
        nome: "Lavagem Completa",
        descricao: "Lavagem externa e interna completa do veículo",
        preco: 80.00
      },
      {
        nome: "Polimento",
        descricao: "Polimento profissional para brilho e proteção",
        preco: 150.00
      },
      {
        nome: "Higienização de Ar-Condicionado",
        descricao: "Limpeza completa do sistema de ar-condicionado",
        preco: 120.00
      }
    ];

    const servicoIds: string[] = [];
    for (const servico of servicosData) {
      const docRef = await addDoc(servicosRef, servico);
      servicoIds.push(docRef.id);
    }
    console.log("Serviços adicionados com sucesso!");

    // Seed Materiais
    const materiaisRef = collection(db, "materiais");
    const materiaisData = [
      {
        nome: "Shampoo Automotivo",
        quantidade: 50,
        unidade: "litros"
      },
      {
        nome: "Cera Automotiva",
        quantidade: 25,
        unidade: "litros"
      },
      {
        nome: "Pano de Microfibra",
        quantidade: 100,
        unidade: "unidades"
      }
    ];

    for (const material of materiaisData) {
      await addDoc(materiaisRef, material);
    }
    console.log("Materiais adicionados com sucesso!");

    // Seed Colaboradores
    const colaboradoresRef = collection(db, "colaboradores");
    const colaboradoresData = [
      {
        nome: "Carlos Silva",
        cargo: "Lavador",
        telefone: "(11) 99999-3333",
        email: "carlos.silva@kronstudio.com"
      },
      {
        nome: "Ana Santos",
        cargo: "Polidor",
        telefone: "(11) 99999-4444",
        email: "ana.santos@kronstudio.com"
      },
      {
        nome: "Roberto Oliveira",
        cargo: "Gerente",
        telefone: "(11) 99999-5555",
        email: "roberto.oliveira@kronstudio.com"
      }
    ];

    const colaboradorIds: string[] = [];
    for (const colaborador of colaboradoresData) {
      const docRef = await addDoc(colaboradoresRef, colaborador);
      colaboradorIds.push(docRef.id);
    }
    console.log("Colaboradores adicionados com sucesso!");

    // Seed Agendamentos
    const agendamentosRef = collection(db, "agendamentos");
    const agendamentosData = [
      {
        clienteId: clienteIds[0],
        clienteNome: "João Silva",
        veiculoId: veiculoIds[0],
        veiculoPlaca: "ABC-1234",
        servicoId: servicoIds[0],
        servicoNome: "Lavagem Completa",
        colaboradorId: colaboradorIds[0],
        colaboradorNome: "Carlos Silva",
        data: new Date().toISOString().split('T')[0],
        hora: "09:00",
        status: "agendado",
        observacoes: "Cliente prefere horário matinal"
      },
      {
        clienteId: clienteIds[1],
        clienteNome: "Maria Santos",
        veiculoId: veiculoIds[1],
        veiculoPlaca: "DEF-5678",
        servicoId: servicoIds[1],
        servicoNome: "Polimento",
        colaboradorId: colaboradorIds[1],
        colaboradorNome: "Ana Santos",
        data: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
        hora: "14:00",
        status: "em_andamento",
        observacoes: "Cliente VIP - atendimento prioritário"
      }
    ];

    for (const agendamento of agendamentosData) {
      await addDoc(agendamentosRef, agendamento);
    }
    console.log("Agendamentos adicionados com sucesso!");

    console.log("Banco de dados populado com sucesso!");
  } catch (error) {
    console.error("Erro ao popular banco de dados:", error);
  }
};
