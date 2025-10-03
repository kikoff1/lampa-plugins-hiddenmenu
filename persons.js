(function () {
    "use strict";

    // ==== Приховати стандартну кнопку "Subscribe" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;

        const css = `.button--subscribe { display: none !important; }`;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== Константи ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const DEFAULT_PERSONS_DATA = { cards: {}, ids: [] };
    let currentPersonId = null;
    let personsCache = null;
    let my_logging = true;

    const CSS_CLASSES = {
        BUTTON: 'button--persons-plugin',
        SUBSCRIBED: 'unsubscriibbe',
        UNSUBSCRIBED: 'subscriibbe'
    };

    const ICON_SVG = `<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>`;

    // ==== Локалізація ====
    Lampa.Lang.add({
        persons_plugin_subscribe: {
            ru: "Подписаться", 
en: "Subscribe", 
uk: "Підписатися", 
be: "Падпісацца",
            pt: "Subscrever", 
zh: "订阅", 
he: "הירשם", 
cs: "Odebírat", 
bg: "Абонирай се"
        },
        persons_plugin_unsubscribe: {
            ru: "Отписаться", en: "Unsubscribe", uk: "Відписатися", be: "Адпісацца",
            pt: "Cancelar subscrição", zh: "取消订阅", he: "בטל הרשמה", cs: "Zrušit odběr", bg: "Отпиши се"
        },
        persons_plugin_title: {
            ru: "Персоны", en: "Persons", uk: "Персони", be: "Асобы",
            pt: "Pessoas", zh: "人物", he: "אנשים", cs: "Osoby", bg: "Хора"
        },
        persons_not_found: {
            ru: "Персоны не найдены", en: "No persons found", uk: "Особи не знайдені", be: "Асобы не знойдзены",
            pt: "Nenhuma pessoa encontrada", zh: "未找到人物", he: "לא נמצאו אנשים", cs: "Nebyly nalezeny žádné osoby", bg: "Не са намерени хора"
        }
    });

    // ==== Логування ====
    function log() { if (my_logging) console.log(...arguments); }
    function error() { if (my_logging) console.error(...arguments); }

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        const current = Lampa.Storage.get(PERSONS_KEY);
        if (!current || !current.cards) {
            Lampa.Storage.set(PERSONS_KEY, DEFAULT_PERSONS_DATA);
        }
    }

    function getPersonsData() {
        const currentLang = getCurrentLanguage();
        const cacheKey = `${PERSONS_KEY}_${currentLang}`;

        if (!personsCache || personsCache.language !== currentLang) {
            personsCache = Lampa.Storage.get(cacheKey, DEFAULT_PERSONS_DATA);
            personsCache.language = currentLang;
        }
        return personsCache;
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

    function isValidPersonData(data) {
        return data && data.id && data.name && typeof data.id === 'number';
    }

    function togglePersonSubscription(personId, button) {
        const savedPersons = getPersonsData();
        const index = savedPersons.ids.indexOf(personId);

        if (index === -1) {
            const currentLang = getCurrentLanguage();
            const url = Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${currentLang}`);

            new Lampa.Reguest().silent(url, (response) => {
                try {
                    const json = typeof response === 'string' ? JSON.parse(response) : response;
                    if (isValidPersonData(json)) {
                        savePersonCard(personId, json);
                        updatePersonsList();
                        updateButtonUI(button, true);
                    }
                } catch (e) {
                    error('Error saving person data:', e);
                }
            }, (err) => {
                error('Failed to load person data:', err);
                updateButtonUI(button, false);
            });

            return true;
        } else {
            removePersonCard(personId);
            updatePersonsList();
            updateButtonUI(button, false);
            return false;
        }
    }

    function updateButtonUI(button, subscribed) {
        if (!button) return;
        const newText = subscribed ?
            Lampa.Lang.translate('persons_plugin_unsubscribe') :
            Lampa.Lang.translate('persons_plugin_subscribe');
        button.classList.remove(CSS_CLASSES.SUBSCRIBED, CSS_CLASSES.UNSUBSCRIBED);
        button.classList.add(subscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED);
        const span = button.querySelector('span');
        if (span) span.textContent = newText;
    }

    function isPersonSubscribed(personId) {
        return getPersonsData().ids.includes(personId);
    }

    function addButtonToContainer(container) {
        if (!container || !currentPersonId) return;

        const existing = container.querySelector(`.${CSS_CLASSES.BUTTON}`);
        if (existing) existing.remove();

        const subscribed = isPersonSubscribed(currentPersonId);
        const text = subscribed ?
            Lampa.Lang.translate('persons_plugin_unsubscribe') :
            Lampa.Lang.translate('persons_plugin_subscribe');

        const button = document.createElement('div');
        button.className = `full-start__button selector ${CSS_CLASSES.BUTTON}`;
        button.classList.add(subscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED);
        button.setAttribute('data-focusable', 'true');
        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');

        button.innerHTML = `
            <svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>
                <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>
            </svg>
            <span>${text}</span>`;

        button.addEventListener('hover:enter', () => {
            togglePersonSubscription(currentPersonId, button);
        });

        const buttonsContainer = container.querySelector('.full-start__buttons');
        if (buttonsContainer) buttonsContainer.append(button);
        else container.append(button);
    }

    function waitForContainer(callback) {
        let timeoutId;
        const observer = new MutationObserver(() => {
            const container = document.querySelector('.person-start__bottom');
            if (container) {
                observer.disconnect();
                clearTimeout(timeoutId);
                callback(container);
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
        timeoutId = setTimeout(() => {
            observer.disconnect();
            log('Container not found within timeout');
        }, 10000);
    }

    function updatePersonsList() {
        const activity = Lampa.Activity.active();
        if (activity && activity.component === 'category_full' && activity.source === PLUGIN_NAME) {
            Lampa.Activity.reload();
        }
    }

    function addButtonStyles() {
        if (document.getElementById('persons-plugin-styles')) return;
        const css = `
            .${CSS_CLASSES.BUTTON}.${CSS_CLASSES.UNSUBSCRIBED} { color: #4CAF50; }
            .${CSS_CLASSES.BUTTON}.${CSS_CLASSES.SUBSCRIBED} { color: #F44336; }`;
        const style = document.createElement('style');
        style.id = 'persons-plugin-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== Сервіс ====
    function PersonsService() {
        this.list = function (params, onComplete) {
            const saved = getPersonsData();
            const results = [];

            saved.ids.forEach((id) => {
                const card = saved.cards[id];
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
                    results.push(modified);
                }
            });

            if (!results.length) {
                Lampa.Noty.show(Lampa.Lang.translate('persons_not_found'));
            }

            onComplete({
                results,
                page: 1,
                total_pages: 1,
                total_results: results.length
            });
        };
    }

    function startPlugin() {
        hideSubscribeButton();
        initStorage();

        const personsService = new PersonsService();
        Lampa.Api.sources[PLUGIN_NAME] = personsService;

        const menuItem = $(`
            <li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${ICON_SVG}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>
        `);

        menuItem.on("hover:enter", () => {
            Lampa.Activity.push({
                component: "category_full",
                source: PLUGIN_NAME,
                title: Lampa.Lang.translate('persons_plugin_title'),
                page: 1,
                url: PLUGIN_NAME + '__main'
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        function checkCurrentActivity() {
            const activity = Lampa.Activity.active();
            if (activity && activity.component === 'actor') {
                currentPersonId = parseInt(
                    activity.id || activity.params?.id || location.pathname.match(/\/actor\/(\d+)/)?.[1],
                    10
                );
                if (currentPersonId) {
                    waitForContainer(addButtonToContainer);
                }
            }
        }

        Lampa.Listener.follow('activity', (e) => {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                waitForContainer(addButtonToContainer);
            } else if (e.type === 'resume' && e.component === 'category_full' && e.object?.source === PLUGIN_NAME) {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        setTimeout(checkCurrentActivity, 1500);
        addButtonStyles();
    }

    if (window.appready) startPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') startPlugin(); });

})();