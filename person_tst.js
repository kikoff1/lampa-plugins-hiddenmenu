(function() {
    "use strict";

    // ==== ОСНОВНІ ЗМІННІ ====
    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var PAGE_SIZE = 20;
    var DEFAULT_PERSON_IDS = [];
    var currentPersonId = null;

    // ==== ЗБЕРІГАННЯ ====
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

    function isPersonsubscriibbed(personId) {
        return getPersonIds().includes(personId);
    }

    // ==== КНОПКА "SUBSCRIIBBE" ====
    function addButtonToContainer(bottomBlock) {
        var existingButton = bottomBlock.querySelector('.button--subscriibbe-plugin');
        if (existingButton && existingButton.parentNode) {
            existingButton.parentNode.removeChild(existingButton);
        }

        var issubscriibbed = isPersonsubscriibbed(currentPersonId);
        var buttonText = issubscriibbed ?
            Lampa.Lang.translate('persons_plugin_unsubscriibbe') :
            Lampa.Lang.translate('persons_plugin_subscriibbe');

        var button = document.createElement('div');
        button.className = 'full-start__button selector button--subscriibbe-plugin';
        button.classList.add(issubscriibbed ? 'button--unsubscriibbe' : 'button--subscriibbe');
        button.setAttribute('data-focusable', 'true');

        button.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${buttonText}</span>
        `;

        button.addEventListener('hover:enter', function () {
            var wasAdded = togglePersonSubscription(currentPersonId);
            var newText = wasAdded ?
                Lampa.Lang.translate('persons_plugin_unsubscriibbe') :
                Lampa.Lang.translate('persons_plugin_subscriibbe');

            button.classList.remove('button--subscriibbe', 'button--unsubscriibbe');
            button.classList.add(wasAdded ? 'button--unsubscriibbe' : 'button--subscriibbe');

            var span = button.querySelector('span');
            if (span) span.textContent = newText;
        });

        var buttonsContainer = bottomBlock.querySelector('.full-start__buttons');
        if (buttonsContainer) buttonsContainer.append(button);
        else bottomBlock.append(button);
    }

    function addsubscriibbeButton() {
        if (!currentPersonId) return;

        var bottomBlock = document.querySelector('.person-start__bottom');
        if (bottomBlock) addButtonToContainer(bottomBlock);
        else {
            let attempts = 0;
            const maxAttempts = 10;

            function tryAgain() {
                attempts++;
                var container = document.querySelector('.person-start__bottom');
                if (container) addButtonToContainer(container);
                else if (attempts < maxAttempts) setTimeout(tryAgain, 300);
            }

            setTimeout(tryAgain, 300);
        }
    }

    // ==== СЕРВІС СПИСКУ ПЕРСОН ====
    function PersonsService() {
        this.list = function (params, onComplete) {
            var page = parseInt(params.page, 10) || 1;
            var startIndex = (page - 1) * PAGE_SIZE;
            var endIndex = startIndex + PAGE_SIZE;
            var personIds = getPersonIds();
            var pageIds = personIds.slice(startIndex, endIndex);

            if (pageIds.length === 0) {
                onComplete({ results: [], page, total_pages: 0, total_results: 0 });
                return;
            }

            var loaded = 0;
            var results = [];
            var lang = localStorage.getItem('language') || 'en';

            pageIds.forEach(personId => {
                var url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url, function (json) {
                    if (json && json.id) {
                        results.push({
                            id: json.id,
                            title: json.name,
                            name: json.name,
                            poster_path: json.profile_path,
                            type: "person",
                            source: "tmdb",
                            media_type: "person"
                        });
                    }
                    checkComplete();
                }, checkComplete);
            });

            function checkComplete() {
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

    // ==== СТАРТ ПЛАГІНА ====
    function startPlugin() {
        initStorage();

        Lampa.Api.sources[PLUGIN_NAME] = new PersonsService();

        // меню "Персони"
        var menuItem = $(
            `<li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${ICON_SVG}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>`
        );

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

        // перехоплення вибору картки
        Lampa.Listener.follow('full', function (e) {
            if (e.type === 'open' && e.card && e.card.type === 'person') {
                Lampa.Activity.push({
                    component: 'actor',
                    source: 'tmdb',
                    id: e.card.id,
                    title: e.card.title,
                    poster_path: e.card.poster_path
                });
            }
        });

        // кнопка на сторінці актора
        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                setTimeout(addsubscriibbeButton, 300);
            }
        });
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', function (e) { if (e.type === 'ready') startPlugin(); });

})();
