(() => {
    "use strict";

    const MENU_COMPONENT = 'menu_manage';
    const ORDER_KEY = 'menu_order';
    const HIDE_PREFIX = 'hide_';
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

    function getDefaultOrder() {
        return menuItems.map(i => i.id);
    }

    function getOrder() {
        const saved = Lampa.Storage.get(ORDER_KEY, MENU_COMPONENT);
        if (Array.isArray(saved)) {
            // перевіряємо, чи всі id присутні або додаємо відсутні
            const all = getDefaultOrder();
            const filtered = saved.filter(id => all.includes(id));
            const missing = all.filter(id => !filtered.includes(id));
            return [...filtered, ...missing];
        }
        return getDefaultOrder();
    }

    function saveOrder(order) {
        Lampa.Storage.set(ORDER_KEY, order, MENU_COMPONENT);
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
            name: "Керування меню"
        });

        // параметри приховування
        menuItems.forEach(({ id, title }) => {
            Lampa.SettingsApi.addParam({
                component: MENU_COMPONENT,
                param: {
                    name: `${HIDE_PREFIX}${id}`,
                    type: "select",
                    values: { 0: "Показати", 1: "Приховати" },
                    default: 0
                },
                field: { name: `👁 ${title}` }
            });
        });

        // додати пункт «Управління порядком меню» як статичний тип
        // тут буде можливість вибрати пункт меню та перемістити його вверх/вниз/на початок/на кінець
        menuItems.forEach(({ id, title }) => {
            Lampa.SettingsApi.addParam({
                component: MENU_COMPONENT,
                param: {
                    name: `order_control_${id}`,
                    type: "static",
                    // значення типу static тільки для відображення/натискання
                },
                field: {
                    name: `🔀 ${title}`,
                    description: () => {  // показує поточну позицію чи інструкцію
                        const order = getOrder();
                        const pos = order.indexOf(id);
                        return pos >= 0 ? `Позиція: ${pos + 1}` : '';
                    }
                },
                onRender: (el) => {
                    // додаємо обробник кліку: показує меню дій переміщення
                    el.on('click', () => {
                        showMoveActions(id);
                    });
                }
            });
        });

        // додати кнопочку "Сбросить порядок по умолчанию"
        Lampa.SettingsApi.addParam({
            component: MENU_COMPONENT,
            param: {
                name: 'reset_order',
                type: "static"
            },
            field: { name: 'Сбросити порядок за замовчуванням' },
            onRender: (el) => {
                el.on('click', () => {
                    resetOrder();
                });
            }
        });
    }

    function showMoveActions(itemId) {
        const actions = [
            { title: 'В начало', action: 'top' },
            { title: 'Перемістити вверх', action: 'up' },
            { title: 'Перемістити вниз', action: 'down' },
            { title: 'В кінець', action: 'bottom' }
        ];
        Lampa.Controller.show({
            title: `Дія для "${menuItems.find(i => i.id === itemId).title}"`,
            items: actions,
            onSelect: (actionItem) => {
                moveItem(itemId, actionItem.action);
                setTimeout(() => {
                    applyOrderAndVisibility();
                    // оновити опис полів (щоб нова позиція відобразилась)
                    Lampa.Listener.fire('settings', { type: 'change' });
                }, 100);
            }
        });
    }

    function moveItem(itemId, direction) {
        const order = getOrder();
        const idx = order.indexOf(itemId);
        if (idx === -1) return;
        switch(direction) {
            case 'top':
                order.splice(idx, 1);
                order.unshift(itemId);
                break;
            case 'bottom':
                order.splice(idx, 1);
                order.push(itemId);
                break;
            case 'up':
                if (idx > 0) {
                    [order[idx - 1], order[idx]] = [order[idx], order[idx - 1]];
                }
                break;
            case 'down':
                if (idx < order.length - 1) {
                    [order[idx + 1], order[idx]] = [order[idx], order[idx + 1]];
                }
                break;
        }
        saveOrder(order);
    }

    function resetOrder() {
        saveOrder(getDefaultOrder());
        applyOrderAndVisibility();
        // оновити відображення описів
        Lampa.Noty.show('Порядок меню скинуто до стандартного', 2000);
        Lampa.Listener.fire('settings', { type: 'change' });
    }

    function applyOrderAndVisibility() {
        const order = getOrder();
        const container = $('.menu__list');
        if (!container.length) return;
        // робимо detach усіх пунктів
        order.forEach(id => {
            const itemData = menuItems.find(i => i.id === id);
            const shouldHide = +Lampa.Storage.get(`${HIDE_PREFIX}${id}`, MENU_COMPONENT) === 1;

            let $item;
            if (id === 'sport') {
                $item = container.find('.menu__item').filter((i, el) => $(el).text().trim() === itemData.title);
            } else {
                $item = container.find(`.menu__item[data-action="${id}"]`);
            }

            if ($item.length) {
                $item.detach();
                // тільки якщо не приховано, додаємо назад у потрібному порядку
                if (!shouldHide) {
                    container.append($item);
                }
            }
        });
    }

    function init() {
        if (window.plugin_menu_manage_ready) return;

        addSettingsComponent();

        Lampa.Listener.follow('settings', (e) => {
            if (['open', 'change'].includes(e.type)) {
                setTimeout(applyOrderAndVisibility, 100);
            }
        });

        setTimeout(() => {
            applyOrderAndVisibility();
        }, 1500);

        window.plugin_menu_manage_ready = true;
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow("app", (e) => {
            if (e.type === "ready") init();
        });
    }
})();
