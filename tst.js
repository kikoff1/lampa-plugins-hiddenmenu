(function() {  
    'use strict';  
  
    function startPlugin() {  
        // Додаємо CSS стилі  
        $('<style>' +  
          'body.true--mobile .navigation-bar.plugin-hide { display: none !important; }' +  
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
                $nav.css('display', '');  
            } else {  
                $nav.removeClass('plugin-hide');  
                  
                // Примусове відображення для мобільних  
                if ($('body').hasClass('true--mobile')) {  
                    $nav.css('display', 'block');  
                      
                    // Примусовий reflow  
                    $nav[0].offsetHeight;  
                      
                    // Видаляємо inline стиль після короткої затримки  
                    setTimeout(function() {  
                        $nav.css('display', '');  
                    }, 100);  
                }  
            }  
              
            // Оновлюємо Layer кілька разів для надійності  
            setTimeout(function() {  
                if (window.Lampa && Lampa.Layer) {  
                    Lampa.Layer.update();  
                      
                    setTimeout(function() {  
                        Lampa.Layer.update();  
                    }, 100);  
                }  
            }, 10);  
              
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