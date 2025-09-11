(() => {
    const menuSelector = ".menu .menu__list .menu__item";
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
        if (window.plugin_hide_menu_ready) return;
        window.plugin_hide_menu_ready = true;

        if (!window.Lampa || !Lampa.SettingsApi || !Lampa.Listener || !Lampa.Storage) {
            console.warn("Lampa API не знайдено");
            return;
        }

        // Додаємо компонент налаштувань
        Lampa.SettingsApi.addComponent({
            component: "hide_menu",
            name: "Приховати пункти меню",
            icon: `<svg height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4C7 4 2 7 2 12C2 17 7 20 12 20C17 20 22 17 22 12C22 7 17 4 12 4ZM12 18C8.14 18 5 14.86 5 11C5 7.14 8.14 4 12 4C15.86 4 19 7.14 19 11C19 14.86 15.86 18 12 18Z" fill="white"/>
                <circle cx="12" cy="11" r="3" fill="white"/>
            </svg>`
        });

        // Додаємо параметри для кожного пункту
        controlItems.forEach(title => {
            const paramName = `hide_menu_${title.toLowerCase().replace(/\s+/g, "_")}`;

            Lampa.SettingsApi.addParam({
                component: "hide_menu",
                param: {
                    name: paramName,
                    type: "select",
                    values: { "1": "Показати", "0": "Приховати" },
                    default: "1" // дефолт — Показати
                },
                field: { name: title }
            });
        });

        // Оновлюємо меню при зміні налаштувань
        Lampa.Listener.follow('settings', e => {
            if (e.type === "change" && e.component === "hide_menu") {
                updateMenuVisibility();
            }
        });

        updateMenuVisibility();
    }

    function updateMenuVisibility() {
        const menuItems = document.querySelectorAll(menuSelector);

        menuItems.forEach(item => {
            const textElem = item.querySelector('.menu__text');
            if (!textElem) return;

            const text = textElem.textContent.trim();
            if (!controlItems.includes(text)) return;

            const paramName = `hide_menu_${text.toLowerCase().replace(/\s+/g, "_")}`;
            const storedValue = Lampa.Storage.get(paramName, "hide_menu");

            // Якщо значення не задане — вважаємо, що треба Показати (тобто НЕ ховати)
            const show = storedValue === "0" ? false : true;

            item.style.display = show ? "" : "none";
        });
    }

    // Чекаємо на готовність застосунку
    if (window.appready) {
        initPlugin();
    } else {
        Lampa.Listener.follow("app", e => {
            if (e.type === "ready") initPlugin();
        });
    }
})();
