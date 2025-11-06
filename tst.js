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
            } else {  
                $nav.removeClass('plugin-hide');  
                  
                // КЛЮЧОВЕ РІШЕННЯ: примусово перезавантажуємо елемент  
                if ($('body').hasClass('true--mobile')) {  
                    var parent = $nav.parent();  
                    var navClone = $nav.clone();  
                    $nav.remove();  
                    parent.append(navClone);  
                      
                    // Оновлюємо Layer після перезавантаження  
                    setTimeout(function() {  
                        if (window.Lampa && Lampa.Layer) {  
                            Lampa.Layer.update();  
                        }  
                    }, 50);  
                }  
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