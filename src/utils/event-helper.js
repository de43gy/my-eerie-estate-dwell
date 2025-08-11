import { DebugHelper } from './debug-helper.js';

export class EventHelper {
    static bindButtonEvents(button, handler) {
        const buttonText = button.textContent;
        DebugHelper.log('EVENT', `Binding events to button: ${buttonText}`);
        // Desktop events
        button.addEventListener('click', (e) => {
            DebugHelper.log('EVENT', `Click event on: ${buttonText}`);
            handler(e);
        }, false);
        button.addEventListener('mousedown', (e) => {
            button.dataset.pressed = 'true';
        });
        button.addEventListener('mouseup', (e) => {
            if (button.dataset.pressed === 'true') {
                delete button.dataset.pressed;
                DebugHelper.log('EVENT', `Mouseup event on: ${buttonText}`);
                handler(e);
            }
        });
        
        // Touch events
        button.addEventListener('touchstart', (e) => {
            button.dataset.touched = 'true';
            e.preventDefault();
        }, { passive: false });
        
        button.addEventListener('touchend', (e) => {
            if (button.dataset.touched === 'true') {
                delete button.dataset.touched;
                DebugHelper.log('EVENT', `Touchend event on: ${buttonText}`);
                handler(e);
                e.preventDefault();
            }
        }, { passive: false });
        
        // Pointer events (better support for hybrid devices)
        if (window.PointerEvent) {
            button.addEventListener('pointerdown', (e) => {
                button.setPointerCapture(e.pointerId);
                button.dataset.pointerId = e.pointerId;
            });
            
            button.addEventListener('pointerup', (e) => {
                if (button.dataset.pointerId == e.pointerId) {
                    delete button.dataset.pointerId;
                    button.releasePointerCapture(e.pointerId);
                    DebugHelper.log('EVENT', `Pointerup event on: ${buttonText}`);
                    handler(e);
                }
            });
        }
        
        // Keyboard accessibility
        button.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handler(e);
            }
        });
    }
    
    static isTelegramDesktop() {
        const tg = window.Telegram?.WebApp;
        if (!tg) return false;
        
        return tg.platform === 'tdesktop' || 
               tg.platform === 'web' ||
               tg.platform === 'weba' ||
               tg.platform === 'webk';
    }
    
    static preventDefaultBehaviors(element) {
        element.addEventListener('dragstart', e => e.preventDefault());
        element.addEventListener('selectstart', e => e.preventDefault());
        element.addEventListener('contextmenu', e => e.preventDefault());
    }
}
