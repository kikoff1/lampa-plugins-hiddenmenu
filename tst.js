(function(){
    'use strict';
    Lampa.Platform.tv();

    // Список текстових замін
    const REPLACEMENTS = {
        'Дублированный': 'Дубльований',
        'Ukr': '🇺🇦 Українською',
        'Ua': '🇺🇦 Ua',
        'Дубляж': 'Дубльований',
        'Многоголосый': 'Багатоголосий',
        'Украинский': '🇺🇦 Українською',
        'Zetvideo': 'UaFlix',
        'Нет истории просмотра': 'Історія перегляду відсутня'
    };

    // Конфігурація стилів
    const STYLES = {
        '.torrent-item__seeds span.high-seeds': { color: '#00ff00', 'font-weight': 'bold' },
        '.torrent-item__bitrate span.high-bitrate': { color: '#ff0000', 'font-weight': 'bold' },
        '.torrent-item__tracker.utopia': { color: '#9b59b6', 'font-weight': 'bold' },
        '.torrent-item__tracker.toloka': { color: '#2ecc71', 'font-weight': 'bold' }
    };

    // Додаємо CSS-стилі
    let style = document.createElement('style');
    style.innerHTML = Object.entries(STYLES).map(([selector, props]) => {
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n');
    document.head.appendChild(style);

    // === Основна логіка оновлення ===
    function replaceTexts() {
        const containers = [
            '.online-prestige-watched__body',
            '.online-prestige--full .online-prestige__title',
            '.online-prestige--full .online-prestige__info'
        ];
        containers.forEach(selector => {
            document.querySelectorAll(selector).forEach(container => {
                const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
                let node;
                while (node = walker.nextNode()) {
                    let text = node.nodeValue;
                    Object.entries(REPLACEMENTS).forEach(([original, replacement]) => {
                        if (text.includes(original)) {
                            text = text.replace(new RegExp(original, 'g'), replacement);
                        }
                    });
                    node.nodeValue = text;
                }
            });
        });
    }

    function updateTorrentStyles() {
        document.querySelectorAll('.torrent-item__seeds span').forEach(span => {
            span.classList.toggle('high-seeds', (parseInt(span.textContent) || 0) > 19);
        });
        document.querySelectorAll('.torrent-item__bitrate span').forEach(span => {
            span.classList.toggle('high-bitrate', (parseFloat(span.textContent) || 0) > 50);
        });
        document.querySelectorAll('.torrent-item__tracker').forEach(tracker => {
            const text = tracker.textContent.trim();
            tracker.classList.remove('utopia', 'toloka');
            if (text.includes('UTOPIA (API)')) tracker.classList.add('utopia');
            else if (text.includes('Toloka')) tracker.classList.add('toloka');
        });
    }

    function updateAll() {
        replaceTexts();
        updateTorrentStyles();
    }

    const observer = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length)) updateAll();
    });
    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();

    // === Додаємо компонент налаштувань ===
    Lampa.SettingsApi.addComponent({
        component: 'UI_Tweaks',
        name: 'UI Tweaks',
        icon: 'magic',
        onRender: function(){}
    });

    // === Додаємо параметр "Сховати панель навігації" ===
    Lampa.SettingsApi.addParam({
        component: 'UI_Tweaks',
        param: {
            name: 'NavyBar',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Сховати панель навігації',
            description: 'Ховає головне меню та додає кнопку пошуку у верхній панелі'
        },
        onChange: function(value) {
            toggleNavyBar(value);
        }
    });

    // === Функція для вмикання/вимикання панелі ===
    function toggleNavyBar(enabled) {
        if (enabled) {
            // Приховуємо меню
            Lampa.Template.add('no_bar', '<style id="no_bar">.menu{display:none!important;}</style>');
            $('body').append(Lampa.Template.get('no_bar', {}, true));

            // Додаємо кнопку пошуку
            if (!$('#searchReturnButton').length) {
                const searchReturnButton = `
                    <div id="searchReturnButton" class="selector" style="margin-left: 1em;">
                        🔍 Пошук
                    </div>`;
                $('#app > div.head > div > div.head__actions').append(searchReturnButton);
                $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() {
                    Lampa.Search.open();
                });
                $('.open--search').hide();
            }
        } else {
            $('#no_bar').remove();
            $('#searchReturnButton').remove();
            $('.open--search').show();
        }
    }

    // === Автоматичне застосування при старті ===
    if (Lampa.Storage.get('NavyBar', false)) {
        toggleNavyBar(true);
    }

})();
