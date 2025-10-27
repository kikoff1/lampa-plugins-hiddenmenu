(function() {
    'use strict';

    const plugin_name = 'error_logger';
    let logs = Lampa.Storage.get('error_logs', []);

    // -------- Перехоплення помилок --------
    const originalConsoleError = console.error;
    console.error = function() {
        const message = Array.from(arguments).join(' ');
        saveLog('ConsoleError: ' + message);
        originalConsoleError.apply(console, arguments);
    };

    window.onerror = function(message, source, lineno, colno, error) {
        const errorMsg = `${message} (${source}:${lineno}:${colno})`;
        saveLog('WindowError: ' + errorMsg);
    };

    function saveLog(msg) {
        logs.push({ text: msg, time: new Date().toLocaleString() });
        if (logs.length > 100) logs.shift();
        Lampa.Storage.set('error_logs', logs);
    }

    // -------- Компонент --------
    Lampa.Component.add('error_logs', {
        template: `<div class="error-logs-container" style="padding:20px; background:#004d00; color:#b8ffb8; font-size:14px; overflow:auto; height:100%;">
            <div style="font-size:18px; font-weight:bold; margin-bottom:10px;">📜 Error Logs</div>
            <button class="copy-logs" style="background:#00a000; color:#fff; border:none; padding:5px 10px; border-radius:5px;">📋 Копіювати</button>
            <button class="clear-logs" style="background:#007000; color:#fff; border:none; padding:5px 10px; border-radius:5px; margin-left:10px;">🧹 Очистити</button>
            <div class="error-logs-list" style="margin-top:15px;"></div>
        </div>`,

        start: function() {
            this.render();
        },

        render: function() {
            const $el = $(this.template);
            const $list = $el.find('.error-logs-list');

            renderLogs();

            $el.find('.copy-logs').on('click', function() {
                const text = logs.map(l => `[${l.time}] ${l.text}`).join('\n');
                copyToClipboard(text);
            });

            $el.find('.clear-logs').on('click', function() {
                logs = [];
                Lampa.Storage.set('error_logs', logs);
                Lampa.Noty.show('Логи очищено');
                renderLogs();
            });

            function renderLogs() {
                if (!logs.length) {
                    $list.html('<div style="opacity:0.7;">Немає помилок</div>');
                } else {
                    $list.html('');
                    logs.forEach(function(log) {
                        $list.append(`<div style="border-bottom:1px solid #006600; padding:5px 0;">
                            <div><b>[${log.time}]</b></div>
                            <div>${log.text}</div>
                        </div>`);
                    });
                }
            }

            Lampa.Controller.add('error_logs', {
                toggle: function() {
                    Lampa.Controller.collectionSet($el);
                    Lampa.Controller.collectionFocus($el);
                },
                back: function() {
                    Lampa.Controller.toContent();
                }
            });

            Lampa.Controller.toggle('error_logs');
            Lampa.Activity.loader(false);
            Lampa.Activity.render($el);
        }
    });

    // -------- Копіювання --------
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                Lampa.Noty.show('Логи скопійовано ✅');
            }).catch(() => fallbackCopy(text));
        } else fallbackCopy(text);
    }

    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            Lampa.Noty.show('Логи скопійовано ✅');
        } catch (err) {
            Lampa.Noty.show('Помилка копіювання ❌');
        }
        document.body.removeChild(textarea);
    }

    // -------- Додаємо пункт у меню --------
    function addToMenu() {
        if (!Lampa.Menu || !Lampa.Menu.add) {
            // якщо меню ще не готове — чекаємо
            setTimeout(addToMenu, 1000);
            return;
        }

        // якщо пункт уже існує — не дублюємо
        if ($('#menu [data-action="error_logs_menu"]').length) return;

        Lampa.Menu.add({
            id: 'error_logs_menu',
            title: 'Error Logs',
            icon: 'bug',
            action: function() {
                Lampa.Activity.push({
                    component: 'error_logs',
                    type: 'component',
                    page: 1
                });
            }
        });

        console.log('[Error Logger] Пункт "Error Logs" додано в меню');
    }

    // -------- Реєстрація плагіна --------
    Lampa.Manifest.plugins.push({
        author: 'YourName',
        version: '1.0.2',
        name: 'Error Logger',
        description: 'Плагін для запису і перегляду логів помилок',
        component: 'error_logs',
        path: plugin_name
    });

    // Запускаємо додавання в меню після запуску застосунку
    if (window.appready) addToMenu();
    else document.addEventListener('appready', addToMenu);

    console.log('[Error Logger] Плагін активовано');
})();
