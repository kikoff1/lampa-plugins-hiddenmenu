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
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                var self = this;  
  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Популярні актори',  
                    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'  
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
                    button.removeClass('hide');  
                } else {  
                    button.addClass('hide');  
                }  
            },  
  
            addActorsButton: function() {  
                var self = this;  
                var ico = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';  
                  
                var button = $(`<li class="menu__item selector" data-action="actors">  
                    <div class="menu__ico">${ico}</div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', function() {  
                    self.showActors();  
                });  
  
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
  
                // Патчимо компонент після його створення  
                setTimeout(function() {  
                    var activity = Lampa.Activity.active();  
                    if (activity && activity.activity && activity.activity.component) {  
                        var component = activity.activity.component;  
                          
                        // Перевизначаємо cardRender для правильної обробки карток акторів  
                        var originalCardRender = component.cardRender;  
                        component.cardRender = function(object, element, card) {  
                            // Викликаємо оригінальний метод  
                            if (originalCardRender) {  
                                originalCardRender.call(this, object, element, card);  
                            }  
  
                            // Перевизначаємо onEnter для карток з profile_path (актори)  
                            if (element.profile_path || element.gender !== undefined) {  
                                card.onEnter = function(target, card_data) {  
                                    Lampa.Activity.push({  
                                        url: '',  
                                        title: Lampa.Lang.translate('title_person'),  
                                        component: 'actor',  
                                        id: card_data.id || element.id,  
                                        source: object.source || 'tmdb'  
                                    });  
                                };  
                            }  
                        };  
                    }  
                }, 100);  
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
  
    if (!window.plugin_online_cinemas_ready) startPlugin();  
})();