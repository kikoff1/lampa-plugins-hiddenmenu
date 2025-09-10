(() => {
    const plugin_id = 'hide_left_menu_items';
    const plugin = {
        name: plugin_id,
        version: '1.2.0',
        description: 'Дозволяє обрати, які пункти меню зліва ховати',
        run() {
            const saved = Lampa.Storage.get(plugin_id, []);

            // Без подій — переписуємо сам метод побудови
            const originalBuild = Lampa.Menu.main;

            Lampa.Menu.main = function () {
                const menu = originalBuild.apply(this, arguments);
                menu.forEach((item, i) => {
                    if (saved.includes(item.title)) {
                        menu.splice(i, 1);
                    }
                });
                return menu;
            };

            // Панель налаштувань
            Lampa.SettingsApi.add({
                component: plugin_id,
                name: 'Меню (зліва)',
                description: 'Оберіть, які пункти меню зліва приховати',
                onRender: (body) => {
                    const possibleItems = [
                        'Головна', 'Фільми', 'Серіали', 'Аніме',
                        'Мультфільми', 'ТБ', 'Торренти', 'Історія',
                        'Вибране', 'Стрічка', 'Релізи', 'Спорт',
                        'Плейлисти'
                    ];

                    possibleItems.forEach(title => {
                        const isChecked = saved.includes(title);
                        const item = Lampa.Template.get('settings_input');
                        item.find('input').prop('checked', isChecked);
                        item.find('.settings-param__name').text(title);
                        item.on('change', (e) => {
                            const checked = e.currentTarget.querySelector('input').checked;
                            if (checked && !saved.includes(title)) saved.push(title);
                            else if (!checked) {
                                const index = saved.indexOf(title);
                                if (index > -1) saved.splice(index, 1);
                            }
                            Lampa.Storage.set(plugin_id, saved);
                            window.location.reload(); // перезавантажує додаток для оновлення меню
                        });
                        body.append(item);
                    });
                }
            });

            Lampa.Plugin.create(plugin_id, {
                title: 'Сховати пункти з лівого меню',
                version: plugin.version,
                description: plugin.description
