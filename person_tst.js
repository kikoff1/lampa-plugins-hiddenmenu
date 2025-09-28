(function () {
    "use strict";

    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var PAGE_SIZE = 20;
    var DEFAULT_PERSON_IDS = [];
    var currentPersonId = null;
    var my_logging = true;

    var pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons",
            uk: "Персони",
        },
        subscriibbe: {
            ru: "Подписаться",
            en: "Subscribe",
            uk: "Підписатися",
        },
        unsubscriibbe: {
            ru: "Отписаться",
            en: "Unsubscribe",
            uk: "Відписатися",
        },
        persons_not_found: {
            ru: "Персоны не найдены",
            en: "No persons found",
            uk: "Особи не знайдені",
        }
    };

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        var current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || current.length === 0) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSON_IDS);
        }
    }

    function getPersonIds() {
        return Lampa.Storage.get(PERSONS_KEY, []);
    }

    function togglePersonSubscription(personId) {
        var personIds = getPersonIds();
        var index = personIds.indexOf(personId);

        if (index === -1) personIds.push(personId);
        else personIds.splice(index, 1);

        Lampa.Storage.set(PERSONS_KEY, personIds);
        return index === -1;
    }

    function isPersonSubscribed(personId) {
        return getPersonIds().includes(personId);
    }

    function addButtonToContainer(container) {
        var existing = container.querySelector('.button--subscriibbe-plugin');
        if (existing) existing.remove();

        var subscribed = isPersonSubscribed(currentPersonId);
        var text = subscribed
            ? Lampa.Lang.translate('persons_plugin_unsubscriibbe')
            : Lampa.Lang.translate('persons_plugin_subscriibbe');

        var btn = document.createElement('div');
        btn.className = 'full-start__button selector button--subscriibbe-plugin';
        btn.classList.add(subscribed ? 'button--unsubscriibbe' : 'button--subscriibbe');
        btn.setAttribute('data-focusable', 'true');
        btn.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${text}</span>
        `;

        btn.addEventListener('hover:enter', function () {
            var wasAdded = togglePersonSubscription(currentPersonId);
            var newText = wasAdded
                ? Lampa.Lang.translate('persons_plugin_unsubscriibbe')
                : Lampa.Lang.translate('persons_plugin_subscriibbe');

            btn.classList.toggle('button--subscriibbe', !wasAdded);
            btn.classList.toggle('button--unsubscriibbe', wasAdded);
            btn.querySelector('span').textContent = newText;

            updatePersonsList();
        });

        var buttons = container.querySelector('.full-start__buttons');
        if (buttons) buttons.append(btn);
        else container.append(btn);
    }

    function addSubscribeButton() {
        if (!currentPersonId) return;

        let attempts = 0;
        const maxAttempts = 10;

        function tryAdd() {
            const container = document.querySelector('.person-start__bottom');
            if (container) {
                addButtonToContainer(container);
            } else if (++attempts < maxAttempts) {
                setTimeout(tryAdd, 300);
            }
        }

        tryAdd();
    }

    function updatePersonsList() {
        const activity = Lampa.Activity.active();
        if (activity && activity.component === 'category_full' && activity.source === PLUGIN_NAME) {
            Lampa.Activity.reload();
        }
    }

    function addButtonStyles() {
        if (document.getElementById('subscriibbe-button-styles')) return;

        const style = document.createElement('style');
        style.id = 'subscriibbe-button-styles';
        style.textContent = `
            .full-start__button.selector.button--subscriibbe-plugin.button--subscriibbe {
                color: #4CAF50;
            }
            .full-start__button.selector.button--subscriibbe-plugin.button--unsubscriibbe {
                color: #F44336;
            }
        `;
        document.head.appendChild(style);
    }

    function PersonsService() {
        var self = this;
        var cache = {};

        this.list = function (params, onComplete) {
            var page = parseInt(params.page, 10) || 1;
            var startIndex = (page - 1) * PAGE_SIZE;
            var endIndex = startIndex + PAGE_SIZE;
            var personIds = getPersonIds();
            var pageIds = personIds.slice(startIndex, endIndex);

            if (pageIds.length === 0) {
                onComplete({
                    results: [],
                    page,
                    total_pages: 0,
                    total_results: 0
                });
                return;
            }

            var loaded = 0;
            var results = [];
            var lang = getCurrentLanguage();

            pageIds.forEach(personId => {
                if (cache[personId]) {
                    results.push(cache[personId]);
                    checkDone();
                    return;
                }

                var url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url, response => {
                    try {
                        const json = typeof response === 'string' ? JSON.parse(response) : response;
                        if (json && json.id) {
                            const personCard = {
                                id: json.id,
                                title: json.name,
                                name: json.name,
                                poster_path: json.profile_path,
                                component: "actor",
                                url: "/person/" + json.id
                            };
                            cache[personId] = personCard;
                            results.push(personCard);
                        }
                    } catch (e) { }
                    checkDone();
                }, checkDone);
            });

            function checkDone() {
                loaded++;
                if (loaded >= pageIds.length) {
                    onComplete({
                        results,
                        page,
                        total_pages: Math.ceil(personIds.length / PAGE_SIZE),
                        total_results: personIds.length
                    });
                }
            }
        };
    }

    function startPlugin() {
        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();

        var personsService = new PersonsService();
        Lampa.Api.sources[PLUGIN_NAME] = personsService;

        const icon = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

        var menuItem = $(`
            <li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${icon}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>
        `);

        menuItem.on("hover:enter", function () {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('persons_plugin_title'),
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        function checkActivity() {
            const activity = Lampa.Activity.active();
            if (activity && activity.component === 'actor') {
                currentPersonId = parseInt(activity.id || activity.params?.id || location.pathname.match(/\/person\/(\d+)/)?.[1], 10);
                if (currentPersonId) addSubscribeButton();
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                addSubscribeButton();
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        setTimeout(checkActivity, 1000);
        addButtonStyles();
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
