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
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="18" r="17" stroke="white" stroke-width="2"/><path d="M18 10C14.69 10 12 12.69 12 16C12 19.31 14.69 22 18 22C21.31 22 24 19.31 24 16C24 12.69 21.31 10 18 10ZM18 20C15.79 20 14 18.21 14 16C14 13.79 15.79 12 18 12C20.21 12 22 13.79 22 16C22 18.21 20.21 20 18 20ZM18 24C13.58 24 10 25.79 10 28V30H26V28C26 25.79 22.42 24 18 24Z" fill="white"/></svg>',  
                    name: 'Популярні актори'  
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
                const button = $('.menu .menu__list li[data-action="actors"]');  
                if (this.settings.showActors) {  
                    button.show();  
                } else {  
                    button.hide();  
                }  
            },  
  
            addActorsButton: function() {  
                const button = $(`<li class="menu__item selector" data-action="actors">  
                <div class="menu__item-icon">  
                    <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                        <circle cx="18" cy="18" r="17" stroke="white" stroke-width="2"/>  
                        <path d="M18 10C14.69 10 12 12.69 12 16C12 19.31 14.69 22 18 22C21.31 22 24 19.31 24 16C24 12.69 21.31 10 18 10ZM18 20C15.79 20 14 18.21 14 16C14 13.79 15.79 12 18 12C20.21 12 22 13.79 22 16C22 18.21 20.21 20 18 20ZM18 24C13.58 24 10 25.79 10 28V30H26V28C26 25.79 22.42 24 18 24Z" fill="white"/>  
                    </svg>  
                </div>  
                <div class="menu__item-text">Актори</div>  
            </li>`);  
  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                // Використовуємо прямий виклик API для завантаження акторів  
                Lampa.Api.list({  
                    url: 'person/popular',  
                    source: 'tmdb',  
                    page: 1  
                }, (data) => {  
                    // Додаємо gender до всіх акторів, якщо його немає  
                    if (data.results) {  
                        data.results.forEach(actor => {  
                            if (typeof actor.gender === 'undefined') {  
                                actor.gender = 1; // Додаємо gender  
                            }  
                        });  
                    }  
  
                    // Відкриваємо активність з модифікованими даними  
                    Lampa.Activity.push({  
                        url: 'person/popular',  
                        title: 'Популярні актори',  
                        component: 'category_full',  
                        source: 'tmdb',  
                        card_type: true,  
                        page: 1,  
                        // Додаємо card_events для перевизначення onEnter  
                        card_events: {  
                            onEnter: function(target, card_data) {  
                                if (card_data.profile_path || card_data.gender) {  
                                    Lampa.Activity.push({  
                                        url: '',  
                                        title: card_data.name,  
                                        component: 'actor',  
                                        id: card_data.id,  
                                        source: 'tmdb'  
                                    });  
                                }  
                            }  
                        }  
                    });  
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
  
    if (!window.plugin_online_cinemas_ready) startPlugin();  
})();