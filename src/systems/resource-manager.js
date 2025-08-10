export class ResourceManager {
    constructor() {
        this.inventory = new Map();
        this.maxCapacity = 50;
        this.resourceData = {};
    }

    init(resourceData) {
        this.resourceData = resourceData;
    }

    addResource(resourceId, amount) {
        if (!this.resourceData[resourceId]) {
            console.error('Неизвестный ресурс:', resourceId);
            return false;
        }

        const currentAmount = this.inventory.get(resourceId) || 0;
        const resourceWeight = this.resourceData[resourceId].weight;
        const totalWeight = this.getTotalWeight() + (amount * resourceWeight);

        if (totalWeight > this.maxCapacity) {
            console.warn('Недостаточно места в инвентаре');
            return false;
        }

        this.inventory.set(resourceId, currentAmount + amount);
        return true;
    }

    removeResource(resourceId, amount) {
        const currentAmount = this.inventory.get(resourceId) || 0;
        
        if (currentAmount < amount) {
            console.warn(`Недостаточно ресурса: ${resourceId}`);
            return false;
        }

        const newAmount = currentAmount - amount;
        if (newAmount <= 0) {
            this.inventory.delete(resourceId);
        } else {
            this.inventory.set(resourceId, newAmount);
        }
        
        return true;
    }

    hasResource(resourceId, amount = 1) {
        return (this.inventory.get(resourceId) || 0) >= amount;
    }

    getResourceAmount(resourceId) {
        return this.inventory.get(resourceId) || 0;
    }

    getInventory() {
        const inventoryArray = [];
        
        for (const [resourceId, amount] of this.inventory) {
            const resourceInfo = this.resourceData[resourceId];
            inventoryArray.push({
                id: resourceId,
                name: resourceInfo.name,
                amount: amount,
                weight: resourceInfo.weight,
                totalWeight: amount * resourceInfo.weight,
                description: resourceInfo.description
            });
        }
        
        return inventoryArray.sort((a, b) => a.name.localeCompare(b.name));
    }

    getTotalWeight() {
        let totalWeight = 0;
        
        for (const [resourceId, amount] of this.inventory) {
            const resourceWeight = this.resourceData[resourceId]?.weight || 0;
            totalWeight += amount * resourceWeight;
        }
        
        return totalWeight;
    }

    getCapacityInfo() {
        const currentWeight = this.getTotalWeight();
        const freeSpace = this.maxCapacity - currentWeight;
        const usagePercent = Math.round((currentWeight / this.maxCapacity) * 100);
        
        return {
            currentWeight,
            maxCapacity: this.maxCapacity,
            freeSpace,
            usagePercent
        };
    }

    canAddResource(resourceId, amount) {
        const resourceWeight = this.resourceData[resourceId]?.weight || 0;
        const additionalWeight = amount * resourceWeight;
        const totalWeight = this.getTotalWeight() + additionalWeight;
        
        return totalWeight <= this.maxCapacity;
    }

    getState() {
        return {
            inventory: Object.fromEntries(this.inventory),
            maxCapacity: this.maxCapacity
        };
    }

    setState(state) {
        this.inventory.clear();
        if (state.inventory) {
            for (const [resourceId, amount] of Object.entries(state.inventory)) {
                this.inventory.set(resourceId, amount);
            }
        }
        if (state.maxCapacity) {
            this.maxCapacity = state.maxCapacity;
        }
    }

    reset() {
        this.inventory.clear();
        this.maxCapacity = 50;
    }
}