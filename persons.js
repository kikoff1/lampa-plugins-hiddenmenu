(function () {
    'use strict';

    // --- Константи ---
    const PLUGIN_NAME = 'PersonsPlugin';
    const PERSONS_KEY = 'subscribed_persons';
    const DEFAULT_PERSONS_DATA = { cards: [] };

    const CSS_CLASSES = {
        BUTTON: 'button--persons-plugin',
        SUBSCRIBED: 'unsubscriibbe',
        UNSUBSCRIBED: 'subscriibbe'
    };

    const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 
        6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 
        4.99L20.49 19l-4.99-5zm-6 0C8.01 
        14 6 11.99 6 9.5S8.01 5 10.5 5 
        15 7.01 15 9.5 12.99 14 10.5 14z"/>
    </svg>`;

    let currentPersonId = null;
    let currentPersonData = null;
    let personsCache = null;
    let my_logging = true;

    // --- Логування ---
    function log(...args) {
        if (my_logging) console.log(`[${PLUGIN_NAME}]`, ...args);
    }
    function error(...args) {
        if (my_logging) console.error(`[${PLUGIN_NAME}]`, ...args);
    }

    // --- Валідація даних ---
    function isValidPersonData(data) {
        return data && data.id && typeof data.id === 'number' && data.name;
    }

    // --- Локалізація ---
    function getCurrentLanguage() {
        return Lampa.Lang && Lampa.Lang.get('code') || 'en';
    }
    function getPersonsData() {
        const currentLang = getCurrentLanguage();
        const cacheKey = `${PERSONS_KEY}_${currentLang}`;
        if (!personsCache || personsCache.language !== currentLang) {
            personsCache = Lampa.Storage.get(cacheKey, { ...DEFAULT_PERSONS_DATA });
            personsCache.language = currentLang;
        }
        return personsCache;
    }
    function savePersonsData(data) {
        personsCache = data;
        Lampa.Storage.set(`${PERSONS_KEY}_${getCurrentLanguage()}`, data);
    }

    // --- Управління картками ---
    function savePersonCard(personId, personData) {
        log('Saving person card:', personId, personData.name);
        const personsData = getPersonsData();
        personsData.cards = personsData.cards.filter(card => card.id !== personId);
        personsData.cards.push(personData);
        savePersonsData(personsData);
    }
    function removePersonCard(personId) {
        log('Removing person card:', personId);
        const personsData = getPersonsData();
        personsData.cards = personsData.cards.filter(card => card.id !== personId);
        savePersonsData(personsData);
    }
    function isPersonSubscribed(personId) {
        return getPersonsData().cards.some(card => card.id === personId);
    }

    // --- UI Кнопка ---
    function createButton(text, isSubscribed) {
        const button = document.createElement('div');
        button.className = `full-start__button selector ${CSS_CLASSES.BUTTON} ${isSubscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED}`;
        button.innerHTML = `<div class="full-start__button-icon">${ICON_SVG}</div>
            <div class="full-start__button-text">${text}</div>`;

        button.setAttribute('role', 'button');
        button.setAttribute('tabindex', '0');
        button.setAttribute('aria-pressed', isSubscribed);

        return button;
    }
    function updateButtonUI(button, isSubscribed) {
        const textElement = button.querySelector('.full-start__button-text');
        textElement.textContent = Lampa.Lang.translate(isSubscribed ? 'persons.unsubscribe' : 'persons.subscribe');
        button.classList.remove(CSS_CLASSES.SUBSCRIBED, CSS_CLASSES.UNSUBSCRIBED);
        button.classList.add(isSubscribed ? CSS_CLASSES.SUBSCRIBED : CSS_CLASSES.UNSUBSCRIBED);
        button.setAttribute('aria-pressed', isSubscribed);
    }

    // --- MutationObserver з таймаутом ---
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

    // --- Логіка підписки ---
    function togglePersonSubscription(personId, button) {
        const isSubscribed = isPersonSubscribed(personId);

        if (isSubscribed) {
            removePersonCard(personId);
            updateButtonUI(button, false);
            log('Person unsubscribed:', personId);
        } else {
            const url = `https://api.themoviedb.org/3/person/${personId}?api_key=${Lampa.TMDB.key()}&language=${getCurrentLanguage()}`;
            new Lampa.Reguest().silent(url, (json) => {
                if (isValidPersonData(json)) {
                    savePersonCard(personId, json);
                    currentPersonData = json;
                    updateButtonUI(button, true);
                    log('Person subscribed:', json.name);
                } else {
                    error('Invalid person data received:', json);
                    updateButtonUI(button, false);
                }
            }, (err) => {
                error('Failed to load person data:', err);
                updateButtonUI(button, false);
            });
        }
    }

    function addSubscribeButton() {
        if (!currentPersonId) return;
        const container = document.querySelector('.person-start__bottom');
        if (container) {
            injectButton(container);
        } else {
            waitForContainer(injectButton);
        }
    }

    function injectButton(container) {
        const isSubscribed = isPersonSubscribed(currentPersonId);
        const button = createButton(
            Lampa.Lang.translate(isSubscribed ? 'persons.unsubscribe' : 'persons.subscribe'),
            isSubscribed
        );
        button.addEventListener('click', () => togglePersonSubscription(currentPersonId, button));
        container.appendChild(button);
    }

    // --- Події ---
    function attachEventListeners() {
        Lampa.Listener.follow('full', (event) => {
            if (event.type === 'person') {
                currentPersonId = event.data.id;
                currentPersonData = event.data;
                addSubscribeButton();
            }
        });
    }

    // --- Ініціалізація ---
    function initPlugin() {
        if (!window.Lampa) {
            error('Lampa not found');
            return;
        }
        log('Plugin initialized');

        Lampa.Lang.add({
            en: { 'persons.subscribe': 'Subscribe', 'persons.unsubscribe': 'Unsubscribe' },
            uk: { 'persons.subscribe': 'Підписатися', 'persons.unsubscribe': 'Відписатися' },
            ru: { 'persons.subscribe': 'Подписаться', 'persons.unsubscribe': 'Отписаться' }
        });

        attachEventListeners();
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', (e) => { if (e.type === 'ready') initPlugin(); });

})();