// Версія плагіну: 4.2 - Версія з налаштуваннями  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери + оптимізовані SVG та стилі  
// Підтримка кнопки "Дивитись" для Lampa 3.0.0+ + налаштування  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'UnifiedButtonManager';  
    let observer = null;  
      
    /* === Перевірка версії Lampa (виправлена) === */  
    function isLampaVersionOrHigher(minVersion) {  
        try {  
            let version = null;  
              
            if (window.Lampa && window.Lampa.Manifest && window.Lampa.Manifest.app_version) {  
                version = window.Lampa.Manifest.app_version;  
            } else if (window.lampa_settings && window.lampa_settings.version) {  
                version = window.lampa_settings.version;  
            } else if (window.Lampa && window.Lampa.App && window.Lampa.App.version) {  
                version = window.Lampa.App.version;  
            }  
              
            if (!version) return false;  
              
            const current = parseInt(version.replace(/\./g, ''));  
            const minimum = parseInt(minVersion.replace(/\./g, ''));  
              
            return current >= minimum;  
        } catch (e) {  
            console.warn(`${PLUGIN_NAME}: Помилка перевірки версії`, e);  
            return false;  
        }  
    }  
      
    /* === Перевірка чи увімкнений плагін === */  
    function isPluginEnabled() {  
        return Lampa.Storage.get('unified_button_manager_enabled', 'true') === 'true';  
    }  
      
    /* === Отримання порядку кнопок === */  
    function getButtonOrder() {  
        return Lampa.Storage.get('unified_button_manager_button_order', 'default');  
    }  
      
    /* === CSS (покращена специфічність) === */  
    function addStyles() {  
        if (!document.getElementById('unified-buttons-style')) {  
            const style = document.createElement('style');  
            style.id = 'unified-buttons-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative !important;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                  
                .full-start__button.view--online svg path {     
                    fill: #2196f3 !important;     
                }  
                .full-start__button.view--torrent svg path {     
                    fill: lime !important;     
                }  
                .full-start__button.view--trailer svg path {     
                    fill: #f44336 !important;     
                }  
                .full-start__button.button--play svg path {     
                    fill: #2196f3 !important;     
                }  
                  
                .full-start__button svg {  
                    width: 1.5em !important;  
                    height: 1.5em !important;  
                }  
                  
                .full-start__button.loading::before {  
                    content: '';  
                    position: absolute;  
                    top: 0; left: 0; right: 0;  
                    height: 2px;  
                    background: rgba(255,255,255,0.5);  
                    animation: loading 1s linear infinite;  
                }  
                  
                @keyframes loading {  
                    from { transform: translateX(-100%); }  
                    to   { transform: translateX(100%); }  
                }  
                  
                @media (max-width: 767px) {  
                    .full-start__button {  
                        min-height: 44px !important;  
                        padding: 10px !important;  
                    }  
                }  
            
            document.head.appendChild(style);  
        }  
    }  
      
    /* === SVGs === */  
    const svgs = {  
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/></svg>`,  
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`,  
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg>`,  
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`  
    };  
      
    /* === Додавання налаштувань === */  
    function addSettings() {  
        const component = 'unified_button_manager';  
          
        // Додаємо компонент до налаштувань  
        Lampa.SettingsApi.addComponent({  
            component: component,  
            icon: `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>  
                <circle cx="9" cy="18.5" r="2.5" fill="white"/>  
                <circle cx="19" cy="18.5" r="2.5" fill="white"/>  
                <circle cx="29" cy="18.5" r="2.5" fill="white"/>  
            </svg>`,  
            name: 'Unified Button Manager'  
        });  
          
        // Параметр увімкнення/вимкнення плагіна  
        Lampa.SettingsApi.addParam({  
            component: component,  
            param: {  
                name: 'unified_button_manager_enabled',  
                type: 'trigger',  
                default: true  
            },  
            field: {  
                name: 'Увімкнути Unified Button Manager'  
            },  
            onChange: (value) => {  
                Lampa.Storage.set('unified_button_manager_enabled', value);  
            }  
        });  
          
        // Параметр порядку кнопок  
        Lampa.SettingsApi.addParam({  
            component: component,  
            param: {  
                name: 'unified_button_manager_button_order',  
                type: 'select',  
                default: 'default',  
                values: {  
                    'default': 'За замовчуванням',  
                    'custom': 'Власний порядок'  
                }  
            },  
            field: {  
                name: 'Порядок кнопок'  
            },  
            onChange: (value) => {  
                Lampa.Storage.set('unified_button_manager_button_order', value);  
            }  
        });  
          
        // Заголовок для додаткових налаштувань  
        Lampa.SettingsApi.addParam({  
            component: component,  
            param: {  
                type: 'title'  
            },  
            field: {  
                name: 'Додатково'  
            }  
        });  
          
        // Параметр видалення кнопки джерел  
        Lampa.SettingsApi.addParam({  
            component: component,  
            param: {  
                name: 'unified_button_manager_remove_sources',  
                type: 'trigger',  
                default: true  
            },  
            field: {  
                name: 'Видаляти кнопку "Джерела"'  
            },  
            onChange: (value) => {  
                Lampa.Storage.set('unified_button_manager_remove_sources', value);  
            }  
        });  
          
        // Параметр анімації кнопок  
        Lampa.SettingsApi.addParam({  
            component: component,  
            param: {  
                name: 'unified_button_manager_animation',  
                type: 'trigger',  
                default: true  
            },  
            field: {  
                name: 'Увімкнути анімацію кнопок'  
            },  
            onChange: (value) => {  
                Lampa.Storage.set('unified_button_manager_animation', value);  
                if (!value) {  
                    // Вимикаємо анімацію  
                    const style = document.getElementById('unified-buttons-style');  
                    if (style) {  
                        style.textContent = style.textContent.replace(/transition:[^;]+;/g, 'transition: none !important;');  
                    }  
                } else {  
                    // Вмикаємо анімацію  
                    addStyles();  
                }  
            }  
        });  
    }  
      
    /* === Ініціалізація плагіна === */  
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        // Додаємо стили одразу  
        addStyles();  
          
        // Додаємо налаштування  
        if (window.appready) {  
            addSettings();  
        } else {  
            Lampa.Listener.follow('app', function(e) {  
                if (e.type === 'ready') addSettings();  
            });  
        }  
          
        // Слухаємо події повного екрану  
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    if (isPluginEnabled()) {  
                        processButtons(event);  
                        startObserver(event);  
                    }  
                }, 500);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    // Запускаємо плагін  
    initPlugin();  
      
})();
    /* === Обробка кнопок === */  
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
              
            let mainContainer = render.find('.full-start-new__buttons');  
            if (!mainContainer.length) {  
                mainContainer = render.find('.full-start__buttons');  
            }  
            if (!mainContainer.length) {  
                mainContainer = render.find('.buttons--container');  
            }  
              
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) {  
                console.warn(`${PLUGIN_NAME}: Не знайдено контейнер кнопок`);  
                return;  
            }  
              
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
              
            setTimeout(() => {  
                if (Lampa.Storage.get('unified_button_manager_remove_sources', 'true') === 'true') {  
                    removeSourcesButton(mainContainer);  
                }  
            }, 200);  
              
            reorderButtons(mainContainer);  
              
            setTimeout(() => {  
                updateButtons();  
            }, 300);  
              
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 400);  
            }  
              
        } catch (error) {  
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, error);  
        }  
    }  
      
    /* === Видалення кнопки джерел === */  
    function removeSourcesButton(mainContainer) {  
        const allButtons = mainContainer.find('.full-start__button');  
        const isVersion3OrHigher = isLampaVersionOrHigher('3.0.0');  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
              
            const isImportantButton = classes.includes('view--online') ||       
                                     classes.includes('view--torrent') ||       
                                     classes.includes('view--trailer') ||      
                                     classes.includes('button--book') ||      
                                     classes.includes('button--reaction') ||      
                                     classes.includes('button--subscribe') ||      
                                     classes.includes('button--play') ||  
                                     classes.includes('button--priority');  
              
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('источники') ||  
                                   text.includes('sources') ||  
                                   (text.includes('сезон') && !isImportantButton) ||  
                                   (text.includes('серіал') && !isImportantButton);  
              
            if (!isImportantButton && (isSourcesButton || text === '')) {  
                button.remove();  
            }  
        });  
    }
    /* === Спостерігач за змінами DOM === */  
    function startObserver(event) {  
        if (observer) {  
            observer.disconnect();  
        }  
          
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons, .full-start__buttons, .buttons--container').first();  
          
        if (mainContainer.length && typeof MutationObserver !== 'undefined') {  
            observer = new MutationObserver((mutations) => {  
                mutations.forEach((mutation) => {  
                    if (mutation.type === 'childList' && mutation.addedNodes.length) {  
                        setTimeout(() => {  
                            if (isPluginEnabled()) {  
                                processButtons(event);  
                            }  
                        }, 100);  
                    }  
                });  
            });  
              
            observer.observe(mainContainer[0], {  
                childList: true,  
                subtree: true  
            });  
        }  
    }  
      
    /* === Зупинка спостерігача === */  
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
        }  
    }  
      
    /* === Перевпорядкування кнопок === */  
    function reorderButtons(mainContainer) {  
        const buttonOrder = getButtonOrder();  
          
        if (buttonOrder === 'default') {  
            return;  
        }  
          
        const buttons = mainContainer.find('.full-start__button');  
        const order = ['view--online', 'button--play', 'view--torrent', 'view--trailer', 'button--book', 'button--reaction'];  
          
        buttons.each(function() {  
            const button = $(this);  
            let buttonIndex = -1;  
              
            order.forEach((className, index) => {  
                if (button.hasClass(className)) {  
                    buttonIndex = index;  
                    return false;  
                }  
            });  
              
            if (buttonIndex >= 0) {  
                button.attr('data-order', buttonIndex);  
            }  
        });  
          
        const sortedButtons = buttons.sort((a, b) => {  
            const orderA = parseInt($(a).attr('data-order') || 999);  
            const orderB = parseInt($(b).attr('data-order') || 999);  
            return orderA - orderB;  
        });  
          
        mainContainer.append(sortedButtons);  
    }  
      
    /* === Оновлення кнопок === */  
    function updateButtons() {  
        const isAnimationEnabled = Lampa.Storage.get('unified_button_manager_animation', 'true') === 'true';  
          
        $('.full-start__button').each(function() {  
            const button = $(this);  
              
            if (isAnimationEnabled) {  
                button.addClass('animate-enabled');  
            } else {  
                button.removeClass('animate-enabled');  
            }  
              
            if (button.hasClass('view--online')) {  
                button.find('svg').replaceWith($(svgs.online));  
            } else if (button.hasClass('view--torrent')) {  
                button.find('svg').replaceWith($(svgs.torrent));  
            } else if (button.hasClass('view--trailer')) {  
                button.find('svg').replaceWith($(svgs.trailer));  
            } else if (button.hasClass('button--play')) {  
                button.find('svg').replaceWith($(svgs.play));  
            }  
        });  
    }  
      
})();