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
  
                // Патчимо Activity.push для логування всіх активностей  
                var originalActivityPush = Lampa.Activity.push;  
                Lampa.Activity.push = function(params) {  
                    self.addLog('=== Activity.push викликано ===');  
                    self.addLog('URL: ' + (params.url || 'немає'));  
                    self.addLog('Component: ' + (params.component || 'немає'));  
                    self.addLog('ID: ' + (params.id || 'немає'));  
                    self.addLog('Source: ' + (params.source || 'немає'));  
                    self.addLog('Всі параметри: ' + JSON.stringify(params, null, 2));  
                    self.addLog('---');  
                    return originalActivityPush.apply(this, arguments);  
                };  
  
                // Слухаємо події активності  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'start') {  
                        var activity = Lampa.Activity.active();  
                        if (activity && activity.activity) {  
                            self.addLog('=== Активність запущена ===');  
                            self.addLog('Component: ' + (activity.activity.component || 'немає'));  
                            self.addLog('URL: ' + (activity.activity.url || 'немає'));  
                            self.addLog('ID: ' + (activity.activity.id || 'немає'));  
                            self.addLog('Source: ' + (activity.activity.source || 'немає'));  
                            self.addLog('---');  
                        }  
                    }  
                });  
  
                // Патчимо Lampa.Api.list для логування API запитів  
                if (Lampa.Api && Lampa.Api.list) {  
                    var originalApiList = Lampa.Api.list;  
                    Lampa.Api.list = function(params, oncomplite, onerror) {  
                        self.addLog('=== Api.list викликано ===');  
                        self.addLog('URL: ' + (params.url || 'немає'));  
                        self.addLog('Params: ' + JSON.stringify(params, null, 2));  
                        self.addLog('---');  
  
                        var wrappedOnComplite = function(data) {  
                            self.addLog('=== Api.list успішно завершено ===');  
                            self.addLog('Кількість результатів: ' + (data && data.results ? data.results.length : 0));  
                            if (data && data.results && data.results.length > 0) {  
                                self.addLog('Перший результат: ' + JSON.stringify(data.results[0], null, 2));  
                            }  
                            self.addLog('---');  
                            if (oncomplite) oncomplite(data);  
                        };  
  
                        var wrappedOnError = function(error) {  
                            self.addLog('=== Api.list помилка ===');  
                            self.addLog('Error: ' + JSON.stringify(error, null, 2));  
                            self.addLog('---');  
                            if (onerror) onerror(error);  
                        };  
  
                        return originalApiList.call(this, params, wrappedOnComplite, wrappedOnError);  
                    };  
                }  
  
                // Патчимо Lampa.TMDB.get для логування TMDB запитів  
                if (Lampa.TMDB && Lampa.TMDB.get) {  
                    var originalTMDBGet = Lampa.TMDB.get;  
                    Lampa.TMDB.get = function(method, complite, error) {  
                        self.addLog('=== TMDB.get викликано ===');  
                        self.addLog('Method: ' + method);  
                        self.addLog('---');  
  
                        var wrappedComplite = function(data) {  
                            self.addLog('=== TMDB.get успішно завершено ===');  
                            self.addLog('Method: ' + method);  
                            self.addLog('Кількість результатів: ' + (data && data.results ? data.results.length : 0));  
                            self.addLog('---');  
                            if (complite) complite(data);  
                        };  
  
                        var wrappedError = function(err) {  
                            self.addLog('=== TMDB.get помилка ===');  
                            self.addLog('Method: ' + method);  
                            self.addLog('Error: ' + JSON.stringify(err, null, 2));  
                            self.addLog('---');  
                            if (error) error(err);  
                        };  
  
                        return originalTMDBGet.call(this, method, wrappedComplite, wrappedError);  
                    };  
                }  
  
                // Патчимо Lampa.InteractionCategory для логування створення карток  
                if (Lampa.InteractionCategory) {  
                    var originalInteractionCategory = Lampa.InteractionCategory;  
                    Lampa.InteractionCategory = function(element, params) {  
                        self.addLog('=== InteractionCategory створено ===');  
                        self.addLog('Element: ' + JSON.stringify(element, null, 2));  
                        self.addLog('Params: ' + JSON.stringify(params, null, 2));  
                        self.addLog('---');  
                        return originalInteractionCategory.call(this, element, params);  
                    };  
                }  
  
                // Патчимо Lampa.Scroll для логування скролу  
                if (Lampa.Scroll) {  
                    var originalScroll = Lampa.Scroll;  
                    Lampa.Scroll = function(params) {  
                        self.addLog('=== Scroll створено ===');  
                        self.addLog('Params: ' + JSON.stringify(params, null, 2));  
                        self.addLog('---');  
                          
                        var scrollInstance = new originalScroll(params);  
                          
                        // Патчимо append  
                        var originalAppend = scrollInstance.append;  
                        scrollInstance.append = function(element) {  
                            self.addLog('=== Scroll.append викликано ===');  
                            self.addLog('Element type: ' + (element ? element.constructor.name : 'null'));  
                            self.addLog('---');  
                            return originalAppend.call(this, element);  
                        };  
                          
                        return scrollInstance;  
                    };  
                }  
  
                // Патчимо Lampa.Controller для логування навігації  
                if (Lampa.Controller) {  
                    var originalCollectionSet = Lampa.Controller.collectionSet;  
                    Lampa.Controller.collectionSet = function(html, params) {  
                        self.addLog('=== Controller.collectionSet викликано ===');  
                        self.addLog('HTML type: ' + (html ? html.constructor.name : 'null'));  
                        self.addLog('Params: ' + JSON.stringify(params, null, 2));  
                        self.addLog('---');  
                        return originalCollectionSet.apply(this, arguments);  
                    };  
  
                    var originalCollectionFocus = Lampa.Controller.collectionFocus;  
                    Lampa.Controller.collectionFocus = function(target, html) {  
                        self.addLog('=== Controller.collectionFocus викликано ===');  
                        self.addLog('Target type: ' + (target ? target.constructor.name : 'null'));  
                        self.addLog('HTML type: ' + (html ? html.constructor.name : 'null'));  
                        self.addLog('---');  
                        return originalCollectionFocus.apply(this, arguments);  
                    };  
                }  
  
                self.addLog('✅ Логування ініціалізовано');  
            },  
  
            showLogs: function() {  
                var self = this;  
                var logsText = this.logs.join('\n');  
  
                var modal = $('<div class="modal">' +  
                    '<div class="modal__content">' +  
                    '<div class="modal__title">Логи акторів</div>' +  
                    '<div class="modal__body">' +  
                    '<textarea class="settings-field" style="width: 100%; height: 400px; font-family: monospace; font-size: 12px;">' + logsText + '</textarea>' +  
                    '</div>' +  
                    '<div class="modal__footer">' +  
                    '<div class="simple-button selector" data-action="copy">Копіювати</div>' +  
                    '<div class="simple-button selector" data-action="clear">Очистити</div>' +  
                    '<div class="simple-button selector" data-action="close">Закрити</div>' +  
                    '</div>' +  
                    '</div>' +  
                    '</div>');  
  
                modal.find('[data-action="copy"]').on('hover:enter', function() {  
                    var textarea = modal.find('textarea')[0];  
                    textarea.select();  
                    document.execCommand('copy');  
                    Lampa.Noty.show('Логи скопійовано');  
                });  
  
                modal.find('[data-action="clear"]').on('hover:enter', function() {  
                    self.logs = [];  
                    modal.find('textarea').val('');  
                    Lampa.Noty.show('Логи очищено');  
                });  
  
                modal.find('[data-action="close"]').on('hover:enter', function() {  
                    Lampa.Modal.close();  
                    Lampa.Controller.toggle('settings_component');  
                });  
  
                Lampa.Modal.open({  
                    title: '',  
                    html: modal,  
                    onBack: function() {  
                        Lampa.Modal.close();  
                        Lampa.Controller.toggle('settings_component');  
                    }  
                });  
  
                Lampa.Controller.collectionSet(modal);  
                Lampa.Controller.collectionFocus(modal.find('.selector').eq(0), modal);  
            },  
  
            createSettingsButton: function() {  
                var self = this;  
  
                Lampa.SettingsApi.addParam({  
                    component: 'interface',  
                    param: {  
                        name: 'show_actors_logs',  
                        type: 'button',  
                        default: ''  
                    },  
                    field: {  
                        name: 'Переглянути логи акторів'  
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