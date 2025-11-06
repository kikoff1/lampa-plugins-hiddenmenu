(function(){
    'use strict';
    Lampa.Platform.tv();

    // v1.1 === Створюємо компонент налаштувань ===
    Lampa.SettingsApi.addComponent({
        component: 'UI_Tweaks',
        name: 'UI Tweaks',
        icon: 'bars', // ✅ Змінено з "magic" на підтримувану іконку
        onRender: function(){}
    });

    // === Додаємо параметр "Сховати нижню панель навігації" ===
    Lampa.SettingsApi.addParam({
        component: 'UI_Tweaks',
        param: {
            name: 'HideBottomNav',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Сховати нижню панель навігації',
            description: 'Ховає нижній бар (навігаційні кнопки: головна, каталог, закладки тощо)'
        },
        onChange: function(value) {
            toggleBottomNav(value);
        }
    });

    // === Функція для вмикання / вимикання нижньої панелі ===
    function toggleBottomNav(enabled) {
        if (enabled) {
            // Ховаємо саме нижню панель (а не головне меню)
            Lampa.Template.add('hide_bottom_nav', '<style id="hide_bottom_nav">.navigation{display:none!important;}</style>');
            $('body').append(Lampa.Template.get('hide_bottom_nav', {}, true));

            // Додаємо кнопку "Пошук" у верхній панелі (щоб не втратити пошук)
            if (!$('#searchReturnButton').length) {
                const searchButton = `
                    <div id="searchReturnButton" class="selector" style="margin-left: 1em;">
                        🔍 Пошук
                    </div>`;
                $('#app > div.head > div > div.head__actions').append(searchButton);
                $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() {
                    Lampa.Search.open();
                });
            }
        } else {
            $('#hide_bottom_nav').remove();
            $('#searchReturnButton').remove();
        }
    }

    // === Автоматичне застосування при запуску ===
    if (Lampa.Storage.get('HideBottomNav', false)) {
        toggleBottomNav(true);
    }

})();
