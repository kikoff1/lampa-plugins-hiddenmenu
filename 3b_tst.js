// Версія плагіну: 5.0 - Спрощена версія  
// Базується на перевіреному патерні online_prestige  
  
(function() {  
    'use strict';  
      
    const PLUGIN_NAME = 'UnifiedButtonManager';  
      
    // Перевіряємо, чи плагін вже завантажено  
    if (window.unified_button_manager_ready) return;  
      
    function startPlugin() {  
        window.unified_button_manager_ready = true;  
          
        // Створюємо компонент  
        const UnifiedButtonManager = {  
            create: function(data) {  
                this.data = data;  
                this.container = $('<div></div>');  
                return this.render();  
            },  
              
            render: function() {  
                // Простий рендер без складної логіки  
                return this.container;  
            },  
              
            destroy: function() {  
                this.container.remove();  
            }  
        };  
          
        // Реєструємо компонент  
        Lampa.Component.add('unified_button_manager', UnifiedButtonManager);  
          
        // Додаємо кнопку на сторінку фільму  
        Lampa.Listener.follow('full', (e) => {  
            if (e.type === 'complite') {  
                addButtonToPage(e);  
            }  
        });  
          
        function addButtonToPage(event) {  
            // Проста логіка додавання кнопки  
            const button = $(`  
                <div class="full-start__button selector view--unified" data-subtitle="Unified Manager v5.0">  
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">  
                        <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor"/>  
                        <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>  
                        <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>  
                    </svg>  
                    <span>#{title_unified_manager}</span>  
                </div>  
            `);  
              
            button.on('hover:enter', () => {  
                Lampa.Activity.push({  
                    component: 'unified_button_manager',  
                    title: 'Unified Manager',  
                    movie: event.data.movie  
                });  
            });  
              
            // Додаємо кнопку після існуючих  
            const render = event.object.activity.render();  
            const existingButton = render.find('.view--torrent').first();  
            if (existingButton.length) {  
                existingButton.after(button);  
            } else {  
                render.find('.full-start-new__buttons').append(button);  
            }  
        }  
    }  
      
    // Запускаємо плагін  
    if (window.appready) {  
        startPlugin();  
    } else {  
        Lampa.Listener.follow('app', (e) => {  
            if (e.type === 'ready') startPlugin();  
        });  
    }  
      
    // Реєстрація плагіна  
    if (window.plugin) {  
        window.plugin('unified_button_manager', {  
            type: 'component',  
            name: 'Unified Button Manager',  
            version: '5.0',  
            description: 'Спрощений менеджер кнопок для Lampa'  
        });  
    }  
      
})();