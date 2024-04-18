import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg; 

dotenv.config();

const pgUser = process.env.PG_USER;
const pgHost = process.env.PG_HOST;
const pgDatabase = process.env.PG_DATABASE;
const pgPassword = process.env.PG_PASSWORD;
const pgPort = process.env.PG_PORT;


if (!pgPassword) {
  throw new Error('PG_PASSWORD environment variable is not defined');
}

const pool = new Pool({
  user: pgUser,
  host: pgHost,
  database: pgDatabase,
  password: pgPassword,
  port: pgPort,
});

// Estabelecendo conexão com o PostgreSQL
pool.connect()
  .then(() => console.log('Conexão com o PostgreSQL estabelecida com sucesso'))
  .catch(err => console.error('Erro ao conectar ao PostgreSQL:', err));

export default pool;