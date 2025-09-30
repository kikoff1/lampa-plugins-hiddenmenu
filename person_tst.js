(function() {
    "use strict";

    // ==== ДЕБАГ СИСТЕМА ====
    var debugLogs = [];
    var maxDebugLogs = 30;

    function debugLog(message, data) {
        var timestamp = new Date().toLocaleTimeString();
        
        if (console && console.log) {
            try {
                console.log(timestamp + ' - ' + message, data || '');
            } catch (e) {}
        }
        
        debugLogs.unshift({
            time: timestamp,
            message: message,
            data: data
        });
        
        if (debugLogs.length > maxDebugLogs) {
            debugLogs.pop();
        }
        
        updateDebugPanel();
    }

    function createDebugPanel() {
        if (document.getElementById('debug-panel')) return;
        
        var panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 95%;
            max-width: 500px;
            height: 70vh;
            background: rgba(0,0,0,0.98);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            padding: 0;
            overflow: hidden;
            z-index: 10000;
            border: 2px solid #00ff00;
            border-radius: 10px;
            display: none;
        `;
        
        var textarea = document.createElement('textarea');
        textarea.id = 'debug-textarea';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            background: #111;
            color: #0f0;
            border: none;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            resize: none;
            outline: none;
            box-sizing: border-box;
        `;
        textarea.readOnly = true;
        
        panel.appendChild(textarea);
        
        var toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'DEBUG';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10001;
            background: #ff4444;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        var clearBtn = document.createElement('button');
        clearBtn.textContent = 'CLEAR';
        clearBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 90px;
            z-index: 10001;
            background: #4444ff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        var copyBtn = document.createElement('button');
        copyBtn.textContent = 'COPY';
        copyBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 170px;
            z-index: 10001;
            background: #44aa44;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        toggleBtn.addEventListener('click', function() {
            var panel = document.getElementById('debug-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
                updateDebugPanel();
            }
        });
        
        clearBtn.addEventListener('click', function() {
            debugLogs = [];
            updateDebugPanel();
            debugLog('🧹 Логи очищено');
        });
        
        copyBtn.addEventListener('click', function() {
            var textarea = document.getElementById('debug-textarea');
            if (textarea) {
                textarea.select();
                textarea.setSelectionRange(0, 99999);
                
                try {
                    var successful = document.execCommand('copy');
                    if (successful) {
                        debugLog('✅ Текст скопійовано в буфер обміну');
                    } else {
                        debugLog('❌ Не вдалося скопіювати, виділіть текст вручну');
                    }
                } catch (err) {
                    debugLog('❌ Помилка копіювання: ' + err);
                }
            }
        });
        
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);
        document.body.appendChild(clearBtn);
        document.body.appendChild(copyBtn);
        
        debugLog('🔧 Дебаг панель створена');
    }

    function updateDebugPanel() {
        var textarea = document.getElementById('debug-textarea');
        if (!textarea) return;
        
        var logText = debugLogs.map(function(logEntry) {
            var line = `${logEntry.time} - ${logEntry.message}`;
            if (logEntry.data) {
                try {
                    line += '\n' + JSON.stringify(logEntry.data, null, 2);
                } catch (e) {
                    line += '\n[Неможливо відобразити дані]';
                }
            }
            return line;
        }).join('\n\n' + '='.repeat(50) + '\n\n');
        
        textarea.value = logText;
        textarea.scrollTop = 0;
    }

    // ==== ОСНОВНА ЛОГІКА ПЛАГІНА ====
    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var currentPersonId = null;

    var pluginTranslations = {
        persons_title: {
            ru: "Персоны",
            en: "Persons", 
            uk: "Персони",
            be: "Асобы",
            pt: "Pessoas",
            zh: "人物",
            he: "אנשים",
            cs: "Osobnosti",
            bg: "Личности"
        },
        subscriibbe: {
            ru: "Подписаться",
            en: "subscriibbe",
            uk: "Підписатися",
            be: "Падпісацца",
            pt: "Inscrever",
            zh: "订阅",
            he: "הירשם",
            cs: "Přihlásit se",
            bg: "Абонирай се"
        },
        unsubscriibbe: {
            ru: "Отписаться",
            en: "Unsubscriibbe",
            uk: "Відписатися",
            be: "Адпісацца",
            pt: "Cancelar inscrição",
            zh: "退订",
            he: "בטל מנוי",
            cs: "Odhlásit se",
            bg: "Отписване"
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
            bg: "Не са намерени хора"
        }
    };

    var ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    function getCurrentLanguage() {
        return localStorage.getItem('language') || 'en';
    }

    function initStorage() {
        var current = Lampa.Storage.get(PERSONS_KEY);
        if (!current) {
            Lampa.Storage.set(PERSONS_KEY, []);
            debugLog('💾 Сховище ініціалізовано');
        } else {
            debugLog('💾 Сховище завантажено', {count: current.length});
        }
    }

    function getSavedPersons() {
        var persons = Lampa.Storage.get(PERSONS_KEY);
        if (!Array.isArray(persons)) {
            persons = [];
            Lampa.Storage.set(PERSONS_KEY, persons);
        }
        return persons;
    }

    function togglePersonSubscription(personId, personName, personPhoto) {
        var persons = getSavedPersons();
        var index = persons.findIndex(function(p) {
            return p.id == personId;
        });

        if (index === -1) {
            persons.push({
                id: personId,
                name: personName,
                photo: personPhoto,
                timestamp: new Date().getTime()
            });
            debugLog('✅ Актора додано', {id: personId, name: personName});
            Lampa.Noty.show('Додано до персон', 'success');
        } else {
            persons.splice(index, 1);
            debugLog('❌ Актора видалено', {id: personId, name: personName});
            Lampa.Noty.show('Видалено з персон', 'info');
        }

        Lampa.Storage.set(PERSONS_KEY, persons);
        debugLog('💾 Оновлено сховище', {total: persons.length});
        return index === -1;
    }

    function isPersonsubscriibbed(personId) {
        var persons = getSavedPersons();
        var isSubscribed = persons.some(function(p) {
            return p.id == personId;
        });
        debugLog('🔍 Перевірка підписки', {id: personId, subscribed: isSubscribed});
        return isSubscribed;
    }

    function addButtonToContainer(bottomBlock) {
        var existingButton = bottomBlock.querySelector('.button--subscriibbe-plugin');
        if (existingButton && existingButton.parentNode) {
            existingButton.parentNode.removeChild(existingButton);
        }

        var issubscriibbed = isPersonsubscriibbed(currentPersonId);
        var buttonText = issubscriibbed ? 
            Lampa.Lang.translate('persons_plugin_unsubscriibbe') : 
            Lampa.Lang.translate('persons_plugin_subscriibbe');

        var button = document.createElement('div');
        button.className = 'full-start__button selector button--subscriibbe-plugin';
        button.classList.add(issubscriibbed ? 'button--unsubscriibbe' : 'button--subscriibbe');
        button.setAttribute('data-focusable', 'true');

        button.innerHTML =
            '<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"></path>' +
            '<path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"></path>' +
            '</svg>' +
            '<span>' + buttonText + '</span>';

        button.addEventListener('hover:enter', function () {
            var personName = document.querySelector('.person-start__title')?.textContent || 'Actor';
            var personPhoto = document.querySelector('.person-start__poster img')?.src || '';
            
            debugLog('🎯 Клік по кнопці підписки', {
                personId: currentPersonId, 
                personName: personName
            });
            
            var wasAdded = togglePersonSubscription(currentPersonId, personName, personPhoto);
            var newText = wasAdded ?
                Lampa.Lang.translate('persons_plugin_unsubscriibbe') :
                Lampa.Lang.translate('persons_plugin_subscriibbe');

            button.classList.remove('button--subscriibbe', 'button--unsubscriibbe');
            button.classList.add(wasAdded ? 'button--unsubscriibbe' : 'button--subscriibbe');

            var span = button.querySelector('span');
            if (span) span.textContent = newText;
        });

        var buttonsContainer = bottomBlock.querySelector('.full-start__buttons');
        if (buttonsContainer) {
            buttonsContainer.append(button);
            debugLog('✅ Кнопку додано до контейнера');
        } else {
            bottomBlock.append(button);
            debugLog('✅ Кнопку додано до блоку');
        }
    }

    function addsubscriibbeButton() {
        if (!currentPersonId) {
            debugLog('❌ ID актора не встановлено');
            return;
        }

        debugLog('🔧 Додаємо кнопку для актора', {id: currentPersonId});

        var bottomBlock = document.querySelector('.person-start__bottom');
        if (bottomBlock) {
            addButtonToContainer(bottomBlock);
        } else {
            let attempts = 0;
            const maxAttempts = 10;

            function tryAgain() {
                attempts++;
                var container = document.querySelector('.person-start__bottom');
                if (container) {
                    addButtonToContainer(container);
                    debugLog('✅ Контейнер знайдено, кнопку додано');
                } else if (attempts < maxAttempts) {
                    debugLog('⏳ Очікування контейнера...', {attempt: attempts});
                    setTimeout(tryAgain, 300);
                } else {
                    debugLog('❌ Не вдалося знайти контейнер після спроб', {attempts: attempts});
                }
            }

            setTimeout(tryAgain, 300);
        }
    }

    function addButtonStyles() {
        if (document.getElementById('subscriibbe-button-styles')) return;
        var css = `
            .full-start__button.selector.button--subscriibbe-plugin.button--subscriibbe {
                color: #4CAF50;
            }
            .full-start__button.selector.button--subscriibbe-plugin.button--unsubscriibbe {
                color: #F44336;
            }
            .persons-custom-page {
                padding: 20px;
            }
            .persons-custom-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 20px;
                margin-top: 20px;
            }
            .person-custom-card {
                border-radius: 10px;
                overflow: hidden;
                background: rgba(255,255,255,0.05);
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .person-custom-card:focus {
                transform: scale(1.05);
                background: rgba(255,255,255,0.1);
                outline: none;
            }
            .person-custom-card__poster {
                width: 100%;
                height: 300px;
                position: relative;
                overflow: hidden;
            }
            .person-custom-card__poster img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .person-custom-card__info {
                padding: 15px;
            }
            .person-custom-card__name {
                font-size: 16px;
                font-weight: bold;
                margin: 0 0 5px 0;
                color: white;
            }
            .person-custom-card__department {
                font-size: 14px;
                color: #aaa;
            }
            .persons-custom-empty {
                text-align: center;
                padding: 50px 20px;
                color: #aaa;
                font-size: 18px;
            }
            .persons-custom-loading {
                text-align: center;
                padding: 50px 20px;
                color: #aaa;
                font-size: 18px;
            }`;
        var style = document.createElement('style');
        style.id = 'subscriibbe-button-styles';
        style.textContent = css;
        document.head.appendChild(style);
        debugLog('🎨 Стилі додано');
    }

    // ВИПРАВЛЕНИЙ КОМПОНЕНТ - тепер правильно завантажує дані
    function setupCustomPersonsComponent() {
        Lampa.Component.add('persons_custom', {
            template: `
            <div class="persons-custom">
                <div class="persons-custom__header">
                    <div class="persons-custom__back selector" data-focusable="true" data-action="back">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
                        </svg>
                    </div>
                    <div class="persons-custom__title">{{title}}</div>
                </div>
                <div class="persons-custom__content">
                    <div class="persons-custom-loading" v-if="loading">Завантаження...</div>
                    <div class="persons-custom-empty" v-else-if="!loading && persons.length === 0">
                        {{Lampa.Lang.translate('persons_plugin_not_found')}}
                    </div>
                    <div class="persons-custom-grid" v-else>
                        <div class="person-custom-card selector" 
                             v-for="person in persons" 
                             :key="person.id"
                             data-focusable="true"
                             @hover:enter="openPerson(person)">
                            <div class="person-custom-card__poster">
                                <img :src="getPersonImage(person.photo || person.profile_path)" :alt="person.name" onerror="this.src='/img/person_empty.png'">
                            </div>
                            <div class="person-custom-card__info">
                                <div class="person-custom-card__name">{{person.name}}</div>
                                <div class="person-custom-card__department" v-if="person.known_for_department">
                                    {{person.known_for_department}}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            `,
            data: function() {
                return {
                    loading: true,
                    persons: [],
                    title: ''
                };
            },
            methods: {
                getPersonImage: function(profilePath) {
                    if (!profilePath) return '/img/person_empty.png';
                    if (profilePath.includes('http')) return profilePath;
                    if (profilePath.includes('/img/')) return profilePath;
                    return Lampa.TMDB.image('w500' + profilePath);
                },
                openPerson: function(person) {
                    debugLog('🎯 Відкриваємо сторінку актора', {
                        id: person.id,
                        name: person.name
                    });
                    Lampa.Activity.push({
                        component: 'actor',
                        id: person.id,
                        name: person.name,
                        source: 'tmdb'
                    });
                },
                loadPersons: function() {
                    var self = this;
                    self.loading = true;
                    self.persons = [];
                    
                    // ВИПРАВЛЕННЯ: Використовуємо глобальну функцію getSavedPersons
                    var savedPersons = window.getSavedPersons ? window.getSavedPersons() : [];
                    
                    debugLog('📋 Завантаження акторів зі сховища', {
                        total: savedPersons.length,
                        persons: savedPersons
                    });
                    
                    if (savedPersons.length === 0) {
                        self.loading = false;
                        debugLog('ℹ️ Акторів не знайдено в сховищі');
                        return;
                    }
                    
                    var currentLang = getCurrentLanguage();
                    var loaded = 0;
                    var personsData = [];
                    
                    savedPersons.forEach(function(savedPerson) {
                        var url = Lampa.TMDB.api('person/' + savedPerson.id + '?api_key=' + Lampa.TMDB.key() + '&language=' + currentLang);
                        
                        new Lampa.Reguest().silent(url, function(response) {
                            try {
                                var json = typeof response === 'string' ? JSON.parse(response) : response;
                                if (json && json.id) {
                                    personsData.push({
                                        id: json.id,
                                        name: json.name || savedPerson.name,
                                        profile_path: json.profile_path,
                                        known_for_department: json.known_for_department,
                                        photo: savedPerson.photo
                                    });
                                    debugLog('✅ Актор завантажено з TMDB', {
                                        id: json.id,
                                        name: json.name
                                    });
                                }
                            } catch (e) {
                                // Якщо не вдалося завантажити з TMDB, використовуємо збережені дані
                                personsData.push({
                                    id: savedPerson.id,
                                    name: savedPerson.name,
                                    profile_path: null,
                                    known_for_department: 'Actor',
                                    photo: savedPerson.photo
                                });
                                debugLog('⚠️ Використовуємо резервні дані', {
                                    id: savedPerson.id,
                                    error: e.message
                                });
                            }
                            
                            loaded++;
                            if (loaded >= savedPersons.length) {
                                self.persons = personsData;
                                self.loading = false;
                                debugLog('🎉 Всі актори завантажені', {
                                    total: personsData.length,
                                    persons: personsData
                                });
                            }
                        }, function(error) {
                            // У разі помилки запиту використовуємо збережені дані
                            personsData.push({
                                id: savedPerson.id,
                                name: savedPerson.name,
                                profile_path: null,
                                known_for_department: 'Actor',
                                photo: savedPerson.photo
                            });
                            
                            loaded++;
                            if (loaded >= savedPersons.length) {
                                self.persons = personsData;
                                self.loading = false;
                                debugLog('⚠️ Актори завантажені з помилками', {
                                    total: personsData.length
                                });
                            }
                        });
                    });
                }
            },
            on: {
                create: function() {
                    this.title = Lampa.Lang.translate('persons_plugin_title');
                    debugLog('🚀 Створення сторінки персон');
                    this.loadPersons();
                },
                back: function() {
                    Lampa.Activity.back();
                }
            }
        });
    }

    function startPlugin() {
        createDebugPanel();
        debugLog('🔧 Запуск плагіна');

        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found,
        });

        // Робимо функції глобальними для доступу з компонента
        window.getSavedPersons = getSavedPersons;
        window.getCurrentLanguage = getCurrentLanguage;

        setupCustomPersonsComponent();
        initStorage();

        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '">' +
            '<div class="menu__ico">' + ICON_SVG + '</div>' +
            '<div class="menu__text">' + Lampa.Lang.translate('persons_plugin_title') + '</div>' +
            '</li>'
        );

        menuItem.on("hover:enter", function () {
            debugLog('📖 Відкриваємо сторінку "Персони"');
            Lampa.Activity.push({
                component: "persons_custom",
                title: Lampa.Lang.translate('persons_plugin_title'),
                url: PLUGIN_NAME + '_custom'
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);
        debugLog('✅ Пункт меню додано');

        function waitForContainer(callback) {
            let attempts = 0;
            const max = 15;

            function check() {
                attempts++;
                var container = document.querySelector('.person-start__bottom');
                if (container) {
                    callback();
                    debugLog('✅ Контейнер знайдено');
                } else if (attempts < max) {
                    setTimeout(check, 200);
                } else {
                    debugLog('❌ Контейнер не знайдено після спроб', {attempts: attempts});
                }
            }

            setTimeout(check, 200);
        }

        function checkCurrentActivity() {
            var activity = Lampa.Activity.active();
            if (activity && activity.component === 'actor') {
                currentPersonId = parseInt(activity.id || activity.params?.id || location.pathname.match(/\/actor\/(\d+)/)?.[1], 10);
                if (currentPersonId) {
                    debugLog('🎯 Активна сторінка актора', {id: currentPersonId});
                    waitForContainer(addsubscriibbeButton);
                }
            }
        }

        Lampa.Listener.follow('activity', function (e) {
            if (e.type === 'start' && e.component === 'actor' && e.object?.id) {
                currentPersonId = parseInt(e.object.id, 10);
                debugLog('🔄 Початок сторінки актора', {id: currentPersonId});
                waitForContainer(addsubscriibbeButton);
            }
        });

        addButtonStyles();
        setTimeout(checkCurrentActivity, 1500);
        
        debugLog('✅ Плагін успішно запущено');
    }

    if (window.appready) {
        startPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startPlugin();
        });
    }
})();