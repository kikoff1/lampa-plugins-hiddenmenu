/**
 * Плагін: Редактор меню Lampa
 */

(function(){

    // --- Функції редагування меню ---
    function editLeftMenu() {
        Lampa.Modal.open({
            title: 'Редагування лівого меню',
            html: '<p>Тут можна додати свій інтерфейс для редагування лівого меню.</p>'
        });
    }

    function editTopMenu() {
        Lampa.Modal.open({
            title: 'Редагування верхнього меню',
            html: '<p>Тут можна додати свій інтерфейс для редагування верхнього меню.</p>'
        });
    }

    function editSettingsMenu() {
        Lampa.Modal.open({
            title: 'Редагування меню налаштувань',
            html: '<p>Тут можна додати свій інтерфейс для редагування меню налаштувань.</p>'
        });
    }

    // --- Функція додавання налаштувань ---
    function addSettings() {
        // Додаємо компонент меню редактора
        Lampa.SettingsApi.addComponent({
            component: 'menu_editor',
            icon: `<svg width="30" height="29" viewBox="0 0 30 29" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18.2989 5.27973L2.60834 20.9715C2.52933 21.0507 2.47302 21.1496 2.44528 21.258L0.706081 28.2386C0.680502 28.3422 0.682069 28.4507 0.710632 28.5535C0.739195 28.6563 0.793788 28.75 0.869138 28.8255C0.984875 28.9409 1.14158 29.0057 1.30498 29.0059C1.35539 29.0058 1.4056 28.9996 1.45449 28.9873L8.43509 27.2479C8.54364 27.2206 8.64271 27.1643 8.72172 27.0851L24.4137 11.3944L18.2989 5.27973ZM28.3009 3.14018L26.5543 1.39363C25.3869 0.226285 23.3524 0.227443 22.1863 1.39363L20.0469 3.53318L26.1614 9.64766L28.3009 7.50816C28.884 6.9253 29.2052 6.14945 29.2052 5.32432C29.2052 4.49919 28.884 3.72333 28.3009 3.14018Z" fill="currentColor"/>
                  </svg>`,
            name: Lampa.Lang.translate('menu_editor_title')
        });

        // --- Додаємо кнопки для редагування ---
        Lampa.SettingsApi.addParam({
            component: 'menu_editor',
            param: { name: 'edit_left_menu', type: 'button' },
            field: { name: Lampa.Lang.translate('menu_editor_left') },
            onChange: editLeftMenu
        });

        Lampa.SettingsApi.addParam({
            component: 'menu_editor',
            param: { name: 'edit_top_menu', type: 'button' },
            field: { name: Lampa.Lang.translate('menu_editor_top') },
            onChange: editTopMenu
        });

        Lampa.SettingsApi.addParam({
            component: 'menu_editor',
            param: { name: 'edit_settings_menu', type: 'button' },
            field: { name: Lampa.Lang.translate('menu_editor_settings') },
            onChange: editSettingsMenu
        });

        // --- Додаємо опцію приховування панелі навігації ---
        Lampa.SettingsApi.addParam({
            component: 'menu_editor',
            param: { name: 'hide_navigation_bar', type: 'trigger', default: false },
            field: { 
                name: Lampa.Lang.translate('menu_editor_hide_nav'), 
                description: 'Приховує нижню панель навігації' 
            },
            onChange: function(value) {
                if (value === true) {
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));
                } else {
                    $('#hide_nav_bar').remove();
                }
            }
        });

        // --- Застосовуємо приховування панелі при запуску ---
        if (Lampa.Storage.field('hide_navigation_bar') === true) {
            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');
            $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));
        }
    }

    // --- Ініціалізація плагіна ---
    addSettings();

})();
