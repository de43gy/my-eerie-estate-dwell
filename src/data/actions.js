export const ACTIONS = {
    collect_wood: {
        id: "collect_wood",
        name: "Собрать дрова",
        description: "Найти и собрать упавшие ветки и куски дерева",
        timeCost: 2,
        energyCost: 10,
        location: ["front_yard", "forest_edge"],
        timeOfDay: "day",
        results: {
            wood: { min: 1, max: 3 }
        },
        successRate: 0.8
    },

    collect_stone: {
        id: "collect_stone",
        name: "Собрать камни",
        description: "Найти и собрать камни подходящего размера",
        timeCost: 3,
        energyCost: 15,
        location: ["front_yard"],
        timeOfDay: "day",
        results: {
            stone: { min: 1, max: 2 }
        },
        successRate: 0.9
    },

    collect_water: {
        id: "collect_water",
        name: "Набрать воды",
        description: "Набрать чистой воды из колодца",
        timeCost: 1,
        energyCost: 5,
        location: ["back_yard"],
        results: {
            water: { min: 2, max: 4 }
        },
        successRate: 1.0
    },

    eat_food: {
        id: "eat_food",
        name: "Поесть",
        description: "Съесть немного еды, чтобы утолить голод",
        timeCost: 1,
        energyCost: 0,
        requirements: {
            food: 1
        },
        results: {
            hunger: 30,
            consumedResources: { food: 1 }
        },
        anyLocation: true
    },

    drink_water: {
        id: "drink_water",
        name: "Попить воды",
        description: "Выпить воды, чтобы утолить жажду",
        timeCost: 0.5,
        energyCost: 0,
        requirements: {
            water: 1
        },
        results: {
            thirst: 40,
            consumedResources: { water: 1 }
        },
        anyLocation: true
    },

    eat_berries: {
        id: "eat_berries",
        name: "Съесть ягоды",
        description: "Съесть свежие лесные ягоды",
        timeCost: 0.5,
        energyCost: 0,
        requirements: {
            berries: 1
        },
        results: {
            hunger: 15,
            thirst: 5,
            consumedResources: { berries: 1 }
        },
        anyLocation: true
    },

    sleep: {
        id: "sleep",
        name: "Спать",
        description: "Выспаться, чтобы восстановить энергию",
        timeCost: 8,
        energyCost: 0,
        location: ["main_room", "kitchen"],
        timeOfDay: "night",
        results: {
            energy: 100
        },
        successRate: 1.0
    },

    rest: {
        id: "rest",
        name: "Отдохнуть",
        description: "Немного отдохнуть, чтобы восстановить силы",
        timeCost: 2,
        energyCost: 0,
        results: {
            energy: 20
        },
        anyLocation: true
    },

    explore_yard: {
        id: "explore_yard",
        name: "Исследовать двор",
        description: "Тщательно исследовать передний двор",
        timeCost: 3,
        energyCost: 15,
        location: ["front_yard"],
        timeOfDay: "day",
        results: {
            wood: { min: 0, max: 2 },
            stone: { min: 0, max: 1 },
            cloth: { min: 0, max: 1 }
        },
        successRate: 0.6
    },

    gather_berries: {
        id: "gather_berries",
        name: "Собрать ягоды",
        description: "Собрать лесные ягоды на опушке",
        timeCost: 2,
        energyCost: 10,
        location: ["forest_edge"],
        timeOfDay: "day",
        results: {
            berries: { min: 2, max: 5 }
        },
        successRate: 0.7
    },

    examine_room: {
        id: "examine_room",
        name: "Осмотреть комнату",
        description: "Внимательно осмотреть главную комнату",
        timeCost: 1,
        energyCost: 5,
        location: ["main_room"],
        results: {
            cloth: { min: 0, max: 1 },
            metal_scrap: { min: 0, max: 1 }
        },
        successRate: 0.3,
        oneTime: true
    },

    examine_kitchen: {
        id: "examine_kitchen",
        name: "Осмотреть кухню",
        description: "Поискать полезные вещи на кухне",
        timeCost: 2,
        energyCost: 8,
        location: ["kitchen"],
        results: {
            water: { min: 0, max: 2 },
            food: { min: 0, max: 1 }
        },
        successRate: 0.5,
        oneTime: true
    },

    examine_well: {
        id: "examine_well",
        name: "Осмотреть колодец",
        description: "Внимательно изучить старый колодец",
        timeCost: 1,
        energyCost: 5,
        location: ["back_yard"],
        results: {
            old_key: { min: 0, max: 1 }
        },
        successRate: 0.2,
        oneTime: true
    },

    explore_forest: {
        id: "explore_forest",
        name: "Исследовать лес",
        description: "Углубиться в лес для поиска ресурсов",
        timeCost: 4,
        energyCost: 25,
        location: ["forest_edge"],
        timeOfDay: "day",
        results: {
            wood: { min: 2, max: 4 },
            berries: { min: 1, max: 3 }
        },
        successRate: 0.6,
        dangerChance: 0.2
    }
};