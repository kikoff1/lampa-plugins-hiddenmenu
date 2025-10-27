(function () {
    'use strict';





    function startPlugin() {
        if (window.plugin_error_logger_ready) return;
        window.plugin_error_logger_ready = true;

        var ErrorLogger = {
            logs: Lampa.Storage.get('error_logs', []),

            init: function () {
                this.interceptErrors();
                this.createSettingsButton();
            },

            interceptErrors: function () {
                var self = this;

                const originalConsoleError = console.error;
                console.error = function () {
                    const message = Array.from(arguments).join(' ');
                    self.addLog('ConsoleError: ' + message);
                    originalConsoleError.apply(console, arguments);
                };

                window.onerror = function (message, source, lineno, colno, error) {
                    const errorMsg = `${message} (${source}:${lineno}:${colno})`;
                    self.addLog('WindowError: ' + errorMsg);
                };

                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'error') {
                        self.addLog('AppError: ' + JSON.stringify(e, null, 2));
                    }
                });
            },

            addLog: function (message) {
                var timestamp = new Date().toLocaleTimeString('uk-UA');
                var logEntry = '[' + timestamp + '] ' + message;
                this.logs.push(logEntry);
                if (this.logs.length > 100) this.logs.shift();
                Lampa.Storage.set('error_logs', this.logs);
                console.log('[ErrorLogger]', logEntry);
            },

            showLogs: function () {
                var self = this;

                if (this.logs.length === 0) {
                    Lampa.Noty.show('Логи порожні.');
                    return;
                }

                var logsText = this.logs.join('\n');

                var textarea = $('<textarea readonly style="width:100%; height:60vh; font-family:monospace; font-size:0.9em; padding:10px; background:#003300; color:#b8ffb8; border:1px solid #008000; resize:none;"></textarea>');
                textarea.val(logsText);

                var container = $('<div class="about"></div>');
                container.append('<div style="margin-bottom:10px; font-weight:bold; color:#0f0;">📗 Логи помилок Lampa</div>');
                container.append(textarea);

                Lampa.Modal.open({
                    title: 'Error Logger',
                    html: container,
                    size: 'large',
                    buttons: [
                        {
                            name: '📋 Копіювати',
                            onSelect: function () {
                                textarea[0].select();
                                textarea[0].setSelectionRange(0, 99999);

                                try {
                                    document.execCommand('copy');
                                    Lampa.Noty.show('Логи скопійовано');
                                } catch (err) {
                                    Lampa.Noty.show('Не вдалося скопіювати');
                                }
                            }
                        },
                        {
                            name: '🧹 Очистити',
                            onSelect: function () {
                                self.logs = [];
                                Lampa.Storage.set('error_logs', self.logs);
                                Lampa.Noty.show('Логи очищено');
                                Lampa.Modal.close();
                            }
                        },
                        {
                            name: 'Закрити',
                            onSelect: function () {
                                Lampa.Modal.close();
                            }
                        }
                    ]
                });

                setTimeout(function () {
                    textarea[0].focus();
                    textarea[0].select();
                }, 100);
            },

            createSettingsButton: function () {
                var self = this;

                // Створюємо розділ у налаштуваннях
                Lampa.SettingsApi.addComponent({
                    component: 'error_logger',
                    name: 'Error Logger'
                });

                // Додаємо кнопку для перегляду логів
                Lampa.SettingsApi.addParam({
                    component: 'error_logger',
                    param: {
                        name: 'show_logs',
                        type: 'button',
                        default: ''
                    },
                    field: {
                        name: 'Переглянути логи'
                    },
                    onChange: function () {
                        self.showLogs();
                    }
                });

                // Додаємо кнопку для очищення логів
                Lampa.SettingsApi.addParam({
                    component: 'error_logger',
                    param: {
                        name: 'clear_logs',
                        type: 'button',
                        default: ''
                    },
                    field: {
                        name: 'Очистити логи'
                    },
                    onChange: function () {
                        self.logs = [];
                        Lampa.Storage.set('error_logs', self.logs);
                        Lampa.Noty.show('Логи очищено');
                    }
                });
            }
        };

        function add() {
            ErrorLogger.init();
        }

        if (window.appready) add();
        else {
            Lampa.Listener.follow('app', function (e) {
                if (e.type === 'ready') add();
            });
        }
    }

    if (!window.plugin_error_logger_ready) startPlugin();
})();
