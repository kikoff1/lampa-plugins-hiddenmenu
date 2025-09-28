(function () {
    'use strict';

    const pluginTitle = 'Persons Plugin';
    let currentPersonId = null;

    // ------------------------
    // Storage helpers
    // ------------------------
    function getSubscribedPersons() {
        return Lampa.Storage.get('persons_subscriptions', '[]', true);
    }

    function isPersonSubscribed(id) {
        return getSubscribedPersons().includes(id);
    }

    function togglePersonSubscription(id) {
        let subs = getSubscribedPersons();
        if (subs.includes(id)) {
            subs = subs.filter(pid => pid !== id);
            Lampa.Storage.set('persons_subscriptions', JSON.stringify(subs));
            return false;
        } else {
            subs.push(id);
            Lampa.Storage.set('persons_subscriptions', JSON.stringify(subs));
            return true;
        }
    }

    // ------------------------
    // Button rendering
    // ------------------------
    function addButtonToContainer(container) {
        const existingButton = container.querySelector(".button--subscriibbe-plugin");
        if (existingButton) existingButton.remove();

        const isSubscribed = isPersonSubscribed(currentPersonId);
        const buttonText = isSubscribed ? "Unsubscriibbe" : "Subscriibbe";

        const button = document.createElement("div");
        button.className = "full-start__button selector button--subscriibbe-plugin";
        button.classList.add(isSubscribed ? "button--unsubscribe" : "button--subscribe");
        button.setAttribute("data-focusable", "true");

        button.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${buttonText}</span>
        `;

        button.addEventListener("hover:enter", function () {
            const wasAdded = togglePersonSubscription(currentPersonId);
            const newText = wasAdded ? "Unsubscriibbe" : "Subscriibbe";

            button.classList.remove("button--subscribe", "button--unsubscribe");
            button.classList.add(wasAdded ? "button--unsubscribe" : "button--subscribe");

            const span = button.querySelector("span");
            if (span) span.textContent = newText;

            updatePersonsList();
        });

        container.append(button);
    }

    function addSubscribeButton() {
        if (!currentPersonId) return;

        let attempts = 0;
        const maxAttempts = 15;

        function tryInsert() {
            attempts++;
            const container = document.querySelector(".full-start__buttons") ||
                              document.querySelector(".person-start__bottom");
            if (container) {
                addButtonToContainer(container);
            } else if (attempts < maxAttempts) {
                setTimeout(tryInsert, 300);
            }
        }

        tryInsert();
    }

    // ------------------------
    // PersonsService (фільмографія)
    // ------------------------
    function PersonsService() {}

    PersonsService.list = function (params, onComplete, onError) {
        let results = [];
        let remaining = getSubscribedPersons().length;

        if (remaining === 0) {
            onComplete([]);
            return;
        }

        const currentLang = Lampa.Storage.field('tmdb_lang') || 'uk-UA';

        getSubscribedPersons().forEach(personId => {
            const url = Lampa.TMDB.api(`person/${personId}/combined_credits?api_key=${Lampa.TMDB.key()}&language=${currentLang}`);

            new Lampa.Reguest().silent(url, function (response) {
                try {
                    const json = typeof response === 'string' ? JSON.parse(response) : response;
                    if (json && (json.cast || []).length) {
                        const credits = json.cast.map(item => ({
                            id: item.id,
                            title: item.title || item.name,
                            name: item.title || item.name,
                            poster_path: item.poster_path,
                            type: item.media_type,
                            source: "tmdb",
                            media_type: item.media_type
                        }));
                        results.push(...credits);
                    }
                } catch (e) {}

                if (--remaining === 0) {
                    onComplete(results);
                }
            }, function () {
                if (--remaining === 0) {
                    onComplete(results);
                }
            });
        });
    };

    // ------------------------
    // Update menu
    // ------------------------
    function updatePersonsList() {
        Lampa.Arrays.removeLast(Lampa.Menu.listeners, onMenu);
        Lampa.Menu.listeners.push(onMenu);
    }

    function onMenu(menu) {
        menu.push({
            title: "Persons",
            id: "persons",
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87"/><path d="M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>',
            action: function () {
                Lampa.Activity.push({
                    url: '',
                    title: "Persons Subscriptions",
                    component: 'category_full',
                    page: 1,
                    source: 'persons',
                    card_type: true
                });
            }
        });
    }

    Lampa.Component.add('persons', PersonsService);

    // ------------------------
    // Activity hook (actor page)
    // ------------------------
    Lampa.Listener.follow('activity', function (e) {
        if (e.type === 'component' && e.component === 'actor') {
            currentPersonId = e.data.id;
            addSubscribeButton();
        }
    });

    // ------------------------
    // Init
    // ------------------------
    updatePersonsList();

})();
