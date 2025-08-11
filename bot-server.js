const express = require('express');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

const BOT_TOKEN = '8316154675:AAGDTSUtW0Ysrg5dEbxn5S5GnAr0cgqwIPc';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Serve static files
app.use(express.static('.'));

// Bot commands
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    
    const keyboard = {
        inline_keyboard: [
            [{
                text: '🧪 Открыть тест простых кнопок',
                web_app: { url: `http://localhost:${PORT}/simple-test.html` }
            }],
            [{
                text: '🧪 Открыть тест сложных кнопок',
                web_app: { url: `http://localhost:${PORT}/test-buttons.html` }
            }],
            [{
                text: '🎮 Открыть игру',
                web_app: { url: `http://localhost:${PORT}/index.html` }
            }]
        ]
    };
    
    bot.sendMessage(chatId, 
        'Привет! Выберите, что хотите протестировать:', 
        { reply_markup: keyboard }
    );
});

bot.onText(/\/test/, (msg) => {
    const chatId = msg.chat.id;
    
    const keyboard = {
        inline_keyboard: [
            [{
                text: '🧪 Тест кнопок',
                web_app: { url: `http://localhost:${PORT}/simple-test.html` }
            }]
        ]
    };
    
    bot.sendMessage(chatId, 
        'Открываю тест кнопок:', 
        { reply_markup: keyboard }
    );
});

// Handle web app data
bot.on('web_app_data', (msg) => {
    const chatId = msg.chat.id;
    const data = msg.web_app_data.data;
    
    bot.sendMessage(chatId, `Получены данные: ${data}`);
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🌐 Тест кнопок: http://localhost:${PORT}/simple-test.html`);
    console.log(`🎮 Игра: http://localhost:${PORT}/index.html`);
    console.log(`🤖 Бот готов к работе!`);
});

// Error handling
bot.on('error', (error) => {
    console.error('Ошибка бота:', error);
});

bot.on('polling_error', (error) => {
    console.error('Ошибка polling:', error);
});
