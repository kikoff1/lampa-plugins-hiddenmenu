// Об’єднаний плагін: UnifiedButtons + Menu Settings
// Версія: 5.0 — додано меню налаштувань

(function () {

    const PLUGIN_ID = 'unified_buttons_settings';
    const PLUGIN_NAME = 'Розширені кнопки';
    let observer = null;

    /* ================================
       0. ЗБЕРЕЖЕННЯ НАЛАШТУВАНЬ
    ================================= */
    const DEFAULT_SETTINGS = {
        enableSeparator: true,
        enableSVG: true,
        removeSources: true,
        removePlay: true,
        reorderButtons: true,
        colorize: true
    };

    function loadSettings() {
        try {
            return Object.assign(
                {}, 
                DEFAULT_SETTINGS,
                JSON.parse(localStorage.getItem(PLUGIN_ID) || '{}')
            );
        } catch {
            return DEFAULT_SETTINGS;
        }
    }

    function saveSettings(data) {
        localStorage.setItem(PLUGIN_ID, JSON.stringify(data));
    }

    let SETTINGS = loadSettings();

    /* ================================
       1. MENU: LAMPA → Налаштування
    ================================= */
    function registerMenu() {
        if (!window.Lampa || !Lampa.Settings) return;

        Lampa.Settings.add({
            group: 'plugins',
            icon: '<svg width="24" height="24"><path d="M12 0 L15 8 L24 9 L17 14 L19 22 L12 17 L5 22 L7 14 0 9 9 8 Z" fill="#fff"/></svg>',
            id: PLUGIN_ID,
            name: PLUGIN_NAME,
            description: 'Налаштування розширених кнопок',
            onRender: function (body) {

                const createSwitch = (title, key) => {
                    const item = $('<div class="settings-item selector"></div>');
                    const checkbox = $('<div class="settings-param"></div>');
                    const label = $('<div class="settings-label"></div>').text(title);

                    checkbox.text(SETTINGS[key] ? 'Увімкнено' : 'Вимкнено');

                    item.append(label);
                    item.append(checkbox);

                    item.on('hover:enter', () => {
                        SETTINGS[key] = !SETTINGS[key];
                        checkbox.text(SETTINGS[key] ? 'Увімкнено' : 'Вимкнено');
                        saveSettings(SETTINGS);

                        Lampa.Utils.notify(`Змінено: ${title}`);
                    });

                    body.append(item);
                };

                body.empty();

                createSwitch('Розділення кнопок', 'enableSeparator');
                createSwitch('Оптимізовані SVG іконки', 'enableSVG');
                createSwitch('Видалення кнопки «Джерела»', 'removeSources');
                createSwitch('Видалення кнопки «Дивитись»', 'removePlay');
                createSwitch('Сортування кнопок', 'reorderButtons');
                createSwitch('Кольорова підсвітка кнопок', 'colorize');

            }
        });
    }

    /* ================================
       2. CSS (працює тільки при enable)
    ================================= */
    function injectCSS() {
        if (!SETTINGS.colorize) return;

        if (!document.getElementById('custom-buttons-style')) {
            const style = document.createElement('style');
            style.id = 'custom-buttons-style';

            style.textContent = `
                .full-start__button { transition: transform 0.2s ease !important; }
                .full-start__button:active { transform: scale(0.97) !important; }

                .full-start__button.view--online svg path { fill: #2196f3 !important; }
                .full-start__button.view--torrent svg path { fill: #32ff32 !important; }
                .full-start__button.view--trailer svg path { fill: #ff4444 !important; }

                .full-start__button svg {
                    width: 1.6em !important;
                    height: 1.6em !important;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /* ================================
          3. SVG НАБІР
    ================================= */
    const svgs = {
        torrent: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50"><path d="M25,2C12.317,2,2,12.317,2,25s10.317,23,23,23s23-10.317,23-23S37.683,2,25,2zM40.5,30.963c-3.1,0-4.9-2.4-4.9-2.4S34.1,35,27,35c-1.4,0-3.6-0.837-3.6-0.837l4.17,9.643C26.727,43.92,25.874,44,25,44c-2.157,0-4.222-0.377-6.155-1.039L9.237,16.851c0,0-0.7-1.2,0.4-1.5c1.1-0.3,5.4-1.2,5.4-1.2s1.475-0.494,1.8,0.5c0.5,1.3,4.063,11.112,4.063,11.112S22.6,29,27.4,29c4.7,0,5.9-3.437,5.7-3.937c-1.2-3-4.993-11.862-4.993-11.862s-0.6-1.1,0.8-1.4c1.4-0.3,3.8-0.7,3.8-0.7s1.105-0.163,1.6,0.8c0.738,1.437,5.193,11.262,5.193,11.262s1.1,2.9,3.3,2.9c0.464,0,0.834-0.046,1.152-0.104c-0.082,1.635-0.348,3.221-0.817,4.722C42.541,30.867,41.756,30.963,40.5,30.963z"/></svg>`,

        online: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M20.331 14.644l-13.794-13.831 17.55 10.075zM2.938 0c-0.813 0.425-1.356 1.2-1.356 2.206v27.581c0 1.006 0.544 1.781 1.356 2.206l16.038-16zM29.512 14.1l-3.681-2.131-4.106 4.031 4.106 4.031 3.756-2.131c1.125-0.893 1.125-2.906-0.075-3.8zM6.538 31.188l17.55-10.075-3.756-3.756z"/></svg>`,

        trailer: `<svg viewBox="0 0 80 70" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M71.2555 2.08955C74.6975 3.2397 77.4083 6.62804 78.3283 10.9306C80 18.7291 80 35 80 35C80 35 80 51.2709 78.3283 59.0694C77.4083 63.372 74.6975 66.7603 71.2555 67.9104C65.0167 70 40 70 40 70C40 70 14.9833 70 8.74453 67.9104C5.3025 66.7603 2.59172 63.372 1.67172 59.0694C0 51.2709 0 35 0 35C0 35 0 18.7291 1.67172 10.9306C2.59172 6.62804 5.3025 3.2395 8.74453 2.08955C14.9833 0 40 0 40 0C40 0 65.0167 0 71.2555 2.08955ZM55.5909 35.0004L29.9773 49.5714V20.4286L55.5909 35.0004Z"/></svg>`
    };

    function updateButtons() {
        if (!SETTINGS.enableSVG) return;

        const map = {
            'view--torrent': svgs.torrent,
            'view--online': svgs.online,
            'view--trailer': svgs.trailer
        };

        for (const cls in map) {
            $(`.full-start__button.${cls}`).each(function () {
                const button = $(this);
                const oldSvg = button.find('svg');
                if (!oldSvg.length) return;

                const newSvg = $(map[cls]);

                oldSvg.html(newSvg.html());
                oldSvg.attr('viewBox', newSvg.attr('viewBox'));
            });
        }
    }

    /* ================================
         4. ПЕРШИЙ ПЛАГІН
    ================================= */
    function processButtons(event) {
        if (!SETTINGS.enableSeparator) return;

        try {
            const render = event.object.activity.render();
            const main = render.find('.full-start-new__buttons');
            const hidden = render.find('.buttons--container');

            if (!main.length) return;

            const torrentBtn = hidden.find('.view--torrent');
            const trailerBtn = hidden.find('.view--trailer');

            if (torrentBtn.length) main.append(torrentBtn.removeClass('hide'));
            if (trailerBtn.length) main.append(trailerBtn.removeClass('hide'));

            if (SETTINGS.removeSources || SETTINGS.removePlay)
                setTimeout(() => removeBadButtons(main), 130);

            if (SETTINGS.reorderButtons)
                reorderButtons(main);

        } catch (e) {
            console.error('UnifiedButtons:', e);
        }
    }

    function removeBadButtons(container) {
        const all = container.find('.full-start__button');

        all.each(function () {
            const btn = $(this);
            const text = btn.text().toLowerCase();
            const cls = btn.attr('class');

            const important =
                cls.includes('view--online') ||
                cls.includes('view--torrent') ||
                cls.includes('view--trailer') ||
                text.includes('онлайн');

            const isSources = text.includes('джерел') || text.includes('source');
            const isPlay = cls.includes('button--play');

            if (!important) {
                if (SETTINGS.removeSources && isSources) btn.remove();
                if (SETTINGS.removePlay && isPlay) btn.remove();
            }
        });
    }

    function reorderButtons(box) {
        box.find('.full-start__button').each(function () {
            const btn = $(this);
            const c = btn.attr('class');

            if (c.includes('view--online')) btn.css('order', 1);
            else if (c.includes('view--torrent')) btn.css('order', 2);
            else if (c.includes('view--trailer')) btn.css('order', 3);
            else btn.css('order', 999);
        });
    }

    /* ================================
       5. OBSERVER
    ================================= */
    function startObserver(event) {
        const render = event.object.activity.render();
        const main = render.find('.full-start-new__buttons')[0];
        if (!main) return;

        observer = new MutationObserver(() => updateButtons());
        observer.observe(main, { childList: true });
    }
    function stopObserver() {
        if (observer) observer.disconnect();
        observer = null;
    }

    /* ================================
       6. INIT
    ================================= */
    function init() {
        if (!window.Lampa) return setTimeout(init, 100);

        registerMenu();
        injectCSS();

        Lampa.Listener.follow('full', (e) => {
            if (e.type === 'complite') {
                setTimeout(() => {
                    processButtons(e);
                    updateButtons();
                    startObserver(e);
                }, 200);
            }
            if (e.type === 'destroy') stopObserver();
        });
    }

    init();

})();
