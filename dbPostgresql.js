import pkg from 'pg';
import dotenv from 'dotenv';

const { Pool } = pkg; 

dotenv.config();

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL ,
})


// Estabelecendo conexão com o PostgreSQL
pool.connect()
  .then(() => console.log('Conexão com o PostgreSQL estabelecida com sucesso'))
  .catch(err => console.error('Erro ao conectar ao PostgreSQL:', err));

export default pool;