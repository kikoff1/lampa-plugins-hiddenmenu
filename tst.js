(function(){
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

    // Функція для заміни текстів у вказаних контейнерах
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

    // Спостерігач
    const observer = new MutationObserver(mutations => {
        if (mutations.some(m => m.addedNodes.length)) updateAll();
    });

    observer.observe(document.body, { childList: true, subtree: true });
    updateAll();

    /* 🧩 Додаємо функцію приховування панелі навігації */
    Lampa.SettingsApi.addParam({
        component: 'UiTweaks',
        param: {
            name: 'HideNavBar',
            type: 'trigger',
            default: false
        },
        field: {
            name: 'Приховати панель навігації',
            description: 'Ховає ліве меню для мінімалістичного вигляду'
        },
        onChange: function () {
            if (Lampa.Storage.field('HideNavBar')) {
                Lampa.Template.add('hide_navbar', '<style id="hide_navbar">#app > div.menu {display:none !important;}</style>');
                $('body').append(Lampa.Template.get('hide_navbar', {}, true));
            } else {
                $('#hide_navbar').remove();
            }
        },
        onRender: function () {
            if (Lampa.Storage.field('HideNavBar')) {
                Lampa.Template.add('hide_navbar', '<style id="hide_navbar">#app > div.menu {display:none !important;}</style>');
                $('body').append(Lampa.Template.get('hide_navbar', {}, true));
            }
        }
    });

})();

Lampa.Platform.tv();
