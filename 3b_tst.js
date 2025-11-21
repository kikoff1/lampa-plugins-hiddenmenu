// Версія плагіну: 1.3 - Остаточне виправлення  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonSeparator';  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Запуск плагіна`);  
          
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
            const mainContainer = render.find('.full-start-new__buttons');  
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) {  
                console.warn(`${PLUGIN_NAME}: Основний контейнер не знайдено`);  
                return;  
            }  
              
            // Знаходимо приховані оригінальні кнопки  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            console.log(`${PLUGIN_NAME}: Торрент кнопка: ${torrentBtn.length}, Трейлер кнопка: ${trailerBtn.length}`);  
              
            // Переміщуємо приховані кнопки в основний контейнер  
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
                console.log(`${PLUGIN_NAME}: Додано кнопку Торрентів`);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
                console.log(`${PLUGIN_NAME}: Додано кнопку Трейлерів`);  
            }  
              
            // Видаляємо ВСІ групові кнопки "Джерела"  
            removeSourcesButtons(mainContainer);  
              
            // Сортуємо всі кнопки через CSS order  
            reorderButtons(mainContainer);  
              
            // Оновлюємо навігацію  
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 100);  
            }  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    function removeSourcesButtons(container) {  
        // Шукаємо всі кнопки  
        const allButtons = container.find('.full-start__button');  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
            const hasViewClass = classes.includes('view--online') ||   
                                classes.includes('view--torrent') ||   
                                classes.includes('view--trailer');  
              
            // Видаляємо кнопку якщо:  
            // 1. Вона містить текст "джерела/sources/источники"  
            // 2. Вона порожня  
            // 3. Вона НЕ має класів view--*  
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('sources') ||   
                                   text.includes('источники');  
              
            const isEmpty = text === '' || text.length === 0;  
              
            // Видаляємо якщо це кнопка джерел АБО порожня кнопка без view класів  
            if ((isSourcesButton || isEmpty) && !hasViewClass) {  
                console.log(`${PLUGIN_NAME}: Видаляємо кнопку: "${text}" (класи: ${classes})`);  
                button.remove();  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        const allButtons = container.find('.full-start__button');  
          
        if (allButtons.length === 0) return;  
          
        console.log(`${PLUGIN_NAME}: Сортування ${allButtons.length} кнопок`);  
          
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
          
        buttonData.sort((a, b) => {  
            if (a.order !== b.order) {  
                return a.order - b.order;  
            }  
            return a.originalIndex - b.originalIndex;  
        });  
          
        buttonData.forEach((data, index) => {  
            data.element.css('order', index);  
        });  
          
        container.css('display', 'flex');  
          
        console.log(`${PLUGIN_NAME}: Порядок кнопок оновлено`);  
    }  
      
    function getCategory(button) {  
        const text = button.text().toLowerCase();  
        const classes = button.attr('class') || '';  
          
        const combined = text + ' ' + classes;  
          
        if (classes.includes('view--online') || combined.includes('онлайн') || combined.includes('online')) {  
            return 'online';  
        }  
          
        if (classes.includes('view--torrent') || combined.includes('торрент') || combined.includes('torrent')) {  
            return 'torrent';  
        }  
          
        if (classes.includes('view--trailer') || combined.includes('трейлер') || combined.includes('trailer')) {  
            return 'trailer';  
        }  
          
        return 'other';  
    }  
      
    function getCategoryOrder(category) {  
        const orderMap = {  
            'online': 1,  
            'torrent': 2,  
            'trailer': 3,  
            'other': 4  
        };  
          
        return orderMap[category] || 999;  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();