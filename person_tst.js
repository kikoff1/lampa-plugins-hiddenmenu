(function () {
    'use strict';

    let currentPersonId = null;
    const STORAGE_KEY = 'actors_subscriptions';
    const PLUGIN_SOURCE = 'actors_subs';
    const PAGE_SIZE = 20;

    // === Робота з підписками ===
    function getSubscriptions() {
        return Lampa.Storage.get(STORAGE_KEY, []);
    }

    function isSubscribed(id) {
        return getSubscriptions().includes(id);
    }

    function toggleSubscription(id) {
        let subs = getSubscriptions();
        if (subs.includes(id)) {
            subs = subs.filter(x => x !== id);
        } else {
            subs.push(id);
        }
        Lampa.Storage.set(STORAGE_KEY, subs);
        return isSubscribed(id);
    }

    // === Кнопка Підписатися / Відписатися на сторінці актора ===
    function waitForPersonContainer(callback) {
        let attempts = 0;
        const maxAttempts = 15;
        function check() {
            attempts++;
            const container = document.querySelector('.person-start__bottom');
            if (container) callback(container);
            else if (attempts < maxAttempts) setTimeout(check, 300);
        }
        check();
    }

    function addCustomSubscribeButton() {
        if (!currentPersonId) return;

        waitForPersonContainer((container) => {
            const existing = container.querySelector('.button--sub-plugin');
            if (existing) existing.remove();

            const subscribed = isSubscribed(currentPersonId);
            const btn = document.createElement('div');
            btn.className = 'full-start__button selector button--sub-plugin';
            btn.style.color = subscribed ? '#F44336' : '#4CAF50';
            btn.setAttribute('data-focusable', 'true');
            btn.innerHTML = `<span>${subscribed ? 'Відписатися' : 'Підписатися'}</span>`;

            btn.addEventListener('hover:enter', () => {
                const nowSub = toggleSubscription(currentPersonId);
                btn.style.color = nowSub ? '#F44336' : '#4CAF50';
                btn.querySelector('span').textContent = nowSub ? 'Відписатися' : 'Підписатися';

                if (Lampa.Activity.active()?.source === PLUGIN_SOURCE) {
                    Lampa.Activity.reload();
                }
            });

            const buttons = container.querySelector('.full-start__buttons');
            if (buttons) buttons.appendChild(btn);
            else container.appendChild(btn);
        });
    }

    // === Стилі та приховування стандартної кнопки ===
    function hideDefaultSubscribeButtons() {
        if (document.getElementById('hide-subscribe-style')) return;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = `
            .button--subscribe:not(.button--sub-plugin) {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function addSubButtonStyles() {
        if (document.getElementById('sub-plugin-styles')) return;
        const style = document.createElement('style');
        style.id = 'sub-plugin-styles';
        style.textContent = `
            .button--sub-plugin { font-weight: bold; }
            .button--sub-plugin span { padding-left: 6px; }
        `;
        document.head.appendChild(style);
    }

    // === Служба для підписок ===
    function ActorsSubsService() {
        const cache = {};

        this.list = function (params, onComplete) {
            const page = parseInt(params.page, 10) || 1;
            const allSubs = getSubscriptions();
            const start = (page - 1) * PAGE_SIZE;
            const end = start + PAGE_SIZE;
            const pageIds = allSubs.slice(start, end);

            if (pageIds.length === 0) {
                onComplete({
                    results: [],
                    page: page,
                    total_pages: Math.ceil(allSubs.length / PAGE_SIZE),
                    total_results: allSubs.length
                });
                return;
            }

            let loaded = 0;
            const results = [];
            const lang = localStorage.getItem('language') || 'uk';

            pageIds.forEach(id => {
                if (cache[id]) {
                    results.push(cache[id]);
                    checkComplete();
                    return;
                }

                const url = Lampa.TMDB.api(`person/${id}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url, (json) => {
                    if (json && json.id) {
                        const card = {
                            id: json.id,
                            title: json.name,
                            name: json.name,
                            poster_path: json.profile_path,
                            component: "actor",       // правильний компонент
                            media_type: "person",     // тип media_type
                            source: "tmdb"
                        };
                        cache[id] = card;
                        results.push(card);
                    }
                    checkComplete();
                }, () => checkComplete());
            });

            function checkComplete() {
                loaded++;
                if (loaded >= pageIds.length) {
                    onComplete({
                        results: results.filter(Boolean),
                        page: page,
                        total_pages: Math.ceil(allSubs.length / PAGE_SIZE),
                        total_results: allSubs.length
                    });
                }
            }
        };
    }

    // === Меню ===
    function addMenuButtons() {
        const icoActors = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';
        const icoSubs = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m0 8q-2.75 0-4.825-1.65T4 15q.05-.65.4-1.275t1-1Q6.9 12 8.438 11.5T12 11.25q2.55 0 4.1.525t2.012 1.213q.362.425.625.938T19.95 15q-.35 2.7-2.425 4.35T12 20"/></svg>';

        // Актори
        const btnActors = $(`<li class="menu__item selector" data-action="actors">
            <div class="menu__ico">${icoActors}</div>
            <div class="menu__text">Актори</div>
        </li>`);
        btnActors.on('hover:enter', () => {
            Lampa.Activity.push({
                url: "person/popular",
                title: "Актори",
                component: "category_full",
                source: "tmdb",
                page: 1
            });
        });

        // Підписки акторів
        const btnSubs = $(`<li class="menu__item selector" data-action="${PLUGIN_SOURCE}">
            <div class="menu__ico">${icoSubs}</div>
            <div class="menu__text">Підписки акторів</div>
        </li>`);
        btnSubs.on('hover:enter', () => {
            Lampa.Activity.push({
                title: "Підписки акторів",
                component: "category_full",
                source: PLUGIN_SOURCE,
                page: 1
            });
        });

        $('.menu .menu__list').eq(0).append(btnActors).append(btnSubs);
    }

    // === Ініціалізація плагіна ===
    function initPlugin() {
        hideDefaultSubscribeButtons();
        addSubButtonStyles();
        addMenuButtons();

        // Реєструємо сервіс
        Lampa.Api.sources[PLUGIN_SOURCE] = new ActorsSubsService();

        Lampa.Listener.follow('activity', (e) => {
            if (e.type === 'start' && (e.component === 'actor' || e.component === 'person') && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                addCustomSubscribeButton();
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') initPlugin();
    });

})();
