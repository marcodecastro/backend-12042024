import pool from '../dbPostgresql.js';

// Função para buscar comemorações
export const fetchCelebrations = async (req, res) => {
    try {
        const query = `
        SELECT
            *,
            CASE
                WHEN EXTRACT(DAY FROM data_nascimento_membro) = EXTRACT(DAY FROM CURRENT_DATE)
                    AND EXTRACT(MONTH FROM data_nascimento_membro) = EXTRACT(MONTH FROM CURRENT_DATE)
                THEN 'Aniversário do Membro'
                ... // Outros casos
            END AS TipoDataComemorativa,
            CASE
                WHEN EXTRACT(DAY FROM data_nascimento_membro) = EXTRACT(DAY FROM CURRENT_DATE)
                    AND EXTRACT(MONTH FROM data_nascimento_membro) = EXTRACT(MONTH FROM CURRENT_DATE)
                THEN data_nascimento_membro
                ... // Outros casos
            END AS DataComemorativa
        FROM Trabalho
        WHERE EXTRACT(DAY FROM data_nascimento_membro) = EXTRACT(DAY FROM CURRENT_DATE)
            AND EXTRACT(MONTH FROM data_nascimento_membro) = EXTRACT(MONTH FROM CURRENT_DATE)
            OR EXTRACT(DAY FROM data_nascimento_esposa) = EXTRACT(DAY FROM CURRENT_DATE)
            ... // Outros casos
        ORDER BY DataComemorativa;`;

        const { rows } = await pool.query(query);
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar comemorações:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao buscar as comemorações.' });
    }
};

// Função para criar uma nova comemoração
export const createCelebration = async (req, res) => {
    try {
        const {
            membroId, nomeMembro, dataNascimentoMembro, emailMembro, celularMembro,
            nomeEsposa, dataNascimentoEsposa, nomeFilho, dataNascimentoFilho,
            grauSimbolico, dataGrauSimbolico, descricaoGrauSimbolico,
            grauFilosofico, dataGrauFilosofico, descricaoGrauFilosofico,
            grauAdicional, dataGrauAdicional, descricaoGrauAdicional,
            instalacao, dataInstalacao, descricaoInstalacao,
            reassuncao, dataReassuncao, descricaoReassuncao,
            cavdeStaCruz, dataCavdeStaCruz, descricaoCavdeStaCruz,
            casamento, dataCasamento, descricaoCasamento
        } = req.body;

        await pool.query(
            'INSERT INTO Trabalho (membro_id, nome_membro, data_nascimento_membro, email_membro, celular_membro, nome_esposa, data_nascimento_esposa, nome_filho,  data_nascimento_filho, grau_simbolico, data_grau_simbolico, descricao_grau_simbolico, grau_filosofico, data_grau_filosofico, descricao_grau_filosofico, grau_adicional, data_grau_adicional, descricao_grau_adicional, instalacao, data_instalacao, descricao_instalacao, reassuncao, data_reassuncao, descricao_reassuncao, cavde_sta_cruz, data_cavde_sta_cruz, descricao_cavde_sta_cruz, casamento, data_casamento, descricao_casamento ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30)',
            [membroId, nomeMembro, dataNascimentoMembro, emailMembro, celularMembro,
            nomeEsposa, dataNascimentoEsposa, nomeFilho, dataNascimentoFilho,
            grauSimbolico, dataGrauSimbolico, descricaoGrauSimbolico,
            grauFilosofico, dataGrauFilosofico, descricaoGrauFilosofico,
            grauAdicional, dataGrauAdicional, descricaoGrauAdicional,
            instalacao, dataInstalacao, descricaoInstalacao,
            reassuncao, dataReassuncao, descricaoReassuncao,
            cavdeStaCruz, dataCavdeStaCruz, descricaoCavdeStaCruz,
            casamento, dataCasamento, descricaoCasamento]
        );

        res.status(201).json({ message: 'Dados inseridos com sucesso.' });
    } catch (error) {
        console.error('Erro ao inserir os dados:', error);
        res.status(500).json({ message: 'Ocorreu um erro ao inserir os dados. Por favor, tente novamente.' });
    }
};
