const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Подключение к базе данных MySQL
const db = mysql.createConnection({
    host: 'localhost', // Или адрес вашего сервера базы данных
    user: 'root',      // Имя пользователя MySQL
    password: '12345678', // Пароль MySQL
    database: 'hakrinh' // Имя вашей базы данных
});

// Подключение к базе данных
db.connect((err) => {
    if (err) {
        console.error('Ошибка подключения к базе данных:', err);
        return;
    }
    console.log('Подключено к базе данных MySQL');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API для сохранения таблицы
app.post('/api/save-table', (req, res) => {
    const tableData = req.body.data;

    // Преобразуем таблицу в формат строки для сохранения в базе данных
    const tableString = JSON.stringify(tableData);

    // SQL-запрос для сохранения данных
    const query = 'INSERT INTO table_data (data) VALUES (?)';
    db.query(query, [tableString], (err, result) => {
        if (err) {
            console.error('Ошибка при сохранении таблицы:', err);
            return res.status(500).send({ message: 'Ошибка при сохранении таблицы', error: err });
        }
        res.status(201).send({ message: 'Таблица сохранена успешно!' });
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
