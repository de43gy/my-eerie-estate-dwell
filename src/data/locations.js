export const LOCATIONS = {
    main_room: {
        id: "main_room",
        name: "Главная комната",
        description: "Просторная, но запущенная комната в центре старого дома. Пыль покрывает всё вокруг, а сквозь разбитые окна пробиваются лучи света. В углу стоит старый камин, который давно не топился.",
        actions: ["rest", "sleep", "examine_room", "test_action"],
        connections: ["front_yard", "kitchen"],
        type: "indoor",
        safety: "safe"
    },

    front_yard: {
        id: "front_yard",
        name: "Передний двор",
        description: "Заросший сорняками двор перед домом. Когда-то здесь был красивый сад, но теперь природа взяла своё. Среди травы виднеются упавшие ветки и камни, которые можно собрать.",
        actions: ["collect_wood", "collect_stone", "explore_yard"],
        connections: ["main_room", "back_yard", "forest_edge"],
        type: "outdoor",
        safety: "moderate"
    },

    back_yard: {
        id: "back_yard",
        name: "Задний двор",
        description: "Тихое место за домом, защищённое от посторонних глаз. Здесь есть старый колодец, из которого ещё можно достать воду. Идеальное место для будущего огорода.",
        actions: ["collect_water", "examine_well"],
        connections: ["front_yard", "main_room"],
        type: "outdoor",
        safety: "safe"
    },

    kitchen: {
        id: "kitchen",
        name: "Кухня",
        description: "Старая кухня с треснувшими стенами и сломанной плитой. На полках осталась старая посуда, покрытая пылью. Окно выходит в задний двор.",
        actions: ["examine_kitchen", "rest"],
        connections: ["main_room", "back_yard"],
        type: "indoor",
        safety: "safe"
    },

    forest_edge: {
        id: "forest_edge",
        name: "Опушка леса",
        description: "Граница между двором и густым лесом. Здесь можно найти больше дерева и других полезных ресурсов, но нужно быть осторожным - в лесу могут обитать дикие животные.",
        actions: ["collect_wood", "gather_berries", "explore_forest"],
        connections: ["front_yard"],
        type: "outdoor",
        safety: "dangerous",
        timeOfDayRestriction: "day"
    }
};