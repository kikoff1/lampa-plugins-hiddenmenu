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
                this.patchCategoryComponent();  
            },  
  
            loadSettings: function() {  
                this.settings.showActors = Lampa.Storage.get('show_actors', true);  
            },  
  
            createSettings: function() {  
                Lampa.SettingsApi.addComponent({  
                    component: 'online_cinemas',  
                    name: 'Популярні актори',  
                    icon: '<svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="18" cy="12" r="6" stroke="white" stroke-width="2"/><path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" stroke-width="2"/></svg>'  
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
                        this.toggleActorsButton();  
                    }  
                });  
            },  
  
            toggleActorsButton: function() {  
                const button = $('.menu .menu__item').filter(function() {  
                    return $(this).find('.menu__text').text() === 'Актори';  
                });  
  
                if (this.settings.showActors) {  
                    button.removeClass('hide');  
                } else {  
                    button.addClass('hide');  
                }  
            },  
  
            patchCategoryComponent: function() {  
                // Патчимо створення активності для person/popular  
                const originalActivityPush = Lampa.Activity.push;  
                  
                Lampa.Activity.push = function(params) {  
                    const result = originalActivityPush.call(this, params);  
                      
                    // Якщо це сторінка person/popular  
                    if (params.url === 'person/popular' && params.component === 'category_full') {  
                        // Чекаємо створення компонента  
                        setTimeout(() => {  
                            const activity = Lampa.Activity.active();  
                            if (activity && activity.component) {  
                                const component = activity.component;  
                                  
                                // Додаємо cardRender callback  
                                component.cardRender = function(object, element, card) {  
                                    // Перевіряємо, чи це актор (має profile_path або gender)  
                                    if (element.profile_path || typeof element.gender !== 'undefined') {  
                                        // Перевизначаємо onEnter для відкриття компонента actor  
                                        card.onEnter = function(target, card_data) {  
                                            Lampa.Activity.push({  
                                                url: '',  
                                                title: card_data.name || Lampa.Lang.translate('title_person'),  
                                                component: 'actor',  
                                                id: card_data.id,  
                                                source: 'tmdb'  
                                            });  
                                        };  
                                    }  
                                };  
                            }  
                        }, 100);  
                    }  
                      
                    return result;  
                };  
            },  
  
            addActorsButton: function() {  
                const button = $(`<li class="menu__item selector">  
                    <div class="menu__ico">  
                        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                            <circle cx="18" cy="12" r="6" stroke="white" stroke-width="2"/>  
                            <path d="M6 30c0-6.627 5.373-12 12-12s12 5.373 12 12" stroke="white" stroke-width="2"/>  
                        </svg>  
                    </div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
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