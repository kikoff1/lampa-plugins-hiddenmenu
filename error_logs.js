(function () {
    'use strict';

    function startPlugin() {
        if (window.plugin_error_logger_ready) return;
        window.plugin_error_logger_ready = true;

        var ErrorLogger = {
            logs: Lampa.Storage.get('error_logs', []) || [],
            knownCounts: {},

            init: function () {
                this.setupLogging();
                this.createSettingsButton();
                this.addLog('✅ ErrorLogger ініціалізовано (через Lampa.Console)');
            },

            setupLogging: function () {
                var self = this;

                // ---- 1. Отримання логів безпосередньо з Lampa.Console ----
                setInterval(function () {
                    try {
                        var allLogs = Lampa.Console.export();
                        if (!allLogs || typeof allLogs !== 'object') return;

                        for (var category in allLogs) {
                            var catLogs = allLogs[category];
                            if (!Array.isArray(catLogs)) continue;

                            var prevCount = self.knownCounts[category] || 0;
                            if (catLogs.length > prevCount) {
                                for (var i = prevCount; i < catLogs.length; i++) {
                                    var log = catLogs[i];
                                    if (log && log.message) {
                                        self.addLog(`[${category}] ${log.message}`);
                                    }
                                }
                                self.knownCounts[category] = catLogs.length;
                            }
                        }
                    } catch (err) {
                        self.addLog('❌ Помилка читання Lampa.Console: ' + err.message);
                    }
                }, 1000);

                // ---- 2. Слухаємо системні події помилок ----
                Lampa.Listener.follow('request_error', function (e) {
                    if (e && e.params && e.error) {
                        self.addLog(`[RequestError] ${e.error.status} ${e.params.url}`);
                    }
                });

                Lampa.Listener.follow('activity', function (e) {
                    if (e.type === 'create' && e.error) {
                        self.addLog(`[ActivityError] ${e.error.stack || e.error.message}`);
                    }
                });

                // ---- 3. Глобальні події браузера ----
                window.addEventListener('error', function (e) {
                    const msg = `${e.message || 'Unknown'} @ ${e.filename}:${e.lineno}`;
                    self.addLog(`[Script] ${msg}`);
                });

                window.addEventListener('unhandledrejection', function (e) {
                    const reason = e.reason ? (e.reason.stack || e.reason.message || e.reason) : 'Unknown rejection';
                    self.addLog(`[Promise] ${reason}`);
                });
            },

            addLog: function (message) {
                var timestamp = new Date().toLocaleTimeString('uk-UA');
                var entry = `[${timestamp}] ${message}`;
                this.logs.push(entry);

                if (this.logs.length > 500) this.logs.shift();
                Lampa.Storage.set('error_logs', this.logs);

                console.log('%c[ErrorLogger]', 'color:lime', message);
            },

            showLogs: function () {
                if (this.logs.length === 0) {
                    Lampa.Noty.show('Логи відсутні.');
                    return;
                }

                var self = this;
                var logsText = this.logs.join('\n');

                var textarea = $('<textarea readonly style="width:100%;height:60vh;font-family:monospace;font-size:0.9em;padding:10px;background:#003300;color:#b8ffb8;border:1px solid #008000;resize:none;"></textarea>');
                textarea.val(logsText);

                var container = $('<div class="about"></div>');
                container.append('<div style="margin-bottom:10px; font-weight:bold; color:#0f0;">📗 Логи системи Lampa.Console</div>');
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
