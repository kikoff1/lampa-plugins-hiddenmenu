(function () {
    'use strict';

    // ========================================================================
    // LOCALIZATION (UA + RU fallback)
    // ========================================================================

    var LANG = (Lampa.Storage.get('language') || 'ru').toLowerCase();

    var i18n = {
        ru: {
            torrserver_not_set: 'TorrServer не настроен',
            preparing: 'Подготовка...',
            waiting_files: 'Ожидание файлов',
            restore_from: 'Восстанавливаем',
            playlist_loaded: 'Плейлист загружен',
            loading_playlist: 'Загрузка списка...',
            continue_watch: 'Продолжить',
            no_history: 'Нет истории'
        },
        ua: {
            torrserver_not_set: 'TorrServer не налаштовано',
            preparing: 'Підготовка...',
            waiting_files: 'Очікування файлів',
            restore_from: 'Відновлюємо',
            playlist_loaded: 'Плейлист завантажено',
            loading_playlist: 'Завантаження списку...',
            continue_watch: 'Продовжити',
            no_history: 'Історії немає'
        }
    };

    function t(key) {
        return (i18n[LANG] && i18n[LANG][key]) || i18n.ru[key] || key;
    }

    // ========================================================================
    // CONFIG & CACHE
    // ========================================================================

    var MEMORY_CACHE = null;
    var TORRSERVER_CACHE = null;
    var FILES_CACHE = {};

    var ACCOUNT_READY = !!window.appready;

    var ACTIVE_STORAGE_KEY = null;
    var SYNCED_STORAGE_KEY = null;

    var MIGRATION_FLAG_KEY = 'continue_watch_params__migrated_to_profiles';

    var TIMERS = {
        save: null,
        debounce_click: null
    };

    var LISTENERS = {
        player_start: null,
        player_destroy: null,
        initialized: false
    };

    var STATE = {
        building_playlist: false
    };

    // ========================================================================
    // STORAGE / PROFILES
    // ========================================================================

    function getStorageKey() {
        try {
            if (
                ACCOUNT_READY &&
                Lampa.Account &&
                Lampa.Account.Permit &&
                Lampa.Account.Permit.sync &&
                Lampa.Account.Permit.account &&
                Lampa.Account.Permit.account.profile &&
                typeof Lampa.Account.Permit.account.profile.id !== 'undefined'
            ) {
                return 'continue_watch_params_' + Lampa.Account.Permit.account.profile.id;
            }
        } catch (e) {}
        return 'continue_watch_params';
    }

    function getActiveStorageKey() {
        var key = getStorageKey();
        if (ACTIVE_STORAGE_KEY !== key) {
            ACTIVE_STORAGE_KEY = key;
            MEMORY_CACHE = null;
        }
        return key;
    }

    function ensureStorageSync() {
        var key = getActiveStorageKey();
        if (SYNCED_STORAGE_KEY !== key) {
            try {
                Lampa.Storage.sync(key, 'object_object');
            } catch (e) {}
            SYNCED_STORAGE_KEY = key;
        }
    }

    ensureStorageSync();

    Lampa.Storage.listener.follow('change', function (e) {
        if (e.name && typeof e.name === 'string' && e.name.indexOf('continue_watch_params') === 0) {
            MEMORY_CACHE = null;
        }

        if (e.name === 'account') {
            MEMORY_CACHE = null;
            ensureStorageSync();
            migrateOldData();
        }

        if (
            e.name === 'torrserver_url' ||
            e.name === 'torrserver_url_two' ||
            e.name === 'torrserver_use_link'
        ) {
            TORRSERVER_CACHE = null;
        }
    });

    function getParams() {
        ensureStorageSync();
        if (!MEMORY_CACHE) MEMORY_CACHE = Lampa.Storage.get(getActiveStorageKey(), {});
        return MEMORY_CACHE;
    }

    function setParams(data, force) {
        ensureStorageSync();
        MEMORY_CACHE = data;
        clearTimeout(TIMERS.save);

        var key = getActiveStorageKey();

        if (force) {
            Lampa.Storage.set(key, data);
        } else {
            TIMERS.save = setTimeout(function () {
                Lampa.Storage.set(key, data);
            }, 1000);
        }
    }

    function updateContinueWatchParams(hash, data) {
        var params = getParams();
        if (!params[hash]) params[hash] = {};

        var changed = false;
        for (var key in data) {
            if (params[hash][key] !== data[key]) {
                params[hash][key] = data[key];
                changed = true;
            }
        }

        if (changed || !params[hash].timestamp) {
            params[hash].timestamp = Date.now();
            var isCritical = (data.percent && data.percent > 90);
            setParams(params, isCritical);
        }
    }

    function getTorrServerUrl() {
        if (!TORRSERVER_CACHE) {
            var url = Lampa.Storage.get('torrserver_url');
            var url_two = Lampa.Storage.get('torrserver_url_two');
            var use_two = Lampa.Storage.field('torrserver_use_link') == 'two';
            var final_url = use_two ? (url_two || url) : (url || url_two);

            if (final_url) {
                if (!final_url.match(/^https?:\/\//)) final_url = 'http://' + final_url;
                final_url = final_url.replace(/\/$/, '');
            }
            TORRSERVER_CACHE = final_url;
        }
        return TORRSERVER_CACHE;
    }

    // ========================================================================
    // HELPERS
    // ========================================================================

    function formatTime(seconds) {
        if (!seconds) return '';
        var h = Math.floor(seconds / 3600);
        var m = Math.floor((seconds % 3600) / 60);
        var s = Math.floor(seconds % 60);
        return h > 0
            ? h + ':' + (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s
            : m + ':' + (s < 10 ? '0' : '') + s;
    }

    function buildStreamUrl(params) {
        if (!params || !params.file_name || !params.torrent_link) return null;

        var server_url = getTorrServerUrl();
        if (!server_url) {
            Lampa.Noty.show(t('torrserver_not_set'));
            return null;
        }

        var url = server_url + '/stream/' + encodeURIComponent(params.file_name);
        var query = [];
        query.push('link=' + params.torrent_link);
        query.push('index=' + (params.file_index || 0));
        query.push('play');

        return url + '?' + query.join('&');
    }

    // ========================================================================
    // UI BUTTON
    // ========================================================================

    function handleContinueClick(movieData, buttonElement) {
        if (TIMERS.debounce_click) return;

        var params = getStreamParams(movieData);
        if (!params) {
            Lampa.Noty.show(t('no_history'));
            return;
        }

        if (buttonElement) $(buttonElement).css('opacity', 0.5);

        TIMERS.debounce_click = setTimeout(function () {
            TIMERS.debounce_click = null;
            if (buttonElement) $(buttonElement).css('opacity', 1);
        }, 1000);

        launchPlayer(movieData, params);
    }

    function setupContinueButton() {
        Lampa.Listener.follow('full', function (e) {
            if (e.type !== 'complite') return;

            requestAnimationFrame(function () {
                var activity = e.object.activity;
                var render = activity.render();
                if (render.find('.button--continue-watch').length) return;

                var params = getStreamParams(e.data.movie);
                if (!params) return;

                var percent = params.percent || 0;
                var timeStr = params.time ? formatTime(params.time) : '';

                var labelText = t('continue_watch');
                if (params.season && params.episode) {
                    labelText += ' S' + params.season + ' E' + params.episode;
                }
                if (timeStr) {
                    labelText += ' <span style="opacity:.7">(' + timeStr + ')</span>';
                }

                var dashArray = (percent * 65.97 / 100).toFixed(2);

                var html = `
                    <div class="full-start__button selector button--continue-watch">
                        <svg viewBox="0 0 24 24" width="22" height="22">
                            <path d="M8 5v14l11-7z" fill="currentColor"/>
                            <circle cx="12" cy="12" r="10.5"
                                stroke="currentColor"
                                stroke-width="1.5"
                                fill="none"
                                stroke-dasharray="${dashArray} 65.97"
                                transform="rotate(-90 12 12)"
                                style="opacity:.5"/>
                        </svg>
                        <div>${labelText}</div>
                    </div>
                `;

                var btn = $(html);
                btn.on('hover:enter', function () {
                    handleContinueClick(e.data.movie, this);
                });

                render.find('.full-start__buttons').append(btn);
            });
        });
    }

    // ========================================================================
    // INIT
    // ========================================================================

    function add() {
        ensureStorageSync();
        setupContinueButton();
        console.log('[ContinueWatch] Loaded with UA localization');
    }

    if (window.appready) add();
    else Lampa.Listener.follow('app', function (e) {
        if (e.type === 'ready') add();
    });

})();
