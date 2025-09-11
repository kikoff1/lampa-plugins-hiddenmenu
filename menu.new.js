!function() {
    "use strict";

    const standardMenuItems = [
        { id: 'main', title: 'Головна' },
        { id: 'movie', title: 'Фільми' },
        { id: 'tv', title: 'Серіали' },
        { id: 'tv_channels', title: 'ТВ' },
        { id: 'book', title: 'Закладки' },
        { id: 'search', title: 'Пошук' },
        { id: 'about', title: 'Про програму' },
           ];

    function initPlugin() {
        if (window.plugin_hide_standard_ready) return;

        // Додаємо компонент в налаштування
        Lampa.SettingsApi.addComponent({
            component: "hide_standard_menu",
            icon: `<svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" fill="white"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 18h6v-2H3v2zm0-5h12v-2H3v2zm0-7v2h18V6H3z"/></svg>`,
            name: "Приховати меню"
        });

        // Додаємо параметри для кожного стандартного пункту меню
        standardMenuItems.forEach(item => {
            Lampa.SettingsApi.addParam({
                component: "hide_standard_menu",
                param: {
                    name: `hide_${item.id}`,
                    type: "select",
                    values: { 0: "Показати", 1: "Приховати" },
                    default: 0
                },
                field: { name: item.title }
            });
        });

        // Слідкуємо за змінами в налаштуваннях
        Lampa.Listener.follow('settings', e => {
            if (e.type === 'open' || e.type === 'change') {
                setTimeout(hideMenuItems, 100); // затримка, щоб DOM встиг оновитися
            }
        });

        // Початкове приховування при запуску
        setTimeout(hideMenuItems, 1500);

        window.plugin_hide_standard_ready = true;
    }

    function hideMenuItems() {
        standardMenuItems.forEach(item => {
            const shouldHide = parseInt(Lampa.Storage.get(`hide_${item.id}`, 'hide_standard_menu')) === 1;

            const menuItem = $(`.menu__list .menu__item[data-action="${item.id}"]`);

            if (menuItem.length) {
                if (shouldHide) menuItem.hide();
                else menuItem.show();
            }
        });
    }

    // Ініціалізація після готовності додатку
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow("app", e => {
            if (e.type === "ready") initPlugin();
        });
    }
}();
