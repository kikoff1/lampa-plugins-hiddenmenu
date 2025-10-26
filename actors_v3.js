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
                    },  
                    onChange: this.toggleActorsButton.bind(this)  
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
  
            toggleActorsButton: function() {  
                const button = $('.menu__item.online-cinemas-actors');  
                if (this.settings.showActors) {  
                    button.removeClass('hide');  
                } else {  
                    button.addClass('hide');  
                }  
            },  
  
            addActorsButton: function() {  
                const ico = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" fill="none"><g fill="currentColor"><circle cx="24" cy="9" r="5"/><circle cx="35" cy="22" r="3"/><circle cx="13" cy="22" r="3"/><path d="M24 16c-3.314 0-6 2.686-6 5v3h12v-3c0-2.314-2.686-5-6-5z"/><path stroke="currentColor" stroke-width="2" d="M18 24v-4.977C18 16.226 19.864 14 24 14s6 2.226 6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
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
                    url: 'person/popular',  
                    title: 'Актори',  
                    component: 'category_full',  
                    source: 'tmdb',  
                    page: 1  
                });  
            }  
        };  
  
        // Патчимо category_full для правильної обробки акторів  
        function patchCategoryFull() {  
            Lampa.Listener.follow('activity', function(e) {  
                if (e.type === 'create' && e.component === 'category_full') {  
                    var activity = Lampa.Activity.active();  
                      
                    if (activity.url === 'person/popular') {  
                        setTimeout(function() {  
                            $('.card').each(function() {  
                                var card = $(this);  
                                var cardData = card.data('card');  
                                  
                                if (cardData && cardData.profile_path) {  
                                    card.off('hover:enter').on('hover:enter', function() {  
                                        Lampa.Activity.push({  
                                            url: '',  
                                            title: cardData.name || cardData.original_name,  
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
        }  
  
        function add() {  
            OnlineCinemas.init();  
            OnlineCinemas.addActorsButton();  
            patchCategoryFull();  
        }  
  
        if (window.appready) add();  
        else {  
            Lampa.Listener.follow('app', function (e) {  
                if (e.type == 'ready') add();  
            });  
        }  
    }  
  
    if (!window.plugin_online_cinemas_ready) startPlugin();  
})();