(function () {
    'use strict';

    const PLUGIN_NAME = 'menu_plugin_example';

    function log(message) {
        console.log(`[PLUGIN: ${PLUGIN_NAME}]`, message);
    }

    function isLampaReady() {
        return typeof Lampa !== 'undefined' && Lampa.Listener && Lampa.Storage && Lampa.Api;
    }

    function waitForLampa(callback) {
        if (isLampaReady()) {
            callback();
        } else {
            const interval = setInterval(() => {
                if (isLampaReady()) {
                    clearInterval(interval);
                    callback();
                }
            }, 500);
        }
    }

    function createMenuItem(title = 'Плагін меню', onClick) {
        const item = document.createElement('li');
        item.className = 'menu__item';
        item.innerHTML = `<a class="menu__link selector focus" href="#">${title}</a>`;

        item.addEventListener('click', (e) => {
            e.preventDefault();
            if (typeof onClick === 'function') onClick();
        });

        return item;
    }

    function addMenuItem() {
        const menu = document.querySelector('.menu__list');

        if (!menu) {
            log('Меню не знайдено. Перевір селектор .menu__list');
            return;
        }

        const item = createMenuItem('Мій плагін', showPluginPage);
        menu.appendChild(item);
        log('Меню плагіна додано');
    }

    function showPluginPage() {
        const html = `
            <div class="settings__body">
                <div class="settings-param">
                    <div class="settings-param__name">Привіт із плагіна!</div>
                    <div class="settings-param__descr">Це тестовий плагін, що працює на будь-якому домені.</div>
                </div>
            </div>
        `;

        const body = $('<div class="custom-plugin-layer layer--wheight">').html(html);
        Lampa.Activity.push({
            url: '',
            title: 'Плагін',
            component: 'plugin_component',
            page: 1,
            ready: function () {
                this.render().html(body);
            },
            destroy: function () {
                body.remove();
            }
        });
    }

    function initPlugin() {
        log('Ініціалізація...');

        if (!document.querySelector('.menu__list')) {
            const observer = new MutationObserver((mutations, obs) => {
                if (document.querySelector('.menu__list')) {
                    addMenuItem();
                    obs.disconnect();
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        } else {
            addMenuItem();
        }
    }

    waitForLampa(initPlugin);
})();
