// Версія плагіну: 3.3 - З логуванням натискань на кнопки  
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
          
        // Показуємо повідомлення через Noty  
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
          
        // Додаємо кнопку для показу детального звіту  
        setTimeout(() => {  
            addDebugButton();  
        }, 2000);  
    }  
      
    function addDebugButton() {  
        // Додаємо кнопку в меню для показу звіту  
        if (typeof Lampa !== 'undefined' && Lampa.SettingsApi) {  
            Lampa.SettingsApi.addParam({  
                component: 'more',  
                param: {  
                    name: 'button_separator_debug',  
                    type: 'button',  
                },  
                field: {  
                    name: 'Звіт ButtonSeparator',  
                },  
                onChange: () => {  
                    showDetailedReport();  
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
                showDebug('❌ Контейнер не знайдено', true);  
                return;  
            }  
              
            showDebug('✓ Контейнер знайдено');  
              
            // Знаходимо приховані оригінальні кнопки  
            const torrentBtn = hiddenContainer.find('.view--torrent');  
            const trailerBtn = hiddenContainer.find('.view--trailer');  
              
            showDebug(`Торрент: ${torrentBtn.length}, Трейлер: ${trailerBtn.length}`);  
              
            // Переміщуємо приховані кнопки в основний контейнер  
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
              
            // Видаляємо порожню кнопку "Джерела"  
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
            }, 150);  
              
            // Додаємо логування натискань на всі кнопки  
            addButtonClickLogging(mainContainer);  
              
            // Сортуємо через CSS order  
            reorderButtons(mainContainer);  
              
            // Оновлюємо навігацію  
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 200);  
            }  
              
        } catch (error) {  
            showDebug(`❌ Помилка: ${error.message}`, true);  
        }  
    }  
      
    // НОВА ФУНКЦІЯ: Додавання логування натискань на кнопки  
    function addButtonClickLogging(container) {  
        const allButtons = container.find('.full-start__button');  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().trim() || '(порожня)';  
            const classes = button.attr('class') || '';  
              
            // Додаємо обробник події hover:enter  
            button.on('hover:enter', function(e) {  
                showDebug(`🖱 НАТИСНУТО: "${text}" | Класи: ${classes}`);  
                  
                // Відстежуємо, що відкривається після натискання  
                setTimeout(() => {  
                    const activeController = Lampa.Controller.enabled();  
                    const activeActivity = Lampa.Activity.active();  
                      
                    if (activeController) {  
                        showDebug(`📂 Відкрито контролер: ${activeController.name || 'невідомо'}`);  
                    }  
                      
                    if (activeActivity && activeActivity.component) {  
                        showDebug(`📄 Відкрито компонент: ${activeActivity.component || 'невідомо'}`);  
                    }  
                }, 500);  
            });  
              
            // Також логуємо hover:hover для відстеження фокусу  
            button.on('hover:hover', function(e) {  
                showDebug(`👆 Фокус на: "${text}"`);  
            });  
        });  
          
        showDebug(`✓ Додано логування для ${allButtons.length} кнопок`);  
    }  
      
    function removeSourcesButton(mainContainer) {  
        const allButtons = mainContainer.find('.full-start__button');  
          
        showDebug(`Перевірка ${allButtons.length} кнопок`);  
          
        allButtons.each(function() {  
            const button = $(this);  
            const text = button.text().toLowerCase().trim();  
            const classes = button.attr('class') || '';  
              
            // Список важливих кнопок  
            const isImportantButton = classes.includes('view--online') ||   
                                     classes.includes('view--torrent') ||   
                                     classes.includes('view--trailer') ||  
                                     classes.includes('button--play') ||  
                                     classes.includes('button--book') ||  
                                     classes.includes('button--reaction') ||  
                                     classes.includes('button--subscribe') ||  
                                     classes.includes('button--subs');  
              
            // ВИКЛЮЧЕННЯ: button--options тільки якщо вона НЕ порожня  
            const isOptionsButton = classes.includes('button--options');  
              
            // Перевіряємо чи це кнопка "Джерела"  
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('джерело') ||  
                                   text.includes('sources') ||   
                                   text.includes('source') ||  
                                   text.includes('источники') ||  
                                   text.includes('источник');  
              
            // Перевіряємо чи кнопка порожня  
            const isEmpty = text === '' || text.length <= 2;  
              
            // Видаляємо якщо:  
            // 1. Це кнопка джерел АБО  
            // 2. Це порожня кнопка без важливих класів АБО  
            // 3. Це порожня кнопка options  
            if (!isImportantButton && (isSourcesButton || isEmpty || (isOptionsButton && isEmpty))) {  
                showDebug(`🗑 Видаляємо кнопку: "${text}" (класи: ${classes})`);  
                button.remove();  
            }  
        });  
          
        // Якщо нічого не видалено, виводимо список  
        const remainingButtons = mainContainer.find('.full-start__button');  
        if (remainingButtons.length === allButtons.length) {  
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
                                                     classes.includes('button--play') ||  
                                                     classes.includes('button--book') ||  
                                                     classes.includes('button--reaction') ||  
                                                     classes.includes('button--subscribe') ||  
                                                     classes.includes('button--subs') ||  
                                                     classes.includes('button--options');  
                              
                            const isSourcesButton = text.includes('джерела') ||   
                                                   text.includes('джерело') ||  
                                                   text.includes('sources') ||   
                                                   text.includes('source') ||  
                                                   text.includes('источники') ||  
                                                   text.includes('источник');  
                              
                            const isEmpty = text === '' || text.length <= 2;  
                              
                            if (!isImportantButton && (isSourcesButton || isEmpty)) {  
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