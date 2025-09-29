(function () {
    'use strict';

    const STORAGE_KEY = 'actors_subscriptions';
    let currentPersonId = null;

    // ===== Функції підписок =====
    function getSubscriptions() {
        return Lampa.Storage.get(STORAGE_KEY, []);
    }

    function isSubscribed(id) {
        return getSubscriptions().includes(id);
    }

    function toggleSubscription(id) {
        let subs = getSubscriptions();
        if (subs.includes(id)) subs = subs.filter(x => x !== id);
        else subs.push(id);
        Lampa.Storage.set(STORAGE_KEY, subs);
        return isSubscribed(id);
    }

    // ===== Кнопка Підписатися/Відписатися =====
    function addSubscribeButton(container) {
        if (!currentPersonId) return;
        const existing = container.querySelector('.button--subscriibbe-plugin');
        if (existing) existing.remove();

        const subscribed = isSubscribed(currentPersonId);
        const btn = document.createElement('div');
        btn.className = 'full-start__button selector button--subscriibbe-plugin';
        if(subscribed) btn.classList.add('unsubscribed');
        btn.setAttribute('data-focusable', 'true');
        btn.innerHTML = `<span>${subscribed ? 'Відписатися' : 'Підписатися'}</span>`;

        btn.addEventListener('hover:enter', () => {
            const nowSub = toggleSubscription(currentPersonId);
            btn.querySelector('span').textContent = nowSub ? 'Відписатися' : 'Підписатися';
            btn.classList.toggle('unsubscribed', nowSub);
            if (Lampa.Activity.active()?.source === 'actors_subs') Lampa.Activity.reload();
        });

        const buttons = container.querySelector('.full-start__buttons');
        if (buttons) buttons.appendChild(btn);
        else container.appendChild(btn);
    }

    // ===== Стилі =====
    function hideDefaultSubscribeButtons() {
        if (document.getElementById('hide-subscribe-style')) return;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = `
            .button--subscribe:not(.button--subscriibbe-plugin) { display: none !important; }
        `;
        document.head.appendChild(style);
    }

    function addSubButtonStyles() {
        if (document.getElementById('sub-plugin-styles')) return;
        const style = document.createElement('style');
        style.id = 'sub-plugin-styles';
        style.textContent = `
            .button--subscriibbe-plugin { font-weight: bold; color: #4CAF50; }
            .button--subscriibbe-plugin.unsubscribed { color: #F44336; }
            .button--subscriibbe-plugin span { padding-left: 6px; }
        `;
        document.head.appendChild(style);
    }

    // ===== Сервіс для підписок =====
    function ActorsSubsService() {
        const cache = {};

        this.list = function(params, onComplete) {
            const subs = getSubscriptions();
            const page = parseInt(params.page || 1);
            const pageSize = 20;
            const start = (page-1)*pageSize;
            const end = start+pageSize;
            const pageIds = subs.slice(start,end);

            if (pageIds.length===0) {
                onComplete({results:[], page, total_pages: Math.ceil(subs.length/pageSize), total_results: subs.length});
                return;
            }

            let loaded = 0;
            const results = [];
            const lang = localStorage.getItem('language') || 'uk';

            pageIds.forEach(id=>{
                if (cache[id]) { results.push(cache[id]); checkComplete(); return; }

                const url = Lampa.TMDB.api(`person/${id}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url,(json)=>{
                    if(json && json.id) {
                        const card = {
                            id: json.id,
                            title: json.name,
                            name: json.name,
                            poster_path: json.profile_path,
                            component:"actor",
                            media_type:"person",
                            source:"tmdb",
                            onSelect: function(){
                                // Відкриття Actor Activity
                                Lampa.Activity.push({
                                    component: "actor",
                                    id: json.id,
                                    title: json.name,
                                    source: "tmdb"
                                });
                            }
                        };
                        cache[id]=card;
                        results.push(card);
                    }
                    checkComplete();
                },()=>checkComplete());
            });

            function checkComplete(){
                loaded++;
                if(loaded>=pageIds.length) onComplete({
                    results: results.filter(Boolean),
                    page,
                    total_pages: Math.ceil(subs.length/pageSize),
                    total_results: subs.length
                });
            }
        };
    }

    // ===== Меню =====
    function addMenuButtons() {
        const icoActors = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';
        const icoSubs = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12q-1.65 0-2.825-1.175T8 8q0-1.65 1.175-2.825T12 4q1.65 0 2.825 1.175T16 8q0 1.65-1.175 2.825T12 12m0 8q-2.75 0-4.825-1.65T4 15q.05-.65.4-1.275t1-1Q6.9 12 8.438 11.5T12 11.25q2.55 0 4.1.525t2.012 1.213q.362.425.625.938T19.95 15q-.35 2.7-2.425 4.35T12 20"/></svg>';

        const btnActors = $(`<li class="menu__item selector" data-action="actors"><div class="menu__ico">${icoActors}</div><div class="menu__text">Актори</div></li>`);
        btnActors.on('hover:enter', () => {
            Lampa.Activity.push({ url:"person/popular", title:"Актори", component:"category_full", source:"tmdb", page:1 });
        });

        const btnSubs = $(`<li class="menu__item selector" data-action="actors_subs"><div class="menu__ico">${icoSubs}</div><div class="menu__text">Підписки акторів</div></li>`);
        btnSubs.on('hover:enter', () => {
            Lampa.Activity.push({ title:"Підписки акторів", component:"custom_actors_subs", source:"actors_subs", page:1 });
        });

        $('.menu .menu__list').eq(0).append(btnActors).append(btnSubs);
    }

    // ===== Кастомна активність для підписок =====
    function registerCustomActivity() {
        Lampa.Activity.register('custom_actors_subs', {
            onCreate: function(activity){
                const container = $('<div class="activity__content"></div>');
                activity.body.append(container);

                Lampa.Api.sources['actors_subs'].list({page:1}, (res)=>{
                    if(res.results.length===0){
                        container.append('<div style="padding:20px;text-align:center">Підписок немає</div>');
                        return;
                    }
                    res.results.forEach(card=>{
                        const item = $(`
                            <div class="card selector" style="display:flex;align-items:center;margin:5px 0;">
                                <img src="${card.poster_path?Lampa.TMDB.img(card.poster_path):''}" style="width:50px;height:75px;object-fit:cover;margin-right:10px;">
                                <div>${card.name}</div>
                            </div>
                        `);
                        item.on('hover:enter', ()=>{
                            if(card.onSelect) card.onSelect(); // Відкриваємо Actor Activity
                        });
                        container.append(item);
                    });
                });
            }
        });
    }

    // ===== Ініціалізація плагіна =====
    function initPlugin() {
        hideDefaultSubscribeButtons();
        addSubButtonStyles();
        addMenuButtons();
        Lampa.Api.sources['actors_subs'] = new ActorsSubsService();
        registerCustomActivity();

        // Слухаємо відкриття Actor Activity
        Lampa.Listener.follow('activity', e => {
            if(e.type==='start' && e.component==='actor' && e.object?.id){
                currentPersonId = parseInt(e.object.id,10);

                // Слухаємо рендер сторінки актора
                const renderListener = () => {
                    const container = document.querySelector('.person-start__bottom');
                    if(container){
                        addSubscribeButton(container);
                        Lampa.Listener.remove('render', renderListener);
                    }
                };
                Lampa.Listener.follow('render', renderListener);
            }
        });
    }

    if(window.appready) initPlugin();
    else Lampa.Listener.follow('app', (e)=>{ if(e.type==='ready') initPlugin(); });

})();
