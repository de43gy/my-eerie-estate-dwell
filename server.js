const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'", 
                "'unsafe-inline'",
                "'unsafe-eval'",
                "https://telegram.org"
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https://telegram.org"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
    origin: ['https://web.telegram.org', 'https://webk.telegram.org'],
    credentials: true
}));

// Настройка правильных MIME типов
express.static.mime.define({
    'application/javascript': ['js'],
    'text/css': ['css'],
    'application/json': ['json']
});

// Обслуживание статических файлов из корня проекта
app.use(express.static(path.join(__dirname), {
    maxAge: '1d',
    etag: true,
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css; charset=utf-8');
        } else if (filePath.endsWith('.json')) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }
    }
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0'
    });
});

// Обработка 404 - возвращаем index.html только для HTML запросов
app.use((req, res) => {
    // Если запрашивается API endpoint, возвращаем 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // Если запрашивается статический файл (js, css, json), возвращаем 404
    if (req.path.match(/\.(js|css|json|png|jpg|ico)$/)) {
        return res.status(404).send('File not found');
    }
    
    // Для всех остальных запросов возвращаем index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
    console.log(`🎮 My Eerie Estate Dwell запущен на порту ${PORT}`);
    console.log(`📱 Telegram WebApp готов к работе`);
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Static files served from: ${__dirname}`);
});