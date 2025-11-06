(function(){
    'use strict';
    Lampa.Platform.tv();

    //v1 Список текстових замін
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
        '.torrent-item__seeds span.high-seeds': {
            color: '#00ff00',
            'font-weight': 'bold'
        },
        '.torrent-item__bitrate span.high-bitrate': {
            color: '#ff0000',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.utopia': {
            color: '#9b59b6',
            'font-weight': 'bold'
        },
        '.torrent-item__tracker.toloka': {
            color: '#2ecc71',
            'font-weight': 'bold'
        }
    };

    // Додаємо CSS-стилі
    let style = document.createElement('style');
    style.innerHTML = Object.entries(STYLES).map(([selector, props]) => {
        return `${selector} { ${Object.entries(props).map(([prop, val]) => `${prop}: ${val} !important`).join('; ')} }`;
    }).join('\n');
    document.head.appendChild(style);

    // Функція для заміни текстів
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

    // Функція для оновлення стилів торентів
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

    // Основна функція оновлення
    function updateAll() {
        replaceTexts();
        updateTorrentStyles();
    }

    // Спостерігач за змінами DOM
    const observer = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length)) updateAll();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();

    // === 📦 Додано: Приховання панелі навігації ===
    Lampa.SettingsApi.addParam({
        component: 'Multi_Menu_Component',
        param: {
            name: 'NavyBar',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Сховати панель навігації',
            description: 'Корисно, якщо неправильно визначився тип пристрою'
        },
        onChange: function(value) {
            if (Lampa.Storage.field('NavyBar') == true) {
                // Додаємо стилі для приховування панелі
                Lampa.Template.add('no_bar', '<style id="no_bar">.menu{display:none!important;}</style>');
                $('body').append(Lampa.Template.get('no_bar', {}, true));

                // Додаємо кнопку пошуку замість панелі
                var searchReturnButton = `
                    <div id="searchReturnButton" class="selector" style="margin-left: 1em;">
                        🔍 Пошук
                    </div>`;
                $('.open--search').hide();
                $('#searchReturnButton').remove();
                $('#app > div.head > div > div.head__actions').append(searchReturnButton);

                $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() {
                    Lampa.Search.open();
                });
            }

            if (Lampa.Storage.field('NavyBar') == false) {
                $('.open--search').show();
                $('#no_bar').remove();
                $('#searchReturnButton').remove();
            }
        }
    });

    // Автоматичне застосування при запуску
    if (Lampa.Storage.field('NavyBar') == true) {
        Lampa.Template.add('no_bar', '<style id="no_bar">.menu{display:none!important;}</style>');
        $('body').append(Lampa.Template.get('no_bar', {}, true));
        var searchReturnButton = `
            <div id="searchReturnButton" class="selector" style="margin-left: 1em;">
                🔍 Пошук
            </div>`;
        $('#app > div.head > div > div.head__actions').append(searchReturnButton);
        $('#searchReturnButton').on('hover:enter hover:click hover:touch', function() {
            Lampa.Search.open();
        });
        $('.open--search').hide();
    }

})();
