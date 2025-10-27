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
                  
                // Обмежуємо кількість логів до 1000  
                if (this.logs.length > 1000) {  
                    this.logs.shift();  
                }  
                  
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
                    self.addLog('Source: ' + (params.source || 'tmdb'));  
                    self.addLog('Card ID: ' + (params.card && params.card.id ? params.card.id : 'немає'));  
                    self.addLog('Method: ' + (params.method || 'немає'));  
                    self.addLog('Всі параметри: ' + JSON.stringify(params, null, 2));  
                    self.addLog('---');  
                      
                    return originalActivityPush.apply(this, arguments);  
                };  
  
                // Логування запуску активностей  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'start') {  
                        self.addLog('=== Активність запущена ===');  
                        self.addLog('Component: ' + (e.component || 'немає'));  
                        self.addLog('URL: ' + (e.url || 'немає'));  
                        self.addLog('ID: ' + (e.id || 'немає'));  
                        self.addLog('Source: ' + (e.source || 'tmdb'));  
                        self.addLog('---');  
                    }  
                });  
            },  
  
            showLogs: function() {  
                var self = this;  
                  
                // Створюємо модальне вікно для відображення логів  
                var modal = $('<div class="modal"></div>');  
                var content = $('<div class="modal__content"></div>');  
                var title = $('<div class="modal__title">Логи акторів</div>');  
                var logsContainer = $('<div class="modal__text" style="max-height: 60vh; overflow-y: auto;"></div>');  
                  
                // Створюємо textarea для легкого копіювання  
                var textarea = $('<textarea readonly style="width: 100%; height: 50vh; font-family: monospace; font-size: 0.9em; padding: 1em; background: #000; color: #0f0; border: 1px solid #333;"></textarea>');  
                textarea.val(this.logs.join('\n'));  
                  
                logsContainer.append(textarea);  
                  
                // Кнопки  
                var buttons = $('<div style="margin-top: 1em; display: flex; gap: 1em;"></div>');  
                  
                var copyButton = $('<div class="button selector">Копіювати</div>');  
                copyButton.on('hover:enter', function() {  
                    textarea[0].select();  
                    try {  
                        document.execCommand('copy');  
                        Lampa.Noty.show('Логи скопійовано в буфер обміну');  
                    } catch (err) {  
                        Lampa.Noty.show('Помилка при копіюванні');  
                    }  
                });  
                  
                var clearButton = $('<div class="button selector">Очистити</div>');  
                clearButton.on('hover:enter', function() {  
                    self.logs = [];  
                    textarea.val('');  
                    Lampa.Noty.show('Логи очищено');  
                });  
                  
                var closeButton = $('<div class="button selector">Закрити</div>');  
                closeButton.on('hover:enter', function() {  
                    Lampa.Modal.close();  
                    Lampa.Controller.toggle('content');  
                });  
                  
                buttons.append(copyButton);  
                buttons.append(clearButton);  
                buttons.append(closeButton);  
                  
                content.append(title);  
                content.append(logsContainer);  
                content.append(buttons);  
                modal.append(content);  
                  
                Lampa.Modal.open({  
                    title: '',  
                    html: modal,  
                    size: 'large',  
                    mask: true,  
                    onBack: function() {  
                        Lampa.Modal.close();  
                        Lampa.Controller.toggle('content');  
                    }  
                });  
                  
                Lampa.Controller.add('modal', {  
                    toggle: function() {  
                        Lampa.Controller.collectionSet(modal);  
                        Lampa.Controller.collectionFocus(copyButton[0], modal[0]);  
                    },  
                    back: function() {  
                        Lampa.Modal.close();  
                        Lampa.Controller.toggle('content');  
                    }  
                });  
                  
                Lampa.Controller.toggle('modal');  
            },  
  
            createSettingsButton: function() {  
                var self = this;  
                  
                Lampa.SettingsApi.addParam({  
                    component: 'interface',  
                    param: {  
                        name: 'show_logs',  
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