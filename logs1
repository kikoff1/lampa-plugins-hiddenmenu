(function () {  
    'use strict';  
  
    function startPlugin() {  
        if (window.plugin_online_cinemas_ready) return;  
        window.plugin_online_cinemas_ready = true;  
  
        var OnlineCinemas = {  
            settings: {  
                showActors: true  
            },  
            logs: [],  
  
            init: function() {  
                this.loadSettings();  
                this.createSettings();  
                this.initStorageListener();  
                this.setupLogging();  
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Актори'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'online_cinemas',  
                    param: {  
                        name: 'show_actors',  
                        type: 'trigger',  
                        default: this.settings.showActors  
                    },  
                    field: {  
                        name: 'Показувати кнопку акторів'  
                    }  
                });  
  
                // Додаємо кнопку для перегляду логів  
                Lampa.SettingsApi.addParam({  
                    component: 'online_cinemas',  
                    param: {  
                        name: 'view_logs',  
                        type: 'button'  
                    },  
                    field: {  
                        name: 'Переглянути логи'  
                    },  
                    onChange: this.showLogs.bind(this)  
                });  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', (e) => {  
                    if(e.name === 'show_actors') {  
                        this.settings.showActors = Lampa.Storage.get('show_actors', true);  
                        this.toggleActorsButton();  
                    }  
                });  
            },  
  
            setupLogging: function() {  
                var self = this;  
                  
                // Логуємо створення активності  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'create' && e.component === 'category_full') {  
                        var activity = Lampa.Activity.active();  
                          
                        if (activity.url === 'person/popular') {  
                            self.addLog('=== АКТИВНІСТЬ СТВОРЕНА ===');  
                            self.addLog('URL: ' + activity.url);  
                            self.addLog('Component: ' + activity.component);  
                            self.addLog('Source: ' + activity.source);  
                              
                            setTimeout(function() {  
                                var component = activity.activity.component;  
                                  
                                if (component && component.append) {  
                                    var originalAppend = component.append;  
                                      
                                    component.append = function(data, append_flag) {  
                                        self.addLog('=== APPEND ВИКЛИКАНО ===');  
                                        self.addLog('Кількість результатів: ' + (data.results ? data.results.length : 0));  
                                          
                                        if (data.results && data.results.length > 0) {  
                                            // Логуємо перші 3 елементи  
                                            for (var i = 0; i < Math.min(3, data.results.length); i++) {  
                                                var element = data.results[i];  
                                                self.addLog('--- Елемент ' + (i + 1) + ' ---');  
                                                self.addLog('ID: ' + element.id);  
                                                self.addLog('Name: ' + element.name);  
                                                self.addLog('Gender: ' + (typeof element.gender !== 'undefined' ? element.gender : 'ВІДСУТНЄ'));  
                                                self.addLog('Profile path: ' + (element.profile_path ? 'Є' : 'Немає'));  
                                                self.addLog('Known for department: ' + (element.known_for_department || 'Немає'));  
                                                  
                                                // Логуємо всі ключі об'єкта  
                                                var keys = Object.keys(element);  
                                                self.addLog('Всі ключі: ' + keys.join(', '));  
                                            }  
                                        }  
                                          
                                        // Викликаємо оригінальний append  
                                        originalAppend.call(this, data, append_flag);  
                                    };  
                                }  
                            }, 100);  
                        }  
                    }  
                });  
  
                // Логуємо створення карток  
                Lampa.Listener.follow('line', function(e) {  
                    if (e.type === 'append') {  
                        var activity = Lampa.Activity.active();  
                          
                        if (activity && activity.url === 'person/popular') {  
                            self.addLog('=== КАРТКА ДОДАНА ===');  
                              
                            if (e.items && e.items.length > 0) {  
                                var lastCard = e.items[e.items.length - 1];  
                                  
                                if (lastCard && lastCard.card_data) {  
                                    var card_data = lastCard.card_data;  
                                    self.addLog('Card ID: ' + card_data.id);  
                                    self.addLog('Card Name: ' + card_data.name);  
                                    self.addLog('Card Gender: ' + (typeof card_data.gender !== 'undefined' ? card_data.gender : 'ВІДСУТНЄ'));  
                                    self.addLog('Card onEnter: ' + (lastCard.onEnter ? 'Встановлено' : 'Не встановлено'));  
                                }  
                            }  
                        }  
                    }  
                });  
            },  
  
            addLog: function(message) {  
                var timestamp = new Date().toLocaleTimeString('uk-UA');  
                this.logs.push('[' + timestamp + '] ' + message);  
                console.log(message); // Також виводимо в консоль для розробників  
            },  
  
            showLogs: function() {  
                var self = this;  
                  
                if (this.logs.length === 0) {  
                    Lampa.Noty.show('Логи порожні. Спочатку відкрийте список акторів.');  
                    return;  
                }  
  
                var logsText = this.logs.join('\n');  
                  
                // Створюємо модальне вікно з логами  
                Lampa.Modal.open({  
                    title: 'Логи акторів',  
                    html: $('<div class="about"><div class="about__content" style="white-space: pre-wrap; font-family: monospace; font-size: 0.9em; max-height: 70vh; overflow-y: auto;">' + logsText + '</div></div>'),  
                    size: 'large',  
                    buttons: [  
                        {  
                            name: 'Скопіювати',  
                            onSelect: function() {  
                                // Спроба скопіювати в буфер обміну  
                                if (navigator.clipboard && navigator.clipboard.writeText) {  
                                    navigator.clipboard.writeText(logsText).then(function() {  
                                        Lampa.Noty.show('Логи скопійовано в буфер обміну');  
                                    }).catch(function() {  
                                        Lampa.Noty.show('Не вдалося скопіювати. Виділіть текст вручну.');  
                                    });  
                                } else {  
                                    Lampa.Noty.show('Виділіть текст вручну і скопіюйте');  
                                }  
                            }  
                        },  
                        {  
                            name: 'Очистити логи',  
                            onSelect: function() {  
                                self.logs = [];  
                                Lampa.Noty.show('Логи очищено');  
                                Lampa.Modal.close();  
                            }  
                        },  
                        {  
                            name: 'Закрити',  
                            onSelect: function() {  
                                Lampa.Modal.close();  
                            }  
                        }  
                    ]  
                });  
            },  
  
            toggleActorsButton: function() {  
                $('.online-cinemas-actors').toggle(this.settings.showActors);  
            },  
  
            addActorsButton: function() {  
                const ico = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
                const button = $(`<li class="menu__item selector online-cinemas-actors" data-action="actors">  
                    <div class="menu__ico">${ico}</div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                this.addLog('=== ВІДКРИТТЯ СПИСКУ АКТОРІВ ===');  
                  
                Lampa.Activity.push({  
                    url: 'person/popular',  
                    title: 'Актори',  
                    component: 'category_full',  
                    source: 'tmdb',  
                    page: 1  
                });  
            }  
        };  
  
        function add() {  
            OnlineCinemas.init();  
            OnlineCinemas.addActorsButton();  
        }  
  
        if(window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if(!window.plugin_online_cinemas_ready) startPlugin();  
})();