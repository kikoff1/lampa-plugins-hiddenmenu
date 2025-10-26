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
                    self.addLog('Card ID: ' + (params.card ? params.card.id : 'немає'));    
                    self.addLog('Method: ' + (params.method || 'немає'));    
                    self.addLog('Всі параметри: ' + JSON.stringify(params, null, 2));    
                    self.addLog('---');    
                        
                    return originalActivityPush.call(this, params);    
                };    
    
                // Логуємо створення активностей    
                Lampa.Listener.follow('activity', function(e) {    
                    if (e.type === 'start') {    
                        self.addLog('=== Активність запущена ===');    
                        self.addLog('Component: ' + e.component);    
                        self.addLog('URL: ' + (e.object.url || 'немає'));    
                        self.addLog('ID: ' + (e.object.id || 'немає'));    
                        self.addLog('Source: ' + (e.object.source || 'немає'));    
                        self.addLog('---');    
                    }    
                });    
    
                // ВИПРАВЛЕНИЙ КОД: Логуємо події через addEventListener  
                var originalCardCreate = Lampa.Card.prototype.create;    
                Lampa.Card.prototype.create = function() {    
                    var result = originalCardCreate.call(this);    
                        
                    var card = this;    
                    var card_data = card.card;    
                        
                    // Логуємо створення картки актора    
                    if (card_data && card_data.profile_path) {    
                        self.addLog('=== Картка актора створена ===');    
                        self.addLog('ID: ' + (card_data.id || 'немає'));    
                        self.addLog('Name: ' + (card_data.name || 'немає'));    
                        self.addLog('Gender: ' + (card_data.gender || 'немає'));    
                        self.addLog('Profile path: ' + (card_data.profile_path || 'немає'));    
                        self.addLog('---');    
                          
                        // Патчимо addEventListener для перехоплення hover:enter  
                        var originalAddEventListener = card.card.addEventListener;  
                        card.card.addEventListener = function(event, handler) {  
                            if (event === 'hover:enter') {  
                                self.addLog('=== addEventListener hover:enter викликано ===');  
                                self.addLog('ID: ' + (card_data.id || 'немає'));  
                                self.addLog('Name: ' + (card_data.name || 'немає'));  
                                self.addLog('---');  
                                  
                                // Обгортаємо оригінальний handler  
                                var wrappedHandler = function() {  
                                    self.addLog('=== hover:enter спрацював на картці актора ===');  
                                    self.addLog('ID: ' + (card_data.id || 'немає'));  
                                    self.addLog('Name: ' + (card_data.name || 'немає'));  
                                    self.addLog('Gender: ' + (card_data.gender || 'немає'));  
                                    self.addLog('---');  
                                      
                                    return handler.apply(this, arguments);  
                                };  
                                  
                                return originalAddEventListener.call(this, event, wrappedHandler);  
                            }  
                              
                            return originalAddEventListener.call(this, event, handler);  
                        };  
                    }    
                        
                    return result;    
                };    
            },    
    
            showLogs: function() {    
                var self = this;    
                    
                if (this.logs.length === 0) {    
                    Lampa.Noty.show('Логи порожні. Спочатку відкрийте список акторів.');    
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
                                    document.execCommand('copy');    
                                    Lampa.Noty.show('Логи скопійовано');    
                                } catch (err) {    
                                    Lampa.Noty.show('Не вдалося скопіювати. Виділіть текст вручну.');    
                                }    
                            }    
                        },    
                        {    
                            name: 'Виділити все',    
                            onSelect: function() {    
                                textarea[0].focus();    
                                textarea[0].select();    
                                textarea[0].setSelectionRange(0, 99999);    
                            }    
                        },    
                        {    
                            name: 'Очистити',    
                            onSelect: function() {    
                                self.logs = [];    
                                Lampa.Modal.close();    
                                Lampa.Noty.show('Логи очищено');    
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
                        name: 'show_logs',    
                        type: 'button',    
                        default: ''    
                    },    
                    field: {    
                        name: 'Переглянути логи'    
                    },    
                    onChange: function() {    
                        self.showLogs();    
                    }    
                });    
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