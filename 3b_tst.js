// Версія плагіну: 2.6 - Фінальна версія  
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
                console.log(`${PLUGIN_NAME}: Додано кнопку Торрентів`);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
                console.log(`${PLUGIN_NAME}: Додано кнопку Трейлерів`);  
            }  
              
            // Видаляємо порожню кнопку "Джерела" з затримкою  
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
            }, 150);  
              
            // Сортуємо через CSS order  
            reorderButtons(mainContainer);  
              
            // Оновлюємо навігацію  
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 200);  
            }  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    function removeSourcesButton(container) {  
        const allButtons = container.find('.full-start__button');  
          
        console.log(`${PLUGIN_NAME}: Перевірка ${allButtons.length} кнопок`);  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
              
            // Список важливих кнопок, які НЕ треба видаляти  
            const isImportantButton = classes.includes('view--online') ||   
                                     classes.includes('view--torrent') ||   
                                     classes.includes('view--trailer') ||  
                                     classes.includes('button--play') ||  
                                     classes.includes('button--book') ||  
                                     classes.includes('button--reaction') ||  
                                     classes.includes('button--subscribe') ||  
                                     classes.includes('button--options');  
              
            // Перевіряємо чи це кнопка "Джерела"  
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('джерело') ||  
                                   text.includes('sources') ||   
                                   text.includes('источники') ||  
                                   text.includes('источник');  
              
            // Перевіряємо чи кнопка порожня або майже порожня  
            const isEmpty = text === '' || text.length <= 2;  
              
            // Видаляємо якщо це кнопка джерел або порожня кнопка без важливих класів  
            if (!isImportantButton && (isSourcesButton || isEmpty)) {  
                console.log(`${PLUGIN_NAME}: Видаляємо кнопку: "${text}" (класи: ${classes})`);  
                button.remove();  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        const buttons = container.find('.full-start__button');  
          
        buttons.each(function() {  
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