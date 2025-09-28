(function () {
    "use strict";

    // ==== Приховування стандартної кнопки "Підписатися" ====
    function hideDefaultSubscribeButton() {
        if (document.getElementById("hide-subscribe-style")) return;

        const css = `
            .button--subscribe {
                display: none !important;
            }
        `;

        const style = document.createElement("style");
        style.id = "hide-subscribe-style";
        style.textContent = css;
        document.head.appendChild(style);
    }

    // ==== Константи ====
    const PLUGIN_NAME = "persons_plugin";
    const PERSONS_KEY = "saved_persons";
    const PAGE_SIZE = 20;
    let currentPersonId = null;

    // ==== Переклади ====
    const pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons",
            uk: "Персони",
            be: "Асобы",
            pt: "Pessoas",
            zh: "人物",
            he: "אנשים",
            cs: "Osobnosti",
            bg: "Личности",
        },
        subscribe: {
            ru: "Подписаться",
            en: "Subscribe",
            uk: "Підписатися",
            be: "Падпісацца",
            pt: "Inscrever",
            zh: "订阅",
            he: "הירשם",
            cs: "Přihlásit se",
            bg: "Абонирай се",
        },
        unsubscribe: {
            ru: "Отписаться",
            en: "Unsubscribe",
            uk: "Відписатися",
            be: "Адпісацца",
            pt: "Cancelar inscrição",
            zh: "退订",
            he: "בטל מנוי",
            cs: "Odhlásit se",
            bg: "Отписване",
        },
        persons_not_found: {
            ru: "Персоны не найдены",
            en: "No persons found",
            uk: "Особи не знайдені",
            be: "Асобы не знойдзены",
            pt: "Nenhuma pessoa encontrada",
            zh: "未找到人物",
            he: "לא נמצאו אנשים",
            cs: "Nebyly nalezeny žádné osoby",
            bg: "Не са намерени хора",
        },
    };

    // ==== Іконка в меню ====
    const ICON_SVG =
        '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    // ==== Допоміжні функції ====
    function getCurrentLanguage() {
        return localStorage.getItem("language") || "en";
    }

    function initStorage() {
        if (!Lampa.Storage.get(PERSONS_KEY)) {
            Lampa.Storage.set(PERSONS_KEY, []);
        }
    }

    function getPersonIds() {
        return Lampa.Storage.get(PERSONS_KEY, []);
    }

    function togglePersonSubscription(personId) {
        let personIds = getPersonIds();
        const index = personIds.indexOf(personId);

        if (index === -1) personIds.push(personId);
        else personIds.splice(index, 1);

        Lampa.Storage.set(PERSONS_KEY, personIds);
        return index === -1; // true якщо додано
    }

    function isPersonSubscribed(personId) {
        return getPersonIds().includes(personId);
    }

    // ==== Кнопка підписки в картці актора ====
    function addButtonToContainer(container) {
        const existingButton = container.querySelector(".button--subscribe-plugin");
        if (existingButton) existingButton.remove();

        const isSubscribed = isPersonSubscribed(currentPersonId);
        const buttonText = isSubscribed
            ? Lampa.Lang.translate("persons_plugin_unsubscribe")
            : Lampa.Lang.translate("persons_plugin_subscribe");

        const button = document.createElement("div");
        button.className = "full-start__button selector button--subscribe-plugin";
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
            const newText = wasAdded
                ? Lampa.Lang.translate("persons_plugin_unsubscribe")
                : Lampa.Lang.translate("persons_plugin_subscribe");

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
            const container =
                document.querySelector(".full-start__buttons") ||
                document.querySelector(".person-start__bottom");
            if (container) {
                addButtonToContainer(container);
            } else if (attempts < maxAttempts) {
                setTimeout(tryInsert, 300);
            }
        }

        tryInsert();
    }

    // ==== Оновлення списку ====
    function updatePersonsList() {
        const activity = Lampa.Activity.active();
        if (activity && activity.component === "category_full" && activity.source === PLUGIN_NAME) {
            Lampa.Activity.reload();
        }
    }

    // ==== Стилі для кнопки ====
    function addButtonStyles() {
        if (document.getElementById("subscribe-button-styles")) return;
        const css = `
            .full-start__button.selector.button--subscribe-plugin.button--subscribe {
                color: #4CAF50;
            }
            .full-start__button.selector.button--subscribe-plugin.button--unsubscribe {
                color: #F44336;
            }`;
        const style = document.createElement("style");
        style.id = "subscribe-button
