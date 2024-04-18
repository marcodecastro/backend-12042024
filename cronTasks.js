import cron from 'node-cron';
import fetch from 'node-fetch';

// Configurar uma tarefa agendada para executar todos os dias à meia-noite
cron.schedule('0 0 * * *', async () => {
  try {
    // Fazer uma requisição GET para a rota que busca as comemorações
    const response = await fetch('http://localhost:5000/api/comemoracoes');
    if (response.ok) {
      // Se a requisição for bem-sucedida, você pode processar os dados da resposta aqui
      const comemoracoes = await response.json();
      console.log('Comemorações do dia:', comemoracoes);
    } else {
      console.error('Erro ao buscar comemorações:', response.statusText);
    }
  } catch (error) {
    console.error('Erro ao buscar comemorações:', error);
  }
}, {
  scheduled: true,
  timezone: 'America/Sao_Paulo' // Ajuste o fuso horário conforme necessário
});