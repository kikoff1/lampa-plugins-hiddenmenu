(function() {
    "use strict";

    var PLUGIN_NAME = "actor_debug_plugin";
    var my_logging = true;
    var debugLogs = [];
    var maxLogs = 20;

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
            top: 10px;
            right: 10px;
            width: 400px;
            height: 500px;
            background: rgba(0,0,0,0.9);
            color: white;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            overflow-y: auto;
            z-index: 10000;
            border: 2px solid #00ff00;
            border-radius: 5px;
            display: none;
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
            padding: 10px;
            border-radius: 5px;
            cursor: pointer;
        `;
        
        toggleBtn.addEventListener('click', function() {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        });
        
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);
        
        return panel;
    }

    function updateDebugPanel() {
        var panel = document.getElementById('debug-panel');
        if (!panel) return;
        
        var html = '<h3 style="color: #00ff00; margin: 0 0 10px 0;">Debug Logs</h3>';
        
        debugLogs.forEach(function(logEntry, index) {
            html += `<div style="margin-bottom: 8px; border-bottom: 1px solid #333; padding-bottom: 5px;">
                <div style="color: #888; font-size: 10px;">${logEntry.time}</div>
                <div style="color: #fff; font-weight: bold;">${logEntry.message}</div>`;
            
            if (logEntry.data) {
                html += `<div style="color: #aaa; font-size: 11px; margin-top: 2px;">${JSON.stringify(logEntry.data, null, 2)}</div>`;
            }
            
            html += '</div>';
        });
        
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
                name: e.object?.name
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
                url: activity.url
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
                source: data.source
            });
            
            return originalCardClick.call(this);
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
        });

        $(".menu .menu__list").eq(0).append(menuItem);
    }

    if (window.appready) {
        startDebugPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startDebugPlugin();
        });
    }
})();