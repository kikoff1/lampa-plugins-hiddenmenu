// Версія плагіну: 3.4 - Видалення кнопки "Дивитись"  
// Розділяє кнопки окремо: Онлайн, Торренти, Трейлери  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'ButtonSeparator';  
    let observer = null;  
    let debugLogs = [];  
      
    // Функція для виведення повідомлень на екран  
    function showDebug(message, isError = false) {  
        debugLogs.push(message);  
        console.log(`${PLUGIN_NAME}: ${message}`);  
          
        if (typeof Lampa !== 'undefined' && Lampa.Noty) {  
            Lampa.Noty.show(message, {  
                time: isError ? 5000 : 3000,  
                class: isError ? 'error' : 'info'  
            });  
        }  
    }  
      
    // Функція для показу детального звіту з можливістю копіювання  
    function showDetailedReport() {  
        if (typeof Lampa !== 'undefined' && Lampa.Modal) {  
            const report = debugLogs.join('\n');  
            const reportHtml = debugLogs.join('<br>');  
              
            const content = $('<div class="about"><div style="max-height: 400px; overflow-y: auto; user-select: text; -webkit-user-select: text;">' + reportHtml + '</div></div>');  
              
            Lampa.Modal.open({  
                title: 'Звіт плагіна ButtonSeparator',  
                html: content,  
                size: 'medium',  
                buttons: [{  
                    name: 'Копіювати звіт',  
                    onSelect: () => {  
                        Lampa.Utils.copyTextToClipboard(report, () => {  
                            Lampa.Noty.show('✓ Звіт скопійовано в буфер обміну');  
                        }, () => {  
                            Lampa.Noty.show('❌ Помилка копіювання');  
                        });  
                    }  
                }],  
                onBack: () => {  
                    Lampa.Modal.close();  
                    Lampa.Controller.toggle('settings_component');  
                }  
            });  
        }  
    }  
      
    function initPlugin() {  
        if (typeof Lampa === 'undefined') {  
            setTimeout(initPlugin, 100);  
            return;  
        }  
          
        showDebug('Запуск плагіна');  
          
        Lampa.Listener.follow('full', function(event) {  
            if (event.type === 'complite') {  
                setTimeout(() => {  
                    processButtons(event);  
                    startObserver(event);  
                }, 300);  
            }  
              
            if (event.type === 'destroy') {  
                stopObserver();  
            }  
        });  
          
        setTimeout(() => {  
            addDebugButton();  
        }, 2000);  
    }  
      
    function addDebugButton() {  
        if (typeof Lampa !== 'undefined' && Lampa.SettingsApi) {  
            Lampa.SettingsApi.addParam({  
                component: 'more',  
                param: {  
                    name: 'button_separator_report',  
                    type: 'button',  
                    label: 'Звіт ButtonSeparator'  
                },  
                onRender: (item) => {  
                    item.on('hover:enter', () => {  
                        showDetailedReport();  
                    });  
                }  
            });  
        }  
    }  
      
    function processButtons(event) {  
        try {  
            const render = event.object.activity.render();  
            const mainContainer = render.find('.full-start-new__buttons');  
            const hiddenContainer = render.find('.buttons--container');  
              
            if (!mainContainer.length) {  
                showDebug('⚠ Контейнер не знайдено', true);  
                return;  
            }  
              
            showDebug('✓ Контейнер знайдено');  
              
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            showDebug(`Торрент: ${torrentBtn.length}, Трейлер: ${trailerBtn.length}`);  
              
            if (torrentBtn.length > 0) {  
                torrentBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(torrentBtn);  
                showDebug('✓ Додано кнопку Торрентів');  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
                showDebug('✓ Додано кнопку Трейлерів');  
            }  
              
            addButtonClickLogging(mainContainer);  
              
            reorderButtons(mainContainer);  
              
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
            }, 150);  
              
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 200);  
            }  
              
        } catch (error) {  
            showDebug('❌ Помилка: ' + error.message, true);  
        }  
    }  
      
    function addButtonClickLogging(mainContainer) {  
        const buttons = mainContainer.find('.full-start__button');  
          
        showDebug(`✓ Додано логування для ${buttons.length} кнопок`);  
          
        buttons.each(function() {  
            const button = $(this);  
              
            button.on('hover:enter', function() {  
                const text = button.text().trim();  
                const classes = button.attr('class') || '';  
                  
                showDebug(`🖱 НАТИСНУТО: "${text}" | Класи: ${classes}`);  
                  
                setTimeout(() => {  
                    const activeController = Lampa.Controller.enabled();  
                    if (activeController && activeController.name) {  
                        showDebug(`📂 Відкрито контролер: ${activeController.name}`);  
                    }  
                      
                    const activeActivity = Lampa.Activity.active();  
                    if (activeActivity && activeActivity.component) {  
                        showDebug(`📄 Відкрито компонент: ${activeActivity.component}`);  
                    }  
                }, 100);  
            });  
        });  
    }  
      
    function removeSourcesButton(mainContainer) {  
        const allButtons = mainContainer.find('.full-start__button');  
          
        showDebug(`Перевірка ${allButtons.length} кнопок`);  
          
        let removedCount = 0;  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
              
            // Список важливих кнопок (БЕЗ button--play)  
            const isImportantButton = classes.includes('view--online') ||   
                                     classes.includes('view--torrent') ||   
                                     classes.includes('view--trailer') ||  
                                     classes.includes('button--book') ||  
                                     classes.includes('button--reaction') ||  
                                     classes.includes('button--subscribe') ||  
                                     classes.includes('button--subs');  
              
            // Перевіряємо чи це кнопка "Дивитись"  
            const isPlayButton = classes.includes('button--play');  
              
            // Перевіряємо чи це кнопка "Джерела"  
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('джерело') ||  
                                   text.includes('sources') ||   
                                   text.includes('source') ||  
                                   text.includes('источники') ||  
                                   text.includes('источник');  
              
            // Перевіряємо чи це порожня кнопка options  
            const isOptionsButton = classes.includes('button--options');  
            const isEmpty = text === '' || text.length <= 2;  
              
            // Видаляємо якщо:  
            // 1. Це кнопка "Дивитись" АБО  
            // 2. Це кнопка джерел АБО  
            // 3. Це порожня кнопка options  
            if (!isImportantButton && (isPlayButton || isSourcesButton || (isOptionsButton && isEmpty))) {  
                showDebug(`🗑 Видаляємо кнопку: "${text}" (класи: ${classes})`);  
                button.remove();  
                removedCount++;  
            }  
        });  
          
        if (removedCount === 0) {  
            const remainingButtons = mainContainer.find('.full-start__button');  
            showDebug(`⚠ Жодної кнопки не видалено. Список всіх кнопок:`);  
            remainingButtons.each(function() {  
                const btn = $(this);  
                showDebug(`📋 Кнопка: "${btn.text().toLowerCase().trim()}" | Класи: ${btn.attr('class')}`);  
            });  
        }  
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
          
        showDebug('✓ Сортування завершено');  
    }  
      
    function startObserver(event) {  
        const render = event.object.activity.render();  
        const mainContainer = render.find('.full-start-new__buttons')[0];  
          
        if (!mainContainer) return;  
          
        observer = new MutationObserver((mutations) => {  
            mutations.forEach((mutation) => {  
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                    mutation.addedNodes.forEach((node) => {  
                        if (node.nodeType === 1 && node.classList && node.classList.contains('full-start__button')) {  
                            const text = $(node).text().toLowerCase().trim();  
                            const classes = $(node).attr('class') || '';  
                              
                            const isImportantButton = classes.includes('view--online') ||   
                                                     classes.includes('view--torrent') ||   
                                                     classes.includes('view--trailer') ||  
                                                     classes.includes('button--book') ||  
                                                     classes.includes('button--reaction') ||  
                                                     classes.includes('button--subscribe') ||  
                                                     classes.includes('button--subs');  
                              
                            const isPlayButton = classes.includes('button--play');  
                              
                            const isSourcesButton = text.includes('джерела') ||   
                                                   text.includes('джерело') ||  
                                                   text.includes('sources') ||   
                                                   text.includes('source') ||  
                                                   text.includes('источники') ||  
                                                   text.includes('источник');  
                              
                            const isOptionsButton = classes.includes('button--options');  
                            const isEmpty = text === '' || text.length <= 2;  
                              
                            if (!isImportantButton && (isPlayButton || isSourcesButton || (isOptionsButton && isEmpty))) {  
                                showDebug(`🔍 Observer видаляє кнопку: "${text}"`);  
                                $(node).remove();  
                            }  
                        }  
                    });  
                }  
            });  
        });  
          
        observer.observe(mainContainer, {  
            childList: true,  
            subtree: false  
        });  
          
        showDebug('✓ Observer запущено');  
    }  
      
    function stopObserver() {  
        if (observer) {  
            observer.disconnect();  
            observer = null;  
            showDebug('✓ Observer зупинено');  
        }  
    }  
      
    if (document.readyState === 'loading') {  
        document.addEventListener('DOMContentLoaded', initPlugin);  
    } else {  
        initPlugin();  
    }  
      
})();