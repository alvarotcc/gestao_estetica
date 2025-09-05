import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCG4I8q0d1iY0_UzYQJhRL8TMiBlALz9vc",
  authDomain: "kron-studio-car.firebaseapp.com",
  projectId: "kron-studio-car",
  storageBucket: "kron-studio-car.firebasestorage.app",
  messagingSenderId: "676445930978",
  appId: "1:676445930978:web:9542055f3c5e95c091a5bb",
  measurementId: "G-2C2KKBF24G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function seedDatabase() {
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
      },
      {
        nome: "Pedro Oliveira",
        telefone: "(11) 99999-3333",
        email: "pedro.oliveira@email.com",
        cpfCnpj: "456.789.123-00",
        aniversario: "1988-12-10",
        observacoes: "Cliente corporativo, fatura mensal",
        veiculos: 3,
        servicos: 12
      },
      {
        nome: "Ana Costa",
        telefone: "(11) 99999-4444",
        email: "ana.costa@email.com",
        cpfCnpj: "789.123.456-00",
        aniversario: "1992-03-25",
        observacoes: "Cliente novo, primeira visita",
        veiculos: 1,
        servicos: 1
      },
      {
        nome: "Carlos Rodrigues",
        telefone: "(11) 99999-5555",
        email: "carlos.rodrigues@email.com",
        cpfCnpj: "321.654.987-00",
        aniversario: "1980-07-08",
        observacoes: "Cliente antigo, sempre pontual",
        veiculos: 2,
        servicos: 15
      },
      {
        nome: "Fernanda Lima",
        telefone: "(11) 99999-6666",
        email: "fernanda.lima@email.com",
        cpfCnpj: "654.987.321-00",
        aniversario: "1995-11-30",
        observacoes: "Cliente jovem, prefere serviços premium",
        veiculos: 1,
        servicos: 3
      },
      {
        nome: "Roberto Alves",
        telefone: "(11) 99999-7777",
        email: "roberto.alves@email.com",
        cpfCnpj: "147.258.369-00",
        aniversario: "1975-09-14",
        observacoes: "Cliente sênior, atendimento especial",
        veiculos: 2,
        servicos: 20
      },
      {
        nome: "Juliana Pereira",
        telefone: "(11) 99999-8888",
        email: "juliana.pereira@email.com",
        cpfCnpj: "963.852.741-00",
        aniversario: "1998-01-22",
        observacoes: "Cliente influenciadora, bom para marketing",
        veiculos: 1,
        servicos: 4
      }
    ];

    const clienteIds = [];
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
      },
      {
        clienteId: clienteIds[2],
        marca: "Chevrolet",
        modelo: "Onix",
        placa: "JKL-3456"
      },
      {
        clienteId: clienteIds[2],
        marca: "Volkswagen",
        modelo: "Golf",
        placa: "MNO-7890"
      },
      {
        clienteId: clienteIds[2],
        marca: "Fiat",
        modelo: "Uno",
        placa: "PQR-1234"
      },
      {
        clienteId: clienteIds[3],
        marca: "Hyundai",
        modelo: "HB20",
        placa: "STU-5678"
      },
      {
        clienteId: clienteIds[4],
        marca: "Renault",
        modelo: "Sandero",
        placa: "VWX-9012"
      },
      {
        clienteId: clienteIds[4],
        marca: "Nissan",
        modelo: "March",
        placa: "YZA-3456"
      },
      {
        clienteId: clienteIds[5],
        marca: "Jeep",
        modelo: "Compass",
        placa: "BCD-7890"
      },
      {
        clienteId: clienteIds[6],
        marca: "BMW",
        modelo: "X3",
        placa: "EFG-1234"
      },
      {
        clienteId: clienteIds[6],
        marca: "Mercedes-Benz",
        modelo: "C-Class",
        placa: "HIJ-5678"
      },
      {
        clienteId: clienteIds[7],
        marca: "Audi",
        modelo: "A3",
        placa: "KLM-9012"
      }
    ];

    const veiculoIds = [];
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
      },
      {
        nome: "Lavagem Simples",
        descricao: "Lavagem externa básica do veículo",
        preco: 50.00
      },
      {
        nome: "Cristalização",
        descricao: "Aplicação de cristalização para proteção da pintura",
        preco: 200.00
      },
      {
        nome: "Limpeza de Motor",
        descricao: "Limpeza completa do compartimento do motor",
        preco: 100.00
      },
      {
        nome: "Higienização Interna Premium",
        descricao: "Limpeza profunda dos bancos e carpetes",
        preco: 180.00
      },
      {
        nome: "Vitrificação",
        descricao: "Aplicação de vitrificação para proteção duradoura",
        preco: 250.00
      },
      {
        nome: "Lavagem a Seco",
        descricao: "Lavagem sem água, ideal para limpeza rápida",
        preco: 60.00
      },
      {
        nome: "Polimento Técnico",
        descricao: "Polimento para remoção de riscos leves",
        preco: 120.00
      }
    ];

    const servicoIds = [];
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
      },
      {
        nome: "Cera de Carnaúba",
        quantidade: 30,
        unidade: "litros"
      },
      {
        nome: "Limpa Vidros",
        quantidade: 40,
        unidade: "litros"
      },
      {
        nome: "Desengraxante",
        quantidade: 20,
        unidade: "litros"
      },
      {
        nome: "Silicone para Plástico",
        quantidade: 15,
        unidade: "litros"
      },
      {
        nome: "Espuma de Limpeza",
        quantidade: 35,
        unidade: "litros"
      },
      {
        nome: "Brilho para Rodas",
        quantidade: 10,
        unidade: "litros"
      },
      {
        nome: "Produto para Ar-Condicionado",
        quantidade: 25,
        unidade: "unidades"
      },
      {
        nome: "Escova para Motor",
        quantidade: 50,
        unidade: "unidades"
      },
      {
        nome: "Luva de Lavagem",
        quantidade: 75,
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
      },
      {
        nome: "Fernanda Costa",
        cargo: "Lavador",
        telefone: "(11) 99999-6666",
        email: "fernanda.costa@kronstudio.com"
      },
      {
        nome: "Marcos Lima",
        cargo: "Especialista em Higienização",
        telefone: "(11) 99999-7777",
        email: "marcos.lima@kronstudio.com"
      },
      {
        nome: "Juliana Alves",
        cargo: "Atendente",
        telefone: "(11) 99999-8888",
        email: "juliana.alves@kronstudio.com"
      },
      {
        nome: "Ricardo Pereira",
        cargo: "Lavador",
        telefone: "(11) 99999-9999",
        email: "ricardo.pereira@kronstudio.com"
      },
      {
        nome: "Patricia Rodrigues",
        cargo: "Polidor",
        telefone: "(11) 99999-1010",
        email: "patricia.rodrigues@kronstudio.com"
      }
    ];

    const colaboradorIds = [];
    for (const colaborador of colaboradoresData) {
      const docRef = await addDoc(colaboradoresRef, colaborador);
      colaboradorIds.push(docRef.id);
    }
    console.log("Colaboradores adicionados com sucesso!");

    // Seed Fornecedores
    const fornecedoresRef = collection(db, "fornecedores");
    const fornecedoresData = [
      {
        nome: "Auto Peças Silva Ltda",
        telefone: "(11) 3333-1111",
        email: "contato@autopecassilva.com.br",
        cnpj: "12.345.678/0001-90",
        endereco: "Rua das Peças, 123 - Centro, São Paulo - SP",
        contato: "João Silva",
        categoria: "Materiais",
        observacoes: "Fornecedor de peças automotivas, entrega rápida"
      },
      {
        nome: "Produtos de Limpeza Premium",
        telefone: "(11) 3333-2222",
        email: "vendas@limpezapremium.com.br",
        cnpj: "98.765.432/0001-10",
        endereco: "Av. Industrial, 456 - Distrito Industrial, São Paulo - SP",
        contato: "Maria Santos",
        categoria: "Materiais",
        observacoes: "Especialistas em produtos de limpeza automotiva"
      },
      {
        nome: "Equipamentos Auto Center",
        telefone: "(11) 3333-3333",
        email: "comercial@equipautos.com.br",
        cnpj: "45.678.901/0001-23",
        endereco: "Rua dos Equipamentos, 789 - Vila Industrial, São Paulo - SP",
        contato: "Pedro Oliveira",
        categoria: "Equipamentos",
        observacoes: "Fornecedor de equipamentos para lava-jato"
      },
      {
        nome: "Químicos Industriais Brasil",
        telefone: "(11) 3333-4444",
        email: "pedidos@quimicosbr.com.br",
        cnpj: "67.890.123/0001-45",
        endereco: "Rodovia dos Bandeirantes, km 45 - Jundiaí - SP",
        contato: "Ana Costa",
        categoria: "Materiais",
        observacoes: "Produtos químicos para limpeza profissional"
      },
      {
        nome: "Ferramentas e Acessórios Ltda",
        telefone: "(11) 3333-5555",
        email: "vendas@ferramentas.com.br",
        cnpj: "23.456.789/0001-67",
        endereco: "Rua das Ferramentas, 321 - Bairro Industrial, São Paulo - SP",
        contato: "Carlos Rodrigues",
        categoria: "Equipamentos",
        observacoes: "Ferramentas e acessórios para manutenção"
      },
      {
        nome: "Distribuidora de Ceras",
        telefone: "(11) 3333-6666",
        email: "contato@cerasdistribuidora.com.br",
        cnpj: "89.012.345/0001-89",
        endereco: "Av. das Indústrias, 654 - São Bernardo do Campo - SP",
        contato: "Fernanda Lima",
        categoria: "Materiais",
        observacoes: "Especializada em ceras e protetores para veículos"
      },
      {
        nome: "Soluções em Higienização",
        telefone: "(11) 3333-7777",
        email: "comercial@higienizacaosolucoes.com.br",
        cnpj: "34.567.890/0001-12",
        endereco: "Rua da Higienização, 987 - Centro, São Paulo - SP",
        contato: "Roberto Alves",
        categoria: "Materiais",
        observacoes: "Produtos para higienização de ar-condicionado"
      },
      {
        nome: "Importadora de Equipamentos",
        telefone: "(11) 3333-8888",
        email: "import@equipimport.com.br",
        cnpj: "56.789.012/0001-34",
        endereco: "Av. Internacional, 147 - Guarulhos - SP",
        contato: "Juliana Pereira",
        categoria: "Equipamentos",
        observacoes: "Importadora de equipamentos importados"
      }
    ];

    for (const fornecedor of fornecedoresData) {
      await addDoc(fornecedoresRef, fornecedor);
    }
    console.log("Fornecedores adicionados com sucesso!");

    // Seed Agendamentos
    const agendamentosRef = collection(db, "agendamentos");
    const agendamentosData = [
      {
        clienteId: clienteIds[0],
        veiculoId: veiculoIds[0],
        servicoId: servicoIds[0],
        colaboradorId: colaboradorIds[0],
        data: new Date().toISOString().split('T')[0],
        hora: "09:00",
        status: "agendado",
        observacoes: "Cliente prefere horário matinal"
      },
      {
        clienteId: clienteIds[1],
        veiculoId: veiculoIds[1],
        servicoId: servicoIds[1],
        colaboradorId: colaboradorIds[1],
        data: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Amanhã
        hora: "14:00",
        status: "em_andamento",
        observacoes: "Cliente VIP - atendimento prioritário"
      },
      {
        clienteId: clienteIds[2],
        veiculoId: veiculoIds[2],
        servicoId: servicoIds[2],
        colaboradorId: colaboradorIds[2],
        data: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Depois de amanhã
        hora: "10:30",
        status: "agendado",
        observacoes: "Cliente corporativo - fatura mensal"
      },
      {
        clienteId: clienteIds[3],
        veiculoId: veiculoIds[3],
        servicoId: servicoIds[3],
        colaboradorId: colaboradorIds[3],
        data: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        hora: "08:00",
        status: "agendado",
        observacoes: "Cliente novo - primeira visita"
      },
      {
        clienteId: clienteIds[4],
        veiculoId: veiculoIds[4],
        servicoId: servicoIds[4],
        colaboradorId: colaboradorIds[4],
        data: new Date(Date.now() + 4 * 86400000).toISOString().split('T')[0],
        hora: "15:30",
        status: "agendado",
        observacoes: "Cliente antigo - sempre pontual"
      },
      {
        clienteId: clienteIds[5],
        veiculoId: veiculoIds[5],
        servicoId: servicoIds[5],
        colaboradorId: colaboradorIds[5],
        data: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        hora: "11:00",
        status: "agendado",
        observacoes: "Cliente jovem - serviços premium"
      },
      {
        clienteId: clienteIds[6],
        veiculoId: veiculoIds[6],
        servicoId: servicoIds[6],
        colaboradorId: colaboradorIds[6],
        data: new Date(Date.now() + 6 * 86400000).toISOString().split('T')[0],
        hora: "13:00",
        status: "agendado",
        observacoes: "Cliente sênior - atendimento especial"
      },
      {
        clienteId: clienteIds[7],
        veiculoId: veiculoIds[7],
        servicoId: servicoIds[7],
        colaboradorId: colaboradorIds[7],
        data: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        hora: "16:00",
        status: "agendado",
        observacoes: "Cliente influenciadora - bom para marketing"
      },
      {
        clienteId: clienteIds[0],
        veiculoId: veiculoIds[1],
        servicoId: servicoIds[8],
        colaboradorId: colaboradorIds[0],
        data: new Date(Date.now() + 8 * 86400000).toISOString().split('T')[0],
        hora: "09:30",
        status: "agendado",
        observacoes: "Cliente fiel - retorno para manutenção"
      },
      {
        clienteId: clienteIds[1],
        veiculoId: veiculoIds[2],
        servicoId: servicoIds[9],
        colaboradorId: colaboradorIds[1],
        data: new Date(Date.now() + 9 * 86400000).toISOString().split('T')[0],
        hora: "14:30",
        status: "agendado",
        observacoes: "Cliente VIP - polimento técnico"
      },
      {
        clienteId: clienteIds[2],
        veiculoId: veiculoIds[3],
        servicoId: servicoIds[0],
        colaboradorId: colaboradorIds[2],
        data: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
        hora: "10:00",
        status: "agendado",
        observacoes: "Cliente corporativo - manutenção mensal"
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
}

seedDatabase();
