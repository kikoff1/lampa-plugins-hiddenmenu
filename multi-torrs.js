(function () {
    'use strict';

    if (!window.Lampa) return;

    const STORAGE_LIST = 'torrserver_multi_list';
    const STORAGE_ACTIVE = 'torrserver_multi_active';

    /* ================== HELPERS ================== */

    function getList() {
        return Storage.get(STORAGE_LIST, []);
    }

    function saveList(list) {
        Storage.set(STORAGE_LIST, list);
    }

    function getActive() {
        return Storage.get(STORAGE_ACTIVE, null);
    }

    function setActive(id) {
        Storage.set(STORAGE_ACTIVE, id);
        let list = getList();
        let server = list.find(s => s.id === id);
        if (server) {
            Storage.set('torrserver_url', server.url);
        }
    }

    function generateId() {
        return Date.now();
    }

    /* ================== CHECK SERVER ================== */

    function checkServer(url, callback) {
        let controller = new AbortController();
        let timeout = setTimeout(() => controller.abort(), 3000);

        fetch(url + '/echo', { signal: controller.signal })
            .then(r => r.ok ? callback(true) : callback(false))
            .catch(() => callback(false))
            .finally(() => clearTimeout(timeout));
    }

    /* ================== UI ================== */

    function openManager() {
        let list = getList();
        let active = getActive();

        let items = list.map(server => ({
            title: server.name + (server.id === active ? ' ✔' : ''),
            description: server.url,
            onClick: () => openServerMenu(server.id)
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
        let server = list.find(s => s.id === id);
        if (!server) return;

        Lampa.Select.show({
            title: server.name,
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
                    onClick: () => {
                        Lampa.Noty.show('Перевірка...');
                        checkServer(server.url, ok => {
                            Lampa.Noty.show(
                                ok ? 'Сервер доступний ✅' : 'Сервер недоступний ❌'
                            );
                        });
                    }
                },
                {
                    title: 'Редагувати',
                    onClick: () => editServer(server)
                },
                {
                    title: 'Видалити',
                    onClick: () => {
                        saveList(list.filter(s => s.id !== id));
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
                            id: generateId(),
                            name,
                            url
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
        SettingsApi.add({
            component: 'button',
            name: 'TorrServer (кілька)',
            description: 'Керування кількома TorrServer',
            onClick: openManager
        });
    }

    /* ================== INIT ================== */

    function init() {
        if (!Storage.get(STORAGE_LIST)) {
            saveList([]);
        }
        addToSettings();
    }

    if (window.appready) init();
    else Lampa.Listener.follow('app', e => e.type === 'ready' && init());

})();
