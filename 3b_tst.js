// Версія плагіну: 1.0 - Повністю нова логіка  
// Не чіпає події кнопок, працює тільки з CSS та порядком  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonSeparator';  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Запуск плагіна`);  
          
        // Слухаємо подію завершення рендерингу full-сторінки  
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                }, 300);  
            }  
        });  
    }  
      
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const container = render.find('.full-start-new__buttons');  
              
            if (!container.length) {  
                console.warn(`${PLUGIN_NAME}: Контейнер не знайдено`);  
                return;  
            }  
              
            reorderButtons(container);  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    function reorderButtons(container) {  
        // Знаходимо всі кнопки  
        const allButtons = container.find('.full-start__button');  
          
        if (allButtons.length === 0) {  
            console.warn(`${PLUGIN_NAME}: Кнопки не знайдено`);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Знайдено ${allButtons.length} кнопок`);  
          
        // Створюємо масив кнопок з їх категоріями та порядком  
        const buttonData = [];  
          
        allButtons.each(function(index) {  
            const button = $(this);  
            const category = getCategory(button);  
            const order = getCategoryOrder(category);  
              
            buttonData.push({  
                element: button,  
                category: category,  
                order: order,  
                originalIndex: index  
            });  
              
            console.log(`${PLUGIN_NAME}: "${button.text().trim()}" -> ${category} (order: ${order})`);  
        });  
          
        // Сортуємо за порядком категорій  
        buttonData.sort((a, b) => {  
            if (a.order !== b.order) {  
                return a.order - b.order;  
            }  
            return a.originalIndex - b.originalIndex;  
        });  
          
        // Застосовуємо CSS order для зміни порядку БЕЗ переміщення в DOM  
        buttonData.forEach((data, index) => {  
            data.element.css('order', index);  
        });  
          
        // Переконуємося, що контейнер використовує flexbox  
        container.css('display', 'flex');  
          
        console.log(`${PLUGIN_NAME}: Порядок кнопок змінено через CSS order`);  
    }  
      
    function getCategory(button) {  
        const text = button.text().toLowerCase();  
        const classes = button.attr('class') || '';  
        const html = button.html().toLowerCase();  
          
        const combined = text + ' ' + classes + ' ' + html;  
          
        // Онлайн  
        if (classes.includes('view--online') ||   
            combined.includes('онлайн') ||  
            combined.includes('online') ||  
            combined.includes('prestige')) {  
            return 'online';  
        }  
          
        // Торренти  
        if (classes.includes('view--torrent') ||  
            combined.includes('торрент') ||  
            combined.includes('torrent')) {  
            return 'torrent';  
        }  
          
        // Трейлери  
        if (classes.includes('view--trailer') ||  
            combined.includes('трейлер') ||  
            combined.includes('trailer')) {  
            return 'trailer';  
        }  
          
        // Джерела (групова кнопка)  
        if (combined.includes('джерела') ||  
            combined.includes('sources') ||  
            combined.includes('источники')) {  
            return 'sources';  
        }  
          
        return 'other';  
    }  
      
    function getCategoryOrder(category) {  
        const orderMap = {  
            'online': 1,  
            'torrent': 2,  
            'trailer': 3,  
            'sources': 4,  
            'other': 5  
        };  
          
        return orderMap[category] || 999;  
    }  
      
    // Запуск  
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();