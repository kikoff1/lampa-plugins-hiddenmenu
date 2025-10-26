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
                        default: true  
                    },  
                    field: {  
                        name: 'Показувати пункт меню "Актори"'  
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
                const button = $('.online-cinemas-actors');  
                if (this.settings.showActors) {  
                    button.show();  
                } else {  
                    button.hide();  
                }  
            },  
  
            patchActorsPage: function() {  
                var self = this;  
                  
                // Перехоплюємо створення активності  
                Lampa.Listener.follow('activity', function(e) {  
                    if (e.type === 'create' && e.component === 'category_full') {  
                        var activity = Lampa.Activity.active();  
                        if (activity.url === 'person/popular') {  
                            // Чекаємо, поки картки створяться  
                            setTimeout(function() {  
                                // Знаходимо всі картки на сторінці  
                                $('.card').each(function() {  
                                    var card = $(this);  
                                      
                                    // Перевіряємо, чи це картка актора (має profile_path)  
                                    var cardData = card.data('card_data');  
                                    if (cardData && (cardData.profile_path || cardData.gender)) {  
                                        // Видаляємо старий обробник  
                                        card.off('hover:enter');  
                                          
                                        // Додаємо новий обробник, який копіює логіку з full_persons.js:72-79  
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
                    }  
                });  
            },  
  
            addActorsButton: function() {  
                const ico = '<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><g fill="none" fill-rule="evenodd"><path d="M0 0h36v36H0z"/><path fill="#fff" d="M18 4c7.732 0 14 6.268 14 14s-6.268 14-14 14S4 25.732 4 18 10.268 4 18 4Zm0 2C11.373 6 6 11.373 6 18s5.373 12 12 12 12-5.373 12-12S24.627 6 18 6Zm0 2c3.314 0 6 2.686 6 6s-2.686 6-6 6-6-2.686-6-6 2.686-6 6-6Zm0 2c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4Zm-6 10.023C12 24.774 14.864 27 18 27s6-2.226 6-5.023V24h-6v-4.977C12 16.226 10.136 14 6 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
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