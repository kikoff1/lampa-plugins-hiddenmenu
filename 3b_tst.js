// Версія плагіну: 0.6 - Розгрупування кнопок  
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
          
        // Підписуємося на подію створення full-компонента  
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                processButtons(event);  
            }  
        });  
    }  
      
    function processButtons(event) {  
        try {  
            const activity = event.object.activity;  
            const render = activity.render();  
              
            // Знаходимо контейнер з кнопками  
            const buttonsContainer = render.find('.full-start-new__buttons');  
              
            if (!buttonsContainer.length) {  
                console.warn(`${PLUGIN_NAME}: Контейнер кнопок не знайдено`);  
                return;  
            }  
              
            // Затримка для завершення рендерингу всіх кнопок  
            setTimeout(() => {  
                ungroupAndSeparateButtons(buttonsContainer);  
            }, 150);  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, error);  
        }  
    }  
      
    function ungroupAndSeparateButtons(container) {  
        // Знаходимо кнопку "Джерела" (sources)  
        const sourcesButton = container.find('.full-start__button').filter(function() {  
            const text = $(this).text().toLowerCase();  
            return text.includes('джерела') || text.includes('sources') || text.includes('источники');  
        });  
          
        if (sourcesButton.length > 0) {  
            console.log(`${PLUGIN_NAME}: Знайдено кнопку "Джерела", розгруповуємо`);  
              
            // Знаходимо всі згруповані кнопки всередині  
            const groupedButtons = sourcesButton.find('.full-start__button');  
              
            if (groupedButtons.length > 0) {  
                // Витягуємо згруповані кнопки  
                groupedButtons.each(function() {  
                    const button = $(this);  
                    // Видаляємо кнопку з групи і додаємо безпосередньо в контейнер  
                    button.detach();  
                    button.removeClass('hide');  
                    button.addClass('selector');  
                    container.append(button);  
                });  
                  
                // Видаляємо порожню кнопку "Джерела"  
                sourcesButton.remove();  
                  
                console.log(`${PLUGIN_NAME}: Розгруповано ${groupedButtons.length} кнопок`);  
            }  
        }  
          
        // Тепер сортуємо всі кнопки  
        separateButtons(container);  
    }  
      
    function separateButtons(container) {  
        // Знаходимо всі кнопки в контейнері  
        const buttons = container.find('.full-start__button, .selector').filter(function() {  
            // Виключаємо вкладені кнопки  
            return $(this).parent().hasClass('full-start-new__buttons') ||   
                   $(this).parent().parent().hasClass('full-start-new__buttons');  
        });  
          
        if (buttons.length === 0) {  
            console.warn(`${PLUGIN_NAME}: Кнопки не знайдено`);  
            return;  
        }  
          
        console.log(`${PLUGIN_NAME}: Знайдено ${buttons.length} кнопок для сортування`);  
          
        // Категоризуємо кнопки  
        const categorized = {  
            online: [],  
            torrent: [],  
            trailer: [],  
            other: []  
        };  
          
        buttons.each(function() {  
            const button = $(this);  
            const category = detectCategory(button);  
            categorized[category].push(button);  
        });  
          
        // Видаляємо всі кнопки з контейнера  
        buttons.detach();  
          
        // Додаємо кнопки назад у правильному порядку  
        const order = ['online', 'torrent', 'trailer', 'other'];  
          
        order.forEach(category => {  
            categorized[category].forEach(button => {  
                // Переконуємося, що кнопка видима і має правильні класи  
                button.removeClass('hide');  
                button.addClass('selector');  
                button.css({  
                    'display': '',  
                    'visibility': 'visible',  
                    'opacity': '1'  
                });  
                  
                container.append(button);  
            });  
        });  
          
        console.log(`${PLUGIN_NAME}: Кнопки успішно розділено та відсортовано`);  
        console.log(`${PLUGIN_NAME}: Онлайн: ${categorized.online.length}, Торренти: ${categorized.torrent.length}, Трейлери: ${categorized.trailer.length}, Інші: ${categorized.other.length}`);  
          
        // Оновлюємо Controller для нових позицій кнопок  
        if (Lampa.Controller) {  
            setTimeout(() => {  
                Lampa.Controller.collectionSet(container.parent());  
            }, 50);  
        }  
    }  
      
    function detectCategory(button) {  
        const text = button.text().toLowerCase();  
        const html = button.html().toLowerCase();  
        const classes = button.attr('class') || '';  
        const dataSubtitle = button.attr('data-subtitle') || '';  
          
        const allText = text + ' ' + html + ' ' + classes + ' ' + dataSubtitle;  
          
        // Перевірка на онлайн-джерела  
        if (allText.includes('онлайн') ||   
            allText.includes('online') ||  
            allText.includes('view--online') ||  
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
          
        // Перевірка на торренти  
        if (allText.includes('торрент') ||  
            allText.includes('torrent') ||  
            allText.includes('view--torrent') ||  
            allText.includes('трекер') ||  
            allText.includes('tracker')) {  
            return 'torrent';  
        }  
          
        // Перевірка на трейлери  
        if (allText.includes('трейлер') ||  
            allText.includes('trailer') ||  
            allText.includes('view--trailer') ||  
            allText.includes('youtube')) {  
            return 'trailer';  
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