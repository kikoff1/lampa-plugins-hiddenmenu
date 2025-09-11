(() => {
    const menuSelector = ".menu .menu__list .menu__item";  // селектор пунктів меню
    const controlItems = [
        'Стрічка',
        'Фільми',
        'Серіали',
        'Мультфільми',
        'Особи',
        'Каталог',
        'Фільтр',
        'Релізи',
        'Вибране',
        'Історія',
        'Підписки',
        'Розклад',
        'Торренти',
        'Спорт'
    ];

    function initPlugin() {
        if(window.plugin_hide_menu_ready) return;
        window.plugin_hide_menu_ready = true;

        Lampa.SettingsApi.addComponent({
            component: "hide_menu",
            icon: `<svg height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4C7 4 2 7 2 12C2 17 7 20 12 20C17 20 22 17 22 12C22 7 17 4 12 4ZM12 18C8.14 18 5 14.86 5 11C5 7.14 8.14 4 12 4C15.86 4 19 7.14 19 11C19 14.86 15.86 18 12 18Z" fill="white"/>
                    <circle cx="12" cy="11" r="3" fill="white"/>
                  </svg>`,
            name: "Приховати пункти меню"
        });

        controlItems.forEach(title => {
            Lampa.SettingsApi.addParam({
                component: "hide_menu",
                param: {
                    name: `hide_menu_${title.toLowerCase().replace(/\s+/g, "_")}`,
                    type: "select",
                    values: {1: "Показати", 0: "Приховати"},
                    default: 1
                },
                field: {name: title}
            });
        });

        Lampa.Listener.follow('settings', e => {
            if(e.type === "change" && e.component === "hide_menu") {
                updateMenuVisibility();
            }
        });

        updateMenuVisibility();
    }

    function updateMenuVisibility() {
        const menuItems = document.querySelectorAll(menuSelector);

        menuItems.forEach(item => {
            const textElem = item.querySelector('.menu__text');
            if(!textElem) return;
            const text = textElem.textContent.trim();

            if(controlItems.includes(text)) {
                const paramName = `hide_menu_${text.toLowerCase().replace(/\s+/g, "_")}`;
                const value = Lampa.Storage.get(paramName, "hide_menu");

                // Показуємо пункт, якщо параметр відсутній або встановлений у "1"
                // Приховуємо лише якщо явно обрано "0"
                const show = value !== "0";

                item.style.display = show ? "" : "none";
            }
        });
    }

    if(window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow("app", e => {
            if(e.type === "ready") initPlugin();
        });
    }
})();
