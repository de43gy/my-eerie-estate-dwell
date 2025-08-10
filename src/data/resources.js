export const RESOURCES = {
    wood: {
        id: "wood",
        name: "Дрова",
        weight: 1,
        stackable: true,
        description: "Сухие ветки и куски дерева, пригодные для костра или простых поделок",
        type: "material",
        rarity: "common"
    },

    stone: {
        id: "stone",
        name: "Камень",
        weight: 2,
        stackable: true,
        description: "Твёрдые камни различных размеров, полезные для строительства и ремонта",
        type: "material",
        rarity: "common"
    },

    food: {
        id: "food",
        name: "Еда",
        weight: 0.5,
        stackable: true,
        description: "Простая еда - консервы, сухари и другие продукты длительного хранения",
        type: "consumable",
        rarity: "common",
        hungerRestore: 30,
        spoilTime: 72
    },

    water: {
        id: "water",
        name: "Вода",
        weight: 1,
        stackable: true,
        description: "Чистая питьевая вода из колодца",
        type: "consumable",
        rarity: "common",
        thirstRestore: 40
    },

    berries: {
        id: "berries",
        name: "Ягоды",
        weight: 0.2,
        stackable: true,
        description: "Свежие лесные ягоды - не очень сытные, но вкусные",
        type: "consumable",
        rarity: "uncommon",
        hungerRestore: 15,
        thirstRestore: 5,
        spoilTime: 24
    },

    cloth: {
        id: "cloth",
        name: "Ткань",
        weight: 0.3,
        stackable: true,
        description: "Куски ткани от старой одежды и занавесок",
        type: "material",
        rarity: "uncommon"
    },

    metal_scrap: {
        id: "metal_scrap",
        name: "Металлолом",
        weight: 3,
        stackable: true,
        description: "Куски старого металла, гвозди и проволока",
        type: "material",
        rarity: "uncommon"
    },

    old_key: {
        id: "old_key",
        name: "Старый ключ",
        weight: 0.1,
        stackable: false,
        description: "Ржавый ключ от неизвестного замка",
        type: "key",
        rarity: "rare"
    }
};