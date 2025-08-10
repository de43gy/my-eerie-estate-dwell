export class LocationManager {
    constructor() {
        this.currentLocation = 'main_room';
        this.locationData = {};
        this.discoveredLocations = new Set(['main_room']);
        this.locationStates = new Map();
    }

    init(locationData) {
        this.locationData = locationData;
        
        for (const locationId of Object.keys(locationData)) {
            this.locationStates.set(locationId, {
                condition: 'poor',
                discovered: locationId === 'main_room',
                lastVisited: locationId === 'main_room' ? Date.now() : null
            });
        }
    }

    setCurrentLocation(locationId) {
        if (!this.locationData[locationId]) {
            console.error('Неизвестная локация:', locationId);
            return false;
        }

        this.currentLocation = locationId;
        this.discoverLocation(locationId);
        
        const locationState = this.locationStates.get(locationId);
        locationState.lastVisited = Date.now();
        
        return true;
    }

    getCurrentLocation() {
        return {
            id: this.currentLocation,
            ...this.locationData[this.currentLocation],
            state: this.locationStates.get(this.currentLocation)
        };
    }

    canMoveTo(locationId) {
        if (!this.locationData[locationId]) {
            return false;
        }

        const currentLocationData = this.locationData[this.currentLocation];
        return currentLocationData.connections && 
               currentLocationData.connections.includes(locationId);
    }

    discoverLocation(locationId) {
        const locationState = this.locationStates.get(locationId);
        if (locationState && !locationState.discovered) {
            locationState.discovered = true;
            this.discoveredLocations.add(locationId);
            return true;
        }
        return false;
    }

    getAvailableConnections() {
        const currentLocationData = this.locationData[this.currentLocation];
        if (!currentLocationData.connections) {
            return [];
        }

        return currentLocationData.connections
            .filter(locationId => this.discoveredLocations.has(locationId))
            .map(locationId => ({
                id: locationId,
                name: this.locationData[locationId].name,
                state: this.locationStates.get(locationId)
            }));
    }

    getAvailableActions() {
        const currentLocationData = this.locationData[this.currentLocation];
        return currentLocationData.actions || [];
    }

    getState() {
        return {
            currentLocation: this.currentLocation,
            discoveredLocations: Array.from(this.discoveredLocations),
            locationStates: Object.fromEntries(this.locationStates)
        };
    }

    setState(state) {
        if (state.currentLocation) {
            this.currentLocation = state.currentLocation;
        }
        
        if (state.discoveredLocations) {
            this.discoveredLocations = new Set(state.discoveredLocations);
        }
        
        if (state.locationStates) {
            this.locationStates.clear();
            for (const [locationId, locationState] of Object.entries(state.locationStates)) {
                this.locationStates.set(locationId, locationState);
            }
        }
    }

    reset() {
        this.currentLocation = 'main_room';
        this.discoveredLocations = new Set(['main_room']);
        this.locationStates.clear();
        
        if (this.locationData) {
            for (const locationId of Object.keys(this.locationData)) {
                this.locationStates.set(locationId, {
                    condition: 'poor',
                    discovered: locationId === 'main_room',
                    lastVisited: locationId === 'main_room' ? Date.now() : null
                });
            }
        }
    }
}