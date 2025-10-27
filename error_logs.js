(function () {
    'use strict';

    function startPlugin() {
        if (window.plugin_error_logger_ready) return;
        window.plugin_error_logger_ready = true;

        var ErrorLogger = {
            logs: Lampa.Storage.get('error_logs', []) || [],

            init: function () {
                this.setupLogging();
                this.createSettingsButton();
                console.log('%c[ErrorLogger] Плагін ініціалізовано', 'color:lime');
                // Тестовий запис для перевірки роботи
                this.addLog('✅ ErrorLogger запущено');
            },

            setupLogging: function () {
                var self = this;

                // --- Перехоплення console.error ---
                const origConsoleError = console.error;
                console.error = function () {
                    const message = Array.from(arguments).map(a => (typeof a === 'object' ? JSON.stringify(a) : a)).join(' ');
                    self.addLog('ConsoleError: ' + message);
                    origConsoleError.apply(console, arguments);
                };

                // --- Перехоплення window.onerror ---
                window.addEventListener('error', function (e) {
                    const msg = `${e.message || 'Unknown error'} at ${e.filename || 'unknown'}:${e.lineno || '?'}:${e.colno || '?'}`;
                    self.addLog('WindowError: ' + msg);
                });

                // --- Перехоплення unhandledrejection ---
                window.addEventListener('unhandledrejection', function (e) {
                    const reason = e.reason ? (e.reason.stack || e.reason.message || e.reason) : 'Unknown promise rejection';
                    self.addLog('PromiseRejection: ' + reason);
                });

                // --- Події Lampa ---
                Lampa.Listener.follow('app', function (e) {
                    if (e.type === 'error') {
                        self.addLog('AppError: ' + JSON.stringify(e, null, 2));
                    }
                });
            },

            addLog: function (message) {
                var timestamp = new Date().toLocaleTimeString('uk-UA');
                var entry = `[${timestamp}] ${message}`;
                this.logs.push(entry);
                if (this.logs.length > 200) this.logs.shift();
                Lampa.Storage.set('error_logs', this.logs);
                console.log('%c[ErrorLogger]', 'color:green', message);
            },

            showLogs: function () {
                var self = this;

                if (!this.logs || this.logs.length === 0) {
                    Lampa.Noty.show('Логи відсутні.');
                    return;
                }

                var logsText = this.logs.join('\n');
                var textarea = $('<textarea readonly style="width:100%;height:60vh;font-family:monospace;font-size:0.9em;padding:10px;background:#003300;color:#b8ffb8;border:1px solid #008000;resize:none;"></textarea>');
                textarea.val(logsText);

                var container = $('<div class="about"></div>');
                container.append('<div style="margin-bottom:10px; font-weight:bold; color:#0f0;">📗 Логи помилок</div>');
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

                Lampa.SettingsApi.addComponent({
                    component: 'error_logger',
                    name: 'Error Logger'
                });

                Lampa.SettingsApi.addParam({
                    component: 'error_logger',
                    param: { name: 'show_logs', type: 'button', default: '' },
                    field: { name: 'Переглянути логи' },
                    onChange: function () {
                        self.showLogs();
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'error_logger',
                    param: { name: 'test_error', type: 'button', default: '' },
                    field: { name: 'Тестова помилка' },
                    onChange: function () {
                        console.error('Це тестова помилка для перевірки ErrorLogger');
                        Lampa.Noty.show('Тестову помилку відправлено у лог');
                    }
                });

                Lampa.SettingsApi.addParam({
                    component: 'error_logger',
                    param: { name: 'clear_logs', type: 'button', default: '' },
                    field: { name: 'Очистити логи' },
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
