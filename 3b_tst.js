// Версія плагіну: 2.0 - Тільки CSS сортування  
// Не додає і не видаляє кнопки, тільки змінює порядок  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonReorder';  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Запуск`);  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    reorderButtons(event);  
                }, 300);  
            }  
        });  
    }  
      
    function reorderButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const container = render.find('.full-start-new__buttons');  
              
            if (!container.length) return;  
              
            // Переконуємося що контейнер flexbox  
            container.css('display', 'flex');  
              
            // Знаходимо всі кнопки  
            const buttons = container.find('.full-start__button');  
              
            console.log(`${PLUGIN_NAME}: Знайдено ${buttons.length} кнопок`);  
              
            // Призначаємо CSS order кожній кнопці  
            buttons.each(function() {  
                const button = $(this);  
                const classes = button.attr('class') || '';  
                const text = button.text().toLowerCase();  
                  
                let order = 999; // За замовчуванням в кінець  
                  
                // Онлайн - перші  
                if (classes.includes('view--online') || text.includes('онлайн')) {  
                    order = 1;  
                }  
                // Торренти - другі  
                else if (classes.includes('view--torrent') || text.includes('торрент')) {  
                    order = 2;  
                }  
                // Трейлери - треті  
                else if (classes.includes('view--trailer') || text.includes('трейлер')) {  
                    order = 3;  
                }  
                // Джерела - в кінець  
                else if (text.includes('джерела') || text.includes('sources')) {  
                    order = 100;  
                }  
                  
                button.css('order', order);  
                  
                console.log(`${PLUGIN_NAME}: "${text.trim()}" -> order: ${order}`);  
            });  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();