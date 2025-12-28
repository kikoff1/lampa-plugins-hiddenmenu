// Версія плагіну: 4.4 - Повністю виправлена версія  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери + оптимізовані SVG та стилі  
// Підтримка кнопки "Дивитись" для Lampa 3.0.0+ + налаштування  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'UnifiedButtonManager';  
    let observer = null;  
      
    /* === Перевірка версії Lampa === */  
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
      
    /* === CSS стилі === */  
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
            `;  
            document.head.appendChild(style);  
        }  
    }  
      
    /* === SVG іконки === */  
    const svgs = {  
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/></svg>`,  
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`,  
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg>`,  
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`  
    };  
      
    /* === Застосування налаштувань === */  
    function applySettings() {  
        try {  
            if (!Lampa.Storage.get('unified_buttons_enabled', true)) {  
                $('#unified-buttons-style').remove();  
                $('#unified-buttons-custom-colors').remove();  
                return;  
            }  
              
            addStyles();  
              
            // Застосовуємо кольори  
            const colors = {};  
            const onlineColor = Lampa.Storage.get('unified_buttons_color_online', '');  
            const torrentColor = Lampa.Storage.get('unified_buttons_color_torrent', '');  
            const trailerColor = Lampa.Storage.get('unified_buttons_color_trailer', '');  
            const playColor = Lampa.Storage.get('unified_buttons_color_play', '');  
              
            if (onlineColor) colors.online = onlineColor;  
            if (torrentColor) colors.torrent = torrentColor;  
            if (trailerColor) colors.trailer = trailerColor;  
            if (playColor) colors.play = playColor;  
              
            if (Object.keys(colors).length > 0) {  
                updateButtonColors(colors);  
            }  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка застосування налаштувань`, e);  
        }  
    }  
      
    /* === Оновлення кольорів кнопок === */  
    function updateButtonColors(colors) {  
        try {  
            const styleId = 'unified-buttons-custom-colors';  
            let style = document.getElementById(styleId);  
              
            if (!style) {  
                style = document.createElement('style');  
                style.id = styleId;  
                document.head.appendChild(style);  
            }  
              
            let css = '';  
            if (colors.online) css += `.full-start__button.view--online svg path { fill: ${colors.online} !important; }`;  
            if (colors.torrent) css += `.full-start__button.view--torrent svg path { fill: ${colors.torrent} !important; }`;  
            if (colors.trailer) css += `.full-start__button.view--trailer svg path { fill: ${colors.trailer} !important; }`;  
            if (colors.play) css += `.full-start__button.button--play svg path { fill: ${colors.play} !important; }`;  
              
            style.textContent = css;  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка оновлення кольорів`, e);  
        }  
    }
    /* === Додавання налаштувань === */  
    function addSettings() {  
        try {  
            // Перевіряємо чи доступний SettingsApi  
            if (!Lampa.SettingsApi) {  
                console.warn(`${PLUGIN_NAME}: SettingsApi не доступний`);  
                return;  
            }  
              
            // Додаємо переклади  
            if (Lampa.Lang) {  
                Lampa.Lang.add({  
                    unified_buttons_title: {  
                        ru: 'Менеджер кнопок',  
                        uk: 'Менеджер кнопок',  
                        en: 'Button Manager'  
                    },  
                    unified_buttons_enabled: {  
                        ru: 'Включить менеджер кнопок',  
                        uk: 'Увімкнути менеджер кнопок',  
                        en: 'Enable button manager'  
                    },  
                    unified_buttons_hide_sources: {  
                        ru: 'Скрывать кнопку "Источники"',  
                        uk: 'Приховати кнопку "Джерела"',  
                        en: 'Hide "Sources" button'  
                    },  
                    unified_buttons_colors: {  
                        ru: 'Настройка цветов кнопок',  
                        uk: 'Налаштування кольорів кнопок',  
                        en: 'Button color settings'  
                    },  
                    unified_buttons_color_online: {  
                        ru: 'Цвет кнопки "Онлайн"',  
                        uk: 'Колір кнопки "Онлайн"',  
                        en: 'Online button color'  
                    },  
                    unified_buttons_color_torrent: {  
                        ru: 'Цвет кнопки "Торрент"',  
                        uk: 'Колір кнопки "Торрент"',  
                        en: 'Torrent button color'  
                    },  
                    unified_buttons_color_trailer: {  
                        ru: 'Цвет кнопки "Трейлер"',  
                        uk: 'Колір кнопки "Трейлер"',  
                        en: 'Trailer button color'  
                    },  
                    unified_buttons_color_play: {  
                        ru: 'Цвет кнопки "Смотреть"',  
                        uk: 'Колір кнопки "Дивитись"',  
                        en: 'Play button color'  
                    },  
                    unified_buttons_reset_colors: {  
                        ru: 'Сбросить цвета',  
                        uk: 'Скинути кольори',  
                        en: 'Reset colors'  
                    }  
                });  
            }  
              
            // Додаємо компонент в налаштування  
            Lampa.SettingsApi.addComponent({  
                component: 'unified_buttons',  
                icon: `<svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">  
                    <rect x="2" y="2" width="26" height="26" rx="4" stroke="currentColor" stroke-width="2"/>  
                    <circle cx="8" cy="8" r="2" fill="currentColor"/>  
                    <circle cx="22" cy="8" r="2" fill="currentColor"/>  
                    <circle cx="8" cy="22" r="2" fill="currentColor"/>  
                    <circle cx="22" cy="22" r="2" fill="currentColor"/>  
                    <circle cx="15" cy="15" r="2" fill="currentColor"/>  
                </svg>`,  
                name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_title') : 'Button Manager'  
            });  
              
            // Ввімкнення/вимкнення плагіна  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_enabled',  
                    type: 'trigger',  
                    default: true  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_enabled') : 'Enable button manager'  
                },  
                onChange: applySettings  
            });  
              
            // Приховування кнопки джерел  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_hide_sources',  
                    type: 'trigger',  
                    default: true  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_hide_sources') : 'Hide "Sources" button'  
                }  
            });  
              
            // Заголовок для налаштувань кольорів  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    type: 'title'  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_colors') : 'Button color settings'  
                }  
            });  
              
            // Функція для оновлення кольорів  
            const updateColors = () => {  
                const colors = {  
                    online: Lampa.Storage.get('unified_buttons_color_online', ''),  
                    torrent: Lampa.Storage.get('unified_buttons_color_torrent', ''),  
                    trailer: Lampa.Storage.get('unified_buttons_color_trailer', ''),  
                    play: Lampa.Storage.get('unified_buttons_color_play', '')  
                };  
                updateButtonColors(colors);  
            };  
              
            // Колір кнопки "Онлайн"  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_color_online',  
                    type: 'input',  
                    placeholder: '#2196f3'  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_color_online') : 'Online button color',  
                    description: 'Наприклад: #2196f3 або blue'  
                },  
                onChange: updateColors  
            });  
              
            // Колір кнопки "Торрент"  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_color_torrent',  
                    type: 'input',  
                    placeholder: 'lime'  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_color_torrent') : 'Torrent button color',  
                    description: 'Наприклад: lime або #00ff00'  
                },  
                onChange: updateColors  
            });  
              
            // Колір кнопки "Трейлер"  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_color_trailer',  
                    type: 'input',  
                    placeholder: '#f44336'  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_color_trailer') : 'Trailer button color',  
                    description: 'Наприклад: #f44336 або red'  
                },  
                onChange: updateColors  
            });  
              
            // Колір кнопки "Дивитись"  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_color_play',  
                    type: 'input',  
                    placeholder: '#2196f3'  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_color_play') : 'Play button color',  
                    description: 'Наприклад: #2196f3 або blue'  
                },  
                onChange: updateColors  
            });  
              
            // Кнопка скидання кольорів  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'unified_buttons_reset_colors',  
                    type: 'button'  
                },  
                field: {  
                    name: Lampa.Lang ? Lampa.Lang.translate('unified_buttons_reset_colors') : 'Reset colors'  
                },  
                onChange: () => {  
                    try {  
                        // Видаляємо збережені кольори  
                        Lampa.Storage.set('unified_buttons_color_online', '');  
                        Lampa.Storage.set('unified_buttons_color_torrent', '');  
                        Lampa.Storage.set('unified_buttons_color_trailer', '');  
                        Lampa.Storage.set('unified_buttons_color_play', '');  
                          
                        // Видаляємо кастомні стилі  
                        $('#unified-buttons-custom-colors').remove();  
                          
                        // Повертаємо стандартні кольори  
                        addStyles();  
                          
                        if (Lampa.Noty) {  
                            Lampa.Noty.show('Кольори скинуто до стандартних');  
                        }  
                    } catch (e) {  
                        console.error(`${PLUGIN_NAME}: Помилка скидання кольорів`, e);  
                    }  
                }  
            });  
              
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка додавання налаштувань`, e);  
        }  
    }
    /* === Ініціалізація плагіна === */  
    function initPlugin() {  
        try {  
            if (typeof Lampa === 'undefined') {  
                setTimeout(initPlugin, 100);  
                return;  
            }  
              
            // Додаємо налаштування  
            addSettings();  
              
            // Застосовуємо налаштування одразу  
            applySettings();  
              
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
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка ініціалізації плагіна`, e);  
        }  
    }  
        
    /* === Обробка кнопок === */  
    function processButtons(event) {  
        try {  
            // Перевіряємо чи увімкнено плагін  
            if (!Lampa.Storage.get('unified_buttons_enabled', true)) {  
                return;  
            }  
              
            const render = event.object.activity.render();  
                
            // Шукаємо контейнери різними способами  
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
                
            // Переміщуємо кнопки  
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
        
    /* === Видалення непотрібних кнопок === */  
    function removeSourcesButton(mainContainer) {  
        try {  
            const allButtons = mainContainer.find('.full-start__button');  
            const isVersion3OrHigher = isLampaVersionOrHigher('3.0.0');  
            const hideSources = Lampa.Storage.get('unified_buttons_hide_sources', true);  
                
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
                    
                if (!isImportantButton &&     
                    ((isPlayButton && !isVersion3OrHigher) ||     
                     (isSourcesButton && hideSources) ||     
                     (isOptionsButton && isEmpty))) {  
                    button.remove();  
                }  
            });  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка видалення кнопок`, e);  
        }  
    }  
        
    /* === Перевпорядкування кнопок === */  
    function reorderButtons(container) {  
        try {  
            container.css('display', 'flex');  
                
            container.find('.full-start__button').each(function() {  
                const button = $(this);  
                const classes = button.attr('class') || '';  
                const text = button.text().toLowerCase();  
                    
                let order = 999;  
                    
                if (classes.includes('button--play') || text.includes('дивитись') || text.includes('watch')) {  
                    order = 0;  
                } else if (classes.includes('view--online') || text.includes('онлайн')) {  
                    order = 1;  
                } else if (classes.includes('view--torrent') || text.includes('торрент')) {  
                    order = 2;  
                } else if (classes.includes('view--trailer') || text.includes('трейлер')) {  
                    order = 3;  
                }  
                    
                button.css('order', order);  
            });  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка перевпорядкування кнопок`, e);  
        }  
    }  
  
    /* === Оновлення кнопок та SVG === */  
    function updateButtons() {  
        try {  
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
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка оновлення кнопок`, e);  
        }  
    }
    /* === Observer для динамічних змін === */  
    function startObserver(event) {  
        try {  
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
                                const hideSources = Lampa.Storage.get('unified_buttons_hide_sources', true);  
                                    
                                if (!isImportantButton &&     
                                    ((isPlayButton && !isVersion3OrHigher) ||     
                                     (isSourcesButton && hideSources) ||     
                                     (isOptionsButton && isEmpty))) {  
                                    $(node).remove();  
                                }  
                            }  
                        });  
                            
                        // Оновлюємо SVG після змін в DOM  
                        setTimeout(updateButtons, 50);  
                    }  
                });  
            });  
                
            observer.observe(mainContainer, {  
                childList: true,  
                subtree: false  
            });  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка запуску observer`, e);  
        }  
    }  
        
    /* === Зупинка observer === */  
    function stopObserver() {  
        try {  
            if (observer) {  
                observer.disconnect();  
                observer = null;  
            }  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка зупинки observer`, e);  
        }  
    }  
        
    /* === Реєстрація плагіна === */  
    if (window.plugin) {  
        try {  
            window.plugin('unified_button_manager', {  
                type: 'component',  
                name: 'Unified Button Manager',  
                version: '4.4',  
                author: 'Enhanced Plugin',  
                description: 'Об\'єднаний плагін: розділення кнопок + оптимізовані SVG та стилі з підтримкою Lampa 3.0.0+ та налаштуваннями'  
            });  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка реєстрації плагіна`, e);  
        }  
    }  
        
    /* === Ініціалізація === */  
    try {  
        if (document.readyState === 'loading') {  
            document.addEventListener('DOMContentLoaded', initPlugin);  
        } else {  
            initPlugin();  
        }  
    } catch (e) {  
        console.error(`${PLUGIN_NAME}: Помилка ініціалізації`, e);  
    }  
        
})();