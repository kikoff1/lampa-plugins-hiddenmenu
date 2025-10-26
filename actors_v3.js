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
                    if (e.name === 'show_actors') {  
                        this.settings.showActors = e.value;  
                        this.toggleActorsButton();  
                    }  
                });  
            },  
  
            patchActorsPage: function() {  
                var self = this;  
                  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'create' && e.object.component === 'category_full' && e.object.url === 'person/popular') {  
                        setTimeout(function() {  
                            var activity = Lampa.Activity.active();  
                            if (!activity || !activity.activity || !activity.activity.component) return;  
                              
                            var cards = $('.card.selector');  
                              
                            cards.each(function() {  
                                var card = $(this);  
                                var cardData = card.data('card_data');  
                                  
                                if (cardData && cardData.profile_path) {  
                                    card.off('hover:enter').on('hover:enter', function() {  
                                        Lampa.Activity.push({  
                                            url: '',  
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
                });  
            },  
  
            toggleActorsButton: function() {  
                if (this.settings.showActors) {  
                    $('.online-cinemas-actors').show();  
                } else {  
                    $('.online-cinemas-actors').hide();  
                }  
            },  
  
            addActorsButton: function() {  
                const ico = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path stroke-linecap="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
                const button = $(`<li class="menu__item selector online-cinemas-actors" data-action="actors">  
                    <div class="menu__ico">${ico}</div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                Lampa.Activity.push({  
                    url: "person/popular",  
                    title: "Актори",  
                    component: "category_full",  
                    source: "tmdb",  
                    page: 1  
                });  
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