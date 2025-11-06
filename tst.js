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
                description: 'Приховує нижню панель навігації та додає кнопки у верхню панель'  
            },  
            onChange: function(value) {  
                if (Lampa.Storage.field('hide_navigation_bar') == true) {  
                    // Приховуємо панель навігації  
                    Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');  
                    $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
                      
                    // Додаємо кнопки у верхню панель  
                    addHeaderButtons();  
                }  
                if (Lampa.Storage.field('hide_navigation_bar') == false) {  
                    // Показуємо панель навігації  
                    $('#hide_nav_bar').remove();  
                      
                    // Видаляємо кнопки з верхньої панелі  
                    removeHeaderButtons();  
                }  
            }  
        });  
  
        // Функція для додавання кнопок у верхню панель  
        function addHeaderButtons() {  
            // Видаляємо старі кнопки, якщо вони є  
            $('#customSearchButton').remove();  
            $('#customSettingsButton').remove();  
              
            // Приховуємо стандартну кнопку пошуку  
            $('.open--search').hide();  
              
            // Додаємо кнопку пошуку  
            var searchButton = '<div id="customSearchButton" class="head__action selector">' +  
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +  
                '<circle cx="11" cy="11" r="8"></circle>' +  
                '<path d="m21 21-4.35-4.35"></path>' +  
                '</svg>' +  
                '</div>';  
              
            // Додаємо кнопку налаштувань  
            var settingsButton = '<div id="customSettingsButton" class="head__action selector">' +  
                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +  
                '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>' +  
                '<circle cx="12" cy="12" r="3"></circle>' +  
                '</svg>' +  
                '</div>';  
              
            // Додаємо кнопки до верхньої панелі  
            $('#app > div.head > div > div.head__actions').append(searchButton);  
            $('#app > div.head > div > div.head__actions').append(settingsButton);  
              
            // Додаємо обробники подій  
            $('#customSearchButton').on('hover:enter hover:click hover:touch', function() {  
                Lampa.Search.open();  
            });  
              
            $('#customSettingsButton').on('hover:enter hover:click hover:touch', function() {  
                Lampa.Controller.toggle('settings');  
            });  
        }  
  
        // Функція для видалення кнопок з верхньої панелі  
        function removeHeaderButtons() {  
            $('#customSearchButton').remove();  
            $('#customSettingsButton').remove();  
              
            // Показуємо стандартну кнопку пошуку  
            $('.open--search').show();  
        }  
  
        // Застосовуємо при запуску  
        if (Lampa.Storage.field('hide_navigation_bar') == true) {  
            Lampa.Template.add('hide_nav_bar', '<style id="hide_nav_bar">.navigation-bar{display:none!important}</style>');  
            $('body').append(Lampa.Template.get('hide_nav_bar', {}, true));  
              
            // Додаємо кнопки після ініціалізації додатку  
            setTimeout(function() {  
                addHeaderButtons();  
            }, 500);  
        }  
    }  
  
    if (window.appready) startPlugin();  
    else {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type == 'ready') startPlugin();  
        });  
    }  
})();