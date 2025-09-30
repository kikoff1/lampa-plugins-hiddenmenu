(function () {
    'use strict';

    Lampa.Plugin.create({
        name: 'Улюблені актори',
        version: '1.0.3',
        author: 'Gemini',
        description: 'Додає можливість створювати список улюблених акторів та переглядати їх в окремому пункті меню.'
    });

    // --- Сховище даних ---
    // Функції для роботи з Lampa.Storage, де будуть зберігатися актори

    function getFavoriteActors() {
        return Lampa.Storage.get('favorite_actors_list', '[]');
    }

    function saveFavoriteActors(actors) {
        Lampa.Storage.set('favorite_actors_list', actors);
    }

    function isActorFavorite(actorId) {
        let favorites = getFavoriteActors();
        return favorites.some(actor => actor.id == actorId);
    }

    function addFavoriteActor(actorData) {
        let favorites = getFavoriteActors();
        if (!isActorFavorite(actorData.id)) {
            favorites.push({
                id: actorData.id,
                name: actorData.name,
                img: actorData.img
            });
            saveFavoriteActors(favorites);
            Lampa.Noty.show('Актора додано до улюблених');
        }
    }

    function removeFavoriteActor(actorId) {
        let favorites = getFavoriteActors();
        let updatedFavorites = favorites.filter(actor => actor.id != actorId);
        saveFavoriteActors(updatedFavorites);
        Lampa.Noty.show('Актора видалено з улюблених');
    }


    // --- Модифікація картки актора ---
    // Слухач, який спрацьовує при відкритті повної інформації (фільму, серіалу, актора)

    Lampa.Listener.follow('full', function (e) {
        // Перевіряємо, що це саме картка актора
        if (e.type === 'load' && e.data.person) {
            let actorData = e.data.person;
            let fullRender = e.object.render; // DOM-елемент картки

            // 1. Приховуємо стандартну кнопку "Підписатися"
            let standardSubscribeButton = fullRender.find('.card-subscribe');
            if (standardSubscribeButton.length > 0) {
                standardSubscribeButton.hide();
            }

            // 2. Створюємо та додаємо нашу нову кнопку
            let buttonText = isActorFavorite(actorData.id) ? 'Відписатися' : 'Підписатися';
            let favoriteButton = $(`
                <div class="full-start__button selector favorite-actor-button">
                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2L9.19 8.63L2 9.24l5.46 4.73L5.82 21L12 17.27z" fill="currentColor"></path></svg>
                    <span>${buttonText}</span>
                </div>
            `);

            // 3. Логіка натискання на кнопку
            favoriteButton.on('click', function () {
                if (isActorFavorite(actorData.id)) {
                    removeFavoriteActor(actorData.id);
                    favoriteButton.find('span').text('Підписатися');
                } else {
                    addFavoriteActor(actorData);
                    favoriteButton.find('span').text('Відписатися');
                }
                // Оновлюємо активний елемент для навігації з пульта/клавіатури
                Lampa.Controller.toggle('full_start');
            });

            // Додаємо кнопку на сторінку
            fullRender.find('.full-start__buttons').append(favoriteButton);
        }
    });


    // --- Створення сторінки "Улюблені актори" ---
    // Реєструємо новий компонент (сторінку) в Lampa

    function buildFavoriteActorsComponent() {
        let component = Lampa.Component.create({
            name: 'favorite_actors',
            template: `
                <div class="favorite-actors-page">
                    <div class="head">
                        <div class="head__title">Улюблені актори</div>
                    </div>
                    <div class="favorite-actors-page__content">
                        <div class="card-collection"></div>
                        <div class="favorite-actors-page__empty-message" style="display: none;">
                            <p>Ваш список улюблених акторів порожній.</p>
                            <p>Ви можете додати актора, натиснувши на кнопку "Підписатися" на його сторінці.</p>
                        </div>
                    </div>
                </div>
            `
        });

        component.onRender = function () {
            let favorites = getFavoriteActors();
            let cardContainer = component.find('.card-collection');
            let emptyMessage = component.find('.favorite-actors-page__empty-message');
            
            cardContainer.empty();

            if (favorites.length === 0) {
                emptyMessage.show();
            } else {
                emptyMessage.hide();
                favorites.forEach(actor => {
                    let card = Lampa.Utils.card({
                        id: actor.id,
                        type: 'person', // Важливо вказати тип 'person' для правильної обробки
                        name: actor.name,
                        img: actor.img
                    });
                    
                    // Обробник для довгого натискання (видалення)
                    card.on('long', function(){
                        Lampa.Select.show({
                            title: 'Видалити актора?',
                            items: [
                                { title: 'Так, видалити' },
                                { title: 'Скасувати' }
                            ],
                            onSelect: (item) => {
                                if(item.title === 'Так, видалити') {
                                    removeFavoriteActor(actor.id);
                                    // Оновлюємо сторінку після видалення
                                    component.onRender();
                                }
                                Lampa.Controller.toggle('content');
                            },
                            onBack: () => {
                                Lampa.Controller.toggle('content');
                            }
                        });
                    });
                    
                    cardContainer.append(card.render());
                });
            }
        };

        return component;
    }

    // Додаємо компонент до Lampa
    Lampa.Component.add('favorite_actors', buildFavoriteActorsComponent());


    // --- Додавання пункту в головне меню ---
    // Слухач, який спрацьовує при завантаженні головного меню

    Lampa.Listener.follow('main', function(e) {
        if (e.type === 'ready') {
            let menu = e.object.render.find('.scroll .scroll__content');
            let favoriteActorsButton = $(`
                <li class="menu__item selector" data-action="favorite_actors">
                    <div class="menu__ico">
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" width="1em" height="1em" preserveAspectRatio="xMidYMid meet" viewBox="0 0 24 24"><path d="M16.5 12A2.5 2.5 0 0 0 14 9.5A2.5 2.5 0 0 0 11.5 12A2.5 2.5 0 0 0 14 14.5A2.5 2.5 0 0 0 16.5 12M9 11A3 3 0 0 0 6 8A3 3 0 0 0 3 11A3 3 0 0 0 6 14A3 3 0 0 0 9 11M16.5 16.25c-1.33 0-4.08.67-4.25 1c-.17.33-.17.67 0 1c.17.33 2.92 1 4.25 1s4.08-.67 4.25-1c.17-.33.17-.67 0-1c-.17-.33-2.92-1-4.25-1M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" fill="currentColor"></path></svg>
                    </div>
                    <div class="menu__text">Улюблені актори</div>
                </li>
            `);

            favoriteActorsButton.on('click', function() {
                Lampa.Controller.add({
                    component: 'favorite_actors'
                });
            });

            menu.find('.menu__item[data-action="history"]').after(favoriteActorsButton);
        }
    });

})();
