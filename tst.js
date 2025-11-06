(function() {  
    'use strict';  
  
    function startPlugin() {  
        // Додаємо CSS стилі з максимальною специфічністю  
        $('<style>' +  
          'body.true--mobile .navigation-bar.plugin-hide { display: none !important; }' +  
          'body.true--mobile .navigation-bar:not(.plugin-hide) { display: block !important; }' +  
          '</style>').appendTo('head');  
  
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
                toggleNavigationBar(value);  
            }  
        });  
  
        // Функція для приховування/показу панелі  
        function toggleNavigationBar(hide) {  
            var $nav = $('.navigation-bar');  
              
            if (hide) {  
                $nav.addClass('plugin-hide');  
            } else {  
                $nav.removeClass('plugin-hide');  
                // Форсуємо перерахунок стилів  
                $nav[0].offsetHeight;  
            }  
              
            // Зберігаємо стан  
            Lampa.Storage.set('hide_navigation_bar', hide);  
        }  
  
        // Застосовуємо налаштування при запуску  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type === 'ready') {  
                var hideNav = Lampa.Storage.get('hide_navigation_bar', false);  
                toggleNavigationBar(hideNav);  
            }  
        });  
    }  
  
    if (window.appready) startPlugin();  
    else {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type === 'ready') startPlugin();  
        });  
    }  
})();