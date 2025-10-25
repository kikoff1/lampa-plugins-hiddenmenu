(function () {  
    'use strict';  
  
    function startPlugin() {  
        if (window.plugin_actors_logger_ready) return;  
        window.plugin_actors_logger_ready = true;  
  
        var ActorsLogger = {  
            logs: [],  
  
            init: function() {  
                this.setupLogging();  
                this.createSettingsButton();  
            },  
  
            addLog: function(message) {  
                var timestamp = new Date().toLocaleTimeString('uk-UA');  
                var logEntry = '[' + timestamp + '] ' + message;  
                this.logs.push(logEntry);  
                console.log(logEntry);  
            },  
  
            setupLogging: function() {  
                var self = this;  
  
                // Логуємо всі Activity.push виклики  
                var originalActivityPush = Lampa.Activity.push;  
                Lampa.Activity.push = function(params) {  
                    self.addLog('=== Activity.push викликано ===');  
                    self.addLog('URL: ' + (params.url || 'немає'));  
                    self.addLog('Component: ' + (params.component || 'немає'));  
                    self.addLog('ID: ' + (params.id || 'немає'));  
                    self.addLog('Source: ' + (params.source || 'немає'));  
                    self.addLog('Card ID: ' + (params.card && params.card.id ? params.card.id : 'немає'));  
                    self.addLog('Method: ' + (params.method || 'немає'));  
                    self.addLog('Всі параметри: ' + JSON.stringify(params, null, 2));  
                    self.addLog('---');  
                      
                    return originalActivityPush.call(this, params);  
                };  
  
                // Логуємо створення карток  
                Lampa.Listener.follow('line', function(e) {  
                    if (e.type === 'append' && e.items && e.items.length > 0) {  
                        var lastCard = e.items[e.items.length - 1];  
                          
                        if (lastCard && lastCard.card_data) {  
                            var card_data = lastCard.card_data;  
                              
                            self.addLog('=== Картка створена ===');  
                            self.addLog('ID: ' + (card_data.id || 'немає'));  
                            self.addLog('Name: ' + (card_data.name || card_data.title || 'немає'));  
                            self.addLog('Gender: ' + (typeof card_data.gender !== 'undefined' ? card_data.gender : 'ВІДСУТНЄ'));  
                            self.addLog('Profile path: ' + (card_data.profile_path ? 'Є' : 'Немає'));  
                            self.addLog('Poster path: ' + (card_data.poster_path ? 'Є' : 'Немає'));  
                            self.addLog('Media type: ' + (card_data.media_type || 'немає'));  
                            self.addLog('Known for department: ' + (card_data.known_for_department || 'немає'));  
                              
                            var keys = Object.keys(card_data);  
                            self.addLog('Всі ключі: ' + keys.join(', '));  
                            self.addLog('---');  
                        }  
                    }  
                });  
  
                // Логуємо події карток  
                var originalCardCreate = Lampa.Card.prototype.create;  
                Lampa.Card.prototype.create = function() {  
                    var card = this;  
                      
                    // Зберігаємо оригінальний onEnter  
                    var originalOnEnter = this.onEnter;  
                      
                    this.onEnter = function(target, card_data) {  
                        self.addLog('=== onEnter викликано на картці ===');  
                        self.addLog('Card ID: ' + (card_data.id || 'немає'));  
                        self.addLog('Card Name: ' + (card_data.name || card_data.title || 'немає'));  
                        self.addLog('Gender: ' + (typeof card_data.gender !== 'undefined' ? card_data.gender : 'ВІДСУТНЄ'));  
                        self.addLog('Profile path: ' + (card_data.profile_path ? 'Є' : 'Немає'));  
                        self.addLog('Source: ' + (card_data.source || 'немає'));  
                        self.addLog('URL: ' + (card_data.url || 'немає'));  
                        self.addLog('---');  
                          
                        if (originalOnEnter) {  
                            return originalOnEnter.call(card, target, card_data);  
                        }  
                    };  
                      
                    return originalCardCreate.call(this);  
                };  
  
                // Логуємо створення активностей  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'start') {  
                        var activity = Lampa.Activity.active();  
                          
                        self.addLog('=== Активність запущена ===');  
                        self.addLog('Component: ' + (activity.component || 'немає'));  
                        self.addLog('URL: ' + (activity.url || 'немає'));  
                        self.addLog('ID: ' + (activity.id || 'немає'));  
                        self.addLog('Source: ' + (activity.source || 'немає'));  
                        self.addLog('---');  
                    }  
                });  
            },  
  
            createSettingsButton: function() {  
                var self = this;  
  
                Lampa.SettingsApi.addComponent({  
                    component: 'actors_logger',  
                    name: 'Логи акторів'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'actors_logger',  
                    param: {  
                        name: 'view_logs',  
                        type: 'button'  
                    },  
                    field: {  
                        name: 'Переглянути логи'  
                    },  
                    onChange: this.showLogs.bind(this)  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'actors_logger',  
                    param: {  
                        name: 'clear_logs',  
                        type: 'button'  
                    },  
                    field: {  
                        name: 'Очистити логи'  
                    },  
                    onChange: function() {  
                        self.logs = [];  
                        Lampa.Noty.show('Логи очищено');  
                    }  
                });  
            },  
  
            showLogs: function() {  
                var self = this;  
                  
                if (this.logs.length === 0) {  
                    Lampa.Noty.show('Логи порожні. Спробуйте відкрити картки акторів.');  
                    return;  
                }  
  
                var logsText = this.logs.join('\n');  
                  
                var textarea = $('<textarea readonly style="width: 100%; height: 60vh; font-family: monospace; font-size: 0.9em; padding: 10px; background: #1a1a1a; color: #fff; border: 1px solid #333; resize: none;"></textarea>');  
                textarea.val(logsText);  
                  
                var container = $('<div class="about"></div>');  
                container.append(textarea);  
                  
                Lampa.Modal.open({  
                    title: 'Логи акторів',  
                    html: container,  
                    size: 'large',  
                    buttons: [  
                        {  
                            name: 'Скопіювати',  
                            onSelect: function() {  
                                textarea[0].select();  
                                textarea[0].setSelectionRange(0, 99999);  
                                  
                                try {  
                                    var successful = document.execCommand('copy');  
                                    if (successful) {  
                                        Lampa.Noty.show('Логи скопійовано');  
                                    } else {  
                                        Lampa.Noty.show('Текст виділено. Скопіюйте вручну (Ctrl+C)');  
                                    }  
                                } catch (err) {  
                                    Lampa.Noty.show('Текст виділено. Скопіюйте вручну (Ctrl+C)');  
                                }  
                            }  
                        },  
                        {  
                            name: 'Виділити все',  
                            onSelect: function() {  
                                textarea[0].select();  
                                textarea[0].setSelectionRange(0, 99999);  
                                Lampa.Noty.show('Текст виділено');  
                            }  
                        },  
                        {  
                            name: 'Очистити',  
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
                  
                setTimeout(function() {  
                    textarea[0].focus();  
                    textarea[0].select();  
                }, 100);  
            }  
        };  
  
        function add() {  
            ActorsLogger.init();  
        }  
  
        if(window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if(!window.plugin_actors_logger_ready) startPlugin();  
})();