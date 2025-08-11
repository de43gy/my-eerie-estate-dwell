export class TelegramAPI {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isAvailable = !!this.tg;
    }

    init() {
        if (!this.isAvailable) {
            console.log('Telegram WebApp API недоступен, используется обычный режим');
            return;
        }

        try {
            this.tg.ready();
            this.tg.expand();
            
            this.user = this.tg.initDataUnsafe?.user;
            
            this.setupTheme();
            this.setupBackButton();
            this.setupMainButton();
            
            console.log('Telegram WebApp инициализирован');
            console.log('Пользователь:', this.user);
        } catch (error) {
            console.error('Ошибка инициализации Telegram WebApp:', error);
        }
    }

    setupTheme() {
        if (!this.isAvailable) return;

        const root = document.documentElement;
        
        // Определяем тему на основе цвета фона
        const bgColor = this.tg.backgroundColor || '#ffffff';
        const isDark = this.isColorDark(bgColor);
        
        // Устанавливаем атрибут темы
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Устанавливаем CSS переменные из Telegram
        root.style.setProperty('--tg-theme-bg-color', this.tg.backgroundColor || '#ffffff');
        root.style.setProperty('--tg-theme-text-color', this.tg.textColor || '#000000');
        root.style.setProperty('--tg-theme-hint-color', this.tg.hintColor || '#999999');
        root.style.setProperty('--tg-theme-link-color', this.tg.linkColor || '#2481cc');
        root.style.setProperty('--tg-theme-button-color', this.tg.buttonColor || '#2481cc');
        root.style.setProperty('--tg-theme-button-text-color', this.tg.buttonTextColor || '#ffffff');
        root.style.setProperty('--tg-theme-secondary-bg-color', this.tg.secondaryBackgroundColor || (isDark ? '#232e3c' : '#f1f1f1'));
        
        document.body.style.backgroundColor = this.tg.backgroundColor || '#ffffff';
        document.body.style.color = this.tg.textColor || '#000000';
        
        console.log(`Тема установлена: ${isDark ? 'темная' : 'светлая'}`);
    }
    
    isColorDark(color) {
        // Конвертируем цвет в RGB и определяем яркость
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Формула для определения яркости
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }

    setupBackButton() {
        if (!this.isAvailable) return;

        this.tg.BackButton.onClick(() => {
            this.handleBackButton();
        });
    }

    setupMainButton() {
        if (!this.isAvailable) return;

        this.tg.MainButton.setText('Сохранить игру');
        this.tg.MainButton.onClick(() => {
            this.handleMainButton();
        });
    }

    handleBackButton() {
        this.showConfirm('Вы уверены, что хотите выйти из игры?', () => {
            this.tg.close();
        });
    }

    handleMainButton() {
        window.dispatchEvent(new CustomEvent('telegram-save-game'));
    }

    hapticFeedback(type = 'medium') {
        if (!this.isAvailable) return;

        try {
            switch (type) {
                case 'light':
                    this.tg.HapticFeedback.impactOccurred('light');
                    break;
                case 'medium':
                    this.tg.HapticFeedback.impactOccurred('medium');
                    break;
                case 'heavy':
                    this.tg.HapticFeedback.impactOccurred('heavy');
                    break;
                case 'error':
                    this.tg.HapticFeedback.notificationOccurred('error');
                    break;
                case 'success':
                    this.tg.HapticFeedback.notificationOccurred('success');
                    break;
                case 'warning':
                    this.tg.HapticFeedback.notificationOccurred('warning');
                    break;
                default:
                    this.tg.HapticFeedback.impactOccurred('medium');
            }
        } catch (error) {
            console.warn('Ошибка haptic feedback:', error);
        }
    }

    showAlert(message) {
        if (!this.isAvailable) {
            alert(message);
            return;
        }

        this.tg.showAlert(message);
    }

    showConfirm(message, callback) {
        if (!this.isAvailable) {
            if (confirm(message)) {
                callback();
            }
            return;
        }

        this.tg.showConfirm(message, callback);
    }

    getUserInfo() {
        return this.user;
    }

    getUserName() {
        if (!this.user) return 'Игрок';
        
        return this.user.first_name + (this.user.last_name ? ` ${this.user.last_name}` : '');
    }

    close() {
        if (!this.isAvailable) {
            window.close();
            return;
        }

        this.tg.close();
    }
}