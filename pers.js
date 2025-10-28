(function() {
    "use strict";

    /****************************************
     * 🔧 ВНУТРІШНІЙ ЛОГЕР ДЛЯ ПЕРЕГЛЯДУ В LAMPA
     ****************************************/
    const PluginLogger = {
        logs: [],
        maxLogs: 500,
        enabled: true,

        push(type, args) {
            if (!this.enabled) return;
            const msg = args.map(a => (typeof a === 'object' ? JSON.stringify(a, null, 2) : a)).join(' ');
            const entry = `[${new Date().toLocaleTimeString()}] [${type.toUpperCase()}] ${msg}`;
            this.logs.push(entry);
            if (this.logs.length > this.maxLogs) this.logs.shift();
        },

        clear() {
            this.logs = [];
            Lampa.Noty.show('Логи очищено');
        },

        getAll() {
            return this.logs.join('\n');
        },

        openViewer() {
            const html = `
                <div class="logs-viewer" style="padding:1em; overflow:auto; color:#ccc; white-space:pre-wrap;">
                    ${this.logs.length ? this.logs.join('\n') : 'Журнал порожній.'}
                </div>
                <div class="logs-controls" style="margin-top:1em; display:flex; gap:1em;">
                    <div class="selector button" id="copy_logs">📋 Копіювати</div>
                    <div class="selector button" id="clear_logs">🗑 Очистити</div>
                </div>
            `;

            const modal = new Lampa.Modal({
                title: 'Логи плагіна',
                html,
                onBack: () => { modal.destroy(); },
            });

            modal.create();

            $('#copy_logs').on('hover:enter', () => {
                const text = PluginLogger.getAll();
                navigator.clipboard.writeText(text).then(() => {
                    Lampa.Noty.show('✅ Логи скопійовано в буфер');
                }).catch(() => {
                    Lampa.Noty.show('⚠️ Не вдалося скопіювати');
                });
            });

            $('#clear_logs').on('hover:enter', () => {
                PluginLogger.clear();
                modal.destroy();
                setTimeout(() => PluginLogger.openViewer(), 300);
            });
        }
    };

    // Перехоплюємо всі console.*
    ['log', 'warn', 'error'].forEach(type => {
        const orig = console[type];
        console[type] = function(...args) {
            PluginLogger.push(type, args);
            orig.apply(console, args);
        };
    });

    /****************************************
     * ⚙️ ОСНОВНА ЧАСТИНА ПЛАГІНА
     ****************************************/

    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = [];

    const ICON_SVG = `
        <svg height="30" viewBox="0 0 24 24" fill="none">
            <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/>
        </svg>`;

    const pluginTranslations = {
        persons_title: { ru: "Персоны", en: "Persons", uk: "Персони" },
        subscriibbe: { ru: "Подписаться", en: "Subscribe", uk: "Підписатися" },
        unsubscriibbe: { ru: "Отписаться", en: "Unsubscribe", uk: "Відписатися" },
        persons_not_found: { ru: "Персоны не найдены", en: "No persons found", uk: "Особи не знайдені" },
        logs_title: { ru: "Логи плагина", en: "Plugin Logs", uk: "Логи плагіна" }
    };

    function initStorage() {
        const current = Lampa.Storage.get(PERSONS_KEY);
        if (!Array.isArray(current)) Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }

    function getPersonsData() {
        return Lampa.Storage.get(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }

    function PersonsService() {
        this.list = function(params, onComplete) {
            const savedIds = getPersonsData();
            if (savedIds.length === 0) return onComplete({ results: [] });

            const lang = localStorage.getItem('language') || 'en';
            const results = [];
            let done = 0;

            savedIds.forEach(id => {
                const url = Lampa.TMDB.api(`person/${id}?api_key=${Lampa.TMDB.key()}&language=${lang}`);

                new Lampa.Reguest().silent(url, res => {
                    const data = typeof res === 'string' ? JSON.parse(res) : res;
                    console.log('=== PERSON DATA ===', id, data);

                    if (data?.id) {
                        if (typeof data.gender === 'undefined' || data.gender === null) {
                            console.warn('Gender missing for person', data.id, '- setting to 0');
                            data.gender = 0;
                        }

                        data.source = 'tmdb';
                        data.url = 'person/' + data.id;

                        data.card_events = {
                            onEnter: function(target, card_data) {
                                console.log('🎯 Open actor page for', card_data.id);
                                Lampa.Activity.push({
                                    url: 'person/' + card_data.id,
                                    title: card_data.name || 'Actor',
                                    component: 'actor',
                                    id: card_data.id,
                                    source: 'tmdb'
                                });
                            }
                        };

                        results.push(data);
                    }

                    if (++done === savedIds.length) {
                        console.log('✅ Persons loaded:', results);
                        onComplete({ results });
                    }
                }, () => {
                    console.error('❌ Failed to load person:', id);
                    if (++done === savedIds.length) onComplete({ results });
                });
            });
        };
    }

    /****************************************
     * 🚀 СТАРТ ПЛАГІНА
     ****************************************/
    function startPlugin() {
        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_logs: pluginTranslations.logs_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
        });

        initStorage();
        Lampa.Api.sources[PLUGIN_NAME] = new PersonsService();

        // Кнопка "Персони"
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

        // Кнопка "Логи"
        const logsItem = $(`
            <li class="menu__item selector" data-action="plugin_logs">
                <div class="menu__ico">🪵</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_logs')}</div>
            </li>`);
        logsItem.on('hover:enter', () => PluginLogger.openViewer());
        $('.menu .menu__list').eq(0).append(logsItem);

        console.log('✅ Плагін "Персони" запущено.');
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', e => { if (e.type === 'ready') startPlugin(); });

})();
