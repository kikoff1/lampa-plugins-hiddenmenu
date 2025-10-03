(function () {
    "use strict";

    // ==== Константи ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = { cards: {}, ids: [] };
    const CSS_CLASSES = {
        BUTTON: 'button--persons-plugin',
        SUBSCRIBED: 'unsubscriibbe',
        UNSUBSCRIBED: 'subscriibbe'
    };
    let currentPersonId = null;
    let my_logging = true;

    const ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    // ==== Локалізація ====
    Lampa.Lang.add({
        en: {
            'persons.subscribe': 'Subscribe',
            'persons.unsubscribe': 'Unsubscribe',
            'menu.persons': 'Persons'
        },
        uk: {
            'persons.subscribe': 'Підписатися',
            'persons.unsubscribe': 'Відписатися',
            'menu.persons': 'Персони'
        },
        ru: {
            'persons.subscribe': 'Подписаться',
            'persons.unsubscribe': 'Отписаться',
            'menu.persons': 'Персоны'
        }
    });

    // ==== Логування ====
    function log() {
        if (my_logging) console.log.apply(console, arguments);
    }
    function error() {
        if (my_logging) console.error.apply(console, arguments);
    }

    // ==== Сховище ====
    function initStorage() {
        const current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || !current.cards) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
        }
    }
    function getPersonsData() {
        return Lampa.Storage.get(PERSONS_KEY, DEFAULT_PERSONS_DATA);
    }
    function savePersonCard(personId, personData) {
        log('Saving person card:', personId, personData.name);
        const savedPersons = getPersonsData();
        savedPersons.cards[personId] = personData;
        if (!savedPersons.ids.includes(personId)) {
            savedPersons.ids.push(personId);
        }
        Lampa.Storage.set(PERSONS_KEY, savedPersons);
    }
    function removePersonCard(personId) {
        log('Removing person card:', personId);
        const savedPersons = getPersonsData();
        delete savedPersons.cards[personId];
        const index = savedPersons.ids.indexOf(personId);
        if (index !== -1) savedPersons.ids.splice(index, 1);
        Lampa.Storage.set(PERSONS_KEY, savedPersons);
    }
    function isPersonSubscribed(personId) {
        const savedPersons = getPersonsData();
        return savedPersons.ids.includes(personId);
    }

    // ==== Кнопка ====
    function createButton(text, isSubscribed) {
        const button = document.createElement('div');
        button.className = `full-start__button selector ${CSS_CLASSES.BUTTON}`;
        button.classList.add(isSubscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED);
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${text}</span>
        `;
        return button;
    }

    function injectButton(container) {
        const isSubscribed = isPersonSubscribed(currentPersonId);
        const buttonText = Lampa.Lang.translate(isSubscribed ? 'persons.unsubscribe' : 'persons.subscribe');
        const button = createButton(buttonText, isSubscribed);

        button.addEventListener('hover:enter', () => togglePersonSubscription(currentPersonId, button));

        // Сховати стандартну кнопку
        const defaultBtn = container.querySelector('.full-start__button.button--subscribe');
        if (defaultBtn) defaultBtn.style.display = 'none';

        container.appendChild(button);
    }

    // ==== Підписка ====
    function togglePersonSubscription(personId, button) {
        const savedPersons = getPersonsData();
        const index = savedPersons.ids.indexOf(personId);

        if (index === -1) {
            const url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${localStorage.getItem('language') || 'en'}`);
            new Lampa.Reguest().silent(url,
                (response) => {
                    const json = typeof response === 'string' ? JSON.parse(response) : response;
                    if (json && json.id) {
                        savePersonCard(personId, json);
                        updateButtonUI(button, true);
                    }
                },
                (err) => {
                    error('Failed to load person data:', err);
                    updateButtonUI(button, false);
                }
            );
        } else {
            removePersonCard(personId);
            updateButtonUI(button, false);
        }
    }

    function updateButtonUI(button, subscribed) {
        button.classList.remove(CSS_CLASSES.SUBSCRIBED, CSS_CLASSES.UNSUBSCRIBED);
        button.classList.add(subscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED);
        const span = button.querySelector('span');
        if (span) span.textContent = Lampa.Lang.translate(subscribed ? 'persons.unsubscribe' : 'persons.subscribe');
    }

    // ==== Сервіс для меню ====
    function PersonsService() {
        this.list = function (params, onComplete) {
            const savedPersons = getPersonsData();
            const results = savedPersons.ids.map(id => {
                const card = savedPersons.cards[id];
                if (card) {
                    const modified = Object.assign({}, card);
                    modified.click = () => {
                        Lampa.Activity.push({
                            component: 'actor',
                            id: parseInt(id, 10),
                            title: card.name || 'Actor',
                            source: 'tmdb'
                        });
                    };
                    modified.component = 'actor';
                    modified.source = 'tmdb';
                    modified.type = 'person';
                    return modified;
                }
                return null;
            }).filter(Boolean);
            onComplete({ results, page: 1, total_pages: 1, total_results: results.length });
        };
    }

    function addMenuItem() {
        const menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
            '<div class="menu__ico">' + ICON_SVG + '</div>' +
            '<div class="menu__text">' + Lampa.Lang.translate('menu.persons') + '</div>' +
            '</li>'
        );
        menuItem.on("hover:enter", () => {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('menu.persons'),
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });
        $(".menu .menu__list").eq(0).append(menuItem);
    }

    // ==== Плагін ====
    function initPlugin() {
        initStorage();
        Lampa.Api.sources[PLUGIN_NAME] = new PersonsService();
        addMenuItem();

        Lampa.Listener.follow('activity', (e) => {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                setTimeout(() => {
                    const container = document.querySelector('.person-start__bottom');
                    if (container) injectButton(container);
                }, 500);
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') initPlugin(); });

})();