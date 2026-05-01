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
    const { nome, frequencia } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO habitos (nome, frequencia) VALUES ($1, $2) RETURNING *',
            [nome, frequencia]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao salvar hábito');
    }
});

app.get('/habitos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM habitos');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar hábitos');
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});