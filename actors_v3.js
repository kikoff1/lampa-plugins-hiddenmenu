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
                this.initStorageListener();  
                this.patchActorsPage();  
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Актори'  
                });  
  
                Lampa.SettingsApi.addParam({  
                    component: 'online_cinemas',  
                    param: {  
                        name: 'show_actors',  
                        type: 'trigger',  
                        default: this.settings.showActors  
                    },  
                    field: {  
                        name: 'Показувати кнопку акторів'  
                    }  
                });  
            },  
  
            initStorageListener: function() {  
                Lampa.Storage.listener.follow('change', (e) => {  
                    if(e.name === 'show_actors') {  
                        this.settings.showActors = Lampa.Storage.get('show_actors', true);  
                        this.toggleActorsButton();  
                    }  
                });  
            },  
  
            patchActorsPage: function() {  
                var self = this;  
                  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'create' && e.component === 'category_full') {  
                        var activity = Lampa.Activity.active();  
                          
                        if (activity.url === 'person/popular') {  
                            setTimeout(function() {  
                                var cards = document.querySelectorAll('.card');  
                                  
                                cards.forEach(function(cardElement) {  
                                    var cardData = null;  
                                      
                                    // Спробуємо знайти дані картки  
                                    if (activity.activity && activity.activity.component && activity.activity.component.items) {  
                                        var items = activity.activity.component.items;  
                                        for (var i = 0; i < items.length; i++) {  
                                            if (items[i].render && items[i].render(true) === cardElement) {  
                                                cardData = items[i].data;  
                                                break;  
                                            }  
                                        }  
                                    }  
                                      
                                    // Перевіряємо наявність profile_path замість gender  
                                    if (cardData && cardData.profile_path) {  
                                        // Видаляємо старий обробник  
                                        var newCard = cardElement.cloneNode(true);  
                                        cardElement.parentNode.replaceChild(newCard, cardElement);  
                                          
                                        // Додаємо новий обробник, який відкриває компонент actor  
                                        newCard.addEventListener('hover:enter', function() {  
                                            Lampa.Activity.push({  
                                                url: cardData.url || '',  
                                                title: Lampa.Lang.translate('title_person'),  
                                                component: 'actor',  
                                                id: cardData.id,  
                                                source: 'tmdb'  
                                            });  
                                        });  
                                    }  
                                });  
                            }, 500);  
                        }  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                var button = $('.online-cinemas-actors');  
                if(this.settings.showActors) {  
                    button.show();  
                } else {  
                    button.hide();  
                }  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                var ico = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
                var button = $('<li class="menu__item selector online-cinemas-actors" data-action="actors"><div class="menu__ico">' + ico + '</div><div class="menu__text">Актори</div></li>');  
  
                button.on('hover:enter', function() {  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Актори',  
                        component: 'category_full',  
                        source: 'tmdb',  
                        page: 1  
                    });  
                });  
  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            }  
        };  
  
        function add() {  
            OnlineCinemas.init();  
            OnlineCinemas.addActorsButton();  
        }  
  
        if(window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if(!window.plugin_online_cinemas_ready) startPlugin();  
})();