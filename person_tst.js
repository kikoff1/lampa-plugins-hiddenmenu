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
        // Перевіряємо чи вже є панель
        if (document.getElementById('debug-panel')) {
            return document.getElementById('debug-panel');
        }
        
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
        
        toggleBtn.addEventListener('click', function() {
            var panel = document.getElementById('debug-panel');
            if (panel) {
                panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
            }
        });
        
        clearBtn.addEventListener('click', function() {
            debugLogs = [];
            updateDebugPanel();
        });
        
        document.body.appendChild(panel);
        document.body.appendChild(toggleBtn);
        document.body.appendChild(clearBtn);
        
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
        createDebugPanel();
        
        // Детальне логування карток
        $(document).on('click', '.card', function(e) {
            var card = $(this);
            var allAttributes = {};
            
            // Збираємо всі атрибути картки
            for (var i = 0; i < card[0].attributes.length; i++) {
                var attr = card[0].attributes[i];
                allAttributes[attr.name] = attr.value;
            }
            
            log('🟢 CARD CLICK - DETAILED', {
                attributes: allAttributes,
                currentActivity: Lampa.Activity.active()
            });
        });

        // Детальне логування hover:enter
        $(document).on('hover:enter', '.card', function(e) {
            var card = $(this);
            var allAttributes = {};
            
            for (var i = 0; i < card[0].attributes.length; i++) {
                var attr = card[0].attributes[i];
                allAttributes[attr.name] = attr.value;
            }
            
            log('🎯 HOVER:ENTER - DETAILED', {
                attributes: allAttributes,
                currentActivity: Lampa.Activity.active()
            });
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

        log('🔧 Debug plugin started successfully');
    }

    function addToMenu() {
        // Чекаємо поки меню завантажиться
        function waitForMenu() {
            var menuList = document.querySelector('.menu .menu__list');
            if (menuList) {
                // Перевіряємо чи вже додали наш пункт
                var existingItem = document.querySelector('[data-action="debug_actors"]');
                if (!existingItem) {
                    var menuItem = document.createElement('li');
                    menuItem.className = 'menu__item selector';
                    menuItem.setAttribute('data-action', 'debug_actors');
                    
                    menuItem.innerHTML = `
                        <div class="menu__ico">🔍</div>
                        <div class="menu__text">Debug Actors</div>
                    `;
                    
                    menuItem.addEventListener('click', function() {
                        Lampa.Activity.push({
                            url: "person/popular",
                            title: "Popular Actors (Debug)",
                            component: "category_full",
                            source: "tmdb",
                            page: 1
                        });
                        
                        log('📖 Opened Popular Actors page for testing');
                    });
                    
                    menuList.appendChild(menuItem);
                    log('✅ Debug menu item added');
                }
            } else {
                setTimeout(waitForMenu, 100);
            }
        }
        
        waitForMenu();
    }

    function startDebugPlugin() {
        debugCardClicks();
        addToMenu();
        log('✅ Debug plugin fully initialized');
    }

    // Чекаємо поки Lampa повністю завантажиться
    function waitForLampa() {
        if (window.Lampa && window.Lampa.Activity) {
            startDebugPlugin();
        } else {
            setTimeout(waitForLampa, 100);
        }
    }

    if (window.appready) {
        waitForLampa();
    } else {
        document.addEventListener('DOMContentLoaded', waitForLampa);
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') waitForLampa();
        });
    }
})();