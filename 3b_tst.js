// Версия плагина: 0.4 Alpha - Оптимизированная
// Правильно разделяет кнопки: Онлайн, Торренты, Трейлеры отдельно

Lampa.Platform.tv();

(function() {
    'use strict';
    
    const PLUGIN_NAME = 'ButtonOrderPlugin';
    
    function rearrangeButtons() {
        try {
            // Очищаем параметр приоритета (как в оригинальном плагине)
            if (Lampa.Storage.get('full_btn_priority')) {
                Lampa.Storage.set('full_btn_priority', '{}');
            }
            
            // Подписываемся на событие создания кнопок
            Lampa.Listener.follow('view_button_create', function(event) {
                if (!event || !event.buttons || !event.buttons.length) return;
                
                setTimeout(() => {
                    const buttons = event.buttons;
                    const container = findButtonContainer();
                    
                    if (!container) return;
                    
                    // Сортируем кнопки по категориям
                    const sortedButtons = sortButtonsByCategory(buttons);
                    
                    // Перестраиваем порядок в контейнере
                    rebuildButtonLayout(container, sortedButtons);
                    
                }, 100);
            });
            
        } catch (error) {
            console.warn(`${PLUGIN_NAME}: Error`, error);
        }
    }
    
    // Поиск контейнера кнопок
    function findButtonContainer() {
        // Ищем различные возможные контейнеры кнопок
        const selectors = [
            '.selector--buttons',
            '.view-buttons',
            '[class*="button"]',
            '.full-buttons'
        ];
        
        for (let selector of selectors) {
            const container = document.querySelector(selector);
            if (container) return container;
        }
        
        return null;
    }
    
    // Сортировка кнопок по категориям
    function sortButtonsByCategory(buttons) {
        const categories = {
            online: [],
            torrent: [],
            trailer: [],
            other: []
        };
        
        buttons.forEach(button => {
            const buttonInfo = extractButtonInfo(button);
            categories[buttonInfo.category].push(button);
        });
        
        return categories;
    }
    
    // Извлечение информации о кнопке
    function extractButtonInfo(button) {
        if (!button) return { category: 'other' };
        
        // Анализируем различные свойства кнопки
        const title = (button.title || '').toLowerCase();
        const html = (button.innerHTML || '').toLowerCase();
        const text = (button.textContent || '').toLowerCase();
        const className = (button.className || '').toLowerCase();
        
        // Определяем категорию по содержимому
        if (title.includes('онлайн') || title.includes('online') ||
            html.includes('онлайн') || html.includes('online') ||
            text.includes('онлайн') || text.includes('online') ||
            className.includes('online')) {
            return { category: 'online', element: button };
        }
        
        if (title.includes('торрент') || title.includes('torrent') ||
            html.includes('торрент') || html.includes('torrent') ||
            text.includes('торрент') || text.includes('torrent') ||
            className.includes('torrent')) {
            return { category: 'torrent', element: button };
        }
        
        if (title.includes('трейлер') || title.includes('trailer') ||
            html.includes('трейлер') || html.includes('trailer') ||
            text.includes('трейлер') || text.includes('trailer') ||
            className.includes('trailer')) {
            return { category: 'trailer', element: button };
        }
        
        return { category: 'other', element: button };
    }
    
    // Перестройка layout кнопок
    function rebuildButtonLayout(container, categories) {
        // Сохраняем оригинальные стили
        const originalDisplay = container.style.display;
        container.style.display = 'none';
        
        // Очищаем контейнер
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Добавляем кнопки в правильном порядке
        const order = ['online', 'torrent', 'trailer', 'other'];
        
        order.forEach(category => {
            categories[category].forEach(button => {
                if (button && button.parentNode !== container) {
                    // Убеждаемся, что кнопка отображается как отдельный элемент
                    ensureButtonVisibility(button);
                    container.appendChild(button);
                }
            });
        });
        
        // Восстанавливаем отображение
        container.style.display = originalDisplay || '';
    }
    
    // Гарантируем видимость кнопки как отдельного элемента
    function ensureButtonVisibility(button) {
        if (!button) return;
        
        // Убираем возможные группирующие стили
        button.style.display = '';
        button.style.flex = '';
        button.style.width = '';
        button.style.margin = '2px 5px';
        
        // Убираем классы, которые могут группировать кнопки
        const groupClasses = ['dropdown', 'group', 'nested', 'submenu'];
        groupClasses.forEach(cls => {
            if (button.classList.contains(cls)) {
                button.classList.remove(cls);
            }
        });
    }
    
    // Альтернативный подход - модификация через Observer
    function observeButtonChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(function(node) {
                        if (node.nodeType === 1 && 
                            (node.classList.contains('button') || 
                             node.querySelector('.button'))) {
                            setTimeout(processButtonGroup, 50);
                        }
                    });
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Обработка группы кнопок
    function processButtonGroup() {
        const buttonContainers = document.querySelectorAll('[class*="button"], [class*="btn"]');
        
        buttonContainers.forEach(container => {
            if (container.children.length > 1) {
                const buttons = Array.from(container.children);
                const hasDropdown = buttons.some(btn => 
                    btn.classList.contains('dropdown') || 
                    btn.querySelector('.dropdown')
                );
                
                if (hasDropdown) {
                    flattenButtonGroups(container);
                }
            }
        });
    }
    
    // Разворачиваем группы кнопок
    function flattenButtonGroups(container) {
        const allButtons = [];
        
        // Рекурсивно собираем все кнопки
        function collectButtons(element) {
            if (element.classList.contains('button') || 
                element.getAttribute('role') === 'button') {
                allButtons.push(element);
            } else {
                Array.from(element.children).forEach(collectButtons);
            }
        }
        
        collectButtons(container);
        
        // Сортируем по категориям
        const categorized = {};
        allButtons.forEach(btn => {
            const category = detectButtonCategory(btn);
            if (!categorized[category]) categorized[category] = [];
            categorized[category].push(btn);
        });
        
        // Очищаем и перестраиваем
        container.innerHTML = '';
        
        ['online', 'torrent', 'trailer', 'other'].forEach(category => {
            if (categorized[category]) {
                categorized[category].forEach(btn => {
                    btn.style.display = '';
                    btn.style.visibility = 'visible';
                    container.appendChild(btn);
                });
            }
        });
    }
    
    // Детектор категории кнопки
    function detectButtonCategory(button) {
        const content = (button.textContent + ' ' + button.innerHTML).toLowerCase();
        
        if (content.includes('онлайн') || content.includes('online')) return 'online';
        if (content.includes('торрент') || content.includes('torrent')) return 'torrent';
        if (content.includes('трейлер') || content.includes('trailer')) return 'trailer';
        
        return 'other';
    }
    
    // Инициализация
    function initPlugin() {
        if (typeof Lampa === 'undefined') {
            setTimeout(initPlugin, 100);
            return;
        }
        
        // Запускаем оба метода для надежности
        rearrangeButtons();
        observeButtonChanges();
        
        // Дополнительная обработка через 2 секунды
        setTimeout(processButtonGroup, 2000);
        
        console.log(`${PLUGIN_NAME}: Initialized`);
    }
    
    // Запуск
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlugin);
    } else {
        initPlugin();
    }
    
})();