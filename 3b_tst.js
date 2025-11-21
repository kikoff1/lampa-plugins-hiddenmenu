// Версия плагина: 0.4 Alpha
// Оптимизированная версия

Lampa.Platform.tv();

(function() {
    'use strict';
    
    const PLUGIN_NAME = 'ButtonOrderPlugin';
    const STORAGE_KEY = 'full_btn_priority';
    
    // Основная функция изменения порядка кнопок
    function rearrangeButtons() {
        try {
            // Очищаем параметр приоритета
            if (Lampa.Storage.get(STORAGE_KEY)) {
                Lampa.Storage.set(STORAGE_KEY, '{}');
            }
            
            // Подписываемся на событие отображения кнопок
            Lampa.Listener.follow('view_button_show', function(event) {
                if (!event || !event.buttons) return;
                
                setTimeout(() => {
                    const buttonContainer = event.buttons.container;
                    if (!buttonContainer || !buttonContainer.children) return;
                    
                    const buttons = Array.from(buttonContainer.children);
                    const categorized = categorizeButtons(buttons);
                    
                    // Очищаем контейнер
                    buttonContainer.innerHTML = '';
                    
                    // Добавляем кнопки в новом порядке
                    reorderButtons(buttonContainer, categorized);
                }, 100);
            });
            
        } catch (error) {
            console.warn(`${PLUGIN_NAME}: Error in rearrangeButtons`, error);
        }
    }
    
    // Категоризация кнопок
    function categorizeButtons(buttons) {
        const categories = {
            online: [],
            torrent: [],
            trailer: [],
            other: []
        };
        
        buttons.forEach(button => {
            const buttonType = detectButtonType(button);
            categories[buttonType].push(button);
        });
        
        return categories;
    }
    
    // Определение типа кнопки
    function detectButtonType(button) {
        const className = button.className || '';
        const text = button.textContent || '';
        
        if (className.includes('online') || text.includes('онлайн') || text.includes('online')) {
            return 'online';
        } else if (className.includes('torrent') || text.includes('торрент') || text.includes('torrent')) {
            return 'torrent';
        } else if (className.includes('trailer') || text.includes('трейлер') || text.includes('trailer')) {
            return 'trailer';
        }
        
        return 'other';
    }
    
    // Переупорядочивание кнопок
    function reorderButtons(container, categories) {
        // Порядок: онлайн → торренты → трейлеры → остальные
        const order = ['online', 'torrent', 'trailer', 'other'];
        
        order.forEach(category => {
            categories[category].forEach(button => {
                container.appendChild(button);
            });
        });
    }
    
    // Инициализация плагина
    function initPlugin() {
        try {
            // Ждем загрузки Lampa
            if (typeof Lampa === 'undefined') {
                setTimeout(initPlugin, 100);
                return;
            }
            
            rearrangeButtons();
            console.log(`${PLUGIN_NAME}: Plugin initialized successfully`);
            
        } catch (error) {
            console.error(`${PLUGIN_NAME}: Initialization failed`, error);
        }
    }
    
    // Запуск плагина
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }
    
})();