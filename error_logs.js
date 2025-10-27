(function() {
    'use strict';

    var plugin_name = 'error_logger';
    var logs = Lampa.Storage.get('error_logs', []);

    // --- Перехоплення помилок ---
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
        logs.push({
            text: msg,
            time: new Date().toLocaleString()
        });
        if (logs.length > 100) logs.shift(); // обмежуємо кількість
        Lampa.Storage.set('error_logs', logs);
    }

    // --- UI Компонент ---
    Lampa.Component.add('error_logs', {
        template: `<div class="error-logs-container" style="padding:20px; background:#004d00; color:#b8ffb8; font-size:14px; overflow:auto; height:100%;">
            <div class="error-logs-header" style="margin-bottom:10px;">
                <div style="font-size:18px; font-weight:bold;">📜 Error Logs</div>
                <button class="copy-logs" style="margin-top:10px; background:#00a000; color:#fff; border:none; padding:5px 10px; border-radius:5px;">📋 Копіювати</button>
                <button class="clear-logs" style="margin-top:10px; margin-left:10px; background:#007000; color:#fff; border:none; padding:5px 10px; border-radius:5px;">🧹 Очистити</button>
            </div>
            <div class="error-logs-list"></div>
        </div>`,

        start: function() {
            this.render();
        },

        render: function() {
            var $el = $(this.template);
            var $list = $el.find('.error-logs-list');

            if (!logs.length) {
                $list.html('<div style="opacity:0.7;">Немає помилок</div>');
            } else {
                logs.forEach(function(log) {
                    $list.append(`<div style="border-bottom:1px solid #006600; padding:5px 0;">
                        <div><b>[${log.time}]</b></div>
                        <div>${log.text}</div>
                    </div>`);
                });
            }

            $el.find('.copy-logs').on('click', function() {
                var text = logs.map(l => `[${l.time}] ${l.text}`).join('\n');
                copyToClipboard(text);
            });

            $el.find('.clear-logs').on('click', function() {
                logs = [];
                Lampa.Storage.set('error_logs', logs);
                Lampa.Noty.show('Логи очищено');
                $list.html('<div style="opacity:0.7;">Немає помилок</div>');
            });

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

    // --- Копіювання ---
    function copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                Lampa.Noty.show('Логи скопійовано ✅');
            }).catch(() => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
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

    // --- Реєстрація плагіна ---
    Lampa.Manifest.plugins.push({
        author: 'YourName',
        version: '1.0.0',
        name: 'Error Logger',
        description: 'Плагін для запису та копіювання логів помилок',
        component: 'error_logs',
        path: plugin_name
    });

    Lampa.Lang.add({
        error_logger_title: {
            ua: 'Логи помилок',
            en: 'Error Logs'
        }
    });

    console.log('[Error Logger] Плагін активовано');
})();
