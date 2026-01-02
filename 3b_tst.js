(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonManager';  
    let observer = null;  
      
    // Перевірка доступності Lampa  
    function checkLampaReady() {  
        return typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Storage;  
    }  
      
    // Функція додавання стилів  
    function addStyles() {  
        if (!document.getElementById('button-manager-style')) {  
            const style = document.createElement('style');  
            style.id = 'button-manager-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative !important;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                  
                .full-start__button.view--online svg path {     
                    fill: var(--button-online-color, #2196f3) !important;     
                }  
                .full-start__button.view--torrent svg path {     
                    fill: var(--button-torrent-color, lime) !important;     
                }  
                .full-start__button.view--trailer svg path {     
                    fill: var(--button-trailer-color, #f44336) !important;     
                }  
                .full-start__button.button--play svg path {     
                    fill: var(--button-play-color, #2196f3) !important;     
                }  
                  
                .full-start__button svg {  
                    width: var(--button-icon-size, 1.5em) !important;  
                    height: var(--button-icon-size, 1.5em) !important;  
                }  
                  
                .button-split .full-start__button {  
                    margin: 0.2em !important;  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    // Основна функція обробки кнопок  
    function processButtons(event) {  
        try {  
            if (!event || !event.object || !event.object.activity) return;  
              
            const render = event.object.activity.render();  
            if (!render) return;  
              
            let mainContainer = render.find('.full-start-new__buttons');  
            if (!mainContainer.length) {  
                mainContainer = render.find('.full-start__buttons');  
            }  
              
            if (!mainContainer.length) {  
                console.warn(`${PLUGIN_NAME}: Контейнер кнопок не знайдено`);  
                return;  
            }  
              
            applyButtonVisibility(mainContainer);  
            reorderButtons(mainContainer);  
            updateButtons();  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, error);  
        }  
    }  
      
    // Застосування видимості кнопок  
    function applyButtonVisibility(container) {  
        try {  
            const hiddenButtons = Lampa.Storage.get('button_manager_hidden', []);  
            const splitButtons = Lampa.Storage.get('button_manager_split', false);  
              
            if (splitButtons) {  
                container.addClass('button-split');  
            } else {  
                container.removeClass('button-split');  
            }  
              
            container.find('.full-start__button').each(function() {  
                const button = $(this);  
                const classes = button.attr('class') || '';  
                  
                let buttonId = '';  
                if (classes.includes('view--online')) buttonId = 'online';  
                else if (classes.includes('view--torrent')) buttonId = 'torrent';  
                else if (classes.includes('view--trailer')) buttonId = 'trailer';  
                else if (classes.includes('button--play')) buttonId = 'play';  
                  
                if (buttonId && hiddenButtons.includes(buttonId)) {  
                    button.addClass('hide');  
                } else {  
                    button.removeClass('hide');  
                }  
            });  
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка видимості кнопок`, error);  
        }  
    }  
      
    // Перевпорядкування кнопок  
    function reorderButtons(container) {  
        try {  
            container.css('display', 'flex');  
              
            const buttonOrder = Lampa.Storage.get('button_manager_order', ['play', 'online', 'torrent', 'trailer']);  
              
            container.find('.full-start__button').each(function() {  
                const button = $(this);  
                const classes = button.attr('class') || '';  
                  
                let buttonId = '';  
                if (classes.includes('button--play')) buttonId = 'play';  
                else if (classes.includes('view--online')) buttonId = 'online';  
                else if (classes.includes('view--torrent')) buttonId = 'torrent';  
                else if (classes.includes('view--trailer')) buttonId = 'trailer';  
                  
                const order = buttonOrder.indexOf(buttonId);  
                button.css('order', order >= 0 ? order : 999);  
            });  
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка порядку кнопок`, error);  
        }  
    }  
      
    // Оновлення стилів кнопок  
    function updateButtons() {  
        try {  
            const customColors = Lampa.Storage.get('button_manager_colors', {  
                online: '#2196f3',  
                torrent: 'lime',  
                trailer: '#f44336',  
                play: '#2196f3'  
            });  
              
            const iconSize = Lampa.Storage.get('button_manager_icon_size', '1.5em');  
              
            document.documentElement.style.setProperty('--button-online-color', customColors.online);  
            document.documentElement.style.setProperty('--button-torrent-color', customColors.torrent);  
            document.documentElement.style.setProperty('--button-trailer-color', customColors.trailer);  
            document.documentElement.style.setProperty('--button-play-color', customColors.play);  
            document.documentElement.style.setProperty('--button-icon-size', iconSize);  
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка оновлення кнопок`, error);  
        }  
    }  
      
    // Ініціалізація плагіна  
    function initPlugin() {  
        if (!checkLampaReady()) {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        try {  
            addStyles();  
              
            Lampa.Listener.follow('full', function(event) {  
                if (event.type === 'complite') {  
                    setTimeout(() => {  
                        processButtons(event);  
                    }, 500);  
                }  
            });  
              
            console.log(`${PLUGIN_NAME}: Плагін успішно ініціалізовано`);  
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка ініціалізації`, error);  
        }  
    }  
      
    // Запуск плагіна  
    function startPlugin() {  
        if (window.plugin_button_manager_ready) return;  
          
        window.plugin_button_manager_ready = true;  
          
        if (window.plugin) {  
            window.plugin('button_manager', {  
                type: 'component',  
                name: 'Button Manager',  
                version: '1.0.0',  
                author: 'Custom Plugin',  
                description: 'Менеджер кнопок з налаштуваннями стилів та порядку'  
            });  
        }  
          
        if (window.appready) {  
            initPlugin();  
        } else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type === 'ready') {  
                    initPlugin();  
                }  
            });  
        }  
    }  
      
    // Запускаємо плагін  
    startPlugin();  
      
})();