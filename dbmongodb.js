import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoDBUrl = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/User';

if (!mongoDBUrl) {
  throw new Error('MONGODB_URI environment variable is not defined');
}

mongoose.connect(mongoDBUrl, {
});

const db = mongoose.connection;
db.on('error', (error) => {
  console.error('Erro ao conectar ao MongoDB:', error.message);
  process.exit(1);
});
db.once('open', () => {
  console.log('Conexão com o MongoDB estabelecida com sucesso');
});

export default db;