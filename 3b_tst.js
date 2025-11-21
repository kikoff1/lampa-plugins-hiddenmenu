// Версія плагіну: 3.1 - З візуальним логуванням для телефону  
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
      
    // Функція для показу детального звіту  
    function showDetailedReport() {  
        if (typeof Lampa !== 'undefined' && Lampa.Modal) {  
            const report = debugLogs.join('<br>');  
            Lampa.Modal.open({  
                title: 'Звіт плагіна ButtonSeparator',  
                html: $('<div class="about"><div style="max-height: 400px; overflow-y: auto;">' + report + '</div></div>'),  
                size: 'medium',  
                onBack: () => Lampa.Modal.close()  
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
            } else {  
                showDebug('⚠ Кнопка Торрентів не знайдена');  
            }  
              
            if (trailerBtn.length > 0) {  
                trailerBtn.removeClass('hide').addClass('selector');  
                mainContainer.append(trailerBtn);  
                showDebug('✓ Додано кнопку Трейлерів');  
            } else {  
                showDebug('⚠ Кнопка Трейлерів не знайдена');  
            }  
              
            // Видаляємо порожню кнопку "Джерела"  
            setTimeout(() => {  
                removeSourcesButton(mainContainer);  
            }, 150);  
              
            // Сортуємо через CSS order  
            reorderButtons(mainContainer);  
              
            // Оновлюємо навігацію  
            if (Lampa.Controller) {  
                setTimeout(() => {  
                    Lampa.Controller.collectionSet(mainContainer.parent());  
                }, 200);  
            }  
              
        } catch (error) {  
            showDebug('❌ Помилка: ' + error.message, true);  
        }  
    }  
      
    function removeSourcesButton(container) {  
        const allButtons = container.find('.full-start__button');  
          
        showDebug(`Перевірка ${allButtons.length} кнопок`);  
          
        let removedCount = 0;  
          
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
                                     classes.includes('button--options');  
              
            // Перевіряємо чи це кнопка "Джерела"  
            const isSourcesButton = text.includes('джерела') ||   
                                   text.includes('джерело') ||  
                                   text.includes('sources') ||   
                                   text.includes('source') ||  
                                   text.includes('источники') ||  
                                   text.includes('источник');  
              
            const isEmpty = text === '' || text.length <= 2;  
              
            if (!isImportantButton && (isSourcesButton || isEmpty)) {  
                showDebug(`🗑 Видаляємо: "${text}" (класи: ${classes.substring(0, 50)})`);  
                button.remove();  
                removedCount++;  
            }  
        });  
          
        if (removedCount === 0) {  
            showDebug('⚠ Жодної кнопки "Джерела" не видалено');  
              
            // Виводимо список всіх кнопок для діагностики  
            allButtons.each(function() {  
                const button = $(this);  
                const text = button.text().toLowerCase().trim();  
                const classes = button.attr('class') || '';  
                showDebug(`📋 Кнопка: "${text.substring(0, 20)}" | Класи: ${classes.substring(0, 40)}`);  
            });  
        } else {  
            showDebug(`✓ Видалено ${removedCount} кнопок`);  
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
          
        stopObserver();  
          
        observer = new MutationObserver(function(mutations) {  
            mutations.forEach(function(mutation) {  
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {  
                    mutation.addedNodes.forEach(function(node) {  
                        if (node.nodeType === 1 && $(node).hasClass('full-start__button')) {  
                            const text = $(node).text().toLowerCase().trim();  
                            const classes = $(node).attr('class') || '';  
                              
                            const isImportantButton = classes.includes('view--online') ||   
                                                     classes.includes('view--torrent') ||   
                                                     classes.includes('view--trailer') ||  
                                                     classes.includes('button--play') ||  
                                                     classes.includes('button--book') ||  
                                                     classes.includes('button--reaction') ||  
                                                     classes.includes('button--subscribe') ||  
                                                     classes.includes('button--options');  
                              
                            const isSourcesButton = text.includes('джерела') ||   
                                                   text.includes('джерело') ||  
                                                   text.includes('sources') ||   
                                                   text.includes('source') ||  
                                                   text.includes('источники') ||  
                                                   text.includes('источник');  
                              
                            const isEmpty = text === '' || text.length <= 2;  
                              
                            if (!isImportantButton && (isSourcesButton || isEmpty)) {  
                                showDebug(`🔍 Observer видаляє: "${text}"`);  
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