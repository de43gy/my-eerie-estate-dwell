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
                "'unsafe-hashes'",
                "https://telegram.org"
            ],
            "script-src-attr": ["'unsafe-inline'"],
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

// Setup correct MIME types
express.static.mime.define({
    'application/javascript': ['js'],
    'text/css': ['css'],
    'application/json': ['json']
});

// Serve static files from project root
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

// Handle 404 - return index.html only for HTML requests
app.use((req, res) => {
    // If API endpoint is requested, return 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    
    // If static file is requested (js, css, json), return 404
    if (req.path.match(/\.(js|css|json|png|jpg|ico)$/)) {
        return res.status(404).send('File not found');
    }
    
    // For all other requests return index.html
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`🎮 My Eerie Estate Dwell started on port ${PORT}`);
    console.log(`📱 Telegram WebApp ready to work`);
    console.log(`🌍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📁 Static files served from: ${__dirname}`);
});