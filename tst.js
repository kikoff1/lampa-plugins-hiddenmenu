(() => {
    "use strict";

    const MENU_COMPONENT = 'hide_standard_menu';
    const menuItems = [
        {  title: 'Головна' },
        {  title: 'Фільми' },
        {  title: 'Серіали' },
        {  title: 'ТВ' },
        {  title: 'Закладки' },
        {  title: 'Пошук' },
        {  title: 'Про програму' },
        {  title: 'Налаштування' }
    ];

    function addSettingsComponent() {
        Lampa.SettingsApi.addComponent({
            component: MENU_COMPONENT,
            icon: `
                <svg xmlns="http://www.w3.org/2000/svg" height="36" viewBox="0 0 24 24" fill="white">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M3 18h6v-2H3v2zm0-5h12v-2H3v2zm0-7v2h18V6H3z"/>
                </svg>
            `,
            name: "Приховати меню"
        });

        menuItems.forEach(({ id, title }) => {
            Lampa.SettingsApi.addParam({
                component: MENU_COMPONENT,
                param: {
                    name: `hide_${id}`,
                    type: "select",
                    values: { 0: "Показати", 1: "Приховати" },
                    default: 0
                },
                field: { name: title }
            });
        });
    }

    function toggleMenuVisibility() {
        menuItems.forEach(({ id }) => {
            const shouldHide = +Lampa.Storage.get(`hide_${id}`, MENU_COMPONENT) === 1;
            const item = $(`.menu__list .menu__item[data-action="${id}"]`);
            if (item.length) item.toggle(!shouldHide);
        });
    }

    function observeMenuList() {
        const observer = new MutationObserver(() => {
            const menuReady = document.querySelector('.menu__list');
            if (menuReady) {
                toggleMenuVisibility();
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    function init() {
        if (window.plugin_hide_standard_ready) return;

        addSettingsComponent();
        observeMenuList();

        Lampa.Listener.follow('settings', (e) => {
            if (['open', 'change'].includes(e.type)) {
                toggleMenuVisibility();
            }
        });

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
