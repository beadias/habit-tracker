require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

app.get('/', (req, res) => {
    res.send('Servidor rodando!');
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao conectar no banco');
    }
});


app.post('/habitos', async (req, res) => {

    const {
      nome,
      frequencia,
      meta_diaria,
      dias_semana
    } = req.body;
  
    try {
  
      const result = await pool.query(
        `
        INSERT INTO habitos
        (
          nome,
          frequencia,
          meta_diaria,
          dias_semana
        )
  
        VALUES ($1, $2, $3, $4)
  
        RETURNING *
        `,
        [
          nome,
          frequencia,
          meta_diaria,
          dias_semana
        ]
      );
  
      res.json(result.rows[0]);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Erro ao cadastrar hábito');
    }
  });

  app.get('/habitos', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                h.*,
                COUNT(hist.id)::int AS progresso_atual,
                CASE 
                    WHEN COUNT(hist.id) >= h.meta_diaria THEN true
                    ELSE false
                END AS concluido
            FROM habitos h
            LEFT JOIN historico_habitos hist
                ON hist.habito_id = h.id
                AND hist.data_conclusao = CURRENT_DATE
            GROUP BY h.id
            ORDER BY h.id
        `);

        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar hábitos');
    }
});

app.put('/habitos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, frequencia } = req.body;

    try {
        const result = await pool.query(
            'UPDATE habitos SET nome = $1, frequencia = $2 WHERE id = $3 RETURNING *',
            [nome, frequencia, id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar hábito');
    }
});

app.delete('/habitos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        await pool.query('DELETE FROM habitos WHERE id = $1', [id]);
        res.send('Hábito excluído com sucesso');
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao excluir hábito');
    }
});

app.patch('/habitos/:id/concluir', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(
            'UPDATE habitos SET concluido = true WHERE id = $1 RETURNING *',
            [id]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao concluir hábito');
    }
});

app.patch('/habitos/:id/progresso', async (req, res) => {
    const { id } = req.params;

    try {
        const habitoResult = await pool.query(
            'SELECT * FROM habitos WHERE id = $1',
            [id]
        );

        const habito = habitoResult.rows[0];

        const registrosHoje = await pool.query(
            `
            SELECT COUNT(*)::int AS total
            FROM historico_habitos
            WHERE habito_id = $1
            AND data_conclusao = CURRENT_DATE
            `,
            [id]
        );

        const totalHoje = registrosHoje.rows[0].total;

        if (totalHoje >= habito.meta_diaria) {
            return res.json({
                ...habito,
                progresso_atual: totalHoje,
                concluido: true
            });
        }

        await pool.query(
            'INSERT INTO historico_habitos (habito_id) VALUES ($1)',
            [id]
        );

        const novoTotalHoje = totalHoje + 1;
        const concluido = novoTotalHoje >= habito.meta_diaria;

        res.json({
            ...habito,
            progresso_atual: novoTotalHoje,
            concluido
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao atualizar progresso');
    }
});

app.get('/historico', async (req, res) => {
    try {
        const registros = await pool.query(`
            SELECT 
                historico_habitos.id,
                historico_habitos.habito_id,
                habitos.nome,
                historico_habitos.data_conclusao
            FROM historico_habitos
            JOIN habitos ON historico_habitos.habito_id = habitos.id
            ORDER BY historico_habitos.data_conclusao DESC
        `);

        const resumoHoje = await pool.query(`
            SELECT COUNT(*)::int AS total_hoje
            FROM historico_habitos
            WHERE data_conclusao = CURRENT_DATE
        `);

        const resumoSemana = await pool.query(`
            SELECT COUNT(*)::int AS total_semana
            FROM historico_habitos
            WHERE data_conclusao >= CURRENT_DATE - INTERVAL '6 days'
        `);

        const registrosPorDia = await pool.query(`
            SELECT 
                data_conclusao,
                COUNT(*)::int AS total
            FROM historico_habitos
            WHERE data_conclusao >= CURRENT_DATE - INTERVAL '6 days'
            GROUP BY data_conclusao
            ORDER BY data_conclusao DESC
        `);

        res.json({
            totalHoje: resumoHoje.rows[0].total_hoje,
            totalSemana: resumoSemana.rows[0].total_semana,
            registrosPorDia: registrosPorDia.rows,
            registros: registros.rows
        });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar histórico');
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});