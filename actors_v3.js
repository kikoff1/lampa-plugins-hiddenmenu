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
                        default: true  
                    },  
                    field: {  
                        name: 'Показувати кнопку "Актори"'  
                    },  
                    onChange: this.toggleActorsButton.bind(this)  
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
                var button = $('.online-cinemas-actors');  
                if (this.settings.showActors) {  
                    button.removeClass('hide');  
                } else {  
                    button.addClass('hide');  
                }  
            },  
  
            addActorsButton: function() {  
                var ico = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></g></svg>';  
                var button = $('<li class="menu__item selector online-cinemas-actors" data-action="actors"><div class="menu__ico">' + ico + '</div><div class="menu__text">Актори</div></li>');  
  
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
            },  
  
            patchActorsPage: function() {  
                var self = this;  
                  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'create' && e.object.component === 'category_full' && e.object.url === 'person/popular') {  
                        setTimeout(function() {  
                            var cards = $('.card');  
                              
                            cards.each(function() {  
                                var card = $(this);  
                                var cardData = card.data('card_data');  
                                  
                                if (cardData && (cardData.gender !== undefined || cardData.profile_path)) {  
                                    card.off('hover:enter');  
                                      
                                    card.on('hover:enter', function() {  
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
            }  
        };  
  
        function add() {  
            OnlineCinemas.init();  
        }  
  
        if (window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if(!window.plugin_online_cinemas_ready) startPlugin();  
})();