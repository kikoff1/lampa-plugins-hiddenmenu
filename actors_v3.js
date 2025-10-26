(function () {  
    'use strict';  
  
    function startPlugin() {  
        if (window.plugin_popular_actors_ready) return;  
        window.plugin_popular_actors_ready = true;  
  
        // Створюємо власний компонент для відображення популярних акторів  
        function PopularActorsComponent(object) {  
            let network = new Lampa.Reguest();  
            let scroll = new Lampa.Scroll({mask: true, over: true});  
            let items = [];  
            let active = 0;  
  
            this.create = function() {  
                this.activity.loader(true);  
  
                scroll.minus();  
  
                // Завантажуємо популярних акторів з TMDB API  
                Lampa.Api.sources.tmdb.get('person/popular', {page: object.page || 1}, (data) => {  
                    this.activity.loader(false);  
  
                    if (data && data.results && data.results.length) {  
                        // Створюємо заголовок  
                        let title = $('<div class="category-full"><div class="category-full__title">' +   
                                     Lampa.Lang.translate('title_actors') + '</div></div>');  
                        scroll.append(title);  
  
                        // Створюємо контейнер для карток  
                        let grid = $('<div class="category-full__grid"></div>');  
                          
                        // Створюємо картки для кожного актора  
                        data.results.forEach((actor) => {  
                            let card = this.createActorCard(actor);  
                            grid.append(card.render(true));  
                            items.push(card);  
                        });  
  
                        scroll.append(grid);  
  
                        Lampa.Layer.update(scroll.render(true));  
                        Lampa.Layer.visible(scroll.render(true));  
  
                        this.activity.toggle();  
                    } else {  
                        this.empty();  
                    }  
                }, this.empty.bind(this));  
  
                return this.render();  
            };  
  
            this.createActorCard = function(actor) {  
                // Створюємо картку актора  
                let card = new Lampa.Card(actor, {  
                    card_category: true,  
                    object: object  
                });  
  
                card.create();  
  
                // Перевизначаємо onEnter для правильного відкриття профілю актора  
                card.onEnter = (target, card_data) => {  
                    Lampa.Activity.push({  
                        url: '',  
                        title: Lampa.Lang.translate('title_person'),  
                        component: 'actor',  
                        id: actor.id,  
                        source: object.source || 'tmdb',  
                        page: 1  
                    });  
                };  
  
                card.onFocus = (target, card_data) => {  
                    active = items.indexOf(card);  
                    scroll.update(card.render(true));  
                    Lampa.Background.change(Lampa.Utils.cardImgBackground(card_data));  
                };  
  
                return card;  
            };  
  
            this.empty = function() {  
                let empty = new Lampa.Empty();  
                scroll.append(empty.render());  
                this.start = empty.start;  
                this.activity.loader(false);  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(scroll.render(true));  
                        Lampa.Controller.collectionFocus(false, scroll.render(true));  
                    },  
                    left: () => {  
                        if (Lampa.Navigator.canmove('left')) Lampa.Navigator.move('left');  
                        else Lampa.Controller.toggle('menu');  
                    },  
                    right: () => {  
                        Lampa.Navigator.move('right');  
                    },  
                    up: () => {  
                        if (Lampa.Navigator.canmove('up')) Lampa.Navigator.move('up');  
                        else Lampa.Controller.toggle('head');  
                    },  
                    down: () => {  
                        Lampa.Navigator.move('down');  
                    },  
                    back: () => {  
                        Lampa.Activity.backward();  
                    }  
                });  
  
                Lampa.Controller.toggle('content');  
            };  
  
            this.pause = function() {};  
  
            this.stop = function() {};  
  
            this.render = function() {  
                return scroll.render(true);  
            };  
  
            this.destroy = function() {  
                network.clear();  
                scroll.destroy();  
                items = null;  
            };  
        }  
  
        // Реєструємо компонент  
        Lampa.Component.add('popular_actors', PopularActorsComponent);  
  
        // Створюємо налаштування  
        function createSettings() {  
            Lampa.SettingsApi.addComponent({  
                component: 'popular_actors_settings',  
                name: 'Популярні актори'  
            });  
  
            Lampa.SettingsApi.addParam({  
                component: 'popular_actors_settings',  
                param: {  
                    name: 'show_actors_menu',  
                    type: 'trigger',  
                    default: true  
                },  
                field: {  
                    name: 'Показувати в меню'  
                },  
                onChange: function(value) {  
                    if (value) {  
                        addMenuButton();  
                    } else {  
                        removeMenuButton();  
                    }  
                }  
            });  
        }  
  
        // Додаємо кнопку в меню  
        function addMenuButton() {  
            if ($('.menu__item[data-action="popular_actors"]').length) return;  
  
            let ico = `<svg height="36" viewBox="0 0 38 36" fill="none" xmlns="http://www.w3.org/2000/svg">  
                <circle cx="19" cy="12" r="6" stroke="currentColor" stroke-width="2"/>  
                <path d="M8 32C8 26 12 22 19 22C26 22 30 26 30 32" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>  
            </svg>`;  
  
            let button = $(`<li class="menu__item selector" data-action="popular_actors">  
                <div class="menu__ico">${ico}</div>  
                <div class="menu__text">${Lampa.Lang.translate('title_actors')}</div>  
            </li>`);  
  
            button.on('hover:enter', function() {  
                Lampa.Activity.push({  
                    url: 'person/popular',  
                    title: Lampa.Lang.translate('title_actors'),  
                    component: 'popular_actors',  
                    source: 'tmdb',  
                    page: 1  
                });  
            });  
  
            $('.menu .menu__list').eq(0).append(button);  
        }  
  
        function removeMenuButton() {  
            $('.menu__item[data-action="popular_actors"]').remove();  
        }  
  
        // Ініціалізація  
        function init() {  
            createSettings();  
              
            if (Lampa.Storage.get('show_actors_menu', true)) {  
                addMenuButton();  
            }  
        }  
  
        if (window.appready) init();  
        else {  
            Lampa.Listener.follow('app', function(e) {  
                if (e.type == 'ready') init();  
            });  
        }  
    }  
  
    if (!window.plugin_popular_actors_ready) startPlugin();  
})();