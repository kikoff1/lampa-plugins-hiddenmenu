(function() {
    "use strict";

    var PLUGIN_NAME = "actor_debug_plugin";
    var my_logging = true;
    var debugLogs = [];
    var maxLogs = 50;

    function log(message, data) {
        if (my_logging && console && console.log) {
            try {
                console.log.apply(console, arguments);
            } catch (e) {}
        }
        
        // Додаємо лог в масив для відображення на екрані
        var logEntry = {
            time: new Date().toLocaleTimeString(),
            message: message,
            data: data
        };
        
        debugLogs.unshift(logEntry);
        if (debugLogs.length > maxLogs) {
            debugLogs.pop();
        }
        
        // Оновлюємо відображення якщо debug panel відкритий
        updateDebugPanel();
    }

    function createDebugPanel() {
        var panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 50px;
            right: 10px;
            width: 95%;
            max-width: 500px;
            height: 80vh;
            background: rgba(0,0,0,0.95);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            padding: 15px;
            overflow-y: auto;
            z-index: 10000;
            border: 2px solid #00ff00;
            border-radius: 10px;
            display: none;
            user-select: text;
            -webkit-user-select: text;
            line-height: 1.4;
            word-wrap: break-word;
        `;
        
        var toggleBtn = document.createElement('button');
        toggleBtn.textContent = 'DEBUG';
        toggleBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 10001;
            background: #ff4444;
            color: white;
            border: none;
            padding: 12px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        var clearBtn = document.createElement('button');
        clearBtn.textContent = 'CLEAR';
        clearBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 80px;
            z-index: 10001;
            background: #4444ff;
            color: white;
            border: none;
            padding: 12px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        var copyBtn = document.createElement('button');
        copyBtn.textContent = 'COPY ALL';
        copyBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 160px;
            z-index: 10001;
            background: #44aa44;
            color: white;
            border: none;
            padding: 12px 15px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        toggleBtn.addEventListener('click', function() {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        clearBtn.addEventListener('click', function() {
            debugLogs = [];
            updateDebugPanel();
        });
        
        copyBtn.addEventListener('click', function() {
            var logText = debugLogs.map(function(logEntry, index) {
                var line = `${logEntry.time} - ${logEntry.message}`;
                if (logEntry.data) {
                    line += '\n' + JSON.stringify(logEntry.data, null, 2);
                }
                return line;
            }).join('\n\n');
            
            // Копіюємо в буфер обміну
            navigator.clipboard.writeText(logText).then(function() {
                log('✅ All logs copied to clipboard!');
            }).catch(function(err) {
                // Альтернативний спосіб для старих браузерів
                var textArea = document.createElement('textarea');
                textArea.value = logText;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                log('✅ All logs copied to clipboard (fallback method)');
            });
        });
        
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);
        document.body.appendChild(clearBtn);
        document.body.appendChild(copyBtn);
        
        return panel;
    }

    function updateDebugPanel() {
        var panel = document.getElementById('debug-panel');
        if (!panel) return;
        
        var html = '<div style="color: #00ff00; font-size: 16px; font-weight: bold; margin: 0 0 15px 0; border-bottom: 1px solid #00ff00; padding-bottom: 5px;">Debug Logs (' + debugLogs.length + ')</div>';
        
        debugLogs.forEach(function(logEntry, index) {
            html += `<div style="margin-bottom: 12px; border-bottom: 1px solid #333; padding-bottom: 8px; user-select: text; -webkit-user-select: text;">
                <div style="color: #888; font-size: 11px; margin-bottom: 3px;">${logEntry.time}</div>
                <div style="color: #fff; font-weight: bold; margin-bottom: 5px; font-size: 14px;">${logEntry.message}</div>`;
            
            if (logEntry.data) {
                var dataStr = JSON.stringify(logEntry.data, null, 2);
                html += `<div style="color: #aaa; font-size: 12px; background: rgba(255,255,255,0.1); padding: 8px; border-radius: 5px; overflow-x: auto; white-space: pre-wrap; font-family: monospace;">${dataStr}</div>`;
            }
            
            html += '</div>';
        });
        
        if (debugLogs.length === 0) {
            html += '<div style="color: #888; text-align: center; padding: 20px;">No logs yet. Click on actors to see debug information.</div>';
        }
        
        panel.innerHTML = html;
        panel.scrollTop = 0;
    }

    function debugCardClicks() {
        var debugPanel = createDebugPanel();
        
        // Логуємо всі кліки на картках
        $(document).on('click', '.card', function(e) {
            var card = $(this);
            var data = {
                id: card.attr('data-id'),
                name: card.attr('data-name'),
                type: card.attr('data-type'),
                media_type: card.attr('data-media-type'),
                classes: card.attr('class')
            };
            
            log('🟢 CARD CLICK', data);
        });

        // Логуємо hover:enter події
        $(document).on('hover:enter', '.card', function(e) {
            var card = $(this);
            var data = {
                id: card.attr('data-id'),
                name: card.attr('data-name'),
                type: card.attr('data-type'),
                media_type: card.attr('data-media-type')
            };
            
            log('🎯 HOVER:ENTER', data);
        });

        // Логуємо зміни активності
        Lampa.Listener.follow('activity', function(e) {
            log('🔄 ACTIVITY: ' + e.type, {
                component: e.component,
                source: e.object?.source,
                id: e.object?.id,
                name: e.object?.name,
                url: e.object?.url
            });
        });

        // Перехоплюємо відкриття сторінки актора
        var originalPush = Lampa.Activity.push;
        Lampa.Activity.push = function(activity) {
            log('🚀 ACTIVITY PUSH', {
                component: activity.component,
                id: activity.id,
                name: activity.name,
                source: activity.source,
                url: activity.url,
                object: activity.object
            });
            
            return originalPush.call(this, activity);
        };

        // Логуємо кліки через стандартну систему Lampa
        var originalCardClick = Lampa.Card.prototype.click;
        Lampa.Card.prototype.click = function() {
            var data = this.data();
            
            log('⚡ CARD PROTOTYPE CLICK', {
                id: data.id,
                name: data.name,
                type: data.type,
                media_type: data.media_type,
                source: data.source,
                title: data.title,
                poster_path: data.poster_path
            });
            
            return originalCardClick.call(this);
        };

        // Логуємо кліки в категоріях
        var originalCategoryClick = Lampa.Category.prototype.click;
        Lampa.Category.prototype.click = function(card) {
            var cardData = card.data();
            
            log('📁 CATEGORY CLICK', {
                id: cardData.id,
                name: cardData.name,
                type: cardData.type,
                media_type: cardData.media_type,
                source: cardData.source
            });
            
            return originalCategoryClick.call(this, card);
        };

        log('🔧 Debug plugin started successfully');
    }

    function startDebugPlugin() {
        debugCardClicks();
        
        // Додаємо кнопку в меню для тестування
        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '_test">' +
            '<div class="menu__ico">🔍</div>' +
            '<div class="menu__text">Debug Actors</div>' +
            '</li>'
        );

        menuItem.on("hover:enter", function () {
            Lampa.Activity.push({
                url: "person/popular",
                title: "Popular Actors (Debug)",
                component: "category_full",
                source: "tmdb",
                page: 1
            });
            
            log('📖 Opened Popular Actors page for testing');
        });

        $(".menu .menu__list").eq(0).append(menuItem);
        
        log('✅ Debug plugin initialized');
    }

    if (window.appready) {
        startDebugPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startDebugPlugin();
        });
    }
})(); 