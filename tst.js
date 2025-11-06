

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
                description: 'Приховує нижню панель навігації'  
            },  
            onChange: function(value) {  
                if (Lampa.Storage.field('hide_navigation_bar') == true) {  
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');  
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
                }  
                if (Lampa.Storage.field('hide_navigation_bar') == false) {  
                    $('#hide_nav_bar').remove();  
                }  
            }  
        });  
  
        // Застосовуємо при запуску  
        if (Lampa.Storage.field('hide_navigation_bar') == true) {  
            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');  
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