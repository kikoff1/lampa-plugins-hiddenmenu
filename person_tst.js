(function() {
    "use strict";

    var PLUGIN_NAME = "actor_debug_plugin";
    var my_logging = true;

    function log() {
        if (my_logging && console && console.log) {
            try {
                console.log.apply(console, arguments);
            } catch (e) {}
        }
    }

    function debugCardClicks() {
        // Логуємо всі кліки на картках
        $(document).on('click', '.card', function(e) {
            var card = $(this);
            var dataId = card.attr('data-id');
            var dataName = card.attr('data-name');
            var dataType = card.attr('data-type');
            var dataMediaType = card.attr('data-media-type');
            
            log('=== CARD CLICK DEBUG ===');
            log('Card element:', card[0]);
            log('Data ID:', dataId);
            log('Data Name:', dataName);
            log('Data Type:', dataType);
            log('Data Media Type:', dataMediaType);
            log('Card classes:', card.attr('class'));
            log('Current activity:', Lampa.Activity.active());
            log('========================');
        });

        // Логуємо hover:enter події
        $(document).on('hover:enter', '.card', function(e) {
            var card = $(this);
            var dataId = card.attr('data-id');
            var dataName = card.attr('data-name');
            
            log('=== HOVER:ENTER DEBUG ===');
            log('Card ID:', dataId);
            log('Card Name:', dataName);
            log('Event:', e);
            log('========================');
        });

        // Логуємо зміни активності
        Lampa.Listener.follow('activity', function(e) {
            log('=== ACTIVITY CHANGE ===');
            log('Activity type:', e.type);
            log('Component:', e.component);
            log('Object:', e.object);
            log('Params:', e.params);
            log('========================');
        });

        // Перехоплюємо відкриття сторінки актора
        var originalPush = Lampa.Activity.push;
        Lampa.Activity.push = function(activity) {
            log('=== ACTIVITY PUSH ===');
            log('Activity object:', activity);
            log('Component:', activity.component);
            log('ID:', activity.id);
            log('Name:', activity.name);
            log('Source:', activity.source);
            log('URL:', activity.url);
            log('========================');
            
            return originalPush.call(this, activity);
        };

        // Логуємо дані карток при їх створенні
        var originalCardCreate = Lampa.Card.prototype.create;
        Lampa.Card.prototype.create = function() {
            var result = originalCardCreate.apply(this, arguments);
            var data = this.data();
            
            log('=== CARD CREATE ===');
            log('Card data:', data);
            log('Card ID:', data.id);
            log('Card name:', data.name);
            log('Card type:', data.type);
            log('Card media_type:', data.media_type);
            log('Card source:', data.source);
            log('========================');
            
            return result;
        };

        // Логуємо кліки через стандартну систему Lampa
        var originalCardClick = Lampa.Card.prototype.click;
        Lampa.Card.prototype.click = function() {
            var data = this.data();
            
            log('=== CARD PROTOTYPE CLICK ===');
            log('Card data:', data);
            log('Card ID:', data.id);
            log('Card name:', data.name);
            log('Card type:', data.type);
            log('Card media_type:', data.media_type);
            log('Current activity:', Lampa.Activity.active());
            log('========================');
            
            return originalCardClick.call(this);
        };

        // Логуємо кліки в категоріях
        var originalCategoryClick = Lampa.Category.prototype.click;
        Lampa.Category.prototype.click = function(card) {
            var cardData = card.data();
            
            log('=== CATEGORY CLICK ===');
            log('Card data:', cardData);
            log('Card ID:', cardData.id);
            log('Card name:', cardData.name);
            log('Card type:', cardData.type);
            log('Card media_type:', cardData.media_type);
            log('Current activity:', Lampa.Activity.active());
            log('========================');
            
            return originalCategoryClick.call(this, card);
        };
    }

    function startDebugPlugin() {
        log('Starting actor debug plugin...');
        debugCardClicks();
        
        // Додаємо кнопку в меню для тестування
        var menuItem = $(
            '<li class="menu__item selector" data-action="' + PLUGIN_NAME + '_test">' +
            '<div class="menu__ico">🔍</div>' +
            '<div class="menu__text">Debug Actors</div>' +
            '</li>'
        );

        menuItem.on("hover:enter", function () {
            // Відкриваємо сторінку з популярними акторами для тестування
            Lampa.Activity.push({
                url: "person/popular",
                title: "Popular Actors (Debug)",
                component: "category_full",
                source: "tmdb",
                page: 1
            });
        });

        $(".menu .menu__list").eq(0).append(menuItem);
        
        log('Actor debug plugin started successfully');
    }

    if (window.appready) {
        startDebugPlugin();
    } else {
        Lampa.Listener.follow('app', function (e) {
            if (e.type === 'ready') startDebugPlugin();
        });
    }
})();