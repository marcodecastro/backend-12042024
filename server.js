import express from 'express';
import db from './dbmongodb.js';
import pool from './dbPostgresql.js';
import cors from 'cors';
import {body, validationResult} from 'express-validator'
import bcrypt from 'bcryptjs';
import { fetchCelebrations, createCelebration } from './controllers/celebrationController.js';
import User from './models/User.js';
import jwt from 'jsonwebtoken';
import './cronTasks.js';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { format } from 'date-fns';
import winston from 'winston';


dotenv.config();

const app = express();

// Configura o body-parser para lidar com JSON e dados codificados na URL
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000', 
  optionsSuccessStatus: 200,
};
const PORT = process.env.PORT 

app.use(cors(corsOptions));


// Rota para graus simbólicos
const handleSymbolicDegrees = async (req, res) => {
  try {
    const symbolicDegrees = req.body;

    for (const degree of symbolicDegrees) {
      const memberId = parseInt(degree.memberId);
      if (isNaN(memberId)) {
        throw new Error(`ID do membro inválido: ${degree.memberId}`);
      }

      // Verificar se já existe um registro para o membro e o grau
      const existingDegree = await pool.query(
        'SELECT * FROM graussimbolicos WHERE membro_cim = $1 AND grau = $2',
        [memberId, degree.grau]
      );

      if (existingDegree.rows.length > 0) {
        // Se já existe, atualize apenas os campos necessários
        await pool.query(
          'UPDATE graussimbolicos SET data = $1, descricao = $2 WHERE membro_cim = $3 AND grau = $4',
          [degree.data, degree.descricao, memberId, degree.grau]
        );
      } else {
        // Se não existir, insira um novo registro na tabela
        await pool.query(
          'INSERT INTO graussimbolicos (membro_cim, grau, data, descricao) VALUES ($1, $2, $3, $4)',
          [memberId, degree.grau, degree.data, degree.descricao]
        );
      }
    }

    res.status(201).json({ message: 'Graus Simbólicos adicionados/atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar/atualizar Graus Simbólicos:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar/atualizar Graus Simbólicos.' });

    console.error('Detalhes do erro:', error.message);
    console.error('Stack Trace:', error.stack);
  }
};




//Rota para graus filosóficos
const handlePhilosophicalDegrees = async (req, res) => {
  try {
    const philosophicalDegrees = req.body;

    for (const degree of philosophicalDegrees) {
      const memberId = parseInt(degree.memberId);
      if (isNaN(memberId)) {
        throw new Error(`ID do membro inválido: ${degree.memberId}`);
      }

      // Verificar se já existe um registro para o membro e o grau
      const existingDegree = await pool.query(
        'SELECT * FROM grausfilosoficos WHERE membro_cim = $1 AND grau = $2',
        [memberId, degree.grau]
      );

      if (existingDegree.rows.length > 0) {
        // Se já existe, atualize apenas os campos necessários
        await pool.query(
          'UPDATE grausfilosoficos SET data = $1, descricao = $2 WHERE membro_cim = $3 AND grau = $4',
          [degree.data, degree.descricao, memberId, degree.grau]
        );
      } else {
        // Se não existir, insira um novo registro na tabela
        await pool.query(
          'INSERT INTO grausfilosoficos (membro_cim, grau, data, descricao) VALUES ($1, $2, $3, $4)',
          [memberId, degree.grau, degree.data, degree.descricao]
        );
      }
    }

    res.status(201).json({ message: 'Graus Filosóficos adicionados/atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar/atualizar Graus Filosóficos:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar/atualizar Graus Filosóficos.' });

    console.error('Detalhes do erro:', error.message);
    console.error('Stack Trace:', error.stack);
  }
};




// Rota para graus adicionais
const handleAdditionalDegrees = async (req, res) => {
  try {
    const additionalDegrees = req.body;

    for (const degree of additionalDegrees) {
      const memberId = parseInt(degree.memberId);
      if (isNaN(memberId)) {
        throw new Error(`ID do membro inválido: ${degree.memberId}`);
      }

      // Verificar se já existe um registro para o membro e o grau
      const existingDegree = await pool.query(
        'SELECT * FROM grausadicionais WHERE membro_cim = $1 AND grau = $2',
        [memberId, degree.grau]
      );

      if (existingDegree.rows.length > 0) {
        // Se já existe, atualize apenas os campos necessários
        await pool.query(
          'UPDATE grausadicionais SET data = $1, descricao = $2 WHERE membro_cim = $3 AND grau = $4',
          [degree.data, degree.descricao, memberId, degree.grau]
        );
      } else {
        // Se não existir, insira um novo registro na tabela
        await pool.query(
          'INSERT INTO grausadicionais (membro_cim, grau, data, descricao) VALUES ($1, $2, $3, $4)',
          [memberId, degree.grau, degree.data, degree.descricao]
        );
      }
    }

    res.status(201).json({ message: 'Graus Adicionais adicionados/atualizados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar/atualizar Graus Adicionais:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar/atualizar Graus Adicionais.' });

    console.error('Detalhes do erro:', error.message);
    console.error('Stack Trace:', error.stack);
  }
};




// Rota para Instalacao
app.post('/api/instalacao', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { membroCim, data, descricao } = req.body;

    // Verificar se a instalação já existe para o membro e data informados
    const existingInstallation = await client.query(
      'SELECT * FROM instalacao WHERE membro_cim = $1 AND data = $2 FOR UPDATE',
      [membroCim, data]
    );

    if (existingInstallation.rows.length > 0) {
      // Atualizar os dados da instalação existente
      const updateResult = await client.query(
        'UPDATE instalacao SET descricao = $1, data = $2 WHERE membro_cim = $3 AND data = $4',
        [descricao, data, membroCim, data]
      );

      if (updateResult.rowCount === 1) {
        await client.query('COMMIT');
        return res.status(200).json({ message: 'Instalação atualizada com sucesso.' });
      } else {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Erro ao atualizar instalação.' });
      }
    } else {
      // Inserir os dados da instalação na tabela 'instalacao'
      const insertResult = await client.query(
        'INSERT INTO instalacao (membro_cim, data, descricao) VALUES ($1, $2, $3)',
        [membroCim, data, descricao]
      );

      if (insertResult.rowCount === 1) {
        await client.query('COMMIT');
        return res.status(201).json({ message: 'Instalação cadastrada com sucesso.' });
      } else {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Erro ao cadastrar instalação.' });
      }
    }
  } catch (error) {
    console.error('Erro ao processar formulário de instalação:', error);
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erro interno ao processar formulário de instalação.' });
  } finally {
    client.release();
  }
});



// Rota para buscar instalação
app.get('/api/instalacao/:membroCim', async (req, res) => {
  try {
    const membroCim = req.params.membroCim;

    // Buscar a instalação do membro com o CIM fornecido
    const installation = await pool.query(
      'SELECT * FROM instalacao WHERE membro_cim = $1',
      [membroCim]
    );

    if (installation.rows.length > 0) {
      res.json(installation.rows[0]);
    } else {
      res.status(404).json({ message: 'Instalação não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar instalação:', error);
    res.status(500).json({ message: 'Erro interno ao buscar instalação.' });
  }
});




// Rota para atualizar instalação
app.put('/api/instalacao/:membroCim', async (req, res) => {
  const client = await pool.connect();

  try {
    const { membroCim } = req.params;
    const { data, descricao } = req.body;

    // Atualizar no banco de dados a instalação com o membroCim especificado
    const result = await client.query(
      'UPDATE instalacao SET data = $1, descricao = $2 WHERE membro_cim = $3',
      [data, descricao, membroCim]
    );

    if (result.rowCount > 0) {
      // Se a instalação foi atualizada, retornar uma mensagem de sucesso
      res.status(200).json({ message: 'Instalação atualizada com sucesso.' });
    } else {
      // Se a instalação não foi atualizada, retornar um erro 404
      res.status(404).json({ message: 'Instalação não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao atualizar instalação:', error);
    res.status(500).json({ message: 'Erro interno ao atualizar instalação.' });
  } finally {
    client.release();
  }
});



// Rota para Reassuncao
app.post('/api/reassuncao', async (req, res) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { membroCim, data, descricao } = req.body;

    // Verificar se a reassuncao já existe para o membro e data informados
    const existingReassumption = await client.query(
      'SELECT * FROM reassuncao WHERE membro_cim = $1 AND data = $2 FOR UPDATE',
      [membroCim, data]
    );

    if (existingReassumption.rows.length > 0) {
      // Atualizar os dados da reassuncao existente
      const updateResult = await client.query(
        'UPDATE reassuncao SET descricao = $1, data = $2 WHERE membro_cim = $3 AND data = $4',
        [descricao, data, membroCim, data]
      );

      if (updateResult.rowCount === 1) {
        await client.query('COMMIT');
        return res.status(200).json({ message: 'Reassuncao atualizada com sucesso.' });
      } else {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Erro ao atualizar reassuncao.' });
      }
    } else {
      // Inserir os dados da reassuncao na tabela 'reassuncao'
      const insertResult = await client.query(
        'INSERT INTO reassuncao (membro_cim, data, descricao) VALUES ($1, $2, $3)',
        [membroCim, data, descricao]
      );

      if (insertResult.rowCount === 1) {
        await client.query('COMMIT');
        return res.status(201).json({ message: 'Reassuncao cadastrada com sucesso.' });
      } else {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Erro ao cadastrar reassuncao.' });
      }
    }
  } catch (error) {
    console.error('Erro ao processar formulário de reassuncao:', error);
    await client.query('ROLLBACK');
    res.status(500).json({ message: 'Erro interno ao processar formulário de reassuncao.' });
  } finally {
    client.release();
  }
});



// Rota para buscar reassuncao
app.get('/api/reassuncao/:membroCim', async (req, res) => {
  try {
    const membroCim = req.params.membroCim;

    // Buscar a reassuncao do membro com o CIM fornecido
    const reassumption = await pool.query(
      'SELECT * FROM reassuncao WHERE membro_cim = $1',
      [membroCim]
    );

    if (reassumption.rows.length > 0) {
      res.json(reassumption.rows[0]);
    } else {
      res.status(404).json({ message: 'Reassuncao não encontrada.' });
    }
  } catch (error) {
    console.error('Erro ao buscar reassuncao:', error);
    res.status(500).json({ message: 'Erro interno ao buscar reassuncao.' });
  }
});


// Rota para atualizar reassuncao
app.put('/api/reassuncao/:membroCim', async (req, res) => {
  const client = await pool.connect();
  
  try {
  const { membroCim } = req.params;
  const { data, descricao } = req.body;
  
  // Atualizar no banco de dados a reassuncao com o membroCim especificado
  const result = await client.query(
    'UPDATE reassuncao SET data = $1, descricao = $2 WHERE membro_cim = $3',
    [data, descricao, membroCim]
  );
  
  if (result.rowCount > 0) {
    // Se a reassuncao foi atualizada, retornar uma mensagem de sucesso
    res.status(200).json({ message: 'Reassuncao atualizada com sucesso.' });
  } else {
    // Se a reassuncao não foi atualizada, retornar um erro 404
    res.status(404).json({ message: 'Reassuncao não encontrada.' });
  }
  } catch (error) {
  console.error('Erro ao atualizar reassuncao:', error);
  res.status(500).json({ message: 'Erro interno ao atualizar reassuncao.' });
  } finally {
  client.release();
  }
  });






  let casamentos = [];



// Rota para criar um novo casamento
app.post('/api/casamento', (req, res) => {
  const novoCasamento = req.body; // Dados enviados no corpo da requisição
  casamentos.push(novoCasamento); // Simulação de inserção no banco de dados
  res.status(201).json({ message: 'Casamento cadastrado com sucesso.' });
});

// Rota para atualizar um casamento existente
app.put('/api/casamento/:membroCim', (req, res) => {
  const membroCim = req.params.membroCim; // Parâmetro da URL
  const dadosAtualizados = req.body; // Dados enviados no corpo da requisição

  // Procurar o casamento pelo membroCim na "base de dados"
  const casamento = casamentos.find(casamento => casamento.membroCim === membroCim);

  if (!casamento) {
    return res.status(404).json({ message: 'Casamento não encontrado.' });
  }

  // Atualizar os dados do casamento
  casamento.data = dadosAtualizados.data;
  casamento.descricao = dadosAtualizados.descricao;

  res.status(200).json({ message: 'Casamento atualizado com sucesso.' });
});







// Rota para lidar com todos os tipos de formulários
app.post('/api/forms', [
  body('formType').notEmpty(),
  body('formData').isObject(),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { formType, formData } = req.body;

    switch (formType) {
      case 'memberForm':
        await handleMemberForm(formData);
        break;
      case 'spouseForm':
        await handleSpouseForm(formData);
        break;
      case 'childForm':
        await handleChildForm(formData);
        break;
      default:
        return res.status(400).json({ message: 'Tipo de formulário desconhecido.' });
    }

    res.status(201).json({ message: 'Formulário enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao processar formulário:', error);
    res.status(500).json({ message: 'Erro interno ao processar o formulário.' });
  }
});


// Rota de cadastro
app.post('/cadastro', [
  // Validação dos campos
  body('nome').isLength({ min: 1 }),
  body('email').isEmail(),
  body('senha').isLength({ min: 6 }),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Verifica se o email já está em uso
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso.' });
    }

    // Criptografa a senha antes de salvar no banco de dados
    const hashedPassword = await bcrypt.hash(req.body.senha, 10);

    // Cria um novo usuário
    const user = new User({
      nome: req.body.nome,
      email: req.body.email,
      senha: hashedPassword,
    });

    // Salva o usuário no banco de dados
    await user.save();

    res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
});


// Rota de login
app.post('/login', async (req, res) => {
  try {
    // Verifica se o usuário existe
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({ message: 'Usuário não encontrado.' });
    }

    // Verifica se a senha está correta
    const isPasswordValid = await bcrypt.compare(req.body.senha, user.senha);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Senha inválida.' });
    }

    // Cria um token JWT
    const token = jwt.sign({ id: user._id }, 'seu segredo', { expiresIn: '1h' });

    res.json({ message: 'Login bem-sucedido!', token: token });
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ message: 'Erro interno no servidor.', error: error.message });
  }
});



app.get('/api/forms', fetchCelebrations);
app.post('/api/forms', createCelebration);
app.post('/api/graussimbolicos', handleSymbolicDegrees);
app.post('/api/grausfilosoficos', handlePhilosophicalDegrees);
app.post('/api/grausadicionais', handleAdditionalDegrees);
app.get('/api/instalacao/:membroCim');
app.post('/api/instalacao/:membroCim');
app.put('/api/instalacao/:membroCim');
app.get('/api/reassuncao/:membroCim');
app.post('/api/reassuncao/:membroCim');
app.put('/api/reassuncao/:membroCim');
app.get('/api/casamento/:membroCim');
app.post('/api/casamento/:membroCim');
app.put('/api/casamento/:membroCim');




// Middleware para lidar com rotas não encontradas
app.use((req, res, next) => {
  res.status(404).send('Rota não encontrada');
});


// Middleware global para lidar com erros não tratados
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Ocorreu um erro interno no servidor.' });
});



// Função para lidar com dados do formulário do membro
async function handleMemberForm(formData) {
  const { memberName, birthDate, memberId, memberEmail, celular, cim } = formData;

  try {
    // Verificar se já existe um membro com o mesmo CIM
    const existingMember = await pool.query(
      'SELECT * FROM membro WHERE cim = $1',
      [cim]
    );

    if (existingMember.rows.length > 0) {
      // Se já existe um membro com o mesmo CIM, atualizamos os dados
      console.log('Atualizando dados do membro...');
      await pool.query(
        'UPDATE membro SET nome = $1, data_nascimento = $2, email = $3, celular = $4 WHERE cim = $5',
        [memberName, birthDate, memberEmail, celular, cim]
      );
      console.log('Dados do membro atualizados com sucesso.');
    } else {
      // Se não existir, inserimos o novo membro na tabela
      console.log('Inserindo novo membro na base de dados...');
      await pool.query(
        'INSERT INTO membro (cim, nome, data_nascimento, email, celular) VALUES ($1, $2, $3, $4, $5)',
        [cim, memberName, birthDate, memberEmail, celular]
      );
      console.log('Novo membro inserido com sucesso.');
    }
  } catch (error) {
    console.error('Erro ao processar formulário do membro:', error);
    throw error;
  }
}


// Função para lidar com dados do formulário da esposa
async function handleSpouseForm(formData) {
  const { spouseName, spouseBirthDate, memberId } = formData;
  
  try {
    // Verificar se já existe uma esposa cadastrada para o membro
    const existingSpouse = await pool.query(
      'SELECT * FROM esposa WHERE membro_cim = $1',
      [memberId]
    );

    if (existingSpouse.rows.length > 0) {
      // Se já existir uma esposa, atualize apenas os campos fornecidos no formulário
      const spouseToUpdate = existingSpouse.rows[0];

      const updatedSpouse = {
        nome: spouseName || spouseToUpdate.nome,
        data_nascimento: spouseBirthDate || spouseToUpdate.data_nascimento,
      };

      await pool.query(
        'UPDATE esposa SET nome = $1, data_nascimento = $2 WHERE membro_cim = $3',
        [updatedSpouse.nome, updatedSpouse.data_nascimento, memberId]
      );

      // Retorne uma mensagem de sucesso ou faça outra ação necessária
      return { message: 'Dados da esposa atualizados com sucesso.' };
    } else {
      // Se não existir, insira os dados da esposa na tabela 'esposa'
      await pool.query(
        'INSERT INTO esposa (nome, data_nascimento, membro_cim) VALUES ($1, $2, $3)',
        [spouseName, spouseBirthDate, memberId]
      );

      // Retorne uma mensagem de sucesso ou faça outra ação necessária
      return { message: 'Dados da esposa inseridos com sucesso.' };
    }
  } catch (error) {
    console.error('Erro ao processar formulário de esposa:', error);
    throw error; // Reenvia o erro para ser tratado no nível superior
  }
}


// Função para lidar com dados do formulário dos filhos
async function handleChildForm(formData) {
  const { nomeFilho, dataNascimento, descricao, memberId } = formData;

  try {
    console.log('Dados recebidos do formulário do filho:', formData);
    // Inserir os dados do filho na tabela 'filhos'
    await pool.query(
      'INSERT INTO filhos (nome, data_nascimento, descricao, membro_cim) VALUES ($1, $2, $3, $4)',
      [nomeFilho, dataNascimento, descricao, memberId]
    );

    // Retornar uma mensagem de sucesso ou realizar outra ação necessária
    return { message: 'Dados do filho inseridos com sucesso.' };
  } catch (error) {
    console.error('Erro ao processar formulário do filho:', error);
    throw error; // Reenvia o erro para ser tratado no nível superior
  }
}


// Função para lidar com os Graus Simbólicos
app.post('/api/graussimbolicos', async (req, res) => {
  try {
    const symbolicDegrees = req.body.map(degree => ({
      ...degree,
      data: format(new Date(degree.data), 'dd/MM/yyyy'),
    }));

    // Verificar se os dados são válidos antes de inserir no banco de dados
    for (const degree of symbolicDegrees) {
      // Certifique-se de que memberId seja um número válido antes de inserir no banco de dados
      const memberId = parseInt(degree.memberId);
      if (isNaN(memberId)) {
        throw new Error(`ID do membro inválido: ${degree.memberId}`);
      }

      // Verificar se já existe um registro para o membro e o tipo de grau
      const existingDegree = await pool.query(
        'SELECT * FROM graussimbolicos WHERE membro_cim = $1 AND grau = $2',
        [memberId, degree.grau]
      );

      if (existingDegree.rows.length > 0) {
        // Se já existe, atualizar apenas a data do grau simbólico
        console.log('Atualizando grau simbólico...');
        await pool.query(
          'UPDATE graussimbolicos SET data = $1 WHERE membro_cim = $2 AND grau = $3',
          [degree.data, memberId, degree.grau]
        );
        console.log('Grau simbólico atualizado com sucesso.');
      } else {
        // Se não existir, insira os dados do grau simbólico na tabela 'graussimbolicos'
        console.log('Inserindo novo grau simbólico na base de dados...');
        await pool.query(
          'INSERT INTO graussimbolicos (membro_cim, grau, data, descricao) VALUES ($1, $2, $3, $4)',
          [memberId, degree.grau, degree.data, degree.descricao]
        );
        console.log('Novo grau simbólico inserido com sucesso.');
      }
    }

    res.status(201).json({ message: 'Graus Simbólicos adicionados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar/atualizar Graus Simbólicos:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar/atualizar Graus Simbólicos.' });

    // Adicionando detalhes do erro e stack trace para facilitar a identificação do problema
    console.error('Detalhes do erro:', error.message);
    console.error('Stack Trace:', error.stack);
  }
});


// Função para lidar com os Graus Filosóficos
app.post('/api/grausfilosoficos', async (req, res) => {
  try {
    const philosophicalDegrees = req.body.map(degree => ({
      ...degree,
      data: format(new Date(degree.data), 'dd/MM/yyyy'),
    }));

    // Verificar se os dados são válidos antes de inserir no banco de dados
    for (const degree of philosophicalDegrees) {
      // Certifique-se de que memberId seja um número válido antes de inserir no banco de dados
      const memberId = parseInt(degree.memberId);
      if (isNaN(memberId)) {
        throw new Error(`ID do membro inválido: ${degree.memberId}`);
      }

      // Verificar se já existe um registro para o membro e o tipo de grau
      const existingDegree = await pool.query(
        'SELECT * FROM grausfilosoficos WHERE membro_cim = $1 AND grau = $2',
        [memberId, degree.grau]
      );

      if (existingDegree.rows.length > 0) {
        // Se já existe, atualizar apenas a data do grau filosófico
        console.log('Atualizando grau filosófico...');
        await pool.query(
          'UPDATE grausfilosoficos SET data = $1 WHERE membro_cim = $2 AND grau = $3',
          [degree.data, memberId, degree.grau]
        );
        console.log('Grau filosófico atualizado com sucesso.');
      } else {
        // Se não existir, insira os dados do grau filosófico na tabela 'grausfilosoficos'
        console.log('Inserindo novo grau filosófico na base de dados...');
        await pool.query(
          'INSERT INTO grausfilosoficos (membro_cim, grau, data, descricao) VALUES ($1, $2, $3, $4)',
          [memberId, degree.grau, degree.data, degree.descricao]
        );
        console.log('Novo grau filosófico inserido com sucesso.');
      }
    }

    res.status(201).json({ message: 'Graus Filosóficos adicionados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar/atualizar Graus Filosóficos:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar/atualizar Graus Filosóficos.' });

    // Adicionando detalhes do erro e stack trace para facilitar a identificação do problema
    console.error('Detalhes do erro:', error.message);
    console.error('Stack Trace:', error.stack);
  }
});


// Função para lidar com os Graus Adicionais
app.post('/api/grausadicionais', async (req, res) => {
  try {
    const additionalDegrees = req.body.map(degree => ({
      ...degree,
      data: format(new Date(degree.data), 'dd/MM/yyyy'),
    }));

    // Verificar se os dados são válidos antes de inserir no banco de dados
    for (const degree of additionalDegrees) {
      // Certifique-se de que memberId seja um número válido antes de inserir no banco de dados
      const memberId = parseInt(degree.memberId);
      if (isNaN(memberId)) {
        throw new Error(`ID do membro inválido: ${degree.memberId}`);
      }

      // Verificar se já existe um registro para o membro e o tipo de grau
      const existingDegree = await pool.query(
        'SELECT * FROM grausadicionais WHERE membro_cim = $1 AND grau = $2',
        [memberId, degree.grau]
      );

      if (existingDegree.rows.length > 0) {
        // Se já existe, atualizar apenas a data do grau adicional
        console.log('Atualizando grau adicional...');
        await pool.query(
          'UPDATE grausadicionais SET data = $1 WHERE membro_cim = $2 AND grau = $3',
          [degree.data, memberId, degree.grau]
        );
        console.log('Grau adicional atualizado com sucesso.');
      } else {
        // Se não existir, insira os dados do grau adicional na tabela 'grausadicionais'
        console.log('Inserindo novo grau adicional na base de dados...');
        await pool.query(
          'INSERT INTO grausadicionais (membro_cim, grau, data, descricao) VALUES ($1, $2, $3, $4)',
          [memberId, degree.grau, degree.data, degree.descricao]
        );
        console.log('Novo grau adicional inserido com sucesso.');
      }
    }

    res.status(201).json({ message: 'Graus Adicionais adicionados com sucesso!' });
  } catch (error) {
    console.error('Erro ao adicionar/atualizar Graus Adicionais:', error);
    res.status(500).json({ message: 'Erro interno ao adicionar/atualizar Graus Adicionais.' });

    // Adicionando detalhes do erro e stack trace para facilitar a identificação do problema
    console.error('Detalhes do erro:', error.message);
    console.error('Stack Trace:', error.stack);
  }
});


app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}
);
