(function () {  
    'use strict';  
  
    function startPlugin() {  
        if (window.plugin_online_cinemas_ready) return;  
        window.plugin_online_cinemas_ready = true;  
  
        var OnlineCinemas = {  
            settings: {  
                showActors: true  
            },  
  
            init: function() {  
                this.loadSettings();  
                this.createSettings();  
                this.addActorsButton();  
                this.initStorageListener();  
                this.patchActorCards();  
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                var self = this;  
  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Популярні актори',  
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/></svg>'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'online_cinemas',  
                    param: {  
                        name: 'show_actors',  
                        type: 'trigger',  
                        default: true  
                    },  
                    field: {  
                        name: 'Показувати пункт меню "Актори"'  
                    },  
                    onChange: function(value) {  
                        self.settings.showActors = value;  
                        Lampa.Storage.set('show_actors', value);  
                        self.toggleActorsButton();  
                    }  
                });  
            },  
  
            initStorageListener: function() {  
                var self = this;  
                Lampa.Storage.listener.follow('change', function(e) {  
                    if (e.name === 'show_actors') {  
                        self.settings.showActors = e.value;  
                        self.toggleActorsButton();  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                var button = $('.menu .menu__item[data-action="actors"]');  
                if (this.settings.showActors) {  
                    button.show();  
                } else {  
                    button.hide();  
                }  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                var button = $('<li class="menu__item selector" data-action="actors"><div class="menu__ico"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="white"/></svg></div><div class="menu__text">Актори</div></li>');  
  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                Lampa.Activity.push({  
                    url: "person/popular",  
                    title: "Популярні актори",  
                    component: "category_full",  
                    source: "tmdb",  
                    page: 1  
                });  
            },  
  
            patchActorCards: function() {  
                // Патчимо тільки для сторінки person/popular  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'start' && e.component === 'category_full') {  
                        var activity = Lampa.Activity.active();  
                          
                        if (activity && activity.activity && activity.activity.url === 'person/popular') {  
                            // Чекаємо, поки картки створяться  
                            setTimeout(function() {  
                                var cards = $('.card.selector');  
                                  
                                cards.each(function() {  
                                    var card = $(this);  
                                    var img = card.find('img');  
                                      
                                    // Перевіряємо, чи це картка актора (має profile_path в src)  
                                    if (img.length && img.attr('src') && img.attr('src').indexOf('w185_and_h278_bestv2') > -1) {  
                                        // Видаляємо старі обробники  
                                        card.off('hover:enter');  
                                          
                                        // Додаємо новий обробник  
                                        card.on('hover:enter', function() {  
                                            // Отримуємо ID актора з data атрибутів або з DOM  
                                            var cardData = card.data('card');  
                                              
                                            if (!cardData) {  
                                                // Спробуємо знайти ID в тексті картки  
                                                var titleText = card.find('.card__title').text();  
                                                  
                                                // Шукаємо ID в глобальному контексті  
                                                var allCards = $('.card.selector');  
                                                var index = allCards.index(card);  
                                                  
                                                // Отримуємо дані з activity  
                                                var activity = Lampa.Activity.active();  
                                                if (activity && activity.activity && activity.activity.component) {  
                                                    var component = activity.activity.component;  
                                                    if (component.items && component.items[index]) {  
                                                        cardData = component.items[index];  
                                                    }  
                                                }  
                                            }  
                                              
                                            if (cardData && cardData.id) {  
                                                Lampa.Activity.push({  
                                                    url: '',  
                                                    title: cardData.name || 'Актор',  
                                                    component: 'actor',  
                                                    id: cardData.id,  
                                                    source: 'tmdb',  
                                                    page: 1  
                                                });  
                                            }  
                                        });  
                                    }  
                                });  
                            }, 500);  
                        }  
                    }  
                });  
            }  
        };  
  
        function add() {  
            OnlineCinemas.init();  
        }  
  
        if (window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function(e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if (!window.plugin_online_cinemas_ready) startPlugin();  
})();