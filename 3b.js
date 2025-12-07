// Версія плагіну: 4.5 - Фінальна версія з правильним таймінгом для Lampa 3.0.0+  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'EnhancedButtonSeparator';  
    let observer = null;  
    let updateAttempts = 0;  
    const MAX_ATTEMPTS = 10;  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        initStyles();  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                updateAttempts = 0;  
                // Починаємо перевірку з затримкою і повторюємо кілька разів  
                setTimeout(() => tryUpdateButtons(event), 500);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    function tryUpdateButtons(event) {  
        processButtons(event);  
        updateButtonSVGs();  
        startObserver(event);  
          
        // Повторюємо спроби, якщо онлайн кнопка ще не з'явилася  
        if (updateAttempts < MAX_ATTEMPTS) {  
            updateAttempts++;  
            setTimeout(() => tryUpdateButtons(event), 500);  
        }  
    }  
      
    function updateButtonSVGs() {  
        // Оновлюємо стандартні кнопки  
        $('.full-start__button.view--online').each(function() {  
            const button = $(this);  
            const oldSvg = button.find('svg');  
            if (oldSvg.length > 0) {  
                oldSvg.html(svgs.online.replace(/<svg[^>]*>|<\/svg>/g, ''));  
                oldSvg.attr('viewBox', '0 0 32 32');  
                console.log('Онлайн іконку оновлено для view--online');  
            }  
        });  
          
        // Шукаємо онлайн кнопку за текстом та атрибутами  
        $('.full-start__button').each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase();  
              
            if (text.includes('онлайн') || text.includes('online')) {  
                const oldSvg = button.find('svg');  
                if (oldSvg.length > 0 && !button.hasClass('view--online')) {  
                    oldSvg.html(svgs.online.replace(/<svg[^>]*>|<\/svg>/g, ''));  
                    oldSvg.attr('viewBox', '0 0 32 32');  
                    console.log('Онлайн іконку оновлено для кнопки з текстом:', text);  
                }  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        container.css('display', 'flex');  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase();  
            let order = 999;  
              
            // Онлайн кнопка - завжди перша  
            if (button.hasClass('view--online') || text.includes('онлайн') || text.includes('online')) {  
                order = 0;  
                console.log('Онлайн кнопка встановлена першою');  
            } else if (button.hasClass('view--torrent') || text.includes('торрент')) {  
                order = 1;  
            } else if (button.hasClass('view--trailer') || text.includes('трейлер')) {  
                order = 2;  
            }  
              
            button.css('order', order);  
        });  
    }  
      
    // Решта функцій без змін...  
    function initStyles() {  
        if (!document.getElementById('enhanced-buttons-style')) {  
            const style = document.createElement('style');  
            style.id = 'enhanced-buttons-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                  
                .full-start__button.view--online svg path { fill: #2196f3 !important; }  
                .full-start__button.view--torrent svg path { fill: lime !important; }  
                .full-start__button.view--trailer svg path { fill: #f44336 !important; }  
                  
                .full-start__button svg {  
                    width: 1.5em !important;  
                    height: 1.5em !important;  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    const svgs = {  
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`,  
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2z" fill="currentColor"/></svg>`,  
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path d="M55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg>`  
    };  
      
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const mainContainer = render.find('.full-start-new__buttons');  
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) return;  
              
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
            }  
              
            reorderButtons(mainContainer);  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка`, error);  
        }  
    }  
      
    function startObserver(event) {  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver(() => {  
            setTimeout(updateButtonSVGs, 100);  
        });  
          
        observer.observe(mainContainer, {  
            childList: true,  
            subtree: false  
        });  
    }  
      
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
        }  
    }  
      
    // Реєстрація плагіна  
    if (typeof Lampa !== 'undefined') {  
        const manifest = {  
            type: 'component',  
            name: 'Enhanced Button Separator',  
            version: '4.5.0',  
            author: 'Merged Plugin',  
            description: 'Об\'єднаний плагін з виправленим таймінгом для Lampa 3.0.0+'  
        };  
          
        if (window.plugin) {  
            window.plugin('enhanced_button_separator', manifest);  
        }  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
})();