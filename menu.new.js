(() => {
    "use strict";

    const MENU_COMPONENT = 'hide_standard_menu';
    const ORDER_KEY = 'menu_order';

    const menuItems = [
        { id: 'feed', title: 'Стрічка' },
        { id: 'movie', title: 'Фільми' },
        { id: 'tv', title: 'Серіали' },
        { id: 'anime', title: 'Аніме' },
        { id: 'myperson', title: 'Особи' },
        { id: 'catalog', title: 'Каталог' },
        { id: 'filter', title: 'Фільтр' },
        { id: 'relise', title: 'Релізи' },
        { id: 'favorite', title: 'Вибране' },
        { id: 'history', title: 'Історія' },
        { id: 'subscribes', title: 'Підписки' },
        { id: 'timetable', title: 'Розклад' },
        { id: 'mytorrents', title: 'Торренти' },
        { id: 'sport', title: 'Спорт' },
        { id: 'about', title: 'Інформація' },
        { id: 'console', title: 'Консоль' }
    ];

    function getOrder() {
        const saved = Lampa.Storage.get(ORDER_KEY, MENU_COMPONENT);
        if (Array.isArray(saved)) {
            // Перевірка на повноту списку
            const allIds = menuItems.map(i => i.id);
            const filtered = saved.filter(id => allIds.includes(id));
            const missing = allIds.filter(id => !filtered.includes(id));
            return [...filtered, ...missing];
        }
        return menuItems.map(i => i.id);
    }

    function saveOrder(newOrder) {
        Lampa.Storage.set(ORDER_KEY, newOrder, MENU_COMPONENT);
    }

    function addSettingsComponent() {
        Lampa.SettingsApi.addComponent({
            component: MENU_COMPONENT,
            icon: `
                <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" fill="white">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M3 18h6v-2H3v2zm0-5h12v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
            `,
            name: "Меню: приховати та впорядкувати"
        });

        // Додаємо параметри приховування
        menuItems.forEach(({ id, title }) => {
            Lampa.SettingsApi.addParam({
                component: MENU_COMPONENT,
                param: {
                    name: `hide_${id}`,
                    type: "select",
                    values: { 0: "Показати", 1: "Приховати" },
                    default: 0
                },
                field: { name: `👁 ${title}` }
            });
        });

        // Додаємо параметри сортування
        const currentOrder = getOrder();
        menuItems.forEach(({ id, title }) => {
            const positions = {};
            menuItems.forEach((_, index) => {
                positions[index] = `${index + 1}`;
            });

            const currentIndex = currentOrder.indexOf(id);

            Lampa.SettingsApi.addParam({
                component: MENU_COMPONENT,
                param: {
                    name: `order_${id}`,
                    type: "select",
                    values: positions,
                    default: currentIndex
                },
                field: { name: `🔀 Позиція: ${title}` }
            });
        });
    }

    function applySortingAndVisibility() {
        const container = $('.menu__list');
        if (!container.length) return;

        let ordered = getOrder();
        let updatedOrder = [...ordered];

        menuItems.forEach(({ id }) => {
            const pos = parseInt(Lampa.Storage.get(`order_${id}`, MENU_COMPONENT));
            if (!isNaN(pos) && pos >= 0 && pos < menuItems.length) {
                updatedOrder[pos] = id;
            }
        });

        // Усунення дублів і пустих
        updatedOrder = updatedOrder.filter((v, i, a) => v && a.indexOf(v) === i);
        const missing = menuItems.map(i => i.id).filter(id => !updatedOrder.includes(id));
        updatedOrder = [...updatedOrder, ...missing];

        saveOrder(updatedOrder);

        // Переміщення і видимість
        updatedOrder.forEach(id => {
            const itemData = menuItems.find(i => i.id === id);
            const shouldHide = +Lampa.Storage.get(`hide_${id}`, MENU_COMPONENT) === 1;

            let item;
            if (id === 'sport') {
                item = $('.menu__list .menu__item').filter((_, el) => $(el).text().trim() === itemData.title);
            } else {
                item = $(`.menu__list .menu__item[data-action="${id}"]`);
            }

            if (item.length) {
                item.detach(); // Виймаємо
                if (!shouldHide) {
                    container.append(item); // Додаємо в кінець
                }
            }
        });
    }

    function init() {
        if (window.plugin_hide_standard_ready) return;

        addSettingsComponent();

        Lampa.Listener.follow('settings', (e) => {
            if (['open', 'change'].includes(e.type)) {
                setTimeout(applySortingAndVisibility, 100);
            }
        });

        setTimeout(applySortingAndVisibility, 1500); // Початкове застосування

        window.plugin_hide_standard_ready = true;
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow("app", (e) => {
            if (e.type === "ready") init();
        });
    }
})();
