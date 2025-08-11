export class UIManager {
    constructor() {
        this.elements = {};
        this.messageQueue = [];
        this.messageTimeout = null;
    }

    init() {
        this.elements = {
            timeDisplay: document.getElementById('time-display'),
            needsDisplay: document.getElementById('needs-display'),
            locationName: document.getElementById('location-name'),
            locationDescription: document.getElementById('location-description'),
            inventoryItems: document.getElementById('inventory-items'),
            actionsList: document.getElementById('actions-list'),
            messageDisplay: document.getElementById('message-display'),
            locationButtons: document.getElementById('location-buttons')
        };

        this.createNeedsDisplay();
        this.setupMessageSystem();
    }

    createNeedsDisplay() {
        const needsContainer = this.elements.needsDisplay;
        needsContainer.innerHTML = '';

        const needs = ['hunger', 'thirst', 'health', 'energy'];
        const needNames = {
            hunger: 'Голод',
            thirst: 'Жажда', 
            health: 'Здоровье',
            energy: 'Энергия'
        };

        needs.forEach(need => {
            const needContainer = document.createElement('div');
            needContainer.className = 'need-container';

            const needLabel = document.createElement('div');
            needLabel.className = 'need-label';
            needLabel.textContent = needNames[need];

            const needBar = document.createElement('div');
            needBar.className = 'need-bar';
            
            const needFill = document.createElement('div');
            needFill.className = 'need-fill';
            needFill.id = `need-${need}`;
            
            needBar.appendChild(needFill);
            needContainer.appendChild(needLabel);
            needContainer.appendChild(needBar);
            needsContainer.appendChild(needContainer);
        });
    }

    updateTimeDisplay(timeString) {
        if (this.elements.timeDisplay) {
            this.elements.timeDisplay.textContent = timeString;
        }
    }

    updateCharacterStats(needs) {
        for (const [needType, value] of Object.entries(needs)) {
            const needElement = document.getElementById(`need-${needType}`);
            if (needElement) {
                needElement.style.width = `${Math.max(0, value)}%`;
                needElement.className = `need-fill ${this.getNeedColorClass(value)}`;
            }
        }
    }

    getNeedColorClass(value) {
        if (value >= 70) return 'need-good';
        if (value >= 40) return 'need-medium';
        if (value >= 20) return 'need-low';
        return 'need-critical';
    }

    updateLocation(location, availableActions) {
        if (this.elements.locationName) {
            this.elements.locationName.textContent = location.name;
        }
        
        if (this.elements.locationDescription) {
            this.elements.locationDescription.textContent = location.description;
        }

        this.updateActionsList(availableActions);
    }

    updateActionsList(actions) {
        const actionsList = this.elements.actionsList;
        if (!actionsList) return;

        actionsList.innerHTML = '';

        if (actions.length === 0) {
            const noActions = document.createElement('div');
            noActions.className = 'no-actions';
            noActions.textContent = 'Нет доступных действий';
            actionsList.appendChild(noActions);
            return;
        }

        actions.forEach(action => {
            const actionButton = document.createElement('button');
            actionButton.className = 'action-button';
            actionButton.dataset.action = action.id;
            actionButton.textContent = action.name;
            
            // Add additional debug information
            actionButton.setAttribute('data-debug', `action-${action.id}`);
            actionButton.style.position = 'relative';
            actionButton.style.zIndex = '10';
            
            // Special attributes for Telegram Desktop compatibility
            actionButton.setAttribute('role', 'button');
            actionButton.setAttribute('tabindex', '0');
            actionButton.setAttribute('aria-label', action.name);
            
            if (action.timeCost) {
                const timeCost = document.createElement('span');
                timeCost.className = 'action-time';
                timeCost.textContent = ` (${action.timeCost}ч)`;
                actionButton.appendChild(timeCost);
            }

            if (action.energyCost) {
                const energyCost = document.createElement('span');
                energyCost.className = 'action-energy';
                energyCost.textContent = ` [-${action.energyCost} энергии]`;
                actionButton.appendChild(energyCost);
            }

            // Add event handlers directly to the button with multiple strategies
            const handleClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Direct button click:', action.id);
                
                // Direct game engine call as backup
                if (window.gameEngineRef) {
                    window.gameEngineRef.processAction(action.id);
                }
            };
            
            // Multiple event binding approaches for maximum compatibility
            actionButton.onclick = handleClick;
            actionButton.addEventListener('click', handleClick, { capture: true });
            actionButton.addEventListener('mousedown', handleClick, { capture: true });
            actionButton.addEventListener('touchend', handleClick, { passive: false });
            
            // Additional event types for better compatibility
            actionButton.addEventListener('mouseup', handleClick, { capture: true });
            actionButton.addEventListener('pointerdown', handleClick, { capture: true });
            actionButton.addEventListener('pointerup', handleClick, { capture: true });
            
            // Desktop-specific enhancements
            const isDesktop = !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            if (isDesktop) {
                actionButton.setAttribute('tabindex', '0');
                actionButton.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        handleClick(e);
                    }
                });
                
                // Force visibility and interaction
                actionButton.style.display = 'flex';
                actionButton.style.visibility = 'visible';
                actionButton.style.opacity = '1';
                actionButton.style.pointerEvents = 'auto';
                actionButton.style.cursor = 'pointer';
            }

            // Special handling for Telegram Desktop
            const isTelegramWebApp = !!window.Telegram?.WebApp;
            if (isTelegramWebApp && isDesktop) {
                // Add Telegram Desktop specific attributes
                actionButton.setAttribute('data-telegram-desktop', 'true');
                actionButton.setAttribute('data-action-id', action.id);
                
                // Force button to be interactive
                actionButton.style.pointerEvents = 'auto';
                actionButton.style.cursor = 'pointer';
                actionButton.style.userSelect = 'none';
                
                // Add multiple event listeners for Telegram Desktop
                const telegramHandlers = [
                    (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Telegram Desktop action button:', action.id);
                        if (window.gameEngineRef) {
                            window.gameEngineRef.processAction(action.id);
                        }
                    },
                    (e) => {
                        console.log('Telegram Desktop mousedown:', action.id);
                        if (window.gameEngineRef) {
                            window.gameEngineRef.processAction(action.id);
                        }
                    }
                ];
                
                telegramHandlers.forEach(handler => {
                    actionButton.addEventListener('click', handler, { capture: true });
                    actionButton.addEventListener('mousedown', handler, { capture: true });
                    actionButton.addEventListener('mouseup', handler, { capture: true });
                    actionButton.addEventListener('pointerdown', handler, { capture: true });
                    actionButton.addEventListener('pointerup', handler, { capture: true });
                });
                
                // Also bind to parent for better event capture
                const parent = actionButton.parentElement;
                if (parent) {
                    parent.setAttribute('data-telegram-desktop-parent', 'true');
                    parent.style.pointerEvents = 'auto';
                }
                
                // Ultimate fallback - inline onclick
                actionButton.setAttribute('onclick', `if(window.gameEngineRef)window.gameEngineRef.processAction('${action.id}')`);
            }

            actionsList.appendChild(actionButton);
        });
        
        console.log('Actions list updated with', actions.length, 'actions');
    }

    updateInventory(inventory) {
        const inventoryContainer = this.elements.inventoryItems;
        if (!inventoryContainer) return;

        inventoryContainer.innerHTML = '';

        if (inventory.length === 0) {
            const emptyInventory = document.createElement('div');
            emptyInventory.className = 'empty-inventory';
            emptyInventory.textContent = 'Инвентарь пуст';
            inventoryContainer.appendChild(emptyInventory);
            return;
        }

        inventory.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            
            const itemName = document.createElement('span');
            itemName.className = 'item-name';
            itemName.textContent = item.name;
            
            const itemAmount = document.createElement('span');
            itemAmount.className = 'item-amount';
            itemAmount.textContent = `x${item.amount}`;
            
            const itemWeight = document.createElement('span');
            itemWeight.className = 'item-weight';
            itemWeight.textContent = `(${item.totalWeight}кг)`;

            itemElement.appendChild(itemName);
            itemElement.appendChild(itemAmount);
            itemElement.appendChild(itemWeight);
            
            itemElement.title = item.description;
            inventoryContainer.appendChild(itemElement);
        });
    }

    updateNavigation(connections) {
        const navigationContainer = this.elements.locationButtons;
        if (!navigationContainer) return;

        navigationContainer.innerHTML = '';

        if (connections.length === 0) {
            return;
        }

        const navTitle = document.createElement('h4');
        navTitle.textContent = 'Перейти в:';
        navigationContainer.appendChild(navTitle);

        connections.forEach(connection => {
            const locationButton = document.createElement('button');
            locationButton.className = 'location-button';
            locationButton.dataset.location = connection.id;
            locationButton.textContent = connection.name;
            
            // Special attributes for Telegram Desktop compatibility
            locationButton.setAttribute('role', 'button');
            locationButton.setAttribute('tabindex', '0');
            locationButton.setAttribute('aria-label', `Перейти в ${connection.name}`);
            
            if (connection.state && connection.state.condition) {
                const condition = document.createElement('span');
                condition.className = 'location-condition';
                condition.textContent = ` (${connection.state.condition})`;
                locationButton.appendChild(condition);
            }

            // Special handling for Telegram Desktop
            const isTelegramWebApp = !!window.Telegram?.WebApp;
            const isDesktop = !/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (isTelegramWebApp && isDesktop) {
                // Add Telegram Desktop specific attributes
                locationButton.setAttribute('data-telegram-desktop', 'true');
                locationButton.setAttribute('data-location-id', connection.id);
                
                // Force button to be interactive
                locationButton.style.pointerEvents = 'auto';
                locationButton.style.cursor = 'pointer';
                locationButton.style.userSelect = 'none';
                
                // Add multiple event listeners for Telegram Desktop
                const telegramHandlers = [
                    (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Telegram Desktop location button:', connection.id);
                        if (window.gameEngineRef) {
                            window.gameEngineRef.moveToLocation(connection.id);
                        }
                    },
                    (e) => {
                        console.log('Telegram Desktop location mousedown:', connection.id);
                        if (window.gameEngineRef) {
                            window.gameEngineRef.moveToLocation(connection.id);
                        }
                    }
                ];
                
                telegramHandlers.forEach(handler => {
                    locationButton.addEventListener('click', handler, { capture: true });
                    locationButton.addEventListener('mousedown', handler, { capture: true });
                    locationButton.addEventListener('mouseup', handler, { capture: true });
                    locationButton.addEventListener('pointerdown', handler, { capture: true });
                    locationButton.addEventListener('pointerup', handler, { capture: true });
                });
                
                // Also bind to parent for better event capture
                const parent = locationButton.parentElement;
                if (parent) {
                    parent.setAttribute('data-telegram-desktop-parent', 'true');
                    parent.style.pointerEvents = 'auto';
                }
                
                // Ultimate fallback - inline onclick
                locationButton.setAttribute('onclick', `if(window.gameEngineRef)window.gameEngineRef.moveToLocation('${connection.id}')`);
            }
            
            // Add basic event handlers for all platforms
            const handleLocationClick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Location button clicked:', connection.id);
                if (window.gameEngineRef) {
                    window.gameEngineRef.moveToLocation(connection.id);
                }
            };
            
            // Multiple event binding for maximum compatibility
            locationButton.onclick = handleLocationClick;
            locationButton.addEventListener('click', handleLocationClick, { capture: true });
            locationButton.addEventListener('mousedown', handleLocationClick, { capture: true });
            locationButton.addEventListener('mouseup', handleLocationClick, { capture: true });
            locationButton.addEventListener('pointerdown', handleLocationClick, { capture: true });
            locationButton.addEventListener('pointerup', handleLocationClick, { capture: true });
            locationButton.addEventListener('touchend', handleLocationClick, { passive: false });
            
            // Force button to be interactive
            locationButton.style.pointerEvents = 'auto';
            locationButton.style.cursor = 'pointer';
            locationButton.style.display = 'flex';
            locationButton.style.visibility = 'visible';
            locationButton.style.opacity = '1';

            navigationContainer.appendChild(locationButton);
        });
    }

    showMessage(text, type = 'info') {
        this.messageQueue.push({ text, type, timestamp: Date.now() });
        this.processMessageQueue();
    }

    setupMessageSystem() {
        if (!this.elements.messageDisplay) return;

        this.elements.messageDisplay.innerHTML = '';
        this.elements.messageDisplay.className = 'message-display';
    }

    processMessageQueue() {
        if (this.messageQueue.length === 0) return;

        const message = this.messageQueue.shift();
        this.displayMessage(message);

        if (this.messageTimeout) {
            clearTimeout(this.messageTimeout);
        }

        this.messageTimeout = setTimeout(() => {
            this.clearMessage();
            if (this.messageQueue.length > 0) {
                this.processMessageQueue();
            }
        }, 3000);
    }

    displayMessage(message) {
        const messageContainer = this.elements.messageDisplay;
        if (!messageContainer) return;

        messageContainer.innerHTML = '';
        messageContainer.className = `message-display message-${message.type}`;
        messageContainer.textContent = message.text;
        messageContainer.style.display = 'block';
    }

    clearMessage() {
        const messageContainer = this.elements.messageDisplay;
        if (messageContainer) {
            messageContainer.style.display = 'none';
            messageContainer.innerHTML = '';
        }
    }
}