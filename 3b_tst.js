// Минимальная оптимизированная версия
Lampa.Platform.tv();

(function() {
    'use strict';
    
    // Очищаем параметр приоритета
    if (Lampa.Storage.get('full_btn_priority')) {
        Lampa.Storage.set('full_btn_priority', '{}');
    }
    
    // Основная логика реорганизации кнопок
    Lampa.Listener.follow('view_button_show', function(e) {
        if (!e?.buttons?.container) return;
        
        setTimeout(() => {
            const container = e.buttons.container;
            const buttons = Array.from(container.children);
            
            if (buttons.length <= 1) return;
            
            // Сортируем кнопки по категориям
            const sorted = buttons.sort((a, b) => {
                const getPriority = (btn) => {
                    const cls = btn.className || '';
                    const txt = btn.textContent || '';
                    if (cls.includes('online') || txt.includes('онлайн')) return 1;
                    if (cls.includes('torrent') || txt.includes('торрент')) return 2;
                    if (cls.includes('trailer') || txt.includes('трейлер')) return 3;
                    return 4;
                };
                return getPriority(a) - getPriority(b);
            });
            
            // Переставляем кнопки
            sorted.forEach(btn => container.appendChild(btn));
        }, 50);
    });
    
})();