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
        
        var logEntry = {
            time: new Date().toLocaleTimeString(),
            message: message,
            data: data
        };
        
        debugLogs.unshift(logEntry);
        if (debugLogs.length > maxLogs) {
            debugLogs.pop();
        }
        
        updateDebugPanel();
    }

    function createDebugPanel() {
        var panel = document.createElement('div');
        panel.id = 'debug-panel';
        panel.style.cssText = `
            position: fixed;
            top: 60px;
            right: 10px;
            width: 95%;
            max-width: 500px;
            height: 70vh;
            background: rgba(0,0,0,0.98);
            color: white;
            font-family: Arial, sans-serif;
            font-size: 14px;
            padding: 0;
            overflow: hidden;
            z-index: 10000;
            border: 2px solid #00ff00;
            border-radius: 10px;
            display: none;
        `;
        
        // Текстова область для логів
        var textarea = document.createElement('textarea');
        textarea.id = 'debug-textarea';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            background: #111;
            color: #0f0;
            border: none;
            padding: 15px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            resize: none;
            outline: none;
            box-sizing: border-box;
        `;
        textarea.readOnly = true;
        
        panel.appendChild(textarea);
        
        // Кнопки
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
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        var clearBtn = document.createElement('button');
        clearBtn.textContent = 'CLEAR';
        clearBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 90px;
            z-index: 10001;
            background: #4444ff;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        `;
        
        var copyBtn = document.createElement('button');
        copyBtn.textContent = 'COPY';
        copyBtn.style.cssText = `
            position: fixed;
            top: 10px;
            right: 170px;
            z-index: 10001;
            background: #44aa44;
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 5px;
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
            var textarea = document.getElementById('debug-textarea');
            textarea.select();
            textarea.setSelectionRange(0, 99999);
            
            try {
                var successful = document.execCommand('copy');
                if (successful) {
                    log('✅ Text copied to clipboard!');
                } else {
                    log('❌ Copy failed, please select and copy manually');
                }
            } catch (err) {
                log('❌ Copy error: ' + err);
            }
        });
        
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);
        document.body.appendChild(clearBtn);
        document.body.appendChild(copyBtn);
        
        return panel;
    }

    function updateDebugPanel() {
        var textarea = document.getElementById('debug-textarea');
        if (!textarea) return;
        
        var logText = debugLogs.map(function(logEntry, index) {
            var line = `${logEntry.time} - ${logEntry.message}`;
            if (logEntry.data) {
                try {
                    line += '\n' + JSON.stringify(logEntry.data, null, 2);
                } catch (e) {
                    line += '\n[Data cannot be stringified]';
                }
            }
            return line;
        }).join('\n\n' + '='.repeat(50) + '\n\n');
        
        textarea.value = logText;
        textarea.scrollTop = 0;
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