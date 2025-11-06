(function() {  
    'use strict';  
  
    function startPlugin() {  
        // Додаємо налаштування  
        Lampa.SettingsApi.addParam({  
            component: 'interface',  
            param: {  
                name: 'hide_navigation_bar',  
                type: 'trigger',  
                default: false  
            },  
            field: {  
                name: 'Приховати панель навігації',  
                description: 'Приховує нижню панель навігації (Назад, Головна, Пошук, Налаштування)'  
            },  
            onChange: function(value) {  
                if (value == true) {  
                    $('#hide_nav_bar').remove();  
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">body.true--mobile .navigation-bar{display:none!important}</style>');  
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
                }  
                if (value == false) {  
                    $('#hide_nav_bar').remove();  
                }  
                  
                // Зберігаємо стан  
                Lampa.Storage.set('hide_navigation_bar', value);  
            }  
        });  
  
        // Застосовуємо налаштування при запуску  
        if (Lampa.Storage.field('hide_navigation_bar') == true) {  
            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">body.true--mobile .navigation-bar{display:none!important}</style>');  
            $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
        }  
    }  
  
    if (window.appready) startPlugin();  
    else {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type == 'ready') startPlugin();  
        });  
    }  
})();