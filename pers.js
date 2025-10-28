(function() {
    "use strict";

    // v1.0 ==== ПРИХОВАННЯ СТАНДАРТНОЇ КНОПКИ "ПІДПИСАТИСЯ" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;
        const css = `.button--subscribe { display: none !important; }`;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== ОСНОВНІ ЗМІННІ ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = [];
    let currentPersonId = null;

    // ==== ПЕРЕКЛАДИ ====
    const pluginTranslations = {
        persons_title: { ru: "Персоны", en: "Persons", uk: "Персони" },
        subscriibbe: { ru: "Подписаться", en: "Subscribe", uk: "Підписатися" },
        unsubscriibbe: { ru: "Отписаться", en: "Unsubscribe", uk: "Відписатися" },
        persons_not_found: { ru: "Персоны не найдены", en: "No persons found", uk: "Особи не знайдені" }
    };

    // ==== ІКОНКА ====
    const ICON_SVG = `
        <svg height="30" viewBox="0 0 24 24" fill="none">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
        </svg>`;

    // ==== СЛУЖБОВІ ====
    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        const current = Lampa.Storage.get(PERSONS_KEY);
        if (!Array.isArray(current)) Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }

    function getPersonsData() {
        return Lampa.Storage.get(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }

    function savePersonId(id) {
        const saved = getPersonsData();
        if (!saved.includes(id)) {
            saved.push(id);
            Lampa.Storage.set(PERSONS_KEY, saved);
        }
    }

    function removePersonId(id) {
        const saved = getPersonsData();
        const i = saved.indexOf(id);
        if (i !== -1) saved.splice(i, 1);
        Lampa.Storage.set(PERSONS_KEY, saved);
    }

    function togglePersonSubscription(id) {
        const saved = getPersonsData();
        const exists = saved.includes(id);
        if (exists) removePersonId(id);
        else savePersonId(id);
        updatePersonsList();
        return !exists;
    }

    function isSubscribed(id) {
        return getPersonsData().includes(id);
    }

    // ==== КНОПКА ПІДПИСКИ ====
    function addButtonToContainer(bottomBlock) {
        const existing = bottomBlock.querySelector('.button--subscriibbe-plugin');
        if (existing) existing.remove();

        const subscribed = isSubscribed(currentPersonId);
        const text = subscribed
            ? Lampa.Lang.translate('persons_plugin_unsubscriibbe')
            : Lampa.Lang.translate('persons_plugin_subscriibbe');

        const button = document.createElement('div');
        button.className = `full-start__button selector button--subscriibbe-plugin ${subscribed ? 'button--unsubscriibbe' : 'button--subscriibbe'}`;
        button.setAttribute('data-focusable', 'true');

        button.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${text}</span>`;

        button.addEventListener('hover:enter', () => {
            const added = togglePersonSubscription(currentPersonId);
            button.classList.toggle('button--unsubscriibbe', added);
            button.classList.toggle('button--subscriibbe', !added);
            button.querySelector('span').textContent = added
                ? Lampa.Lang.translate('persons_plugin_unsubscriibbe')
                : Lampa.Lang.translate('persons_plugin_subscriibbe');
        });

        const container = bottomBlock.querySelector('.full-start__buttons');
        (container || bottomBlock).append(button);
    }

    function addsubscriibbeButton() {
        if (!currentPersonId) return;
        const tryAdd = () => {
            const block = document.querySelector('.person-start__bottom');
            if (block) addButtonToContainer(block);
            else setTimeout(tryAdd, 300);
        };
        tryAdd();
    }

    function updatePersonsList() {
        const activity = Lampa.Activity.active();
        if (activity && activity.component === 'category_full' && activity.source === PLUGIN_NAME)
            Lampa.Activity.reload();
    }

    function addButtonStyles() {
        if (document.getElementById('subscriibbe-button-styles')) return;
        const style = document.createElement('style');
        style.id = 'subscriibbe-button-styles';
        style.textContent = `
            .button--subscriibbe { color: #4CAF50; }
            .button--unsubscriibbe { color: #F44336; }`;
        document.head.appendChild(style);
    }

    // ==== TMDB SERVICE ====
    function PersonsService() {
        this.list = function(params, onComplete) {
            const savedIds = getPersonsData();
            if (savedIds.length === 0) return onComplete({ results: [] });

            const lang = getCurrentLanguage();
            const results = [];
            let done = 0;

            savedIds.forEach(id => {
                const url = Lampa.TMDB.api(`person/${id}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url, res => {
                    const data = typeof res === 'string' ? JSON.parse(res) : res;
                    if (data?.id) results.push(data);
                    if (++done === savedIds.length)
                        onComplete({ results, page: 1, total_pages: 1, total_results: results.length });
                }, () => {
                    if (++done === savedIds.length)
                        onComplete({ results, page: 1, total_pages: 1, total_results: results.length });
                });
            });
        };
    }

    // ==== ЗАПУСК ПЛАГІНА ====
    function startPlugin() {
        hideSubscribeButton();
        addButtonStyles();

        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();
        Lampa.Api.sources[PLUGIN_NAME] = new PersonsService();

        const menuItem = $(`
            <li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${ICON_SVG}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>`);
        menuItem.on('hover:enter', () => {
            Lampa.Activity.push({
                component: 'category_full',
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('persons_plugin_title'),
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });
        $('.menu .menu__list').eq(0).append(menuItem);

        function waitForContainer(cb) {
            let tries = 0;
            const check = () => {
                if (document.querySelector('.person-start__bottom')) cb();
                else if (++tries < 15) setTimeout(check, 200);
            };
            setTimeout(check, 200);
        }

        function checkCurrentActivity() {
            const a = Lampa.Activity.active();
            if (a && a.component === 'actor') {
                currentPersonId = parseInt(a.id || a.params?.id || location.pathname.match(/\/actor\/(\d+)/)?.[1]);
                if (currentPersonId) waitForContainer(addsubscriibbeButton);
            }
        }

        Lampa.Listener.follow('activity', e => {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id);
                waitForContainer(addsubscriibbeButton);
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        setTimeout(checkCurrentActivity, 1500);
    }

    // ==== ІНІЦІАЛІЗАЦІЯ ====
    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') startPlugin(); });

})();
