// Версія плагіну: 2.1 - Розгрупування через приховані кнопки  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonSeparator';  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Запуск`);  
          
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
                console.warn(`${PLUGIN_NAME}: Контейнер не знайдено`);  
                return;  
            }  
              
            // Знаходимо приховані оригінальні кнопки  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            console.log(`${PLUGIN_NAME}: Торрент: ${torrentBtn.length}, Трейлер: ${trailerBtn.length}`);  
              
            // Переміщуємо приховані кнопки в основний контейнер  
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
            }  
              
            // Видаляємо групову кнопку "Джерела"  
            mainContainer.find('.full-start__button').each(function() {  
                const btn = $(this);  
                const text = btn.text().toLowerCase();  
                const classes = btn.attr('class') || '';  
                  
                // Видаляємо якщо це кнопка "Джерела" (не має класів view--)  
                if ((text.includes('джерела') || text.includes('sources') || text === '') &&  
                    !classes.includes('view--online') &&  
                    !classes.includes('view--torrent') &&  
                    !classes.includes('view--trailer')) {  
                    console.log(`${PLUGIN_NAME}: Видаляємо: "${text}"`);  
                    btn.remove();  
                }  
            });  
              
            // Сортуємо через CSS order  
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
      
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
            const text = button.text().toLowerCase();  
              
            let order = 999;  
              
            if (classes.includes('view--online') || text.includes('онлайн')) {  
                order = 1;  
            } else if (classes.includes('view--torrent') || text.includes('торрент')) {  
                order = 2;  
            } else if (classes.includes('view--trailer') || text.includes('трейлер')) {  
                order = 3;  
            }  
              
            button.css('order', order);  
        });  
          
        console.log(`${PLUGIN_NAME}: Сортування завершено`);  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();