(() => {
    const plugin_id = 'hide_left_menu_items';
    const plugin = {
        name: plugin_id,
        version: '1.1.0',
        description: 'Дозволяє обрати, які пункти меню зліва ховати',
        run() {
            const saved = Lampa.Storage.get(plugin_id, []);

            const updateMenu = () => {
                Lampa.Listener.follow('menu', (event) => {
                    if (event.type === 'build') {
                        event.body = event.body.filter(item => !saved.includes(item.title));
                    }
                });
            };

            updateMenu();

            // Додаємо сторінку в налаштуваннях
            Lampa.SettingsApi.add({
                component: plugin_id,
                name: 'Меню (зліва)',
                description: 'Оберіть, які пункти меню зліва приховати',
                onRender: (body) => {
                    // Всі можливі пункти меню, які можуть бути присутні
                    const possibleItems = [
                        'Головна',
                        'Фільми',
                        'Серіали',
                        'Аніме',
                        'Мультфільми',
                        'ТБ',
                        'Торренти',
                        'Історія',
                        'Вибране',
                        'Стрічка',
                        'Релізи',
                        'Спорт',
                        'Плейлисти'
                    ];

                    possibleItems.forEach(title => {
                        const isChecked = saved.includes(title);
                        const item = Lampa.Template.get('settings_input');
                        item.find('input').prop('checked', isChecked);
                        item.find('.settings-param__name').text(title);
                        item.on('change', (e) => {
                            const checked = e.currentTarget.querySelector('input').checked;
                            if (checked) {
                                if (!saved.includes(title)) saved.push(title);
                            } else {
                                const index = saved.indexOf(title);
                                if (index > -1) saved.splice(index, 1);
                            }
                            Lampa.Storage.set(plugin_id, saved);
                        });
                        body.append(item);
                    });
                }
            });

            // Додаємо пункт у список плагінів
            Lampa.Plugin.create(plugin_id, {
                title: 'Сховати пункти з лівого меню',
                version: plugin.version,
                description: plugin.description
            });
        }
    };

    Lampa.Plugin.register(plugin);
})();
