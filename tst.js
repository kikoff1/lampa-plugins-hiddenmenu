(() => {
    "use strict";

    const MENU_COMPONENT = 'hide_standard_menu';
    const menuItems = [
        { id: 'feed', title: 'Стрічка' },
        { id: 'movie', title: 'Фільми' },
        { id: 'tv', title: 'Серіали' },
        { id: 'cartoon', title: 'Мультфільми' },
        { id: 'person', title: 'Особи' },
        { id: 'catalog', title: 'Каталог' },
        { id: 'filter', title: 'Фільтр' },
        { id: 'release', title: 'Релізи' },
        { id: 'favorites', title: 'Вибране' },
        { id: 'history', title: 'Історія' },
        { id: 'subscribe', title: 'Підписки' },
        { id: 'schedule', title: 'Розклад' },
        { id: 'torrents', title: 'Торренти' },
        { id: 'sport', title: 'Спорт' }
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
