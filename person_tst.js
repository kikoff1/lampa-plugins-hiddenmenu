(function () {
    'use strict';

    const STORAGE_KEY = 'subscribed_persons';
    const PAGE_SIZE = 20;
    let currentPersonId = null;

    const ICON_ACTORS = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';
    const ICON_SUBS = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    // Приховує стандартні кнопки підписок
    function hideDefaultSubscribeButtons() {
        if (document.getElementById('hide-subscribe-style')) return;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = `.button--subscribe { display: none !important; }`;
        document.head.appendChild(style);
    }

    function getSubscribed() {
        return Lampa.Storage.get(STORAGE_KEY, []);
    }

    function toggleSubscription(id) {
        let subs = getSubscribed();
        const index = subs.indexOf(id);
        if (index === -1) subs.push(id);
        else subs.splice(index, 1);
        Lampa.Storage.set(STORAGE_KEY, subs);
        return index === -1;
    }

    function isSubscribed(id) {
        return getSubscribed().includes(id);
    }

    function addCustomSubscribeButton() {
        if (!currentPersonId) return;

        const container = document.querySelector('.person-start__bottom');
        if (!container) return;

        const existing = container.querySelector('.button--sub-plugin');
        if (existing) existing.remove();

        const subscribed = isSubscribed(currentPersonId);
        const btn = document.createElement('div');
        btn.className = 'full-start__button selector button--sub-plugin';
        btn.style.color = subscribed ? '#F44336' : '#4CAF50';
        btn.setAttribute('data-focusable', 'true');
        btn.innerHTML = `<span>${subscribed ? 'Відписатися' : 'Підписатися'}</span>`;

        btn.addEventListener('hover:enter', () => {
            const added = toggleSubscription(currentPersonId);
            btn.style.color = added ? '#F44336' : '#4CAF50';
            btn.querySelector('span').textContent = added ? 'Відписатися' : 'Підписатися';
            if (Lampa.Activity.active()?.source === 'actors_subs') {
                Lampa.Activity.reload();
            }
        });

        const buttons = container.querySelector('.full-start__buttons');
        if (buttons) buttons.appendChild(btn);
        else container.appendChild(btn);
    }

    function SubscriptionsSource() {
        this.list = (params, onComplete) => {
            const page = params.page || 1;
            const subs = getSubscribed();
            const ids = subs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
            if (ids.length === 0) {
                onComplete({ results: [], page, total_pages: 1, total_results: subs.length });
                return;
            }

            let results = [];
            let loaded = 0;
            const lang = localStorage.getItem('language') || 'uk';

            ids.forEach(id => {
                const url = Lampa.TMDB.api(`person/${id}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url, (json) => {
                    if (json && json.id) {
                        results.push({
                            id: json.id,
                            title: json.name,
                            name: json.name,
                            poster_path: json.profile_path,
                            type: 'actor',
                            media_type: 'person',
                            source: 'tmdb'
                        });
                    }
                    check();
                }, () => check());
            });

            function check() {
                loaded++;
                if (loaded >= ids.length) {
                    onComplete({
                        results,
                        page,
                        total_pages: Math.ceil(subs.length / PAGE_SIZE),
                        total_results: subs.length
                    });
                }
            }
        };
    }

    function addMenuItems() {
        // Кнопка "Актори"
        const actorsBtn = $(`<li class="menu__item selector" data-action="actors">
            <div class="menu__ico">${ICON_ACTORS}</div>
            <div class="menu__text">Актори</div>
        </li>`);

        actorsBtn.on('hover:enter', () => {
            Lampa.Activity.push({
                url: "person/popular",
                title: "Актори",
                region: "UA",
                language: "uk-UA",
                component: "category_full",
                source: "tmdb",
                card_type: "true",
                page: 1
            });
        });

        // Кнопка "Підписки на акторів"
        const subsBtn = $(`<li class="menu__item selector" data-action="actors_subs">
            <div class="menu__ico">${ICON_SUBS}</div>
            <div class="menu__text">Підписки на акторів</div>
        </li>`);

        subsBtn.on('hover:enter', () => {
            Lampa.Activity.push({
                component: "category_full",
                source: "actors_subs",
                title: "Підписки на акторів",
                page: 1,
                url: "actors_subs_main"
            });
        });

        $(".menu .menu__list").eq(0).append(actorsBtn).append(subsBtn);
    }

    function startPlugin() {
        hideDefaultSubscribeButtons();
        addMenuItems();

        Lampa.Api.sources['actors_subs'] = new SubscriptionsSource();

        // Слухаємо відкриття акторів
        Lampa.Listener.follow('activity', (e) => {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                setTimeout(addCustomSubscribeButton, 500);
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === 'actors_subs') {
                setTimeout(() => Lampa.Activity.reload(), 200);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') startPlugin(); });

})();
