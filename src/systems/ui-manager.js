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
        this.setupEventDelegation();
    }

    setupEventDelegation() {
        document.addEventListener('click', (event) => {
            const actionButton = event.target.closest('.action-button');
            if (actionButton) {
                const actionId = actionButton.dataset.action;
                if (actionId && window.gameEngine) {
                    window.gameEngine.processAction(actionId);
                    this.triggerHapticFeedback();
                }
                return;
            }

            const locationButton = event.target.closest('.location-button');
            if (locationButton) {
                const locationId = locationButton.dataset.location;
                if (locationId && window.gameEngine) {
                    window.gameEngine.moveToLocation(locationId);
                    this.triggerHapticFeedback();
                }
            }
        });
    }

    triggerHapticFeedback() {
        if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
            try {
                window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
            } catch (e) {}
        }
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
            actionButton.type = 'button';
            
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

            actionsList.appendChild(actionButton);
        });
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
            locationButton.type = 'button';
            
            if (connection.state && connection.state.condition) {
                const condition = document.createElement('span');
                condition.className = 'location-condition';
                condition.textContent = ` (${connection.state.condition})`;
                locationButton.appendChild(condition);
            }

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