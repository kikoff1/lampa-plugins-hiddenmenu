(() => {
    "use strict";

    function logMenuActions() {
        const items = $('.menu__list .menu__item');

        if (!items.length) {
            console.warn('[Menu Logger] Пункти меню не знайдено.');
            return;
        }

        console.log('--- Пункти меню (data-action) ---');
        items.each(function () {
            const action = $(this).data('action');
            const text = $(this).text().trim();
            console.log(`data-action="${action}" | Назва: ${text}`);
        });
        console.log('--- Кінець списку ---');
    }

    function init() {
        if (window.plugin_menu_logger_ready) return;

        // Затримка для завантаження інтерфейсу
        setTimeout(logMenuActions, 2000);

        window.plugin_menu_logger_ready = true;
    }

    if (window.appready) {
        init();
    } else {
        Lampa.Listener.follow("app", (e) => {
            if (e.type === "ready") init();
        });
    }
})();
