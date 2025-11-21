// Версія плагіну: 0.7 - Запобігання групуванню  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonSeparatorPlugin';  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Ініціалізація плагіна`);  
          
        // Перехоплюємо подію ПЕРЕД групуванням кнопок  
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'init') {  
                // Відключаємо модуль Buttons, який групує кнопки  
                if (event.object && event.object.buttons) {  
                    event.object.buttons = null;  
                }  
            }  
              
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                }, 200);  
            }  
        });  
    }  
      
    function processButtons(event) {  
        try {  
            const activity = event.object.activity;  
            const render = activity.render();  
              
            const buttonsContainer = render.find('.full-start-new__buttons');  
              
            if (!buttonsContainer.length) {  
                console.warn(`${PLUGIN_NAME}: Контейнер кнопок не знайдено`);  
                return;  
            }  
              
            separateButtons(buttonsContainer);  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, error);  
        }  
    }  
      
    function separateButtons(container) {  
        // Знаходимо ВСІ кнопки, включаючи приховані  
        const allButtons = container.find('.full-start__button, .view--torrent, .view--trailer, .view--online');  
          
        if (allButtons.length === 0) {  
            console.warn(`${PLUGIN_NAME}: Кнопки не знайдено`);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Знайдено ${allButtons.length} кнопок`);  
          
        // Категоризуємо  
        const categorized = {  
            online: [],  
            torrent: [],  
            trailer: [],  
            other: []  
        };  
          
        allButtons.each(function() {  
            const button = $(this);  
            const category = detectCategory(button);  
              
            console.log(`${PLUGIN_NAME}: Кнопка "${button.text().trim()}" -> категорія: ${category}`);  
              
            categorized[category].push(button);  
        });  
          
        // Очищаємо контейнер  
        container.empty();  
          
        // Додаємо кнопки в правильному порядку  
        const order = ['online', 'torrent', 'trailer', 'other'];  
          
        order.forEach(category => {  
            categorized[category].forEach(button => {  
                // Робимо кнопку видимою та активною  
                button.removeClass('hide');  
                button.addClass('selector');  
                button.css({  
                    'display': 'inline-block',  
                    'visibility': 'visible',  
                    'opacity': '1'  
                });  
                  
                container.append(button);  
            });  
        });  
          
        console.log(`${PLUGIN_NAME}: Розподіл: Онлайн=${categorized.online.length}, Торренти=${categorized.torrent.length}, Трейлери=${categorized.trailer.length}, Інші=${categorized.other.length}`);  
          
        // Оновлюємо навігацію  
        if (Lampa.Controller) {  
            setTimeout(() => {  
                Lampa.Controller.collectionSet(container.parent());  
                Lampa.Controller.collectionFocus(false, container.parent());  
            }, 100);  
        }  
    }  
      
    function detectCategory(button) {  
        const text = button.text().toLowerCase();  
        const classes = button.attr('class') || '';  
        const html = button.html().toLowerCase();  
          
        const allText = text + ' ' + classes + ' ' + html;  
          
        // Торренти - перевіряємо спочатку клас  
        if (classes.includes('view--torrent') ||   
            allText.includes('торрент') ||  
            allText.includes('torrent')) {  
            return 'torrent';  
        }  
          
        // Трейлери  
        if (classes.includes('view--trailer') ||  
            allText.includes('трейлер') ||  
            allText.includes('trailer')) {  
            return 'trailer';  
        }  
          
        // Онлайн  
        if (classes.includes('view--online') ||  
            allText.includes('онлайн') ||   
            allText.includes('online') ||  
            allText.includes('hdrezk') ||  
            allText.includes('voidboost') ||  
            allText.includes('ashdi') ||  
            allText.includes('collaps') ||  
            allText.includes('bazon') ||  
            allText.includes('filmix') ||  
            allText.includes('videocdn') ||  
            allText.includes('rezka') ||  
            allText.includes('kinobase') ||  
            allText.includes('prestige')) {  
            return 'online';  
        }  
          
        return 'other';  
    }  
      
    // Запускаємо плагін  
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();