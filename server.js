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

app.use(express.static(path.join(__dirname, 'src'), {
    maxAge: '1d',
    etag: true
}));

app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true
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

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Что-то пошло не так!' });
});

app.listen(PORT, () => {
    console.log(`🎮 My Eerie Estate Dwell запущен на порту ${PORT}`);
    console.log(`📱 Telegram WebApp готов к работе`);
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
});