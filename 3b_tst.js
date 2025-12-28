// Версія плагіну: 4.2 - Виправлена версія з налаштуваннями  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'UnifiedButtonManager';  
    const SETTINGS_KEY = 'unified_button_manager_settings';  
    let observer = null;  
      
    // Налаштування за замовчуванням  
    const defaultSettings = {  
        showOnline: true,  
        showTorrent: true,  
        showTrailer: true,  
        showPlay: true,  
        enableAnimations: true,  
        hideSources: true  
    };  
      
    // Отримання налаштувань  
    function getSettings() {  
        try {  
            const saved = Lampa.Storage.get(SETTINGS_KEY, null);  
            return saved ? {...defaultSettings, ...saved} : defaultSettings;  
        } catch (e) {  
            console.warn(`${PLUGIN_NAME}: Помилка завантаження налаштувань`, e);  
            return defaultSettings;  
        }  
    }  
      
    // Збереження налаштувань  
    function saveSettings(settings) {  
        try {  
            Lampa.Storage.set(SETTINGS_KEY, settings);  
        } catch (e) {  
            console.warn(`${PLUGIN_NAME}: Помилка збереження налаштувань`, e);  
        }  
    }  
      
    // Додавання локалізації  
    function addLocalization() {  
        Lampa.Lang.add({  
            unified_button_manager_title: {  
                ru: 'Менеджер кнопок',  
                uk: 'Менеджер кнопок',  
                en: 'Button Manager'  
            },  
            unified_button_manager_descr: {  
                ru: 'Настройка кнопок просмотра',  
                uk: 'Налаштування кнопок перегляду',  
                en: 'Customize view buttons'  
            },  
            unified_button_manager_show_online: {  
                ru: 'Показать кнопку "Онлайн"',  
                uk: 'Показати кнопку "Онлайн"',  
                en: 'Show "Online" button'  
            },  
            unified_button_manager_show_torrent: {  
                ru: 'Показать кнопку "Торренты"',  
                uk: 'Показати кнопку "Торренти"',  
                en: 'Show "Torrent" button'  
            },  
            unified_button_manager_show_trailer: {  
                ru: 'Показать кнопку "Трейлеры"',  
                uk: 'Показати кнопку "Трейлери"',  
                en: 'Show "Trailer" button'  
            },  
            unified_button_manager_show_play: {  
                ru: 'Показать кнопку "Смотреть"',  
                uk: 'Показати кнопку "Дивитись"',  
                en: 'Show "Watch" button'  
            },  
            unified_button_manager_enable_animations: {  
                ru: 'Включить анимации кнопок',  
                uk: 'Увімкнути анімації кнопок',  
                en: 'Enable button animations'  
            },  
            unified_button_manager_hide_sources: {  
                ru: 'Скрывать кнопку "Источники"',  
                uk: 'Приховувати кнопку "Джерела"',  
                en: 'Hide "Sources" button'  
            }  
        });  
    }  
      
    // Додавання налаштувань  
    function addSettings() {  
        Lampa.SettingsApi.addComponent({  
            component: 'unified_button_manager',  
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',  
            name: Lampa.Lang.translate('unified_button_manager_title')  
        });  
          
        // Додавання параметрів  
        const params = [  
            { key: 'showOnline', title: Lampa.Lang.translate('unified_button_manager_show_online') },  
            { key: 'showTorrent', title: Lampa.Lang.translate('unified_button_manager_show_torrent') },  
            { key: 'showTrailer', title: Lampa.Lang.translate('unified_button_manager_show_trailer') },  
            { key: 'showPlay', title: Lampa.Lang.translate('unified_button_manager_show_play') },  
            { key: 'enableAnimations', title: Lampa.Lang.translate('unified_button_manager_enable_animations') },  
            { key: 'hideSources', title: Lampa.Lang.translate('unified_button_manager_hide_sources') }  
        ];  
          
        params.forEach(param => {  
            Lampa.SettingsApi.addParam({  
                component: 'unified_button_manager',  
                param: {  
                    name: param.key,  
                    type: 'trigger',  
                    default: defaultSettings[param.key]  
                },  
                field: {  
                    name: param.title  
                },  
                onChange: (value) => {  
                    const settings = getSettings();  
                    settings[param.key] = value;  
                    saveSettings(settings);  
                }  
            });  
        });  
    }  
      
    // Перевірка версії Lampa  
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
      
    // CSS стилі  
    function addStyles() {  
        if (!document.getElementById('unified-buttons-style')) {  
            const settings = getSettings();  
            const style = document.createElement('style');  
            style.id = 'unified-buttons-style';  
            style.textContent = `  
                .full-start__button {  
                    position: relative !important;  
                    ${settings.enableAnimations ? 'transition: transform 0.2s ease !important;' : ''}  
                }  
                .full-start__button:active {  
                    ${settings.enableAnimations ? 'transform: scale(0.98) !important;' : ''}  
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
                  
                @media (max-width: 767px) {  
                    .full-start__button {  
                        min-height: 44px !important;  
                        padding: 10px !important;  
                    }  
                }  
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    // SVG іконки  
    const svgs = {  
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/></svg>`,  
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`,  
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg>`,  
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`  
    };  
      
    // Обробка кнопок  
    function processButtons(event) {  
        try {  
            const settings = getSettings();  
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
              
            // Переміщуємо кнопки відповідно до налаштувань  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            if (torrentBtn.length > 0 && settings.showTorrent) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0 && settings.showTrailer) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
            }  
              
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
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
      
    function removeSourcesButton(mainContainer) {  
        const settings = getSettings();  
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
                                     classes.includes('button--subs') ||      
                                     text.includes('онлайн') ||      
                                     text.includes('online');  
              
            const isPlayButton = classes.includes('button--play');  
            const isSourcesButton = text.includes('джерела') ||       
                                   text.includes('джерело') ||      
                                   text.includes('sources') ||       
                                   text.includes('source') ||      
                                   text.includes('источники') ||      
                                   text.includes('источник');  
              
            const isOptionsButton = classes.includes('button--options');  
            const isEmpty = text === '' || text.length <= 2;  
              
            const shouldRemove = !isImportantButton &&     
                ((isPlayButton && !isVersion3OrHigher && !settings.showPlay) ||     
                 (isSourcesButton && settings.hideSources) ||     
                 (isOptionsButton && isEmpty));  
              
            if (shouldRemove) {  
                button.remove();  
            }  
        });  
    }  
      
    function reorderButtons(container) {  
        const settings = getSettings();  
        container.css('display', 'flex');  
          
        container.find('.full-start__button').each(function() {  
            const button = $(this);  
            const classes = button.attr('class') || '';  
            const text = button.text().toLowerCase();  
              
            let order = 999;  
              
            if ((classes.includes('button--play') || text.includes('дивитись') || text.includes('watch')) && settings.showPlay) {  
                order = 0;  
            } else if ((classes.includes('view--online') || text.includes('онлайн')) && settings.showOnline) {  
                order = 1;  
            } else if ((classes.includes('view--torrent') || text.includes('торрент')) && settings.showTorrent) {  
                order = 2;  
            } else if ((classes.includes('view--trailer') || text.includes('трейлер')) && settings.showTrailer) {  
                order = 3;  
            }  
              
            button.css('order', order);  
        });  
    }  
      
    function updateButtons() {  
        const map = {  
            'view--torrent': svgs.torrent,  
            'view--online': svgs.online,  
            'view--trailer': svgs.trailer,  
            'button--play': svgs.play  
        };  
          
        for (const cls in map) {  
            $(`.full-start__button.${cls}`).each(function() {  
                const button = $(this);  
                const oldSvg = button.find('svg');  
                  
                if (oldSvg.length === 0) return;  
                  
                const newSvg = $(map[cls]);  
                  
                const width = oldSvg.attr('width') || '1.5em';  
                const height = oldSvg.attr('height') || '1.5em';  
                  
                if (oldSvg.attr('class')) {  
                    newSvg.attr('class', oldSvg.attr('class'));  
                }  
                  
                oldSvg.html(newSvg.html());  
                  
                if (newSvg.attr('viewBox')) {  
                    oldSvg.attr('viewBox', newSvg.attr('viewBox'));  
                }  
                if (newSvg.attr('xmlns')) {  
                    oldSvg.attr('xmlns', newSvg.attr('xmlns'));  
                }  
                  
                oldSvg.css({  
                    'width': width,  
                    'height': height  
                });  
            });  
        }  
    }  
      
    function startObserver(event) {  
        const settings = getSettings();  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver((mutations) => {  
            mutations.forEach((mutation) => {  
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                    mutation.addedNodes.forEach((node) => {  
                        if (node.nodeType === 1 && node.classList && node.classList.contains('full-start__button')) {  
                            const text = node.textContent.toLowerCase().trim();  
                            const classes = node.className || '';  
                              
                            const isImportantButton = classes.includes('view--online') ||       
                                                     classes.includes('view--torrent') ||       
                                                     classes.includes('view--trailer') ||      
                                                     classes.includes('button--book') ||      
                                                     classes.includes('button--reaction') ||      
                                                     classes.includes('button--subscribe') ||      
                                                     classes.includes('button--subs') ||      
                                                     text.includes('онлайн') ||      
                                                     text.includes('online');  
                              
                            const isPlayButton = classes.includes('button--play');  
                            const isSourcesButton = text.includes('джерела') ||       
                                                   text.includes('джерело') ||      
                                                   text.includes('sources') ||       
                                                   text.includes('source') ||      
                                                   text.includes('источники') ||      
                                                   text.includes('источник');  
                              
                            const isOptionsButton = classes.includes('button--options');  
                            const isEmpty = text === '' || text.length <= 2;  
                              
                            const isVersion3OrHigher = isLampaVersionOrHigher('3.0.0');  
                              
                            const shouldRemove = !isImportantButton &&     
                                ((isPlayButton && !isVersion3OrHigher && !settings.showPlay) ||     
                                 (isSourcesButton && settings.hideSources) ||     
                                 (isOptionsButton && isEmpty));  
                              
                            if (shouldRemove) {  
                                $(node).remove();  
                            }  
                        }  
                    });  
                      
                    setTimeout(updateButtons, 50);  
                }  
            });  
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
      
    // Ініціалізація плагіна  
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        addLocalization();  
        addSettings();  
        addStyles();  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                    startObserver(event);  
                }, 500);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
    }  
      
    // Перевірка готовності та запуск  
    if (window.appready) {  
        initPlugin();  
    } else {  
        Lampa.Listener.follow('app', function(e) {  
            if (e.type === 'ready') {  
                initPlugin();  
            }  
        });  
    }  
      
    // Реєстрація плагіна  
    if (window.plugin) {  
        window.plugin('unified_button_manager', {  
            type: 'component',  
            name: 'Unified Button Manager',  
            version: '4.2',  
            author: 'Merged Plugin',  
            description: 'Об\'єднаний плагін: розділення кнопок + оптимізовані SVG та стилі з підтримкою Lampa 3.0.0+ та налаштуваннями'  
        });  
    }  
      
})();