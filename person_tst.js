(function () {
    'use strict';

    let currentPersonId = null;
    const STORAGE_KEY = 'actors_subscriptions';

    function getSubscriptions() {
        return Lampa.Storage.get(STORAGE_KEY, []);
    }

    function isSubscribed(id) {
        return getSubscriptions().includes(id);
    }

    function toggleSubscription(id) {
        let subs = getSubscriptions();
        if (subs.includes(id)) {
            subs = subs.filter(x => x !== id);
        } else {
            subs.push(id);
        }
        Lampa.Storage.set(STORAGE_KEY, subs);
        return !isSubscribed(id) ? false : true;
    }

    function waitForPersonContainer(callback) {
        let attempts = 0;
        const maxAttempts = 15;

        function check() {
            attempts++;
            const container = document.querySelector('.person-start__bottom');
            if (container) callback(container);
            else if (attempts < maxAttempts) setTimeout(check, 300);
        }

        check();
    }

    function addCustomSubscribeButton() {
        if (!currentPersonId) return;

        waitForPersonContainer((container) => {
            const existing = container.querySelector('.button--sub-plugin');
            if (existing) existing.remove();

            const subscribed = isSubscribed(currentPersonId);
            const btn = document.createElement('div');
            btn.className = 'full-start__button selector button--sub-plugin';
            btn.style.color = subscribed ? '#F44336' : '#4CAF50';
            btn.setAttribute('data-focusable', 'true');
            btn.innerHTML = `<span>${subscribed ? 'Відписатися' : 'Підписатися'}</span>`;

            btn.addEventListener('hover:enter', () => {
                const added = toggleSubscription(currentPersonId);
                btn.style.color = added ? '#F44336' : '#4CAF50';
                btn.querySelector('span').textContent = added ? 'Відписатися' : 'Підписатися';

                if (Lampa.Activity.active()?.source === 'actors_subs') {
                    Lampa.Activity.reload();
                }
            });

            const buttons = container.querySelector('.full-start__buttons');
            if (buttons) buttons.appendChild(btn);
            else container.appendChild(btn);
        });
    }

    function hideDefaultSubscribeButtons() {
        if (document.getElementById('hide-subscribe-style')) return;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = `
            .button--subscribe:not(.button--sub-plugin) {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
    }

    function addSubButtonStyles() {
        if (document.getElementById('sub-plugin-styles')) return;
        const style = document.createElement('style');
        style.id = 'sub-plugin-styles';
        style.textContent = `
            .button--sub-plugin {
                font-weight: bold;
            }
            .button--sub-plugin span {
                padding-left: 6px;
            }
        `;
        document.head.appendChild(style);
    }

    function initPlugin() {
        hideDefaultSubscribeButtons();
        addSubButtonStyles();

        Lampa.Listener.follow('activity', (e) => {
            if (e.type === 'start' && (e.component === 'actor' || e.component === 'person') && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                addCustomSubscribeButton();
            }
        });
    }

    if (window.appready) initPlugin();
    else Lampa.Listener.follow('app', (e) => {
        if (e.type === 'ready') initPlugin();
    });
})();
