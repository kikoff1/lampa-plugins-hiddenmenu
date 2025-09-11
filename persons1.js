!function() {
    "use strict";
    
    // Конфигурация плагина
    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var PAGE_SIZE = 20;
    var DEFAULT_PERSON_IDS = [];  // Можно задать начальные ID, если нужно
    var currentPersonId = null;
    var my_logging = true; // Включить/выключить логирование
    
    // Переводы для плагина
    var pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons",
            uk: "Персони",
            be: "Асобы"
        },
        subscribe: {
            ru: "Подписаться",
            en: "Subscribe",
            uk: "Підписатися",
            be: "Падпісацца"
        },
        unsubscribe: {
            ru: "Отписаться",
            en: "Unsubscribe",
            uk: "Відписатися",
            be: "Адпісацца"
        },
        persons_not_found: {
            ru: "Персоны не найдены",
            en: "No persons found",
            uk: "Особи не знайдені",
            be: "Асобы не знойдзены"
        }
    };
    
    // Иконка для меню
    var ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11Z"/>' +
        '<path d="M8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11Z"/>' +
        '<path d="M8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13Z"/>' +
        '<path d="M16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z"/>' +
        '</svg>';
    
    // Логирование
    function log() {
        if (my_logging && console && console.log) {
            try {
                console.log.apply(console, arguments);
            } catch (e) {
                // ignore
            }
        }
    }
    
    function error() {
        if (my_logging && console && console.error) {
            try {
                console.error.apply(console, arguments);
            } catch (e) {
                // ignore
            }
        }
    }
    
    // Работа с хранилищем
    function getCurrentLanguage() {
        try {
            var lang = localStorage.getItem('language');
            return lang || 'en';
        } catch(e) {
            return 'en';
        }
    }
    
    function initStorage() {
        var stored = Lampa.Storage.get(PERSONS_KEY);
        if (!stored || !Array.isArray(stored) || stored.length === 0) {
            Lampa.Storage.set(PERSONS_KEY, JSON.stringify(DEFAULT_PERSON_IDS));
        }
    }
    
    function getPersonIds() {
        var stored = Lampa.Storage.get(PERSONS_KEY);
        if (!stored) return [];
        try {
            if (typeof stored === 'string') {
                var arr = JSON.parse(stored);
                if (Array.isArray(arr)) return arr;
            }
            if (Array.isArray(stored)) return stored;
        } catch(e) {
            log("[PERSON-PLUGIN] parse error in getPersonIds", e);
        }
        return [];
    }
    
    function setPersonIds(ids) {
        try {
            var str = JSON.stringify(ids);
            Lampa.Storage.set(PERSONS_KEY, str);
        } catch(e) {
            error("[PERSON-PLUGIN] error in setPersonIds", e);
        }
    }
    
    function togglePersonSubscription(personId) {
        var personIds = getPersonIds();
        var index = personIds.indexOf(personId);
        
        var added;
        if (index === -1) {
            personIds.push(personId);
            added = true;
        } else {
            personIds.splice(index, 1);
            added = false;
        }
        
        setPersonIds(personIds);
        return added;
    }
    
    function isPersonSubscribed(personId) {
        var personIds = getPersonIds();
        return personIds.indexOf(personId) !== -1;
    }
    
    // Добавление кнопки "подписаться"/"отписаться"
    function addButtonToContainer(bottomBlock) {
        log("[PERSON-PLUGIN] Adding subscribe button, currentPersonId:", currentPersonId);
        
        if (!bottomBlock) {
            error("[PERSON-PLUGIN] bottomBlock is null");
            return;
        }
        
        // Удаление уже существующей кнопки
        var existing = bottomBlock.querySelector('.button--subscribe-plugin');
        if (existing) existing.remove();
        
        var subscribed = isPersonSubscribed(currentPersonId);
        var btnText = subscribed ? 
            Lampa.Lang.translate('unsubscribe') : 
            Lampa.Lang.translate('subscribe');
        
        var button = document.createElement('div');
        button.className = 'full-start__button selector button--subscribe-plugin ' + (subscribed ? 'button--unsubscribe' : 'button--subscribe');
        button.setAttribute('data-focusable', 'true');
        button.innerHTML = 
            '<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>' +
            '<path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.71810 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.92730 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>' +
            '</svg>' +
            '<span>' + btnText + '</span>';
        
        // События
        button.addEventListener('hover:enter', function() {
            var wasAdded = togglePersonSubscription(currentPersonId);
            updateButtonUI(button, wasAdded);
        });
        // Так же добавим на click на случай, если hover:enter не срабатывает
        button.addEventListener('click', function() {
            var wasAdded = togglePersonSubscription(currentPersonId);
            updateButtonUI(button, wasAdded);
        });
        
        // Вставка
        var btnContainer = bottomBlock.querySelector('.full-start__buttons');
        if (btnContainer) {
            btnContainer.append(button);
        } else {
            bottomBlock.append(button);
        }
        
        addButtonStyles();
    }
    
    function updateButtonUI(button, subscribed) {
        if (!button) return;
        if (subscribed) {
            button.classList.remove('button--subscribe');
            button.classList.add('button--unsubscribe');
            var sp = button.querySelector('span');
            if (sp) sp.textContent = Lampa.Lang.translate('unsubscribe');
        } else {
            button.classList.remove('button--unsubscribe');
            button.classList.add('button--subscribe');
            var sp = button.querySelector('span');
            if (sp) sp.textContent = Lampa.Lang.translate('subscribe');
        }
        // После изменения списка подписок — можно перезагрузить экран, если нужно
        updatePersonsList();
    }
    
    function updatePersonsList() {
        var activity = Lampa.Activity.active();
        if (activity && activity.component === 'category_full' && activity.source === PLUGIN_NAME) {
            log("[PERSON-PLUGIN] Reloading persons list");
            Lampa.Activity.reload();
        }
    }
    
    function waitForContainer(callback) {
        var attempts = 0;
        var maxAttempts = 15;
        var selector = '.person-start__bottom';
        function check() {
            attempts++;
            var container = document.querySelector(selector);
            if (container) {
                callback(container);
            } else if (attempts < maxAttempts) {
                setTimeout(check, 200);
            } else {
                error("[PERSON-PLUGIN] Container '" + selector + "' not found after " + attempts + " attempts");
            }
        }
        // сразу проверка
        var immediate = document.querySelector(selector);
        if (immediate) {
            callback(immediate);
        } else {
            setTimeout(check, 200);
        }
    }
    
    function extractPersonIdFromActivity(activity) {
        if (!activity) return null;
        // Возможные источники id
        if (activity.id) return parseInt(activity.id, 10);
        if (activity.params && activity.params.id) return parseInt(activity.params.id, 10);
        if (activity.object && activity.object.id) return parseInt(activity.object.id, 10);
        // Возможно, есть e.g. activity.object.personId или другое
        return null;
    }
    
    function checkCurrentActivity() {
        var activity = Lampa.Activity.active();
        log("[PERSON-PLUGIN] checkCurrentActivity, activity:", activity && activity.component);
        if (activity && (activity.component === 'actor' || activity.component === 'person' || activity.component === 'cast')) {
            var pid = extractPersonIdFromActivity(activity);
            if (pid) {
                currentPersonId = pid;
                log("[PERSON-PLUGIN] Found currentPersonId:", currentPersonId);
                waitForContainer(function(container) {
                    addButtonToContainer(container);
                });
            } else {
                error("[PERSON-PLUGIN] Actor page but no id found");
            }
        }
    }
    
    // Сервис загрузки персон
    function PersonsService() {
        var cache = {};
        this.list = function(params, onComplete, onError) {
            var page = parseInt(params.page, 10) || 1;
            var personIds = getPersonIds();
            var total = personIds.length;
            var totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
            
            var start = (page - 1) * PAGE_SIZE;
            var end = Math.min(start + PAGE_SIZE, total);
            var pageIds = personIds.slice(start, end);
            
            if (pageIds.length === 0) {
                onComplete({
                    results: [],
                    page: page,
                    total_pages: totalPages,
                    total_results: total
                });
                return;
            }
            
            var loaded = 0;
            var results = [];
            var currentLang = getCurrentLanguage();
            
            pageIds.forEach(function(personId, idx) {
                if (cache[personId]) {
                    results[idx] = cache[personId];
                    loaded++;
                    if (loaded === pageIds.length) {
                        finish();
                    }
                } else {
                    var path = 'person/' + personId + '?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang;
                    var url = Lampa.TMDB.api(path);
                    new Lampa.Reguest().silent(url, function(response) {
                        try {
                            var json = typeof response === 'string' ? JSON.parse(response) : response;
                            if (json && json.id) {
                                var personCard = {
                                    id: json.id,
                                    title: json.name,
                                    name: json.name,
                                    poster_path: json.profile_path,
                                    profile_path: json.profile_path,
                                    type: "actor",
                                    source: "tmdb",
                                    media_type: "person",
                                    known_for_department: json.known_for_department,
                                    gender: json.gender || 0,
                                    popularity: json.popularity || 0
                                };
                                cache[personId] = personCard;
                                results[idx] = personCard;
                            }
                        } catch(e) {
                            error("[PERSON-PLUGIN] Error parsing for personId " + personId, e);
                        }
                        loaded++;
                        if (loaded === pageIds.length) {
                            finish();
                        }
                    }, function(errMsg) {
                        error("[PERSON-PLUGIN] Request error for personId " + personId, errMsg);
                        loaded++;
                        if (loaded === pageIds.length) {
                            finish();
                        }
                    });
                }
            });
            
            function finish() {
                // фильтрация пустых
                var valid = results.filter(function(it) { return !!it; });
                // сохраняем порядок по personIds
                valid.sort(function(a, b) {
                    return personIds.indexOf(a.id) - personIds.indexOf(b.id);
                });
                onComplete({
                    results: valid,
                    page: page,
                    total_pages: totalPages,
                    total_results: total
                });
            }
        };
    }
    
    function addMenuItem() {
        // Добавим пункт в меню
        var title = Lampa.Lang.translate('persons_title');
        var item = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
                '<div class="menu__ico">' + ICON_SVG + '</div>' +
                '<div class="menu__text">' + title + '</div>' +
            '</li>'
        );
        item.on("hover:enter click", function() {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: title,
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });
        $(".menu .menu__list").eq(0).append(item);
    }
    
    function addButtonStyles() {
        if (document.getElementById('subscribe-button-styles')) return;
        
        var css = [
            '.button--subscribe-plugin {',
            '    display: inline-flex;',
            '    align-items: center;',
            '    justify-content: center;',
            '    margin-top: 10px;',
            '}',
            '.button--subscribe-plugin.button--subscribe {',
            '    color: #4CAF50;',
            '}',
            '.button--subscribe-plugin.button--unsubscribe {',
            '    color: #F44336;',
            '}'
        ].join('\n');
        
        var style = document.createElement('style');
        style.id = 'subscribe-button-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    function startPlugin() {
        // Переводы
        Lampa.Lang.add({
            persons_title: pluginTranslations.persons_title,
            subscribe: pluginTranslations.subscribe,
            unsubscribe: pluginTranslations.unsubscribe,
            persons_not_found: pluginTranslations.persons_not_found
        });
        
        initStorage();
        
        var personsService = new PersonsService();
        Lampa.Api.sources[PLUGIN_NAME] = personsService;
        
        addMenuItem();
        
        // Слушаем активити
        Lampa.Listener.follow('activity', function(e) {
            log("[PERSON-PLUGIN] activity event:", e.type, e.component);
            if (e.type === 'start' && (e.component === 'actor' || e.component === 'person' || e.component === 'cast')) {
                var pid = extractPersonIdFromActivity(e);
                if (pid) {
                    currentPersonId = pid;
                    waitForContainer(function(container) {
                        addButtonToContainer(container);
                    });
                } else {
                    error("[PERSON-PLUGIN] activity start but no id in event");
                }
            }
            // При возврате к странице списка персон
            else if (e.type === 'resume' && e.component === 'category_full' && e.object && e.object.source === PLUGIN_NAME) {
                log("[PERSON-PLUGIN] resume persons list");
                setTimeout(function() {
                    Lampa.Activity.reload();
                }, 100);
            }
        });
        
        // Проверим, может мы уже на странице актера
        setTimeout(function() {
            checkCurrentActivity();
        }, 1500);
    }
    
    // Запуск
    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                startPlugin();
            }
        });
    }
}();
