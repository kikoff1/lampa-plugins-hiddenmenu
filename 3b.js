// Версія плагіну: 5.2 - Виправлена версія з правильним порядком кнопок  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери + оптимізовані SVG та стилі  
// Підтримка кнопки "Дивитись" для Lampa 3.0.0+ + меню налаштувань  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'UnifiedButtonManager';  
    let observer = null;  
    let initialized = false;  
      
    // Налаштування за замовчуванням  
    const defaultSettings = {  
        separateButtons: true,  
        customIcons: true,  
        coloredIcons: true  
    };  
      
    // Безпечне отримання налаштувань  
    function getSettings() {  
        try {  
            if (!Lampa || !Lampa.Storage) return defaultSettings;  
            const saved = Lampa.Storage.get('unified_button_settings', '{}');  
            return Object.assign({}, defaultSettings, JSON.parse(saved));  
        } catch (e) {  
            console.warn(`${PLUGIN_NAME}: Помилка отримання налаштувань`, e);  
            return defaultSettings;  
        }  
    }  
      
    // Безпечне збереження налаштувань  
    function saveSettings(settings) {  
        try {  
            if (Lampa && Lampa.Storage) {  
                Lampa.Storage.set('unified_button_settings', JSON.stringify(settings));  
            }  
        } catch (e) {  
            console.warn(`${PLUGIN_NAME}: Помилка збереження налаштувань`, e);  
        }  
    }  
      
    // Перевірка версії Lampa з обробкою помилок  
    function isLampaVersionOrHigher(minVersion) {  
        try {  
            if (!window.Lampa || !window.Lampa.Manifest) return false;  
              
            let version = null;  
              
            if (window.Lampa.Manifest && window.Lampa.Manifest.app_version) {  
                version = window.Lampa.Manifest.app_version;  
            } else if (window.lampa_settings && window.lampa_settings.version) {  
                version = window.lampa_settings.version;  
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
      
    // Додавання стилів з перевіркою  
    function addStyles() {  
        try {  
            const existing = document.getElementById('unified-buttons-style');  
            if (existing) existing.remove();  
              
            const settings = getSettings();  
            const style = document.createElement('style');  
            style.id = 'unified-buttons-style';  
              
            let cssContent = `  
                .full-start__button {  
                    position: relative !important;  
                    transition: transform 0.2s ease !important;  
                }  
                .full-start__button:active {  
                    transform: scale(0.98) !important;  
                }  
                .full-start__button svg {  
                    width: 1.5em !important;  
                    height: 1.5em !important;  
                }  
            `;  
              
            if (settings.coloredIcons && settings.customIcons) {  
                cssContent += `  
                    .full-start__button.view--online svg path { fill: #2196f3 !important; }  
                    .full-start__button.view--torrent svg path { fill: lime !important; }  
                    .full-start__button.view--trailer svg path { fill: #f44336 !important; }  
                    .full-start__button.button--play svg path { fill: #2196f3 !important; }  
                `;  
            }  
              
            cssContent += `  
                @media (max-width: 767px) {  
                    .full-start__button {  
                        min-height: 44px !important;  
                        padding: 10px !important;  
                    }  
                }  
            `;  
              
            style.textContent = cssContent;  
            document.head.appendChild(style);  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка додавання стилів`, e);  
        }  
    }  
      
    // SVG іконки  
    const svgs = {  
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z" fill="currentColor"/></svg>`,  
        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`,  
        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z" fill="currentColor"/></svg>`,  
        play: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z" fill="currentColor"/></svg>`  
    };  
      
    /* === Додавання налаштувань === */  
    function addSettings() {  
        try {  
            // Додаємо компонент налаштувань  
            Lampa.SettingsApi.addComponent({  
                component: 'unified_buttons',  
                icon: `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                    <rect x="2" y="8" width="34" height="21" rx="3" stroke="white" stroke-width="3"/>  
                    <circle cx="9" cy="18" r="2" fill="white"/>  
                    <circle cx="19" cy="18" r="2" fill="white"/>  
                    <circle cx="29" cy="18" r="2" fill="white"/>  
                </svg>`,  
                name: 'Налаштування 3 кнопок'  
            });  
              
            // Параметр 1: Розділити всі кнопки  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'separateButtons',  
                    type: 'trigger',  
                    default: defaultSettings.separateButtons  
                },  
                field: {  
                    name: 'Розділити всі кнопки',  
                    description: 'Розділяти кнопки Онлайн, Торренти, Трейлери'  
                },  
                onChange: () => {  
                    const settings = getSettings();  
                    settings.separateButtons = !settings.separateButtons;  
                    saveSettings(settings);  
                    addStyles();  
                    // Перезавантажуємо сторінку для застосування змін  
                    setTimeout(() => {  
                        window.location.reload();  
                    }, 100);  
                }  
            });  
              
            // Параметр 2: Замінити іконки  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'customIcons',  
                    type: 'trigger',  
                    default: defaultSettings.customIcons  
                },  
                field: {  
                    name: 'Замінити іконки',  
                    description: 'Використовувати нові іконки замість стандартних'  
                },  
                onChange: () => {  
                    const settings = getSettings();  
                    settings.customIcons = !settings.customIcons;  
                    saveSettings(settings);  
                    addStyles();  
                    setTimeout(updateButtons, 100);  
                }  
            });  
              
            // Параметр 3: Кольорові іконки  
            Lampa.SettingsApi.addParam({  
                component: 'unified_buttons',  
                param: {  
                    name: 'coloredIcons',  
                    type: 'trigger',  
                    default: defaultSettings.coloredIcons  
                },  
                field: {  
                    name: 'Кольорові іконки',  
                    description: 'Застосовувати кольорові іконки'  
                },  
                onChange: () => {  
                    const settings = getSettings();  
                    settings.coloredIcons = !settings.coloredIcons;  
                    saveSettings(settings);  
                    addStyles();  
                }  
            });  
              
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка додавання налаштувань`, e);  
        }  
    }
    // Оновлення іконок з перевіркою  
    function updateButtons() {  
        try {  
            const settings = getSettings();  
            if (!settings.customIcons) return;  
              
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
                    oldSvg.html(newSvg.html());  
                      
                    if (newSvg.attr('viewBox')) {  
                        oldSvg.attr('viewBox', newSvg.attr('viewBox'));  
                    }  
                });  
            }  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка оновлення іконок`, e);  
        }  
    }  
      
    // Обробка кнопок з виправленим порядком  
    function processButtons(event) {  
        try {  
            const settings = getSettings();  
            if (!settings.separateButtons) return;  
              
            const render = event.object.activity.render();  
            if (!render) return;  
              
            let mainContainer = render.find('.full-start-new__buttons');  
            if (!mainContainer.length) {  
                mainContainer = render.find('.full-start__buttons');  
            }  
              
            if (!mainContainer.length) return;  
              
            const hiddenContainer = render.find('.buttons--container');  
              
            // Збираємо всі кнопки, які потрібно перемістити  
            const buttonsToMove = [];  
              
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                buttonsToMove.push(torrentBtn);  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                buttonsToMove.push(trailerBtn);  
            }  
              
            // Вставляємо кнопки після кнопки "Онлайн" (якщо вона є) або після "Дивитись"  
            const onlineBtn = mainContainer.find('.view--online');  
            const playBtn = mainContainer.find('.button--play');  
              
            let insertAfter = null;  
            if (onlineBtn.length > 0) {  
                insertAfter = onlineBtn;  
            } else if (playBtn.length > 0) {  
                insertAfter = playBtn;  
            }  
              
            if (insertAfter && insertAfter.length > 0) {  
                buttonsToMove.forEach(btn => {  
                    insertAfter.after(btn);  
                });  
            } else {  
                // Якщо не знайдено основних кнопок, додаємо в початок  
                buttonsToMove.forEach(btn => {  
                    mainContainer.prepend(btn);  
                });  
            }  
              
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
                reorderButtons(mainContainer); // Сортуємо після всіх змін  
            }, 200);  
              
            setTimeout(() => {  
                updateButtons();  
            }, 300);  
              
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка обробки кнопок`, e);  
        }  
    }  
      
    // Виправлена функція сортування кнопок  
    function reorderButtons(container) {  
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
            } else if (classes.includes('button--book') || text.includes('додати') || text.includes('зберегти')) {  
                order = 4;  
            } else if (classes.includes('button--reaction')) {  
                order = 5;  
            } else if (classes.includes('button--subscribe') || classes.includes('button--subs')) {  
                order = 6;  
            } else if (classes.includes('button--options')) {  
                order = 7;  
            }  
              
            button.css('order', order);  
        });  
    }  
      
    // Спостерігач за змінами  
    function startObserver(event) {  
        try {  
            const render = event.object.activity.render();  
            const mainContainer = render.find('.full-start-new__buttons')[0];  
              
            if (!mainContainer) return;  
              
            observer = new MutationObserver((mutations) => {  
                mutations.forEach((mutation) => {  
                    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                        setTimeout(updateButtons, 50);  
                    }  
                });  
            });  
              
            observer.observe(mainContainer, {  
                childList: true,  
                subtree: false  
            });  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка запуску спостерігача`, e);  
        }  
    }  
      
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
        }  
    }
    // Реєстрація плагіна  
    function registerPlugin() {  
        try {  
            if (window.plugin) {  
                window.plugin('unified_button_manager', {  
                    type: 'component',  
                    name: 'Unified Button Manager',  
                    version: '5.2',  
                    author: 'Merged Plugin',  
                    description: 'Об\'єднаний плагін: розділення кнопок + оптимізовані SVG та стилі з налаштуваннями'  
                });  
            }  
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка реєстрації плагіна`, e);  
        }  
    }  
      
    // Ініціалізація плагіна  
    function initPlugin() {  
        if (initialized) return;  
          
        try {  
            if (typeof Lampa === 'undefined') {  
                setTimeout(initPlugin, 100);  
                return;  
            }  
              
            // Перевіряємо чи готові API налаштувань  
            if (!Lampa.SettingsApi) {  
                setTimeout(initPlugin, 200);  
                return;  
            }  
              
            addSettings();  
            addStyles();  
              
            Lampa.Listener.follow('full', function(event) {  
                if (event.type === 'complite') {  
                    setTimeout(() => {  
                        processButtons(event);  
                    }, 500);  
                }  
            });  
              
            registerPlugin();  
            initialized = true;  
            console.log(`${PLUGIN_NAME}: Плагін успішно ініціалізовано`);  
              
        } catch (e) {  
            console.error(`${PLUGIN_NAME}: Помилка ініціалізації`, e);  
        }  
    }  
      
    // Запуск плагіна  
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        // Невелика затримка для гарантування завантаження Lampa  
        setTimeout(initPlugin, 100);  
    }  
      
})();