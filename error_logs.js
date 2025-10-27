(function () {
    'use strict';





    function startPlugin() {
        if (window.plugin_error_logger_ready) return;
        window.plugin_error_logger_ready = true;

        var ErrorLogger = {
            logs: Lampa.Storage.get('error_logs', []) || [],
            lastConsoleLength: 0,

            init: function () {
                this.setupLogging();
                this.createSettingsButton();
                this.addLog('✅ ErrorLogger ініціалізовано через Lampa.Console');
            },

            setupLogging: function () {
                var self = this;

                // --- 1. Періодично опитуємо Lampa.Console.export() ---
                // (отримує усі логи, які Lampa вже перехопила)
                setInterval(function () {
                    try {
                        var exported = Lampa.Console.export();
                        if (!exported || !Array.isArray(exported)) return;

                        if (exported.length > self.lastConsoleLength) {
                            var newLogs = exported.slice(self.lastConsoleLength);
                            newLogs.forEach(function (entry) {
                                if (entry.type === 'error') {
                                    self.addLog(`[Lampa.Console] ${entry.text}`);
                                }
                            });
                            self.lastConsoleLength = exported.length;
                        }
                    } catch (e) {
                        // Якщо щось пішло не так — пишемо у наш лог
                        self.addLog('ErrorLogger internal error: ' + e.message);
                    }
                }, 2000);

                // --- 2. Слухаємо помилки запитів ---
                Lampa.Listener.follow('request_error', function (e) {
                    try {
                        if (e && e.params && e.error) {
                            var msg = `RequestError: ${e.error.status} ${e.params.url}`;
                            self.addLog(msg);
                        }
                    } catch (err) {
                        self.addLog('Listener request_error failed: ' + err.message);
                    }
                });

                // --- 3. Слухаємо window.onerror ---
                window.addEventListener('error', function (e) {
                    const msg = `${e.message || 'Unknown error'} at ${e.filename || 'unknown'}:${e.lineno || '?'}`;
                    self.addLog('WindowError: ' + msg);
                });

                // --- 4. Слухаємо unhandledrejection ---
                window.addEventListener('unhandledrejection', function (e) {
                    const reason = e.reason ? (e.reason.stack || e.reason.message || e.reason) : 'Unknown promise rejection';
                    self.addLog('PromiseRejection: ' + reason);
                });
            },

            addLog: function (message) {
                var timestamp = new Date().toLocaleTimeString('uk-UA');
                var entry = `[${timestamp}] ${message}`;
                this.logs.push(entry);
                if (this.logs.length > 300) this.logs.shift();
                Lampa.Storage.set('error_logs', this.logs);
                console.log('%c[ErrorLogger]', 'color:lime', message);
            },

            showLogs: function () {
                if (!this.logs || this.logs.length === 0) {
                    Lampa.Noty.show('Логи відсутні.');
                    return;
                }

                var self = this;
                var logsText = this.logs.join('\n');
                var textarea = $('<textarea readonly style="width:100%;height:60vh;font-family:monospace;font-size:0.9em;padding:10px;background:#003300;color:#b8ffb8;border:1px solid #008000;resize:none;"></textarea>');
                textarea.val(logsText);

                var container = $('<div class="about"></div>');
                container.append('<div style="margin-bottom:10px; font-weight:bold; color:#0f0;">📗 Логи Lampa Console та помилок</div>');
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
                    param: { name: 'test_request_error', type: 'button', default: '' },
                    field: { name: 'Створити тестову помилку' },
                    onChange: function () {
                        // Створюємо штучну помилку запиту
                        Lampa.Listener.send('request_error', {
                            params: { url: 'https://fake.lampa/request/fail' },
                            error: { status: 404, text: 'Not Found' }
                        });
                        Lampa.Noty.show('Тестова помилка згенерована');
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
