// Desktop Telegram WebApp Fix Utility
export class DesktopTelegramFix {
    static init() {
        // Check if we're in desktop Telegram
        const isDesktopTelegram = window.Telegram?.WebApp?.platform === 'tdesktop' ||
                                  window.Telegram?.WebApp?.platform === 'web' ||
                                  window.Telegram?.WebApp?.platform === 'weba' ||
                                  (window.Telegram?.WebApp && !('ontouchstart' in window));
        
        if (isDesktopTelegram) {
            console.log('Desktop Telegram detected, applying fixes');
            
            // Add desktop class
            document.body.classList.add('telegram-desktop');
            
            // Force scroll capability
            this.enableScrolling();
            
            // Enhanced button interaction
            this.enhanceButtonInteraction();
            
            // Fix viewport
            this.fixViewport();
            
            return true;
        }
        
        return false;
    }
    
    static enableScrolling() {
        // Force scrolling styles
        document.body.style.overflowY = 'auto';
        document.body.style.height = 'auto';
        document.body.style.minHeight = '100vh';
        
        // Fix container scrolling
        const container = document.getElementById('game-container');
        if (container) {
            container.style.height = 'auto';
            container.style.minHeight = '100vh';
            container.style.overflow = 'visible';
        }
    }
    
    static enhanceButtonInteraction() {
        // Force button activation with multiple strategies
        const forceButtonEvents = () => {
            const buttons = document.querySelectorAll('.action-button, .location-button');
            
            buttons.forEach(button => {
                if (!button.hasAttribute('data-desktop-enhanced')) {
                    button.setAttribute('data-desktop-enhanced', 'true');
                    
                    // Get action data
                    const actionId = button.dataset.action;
                    const locationId = button.dataset.location;
                    
                    // Remove all existing event listeners by cloning
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                    
                    // Add multiple event handlers
                    const handleClick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('Desktop button clicked:', { actionId, locationId });
                        
                        if (actionId && window.gameEngine) {
                            window.gameEngine.processAction(actionId);
                        } else if (locationId && window.gameEngine) {
                            window.gameEngine.moveToLocation(locationId);
                        }
                        
                        // Visual feedback
                        newButton.style.transform = 'scale(0.95)';
                        setTimeout(() => {
                            newButton.style.transform = '';
                        }, 100);
                        
                        return false;
                    };
                    
                    // Multiple event binding approaches
                    newButton.onclick = handleClick;
                    newButton.addEventListener('click', handleClick, { capture: true });
                    newButton.addEventListener('mousedown', handleClick, { capture: true });
                    newButton.addEventListener('mouseup', handleClick, { capture: true });
                    
                    // Keyboard support
                    newButton.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            handleClick(e);
                        }
                    });
                    
                    // Force styles
                    newButton.style.cursor = 'pointer';
                    newButton.style.pointerEvents = 'auto';
                    newButton.style.userSelect = 'none';
                    newButton.style.touchAction = 'manipulation';
                    
                    // Make focusable
                    if (!newButton.hasAttribute('tabindex')) {
                        newButton.setAttribute('tabindex', '0');
                    }
                }
            });
        };
        
        // Initial application
        setTimeout(forceButtonEvents, 100);
        
        // Periodic re-application
        setInterval(forceButtonEvents, 1000);
        
        // Observer for new buttons
        const observer = new MutationObserver(() => {
            setTimeout(forceButtonEvents, 50);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    static fixViewport() {
        // Fix viewport height
        const updateViewportHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
        };
        
        updateViewportHeight();
        window.addEventListener('resize', updateViewportHeight);
        
        // Telegram-specific viewport fix
        if (window.Telegram?.WebApp?.expand) {
            window.Telegram.WebApp.expand();
        }
    }
}