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
                const button = $('.online-cinemas-actors');  
                if (this.settings.showActors) {  
                    button.removeClass('hide');  
                } else {  
                    button.addClass('hide');  
                }  
            },  
  
            addActorsButton: function() {  
                const ico = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-linejoin="round" stroke-width="4"><path d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
                const button = $(`<li class="menu__item selector online-cinemas-actors" data-action="actors">  
                    <div class="menu__ico">${ico}</div>  
                    <div class="menu__text">Актори</div>  
                </li>`);  
  
                button.on('hover:enter', this.showActors.bind(this));  
                $('.menu .menu__list').eq(0).append(button);  
                this.toggleActorsButton();  
            },  
  
            showActors: function() {  
                // Завантажуємо список популярних акторів через API  
                Lampa.Api.person({url: 'person/popular', page: 1}, (data) => {  
                    if (data && data.results) {  
                        // Створюємо активність з власним компонентом  
                        Lampa.Activity.push({  
                            url: '',  
                            title: 'Актори',  
                            component: 'actors_list',  
                            persons: data.results,  
                            source: 'tmdb',  
                            page: 1  
                        });  
                    }  
                }, () => {  
                    Lampa.Noty.show('Помилка завантаження акторів');  
                });  
            }  
        };  
  
        // Створюємо власний компонент для відображення акторів  
        function ActorsListComponent(object) {  
            let scroll, html, last;  
            let persons = object.persons || [];  
            let active = 0;  
  
            this.create = function() {  
                html = Lampa.Template.get('items_line', {title: 'Популярні актори'});  
                scroll = new Lampa.Scroll({horizontal: false, mask: true, over: true});  
  
                let grid = $('<div class="category-full__grid"></div>');  
  
                // Створюємо картки акторів, використовуючи логіку з full_persons  
                persons.forEach((element) => {  
                    let person = Lampa.Template.get('full_person', {  
                        name: element.name,  
                        role: element.known_for_department || Lampa.Lang.translate('title_actor')  
                    });  
  
                    person.on('visible', () => {  
                        let img = person.find('img')[0];  
  
                        img.onerror = function() {  
                            img.src = './img/actor.svg';  
                        };  
  
                        img.onload = function() {  
                            person.addClass('full-person--loaded');  
                        };  
  
                        img.src = element.profile_path ?   
                            Lampa.Api.img(element.profile_path, 'w276_and_h350_face') :   
                            './img/actor.svg';  
                    });  
  
                    // Використовуємо ту саму логіку, що і в full_persons.js:72-79  
                    person.on('hover:focus', (e) => {  
                        last = e.target;  
                        active = persons.indexOf(element);  
                        scroll.update($(e.target), true);  
                    }).on('hover:enter', () => {  
                        // Явно відкриваємо компонент actor, як у full_persons  
                        Lampa.Activity.push({  
                            url: '',  
                            title: Lampa.Lang.translate('title_persons'),  
                            component: 'actor',  
                            id: element.id,  
                            source: object.source || 'tmdb'  
                        });  
                    });  
  
                    grid.append(person);  
                });  
  
                scroll.append(grid);  
                html.find('.items-line__body').append(scroll.render());  
  
                this.activity.toggle();  
            };  
  
            this.start = function() {  
                Lampa.Controller.add('content', {  
                    toggle: () => {  
                        Lampa.Controller.collectionSet(scroll.render());  
                        Lampa.Controller.collectionFocus(last, scroll.render());  
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
                return html;  
            };  
            this.destroy = function() {  
                scroll.destroy();  
                html.remove();  
            };  
        }  
  
        // Реєструємо власний компонент  
        Lampa.Component.add('actors_list', ActorsListComponent);  
  
        function add() {  
            OnlineCinemas.init();  
            OnlineCinemas.addActorsButton();  
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