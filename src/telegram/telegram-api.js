export class TelegramAPI {
    constructor() {
        this.tg = window.Telegram?.WebApp;
        this.user = null;
        this.isAvailable = !!this.tg;
    }

    init() {
        if (!this.isAvailable) {
            console.log('Telegram WebApp API not available, using normal mode');
            return;
        }

        try {
            this.tg.ready();
            this.tg.expand();
            
            // Enable confirmation on close
            this.tg.enableClosingConfirmation();
            
            // Set viewport settings
            if (this.tg.setHeaderColor) {
                this.tg.setHeaderColor('#bg_color');
            }
            
            this.user = this.tg.initDataUnsafe?.user;
            
            this.setupTheme();
            this.setupBackButton();
            this.setupMainButton();
            
            // Desktop-specific fixes
            this.applyDesktopFixes();
            
            console.log('Telegram WebApp initialized');
            console.log('Platform:', this.tg.platform);
            console.log('Version:', this.tg.version);
            console.log('User:', this.user);
        } catch (error) {
            console.error('Telegram WebApp initialization error:', error);
        }
    }
    
    applyDesktopFixes() {
        if (!this.isAvailable) return;
        
        // Check if running on desktop
        const isDesktop = this.tg.platform === 'tdesktop' || 
                         this.tg.platform === 'web' ||
                         this.tg.platform === 'weba';
        
        if (isDesktop) {
            // Add desktop-specific class
            document.body.classList.add('telegram-desktop');
            
            // Fix viewport height for desktop
            const fixViewportHeight = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            fixViewportHeight();
            window.addEventListener('resize', fixViewportHeight);
        }
    }

    setupTheme() {
        if (!this.isAvailable) return;

        const root = document.documentElement;
        
        // Determine theme based on background color
        const bgColor = this.tg.backgroundColor || '#ffffff';
        const isDark = this.isColorDark(bgColor);
        
        // Set theme attribute
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        
        // Set CSS variables from Telegram
        root.style.setProperty('--tg-theme-bg-color', this.tg.backgroundColor || '#ffffff');
        root.style.setProperty('--tg-theme-text-color', this.tg.textColor || '#000000');
        root.style.setProperty('--tg-theme-hint-color', this.tg.hintColor || '#999999');
        root.style.setProperty('--tg-theme-link-color', this.tg.linkColor || '#2481cc');
        root.style.setProperty('--tg-theme-button-color', this.tg.buttonColor || '#2481cc');
        root.style.setProperty('--tg-theme-button-text-color', this.tg.buttonTextColor || '#ffffff');
        root.style.setProperty('--tg-theme-secondary-bg-color', this.tg.secondaryBackgroundColor || (isDark ? '#232e3c' : '#f1f1f1'));
        
        document.body.style.backgroundColor = this.tg.backgroundColor || '#ffffff';
        document.body.style.color = this.tg.textColor || '#000000';
        
        console.log(`Theme set: ${isDark ? 'dark' : 'light'}`);
    }
    
    isColorDark(color) {
        // Convert color to RGB and determine brightness
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        
        // Formula for determining brightness
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
            console.warn('Haptic feedback error:', error);
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