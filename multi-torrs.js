(function () {
    'use strict';

    if (!window.Lampa) return;

    /* ================== CONST ================== */

    const STORAGE_LIST   = 'torrserver_multi_list';
    const STORAGE_ACTIVE = 'torrserver_multi_active';
    const CHECK_TIMEOUT  = 3000;

    /* ================== STORAGE ================== */

    function getList() {
        return Storage.get(STORAGE_LIST, []);
    }

    function saveList(list) {
        Storage.set(STORAGE_LIST, list);
    }

    function getActiveId() {
        return Storage.get(STORAGE_ACTIVE, null);
    }

    function setActive(id) {
        Storage.set(STORAGE_ACTIVE, id);

        let server = getList().find(s => s.id === id);
        if (server) {
            Storage.set('torrserver_url', server.url);
        }
    }

    function genId() {
        return Date.now() + Math.floor(Math.random() * 1000);
    }

    /* ================== CHECK ================== */

    function checkServer(url) {
        return new Promise(resolve => {
            let controller = new AbortController();
            let timer = setTimeout(() => controller.abort(), CHECK_TIMEOUT);

            fetch(url + '/echo', { signal: controller.signal })
                .then(r => resolve(r && r.ok))
                .catch(() => resolve(false))
                .finally(() => clearTimeout(timer));
        });
    }

    async function updateStatuses() {
        let list = getList();

        for (let s of list) {
            s.online = await checkServer(s.url);
        }

        saveList(list);
        return list;
    }

    /* ================== AUTO SWITCH ================== */

    async function autoSwitchIfDown() {
        let list = await updateStatuses();
        let activeId = getActiveId();
        let active = list.find(s => s.id === activeId);

        if (active && active.online) return;

        let fallback = list.find(s => s.online);
        if (fallback) {
            setActive(fallback.id);
            Lampa.Noty.show('TorrServer змінено автоматично');
        }
    }

    /* ================== UI ================== */

    async function openManager() {
        let list = await updateStatuses();
        let activeId = getActiveId();

        let items = list.map(s => ({
            title:
                (s.online ? '🟢 ' : '🔴 ') +
                s.name +
                (s.id === activeId ? ' ✔' : ''),
            description: s.url,
            onClick: () => openServerMenu(s.id)
        }));

        items.push({
            title: '+ Додати TorrServer',
            onClick: addServer
        });

        Lampa.Select.show({
            title: 'TorrServer',
            items
        });
    }

    function openServerMenu(id) {
        let list = getList();
        let s = list.find(i => i.id === id);
        if (!s) return;

        Lampa.Select.show({
            title: s.name,
            items: [
                {
                    title: 'Зробити активним',
                    onClick: () => {
                        setActive(id);
                        Lampa.Noty.show('TorrServer активовано');
                    }
                },
                {
                    title: 'Перевірити доступність',
                    onClick: async () => {
                        Lampa.Noty.show('Перевірка...');
                        let ok = await checkServer(s.url);
                        Lampa.Noty.show(ok ? 'Сервер ONLINE 🟢' : 'Сервер OFFLINE 🔴');
                    }
                },
                {
                    title: 'Редагувати',
                    onClick: () => editServer(s)
                },
                {
                    title: 'Видалити',
                    onClick: () => {
                        saveList(list.filter(i => i.id !== id));
                        openManager();
                    }
                }
            ]
        });
    }

    function addServer() {
        Lampa.Input.show({
            title: 'Назва TorrServer',
            onSubmit: name => {
                Lampa.Input.show({
                    title: 'URL TorrServer',
                    value: 'http://',
                    onSubmit: url => {
                        let list = getList();
                        list.push({
                            id: genId(),
                            name,
                            url,
                            online: false
                        });
                        saveList(list);
                        openManager();
                    }
                });
            }
        });
    }

    function editServer(server) {
        Lampa.Input.show({
            title: 'Назва TorrServer',
            value: server.name,
            onSubmit: name => {
                Lampa.Input.show({
                    title: 'URL TorrServer',
                    value: server.url,
                    onSubmit: url => {
                        let list = getList();
                        let s = list.find(i => i.id === server.id);
                        if (s) {
                            s.name = name;
                            s.url = url;
                        }
                        saveList(list);
                        openManager();
                    }
                });
            }
        });
    }

    /* ================== SETTINGS ================== */

    function addToSettings() {
        SettingsApi.addParam({
            section: 'server',
            category: 'torrserver',
            name: 'TorrServer (кілька)',
            description: 'Список, перевірка та автовибір TorrServer',
            type: 'button',
            onClick: openManager
        });
    }

    /* ================== INIT ================== */

    function init() {
        if (!Storage.get(STORAGE_LIST)) {
            saveList([]);
        }

        autoSwitchIfDown();

        if (window.SettingsApi) {
            addToSettings();
        } else {
            Lampa.Listener.follow('settings', e => {
                if (e.type === 'ready') addToSettings();
            });
        }
    }

    if (window.appready) init();
    else {
        Lampa.Listener.follow('app', e => {
            if (e.type === 'ready') init();
        });
    }

})();
