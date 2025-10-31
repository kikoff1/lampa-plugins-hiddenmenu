(function () {
    const PLUGIN_NAME = 'persons_subscribe';
    const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="12" r="6" stroke="currentColor" stroke-width="2"/>
        <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    let currentPersonId = null;

    const pluginTranslations = {
        persons_title: 'Підписки на акторів',
        subscriibbe: 'Підписатися',
        unsubscriibbe: 'Відписатися',
        persons_not_found: 'Немає підписок'
    };

    // === Зберігання даних акторів ===
    function initStorage() {
        if (!Lampa.Storage.get(PLUGIN_NAME)) {
            Lampa.Storage.set(PLUGIN_NAME, { ids: [], cards: {} });
        }
    }

    function getPersonsData() {
        return Lampa.Storage.get(PLUGIN_NAME) || { ids: [], cards: {} };
    }

    function toggleSubscribe(personId, cardData) {
        let data = getPersonsData();
        let index = data.ids.indexOf(personId);

        if (index === -1) {
            data.ids.push(personId);
            data.cards[personId] = cardData;
        } else {
            data.ids.splice(index, 1);
            delete data.cards[personId];
        }

        Lampa.Storage.set(PLUGIN_NAME, data);
        updateButtonState(personId);
    }

    function isSubscribed(personId) {
        return getPersonsData().ids.includes(personId);
    }

    // === Кнопка підписки ===
    function addSubscribeButton() {
        if (!document.querySelector('.person-start__bottom')) return;

        const container = document.querySelector('.person-start__bottom');
        if (container.querySelector('.subscribe-button')) return;

        const button = document.createElement('div');
        button.classList.add('subscribe-button', 'selector');

        const cardData = Lampa.Activity.active()?.data;

        button.innerText = isSubscribed(currentPersonId)
            ? pluginTranslations.unsubscriibbe
            : pluginTranslations.subscriibbe;

        button.addEventListener('hover:enter', () => {
            toggleSubscribe(currentPersonId, cardData);
        });

        container.appendChild(button);
        updateButtonState(currentPersonId);
    }

    function updateButtonState(personId) {
        const button = document.querySelector('.subscribe-button');
        if (!button) return;
        const subscribed = isSubscribed(personId);

        button.innerText = subscribed
            ? pluginTranslations.unsubscriibbe
            : pluginTranslations.subscriibbe;

        button.classList.toggle('subscribed', subscribed);
    }

    function hideSubscribeButton() {
        const btn = document.querySelector('.subscribe-button');
        if (btn) btn.remove();
    }

    function addButtonStyles() {
        $('<style>')
            .text(`
                .subscribe-button {
                    background-color: #2196F3;
                    padding: 0.7em 1.5em;
                    border-radius: 5px;
                    color: #fff;
                    text-align: center;
                    margin-top: 1em;
                    cursor: pointer;
                    transition: background-color 0.3s ease;
                }
                .subscribe-button.subscribed {
                    background-color: #E91E63;
                }
            `)
            .appendTo('head');
    }

    // === Компонент зі списком підписок ===
    function PersonsComponent() {
        let scroll = new Lampa.Scroll({ mask: true, over: true, step: 250 });
        let body = document.createElement('div');
        let items = [];
        let active = 0;
        let last;

        body.classList.add('category-full');

        this.create = function () {
            this.activity.loader(true);
            const data = getPersonsData();

            if (!data.ids.length) {
                let empty = new Lampa.Empty();
                empty.empty({
                    title: pluginTranslations.persons_not_found
                });
                body.appendChild(empty.render(true));
                scroll.append(body);
                this.activity.toggle();
                this.activity.loader(false);
                return;
            }

            data.ids.forEach((personId) => {
                const person = data.cards[personId];
                if (!person) return;

                const cardData = {
                    id: person.id,
                    name: person.name,
                    title: person.name,
                    original_name: person.name,
                    poster_path: person.profile_path,
                    profile_path: person.profile_path,
                    gender: person.gender || 2
                };

                const card = new Lampa.Card(cardData, {
                    card_category: true,
                    object: { source: 'tmdb' }
                });

                card.create();

                card.onFocus = (target, card_data) => {
                    last = target;
                    active = items.indexOf(card);
                    scroll.update(card.render(true));
                    Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));
                };

                card.onEnter = () => {
                    Lampa.Activity.push({
                        title: person.name,
                        component: 'actor',
                        id: person.id,
                        url: '',
                        source: 'tmdb'
                    });
                };

                body.appendChild(card.render(true));
                items.push(card);
            });

            scroll.append(body);
            scroll.minus();

            scroll.onWheel = (step) => {
                if (!Lampa.Controller.own(this)) this.start();
                if (step > 0) Navigator.move('down');
                else Navigator.move('up');
            };

            scroll.onScroll = () => this.limit();

            this.activity.loader(false);
            this.activity.toggle();
        };

        this.limit = function () {
            let limit_view = 12;
            let collection = items.slice(Math.max(0, active - limit_view), active + limit_view);

            items.forEach(item => {
                if (collection.indexOf(item) === -1)
                    item.render(true).classList.remove('layer--render');
                else
                    item.render(true).classList.add('layer--render');
            });

            Navigator.setCollection(items.slice(Math.max(0, active - 36), active + 36).map(c => c.render(true)));
            Navigator.focused(last);
            Lampa.Layer.visible(scroll.render(true));
        };

        this.start = function () {
            Lampa.Controller.add('content', {
                link: this,
                toggle: () => {
                    Lampa.Controller.collectionSet(scroll.render(true));
                    Lampa.Controller.collectionFocus(last || false, scroll.render(true));
                    this.limit();
                },
                left: () => {
                    if (Navigator.canmove('left')) Navigator.move('left');
                    else Lampa.Controller.toggle('menu');
                },
                right: () => Navigator.move('right'),
                up: () => {
                    if (Navigator.canmove('up')) Navigator.move('up');
                    else Lampa.Controller.toggle('head');
                },
                down: () => {
                    if (Navigator.canmove('down')) Navigator.move('down');
                },
                back: () => {
                    Lampa.Activity.backward();
                }
            });
            Lampa.Controller.toggle('content');
        };

        this.pause = function () {};
        this.stop = function () {};
        this.render = function () { return scroll.render(); };
        this.destroy = function () {
            scroll.destroy();
            items.forEach(c => c.destroy());
            items = [];
        };
    }

    // === Ініціалізація плагіна ===
    function startPlugin() {
        hideSubscribeButton();
        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        initStorage();
        Lampa.Component.add('persons_list', PersonsComponent);

        const menuItem = $(`
            <li class="menu__item selector" data-action="${PLUGIN_NAME}">
                <div class="menu__ico">${ICON_SVG}</div>
                <div class="menu__text">${Lampa.Lang.translate('persons_plugin_title')}</div>
            </li>`);

        menuItem.on("hover:enter", function () {
            Lampa.Activity.push({
                url: '',
                title: Lampa.Lang.translate('persons_plugin_title'),
                component: 'persons_list',
                page: 1
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);

        function waitForContainer(callback) {
            let attempts = 0, max = 15;
            function check() {
                attempts++;
                if (document.querySelector('.person-start__bottom')) callback();
                else if (attempts < max) setTimeout(check, 200);
            }
            setTimeout(check, 200);
        }

        function checkCurrentActivity() {
            const activity = Lampa.Activity.active();
            if (activity && activity.component === 'actor') {
                currentPersonId = parseInt(activity.id || activity.params?.id || location.pathname.match(/\/actor\/(\d+)/)?.[1], 10);
                if (currentPersonId) waitForContainer(addSubscribeButton);
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                waitForContainer(addSubscribeButton);
            } else if (e.type === 'resume' && e.component === 'persons_list') {
                setTimeout(() => Lampa.Activity.reload(), 100);
            }
        });

        setTimeout(checkCurrentActivity, 1500);
        addButtonStyles();
    }

    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();
