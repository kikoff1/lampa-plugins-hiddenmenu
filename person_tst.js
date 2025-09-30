// Плагін для підписки на акторів в Lampa
// Назва: FavoriteActors
// Версія: 2.0

(function() {
    'use strict';

    const STORAGE_KEY = 'favorite_actors';
    let favoriteActors = [];

    function loadFavoriteActors() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                favoriteActors = JSON.parse(stored);
            }
        } catch (e) {
            console.error('Помилка завантаження улюблених акторів:', e);
            favoriteActors = [];
        }
    }

    function saveFavoriteActors() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteActors));
        } catch (e) {
            console.error('Помилка збереження улюблених акторів:', e);
        }
    }

    function isActorFavorite(actorId) {
        return favoriteActors.some(actor => actor.id === actorId);
    }

    function addActorToFavorites(actorInfo) {
        if (!isActorFavorite(actorInfo.id)) {
            favoriteActors.push({
                id: actorInfo.id,
                name: actorInfo.name,
                image: actorInfo.image,
                url: actorInfo.url
            });
            saveFavoriteActors();
            return true;
        }
        return false;
    }

    function removeActorFromFavorites(actorId) {
        const initialLength = favoriteActors.length;
        favoriteActors = favoriteActors.filter(actor => actor.id !== actorId);
        if (favoriteActors.length !== initialLength) {
            saveFavoriteActors();
            return true;
        }
        return false;
    }

    // Модифікація картки актора
    function modifyActorCard() {
        // Перевизначаємо компонент картки актора
        const originalPersonComponent = Lampa.Template.get('person');
        
        if (originalPersonComponent) {
            Lampa.Template.add('person', function(params) {
                const originalTemplate = originalPersonComponent(params);
                
                return Object.assign({}, originalTemplate, {
                    mounted: function() {
                        // Викликаємо оригінальний mounted
                        if (originalTemplate.mounted) {
                            originalTemplate.mounted.call(this);
                        }
                        
                        // Додаємо нашу кнопку після завантаження компонента
                        setTimeout(() => {
                            const selector = this.$el?.querySelector('.selector');
                            if (selector && this.person) {
                                // Приховуємо стандартну кнопку "У вибране"
                                const favoriteBtn = selector.querySelector('.selector--favorite');
                                if (favoriteBtn) {
                                    favoriteBtn.style.display = 'none';
                                }

                                // Перевіряємо чи вже є наша кнопка
                                const existingBtn = selector.querySelector('.selector--subs');
                                if (!existingBtn) {
                                    const actorInfo = {
                                        id: this.person.id || String(this.person.name).replace(/\s+/g, '_'),
                                        name: this.person.name,
                                        image: this.person.image,
                                        url: window.location.href
                                    };

                                    const button = createSubscriptionButton(actorInfo);
                                    selector.appendChild(button);
                                }
                            }
                        }, 100);
                    }
                });
            });
        }
    }

    function createSubscriptionButton(actorInfo) {
        const isFavorite = isActorFavorite(actorInfo.id);
        
        const button = document.createElement('div');
        button.className = 'selector--button selector--subs';
        button.innerHTML = `
            <div class="selector--icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="${isFavorite ? 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' : 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z'}"/>
                </svg>
            </div>
            <div class="selector--title">${isFavorite ? 'Відписатися' : 'Підписатися'}</div>
        `;

        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();

            if (isActorFavorite(actorInfo.id)) {
                removeActorFromFavorites(actorInfo.id);
                button.querySelector('.selector--title').textContent = 'Підписатися';
                const iconPath = button.querySelector('path');
                iconPath.setAttribute('d', 'M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z');
                Lampa.Notify.show('Актора видалено з улюблених', 3000);
            } else {
                addActorToFavorites(actorInfo);
                button.querySelector('.selector--title').textContent = 'Відписатися';
                const iconPath = button.querySelector('path');
                iconPath.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
                Lampa.Notify.show('Актора додано до улюблених', 3000);
            }
        });

        return button;
    }

    // Додаємо пункт в головне меню
    function addMenuButton() {
        // Чекаємо на ініціалізацію меню
        if (Lampa.Menu && Lampa.Menu.add) {
            Lampa.Menu.add({
                name: 'favorite_actors',
                title: 'Улюблені актори',
                icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>',
                component: {
                    template: () => `
                        <div class="fullscreen-page">
                            <div class="fullscreen-page--head">
                                <div class="fullscreen-page--title">Улюблені актори</div>
                            </div>
                            <div class="fullscreen-page--content">
                                <div class="person-view" id="favorite-actors-list">
                                    ${favoriteActors.length === 0 ? 
                                        '<div class="person-view--empty">У вас ще немає улюблених акторів</div>' : 
                                        ''}
                                </div>
                            </div>
                        </div>
                    `,
                    mounted: function() {
                        this.renderActors();
                    },
                    methods: {
                        renderActors: function() {
                            const container = document.getElementById('favorite-actors-list');
                            if (!container) return;

                            if (favoriteActors.length === 0) {
                                container.innerHTML = '<div class="person-view--empty">У вас ще немає улюблених акторів</div>';
                                return;
                            }

                            container.innerHTML = favoriteActors.map(actor => `
                                <div class="person--card" data-id="${actor.id}">
                                    <div class="person--poster">
                                        <div class="person--image">
                                            <img src="${actor.image}" alt="${actor.name}" loading="lazy" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDIwMCAzMDAiIGZpbGw9IiMzMzMiPjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2Ij7QndC10YI8L3RleHQ+PC9zdmc+'">
                                        </div>
                                        <div class="person--actions">
                                            <div class="selector">
                                                <div class="selector--button selector--subs-remove" data-id="${actor.id}">
                                                    <div class="selector--icon">
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                                            <path d="M17 13H7v-2h10v2zm4-6h-3V3c0-1.1-.9-2-2-2H8C6.9 1 6 1.9 6 3v4H3c-1.1 0-2 .9-2 2s.9 2 2 2h1v8c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-8h1c1.1 0 2-.9 2-2s-.9-2-2-2zM8 3h8v4H8V3zm10 16H6v-8h12v8z"/>
                                                        </svg>
                                                    </div>
                                                    <div class="selector--title">Видалити</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="person--name">${actor.name}</div>
                                </div>
                            `).join('');

                            // Додаємо обробники подій
                            container.querySelectorAll('.selector--subs-remove').forEach(btn => {
                                btn.addEventListener('click', (e) => {
                                    const actorId = btn.getAttribute('data-id');
                                    removeActorFromFavorites(actorId);
                                    this.renderActors();
                                    Lampa.Notify.show('Актора видалено', 3000);
                                });
                            });
                        }
                    }
                }
            });
        } else {
            // Альтернативний спосіб додавання меню
            setTimeout(addMenuButton, 1000);
        }
    }

    // Альтернативний спосіб модифікації через MutationObserver
    function observeActorCards() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) {
                        // Шукаємо контейнери з акторами
                        const personCards = node.querySelectorAll ? node.querySelectorAll('.person--selector') : [];
                        personCards.forEach(selector => {
                            const container = selector.querySelector('.selector');
                            if (container) {
                                // Приховуємо стандартну кнопку
                                const favoriteBtn = container.querySelector('.selector--favorite');
                                if (favoriteBtn) {
                                    favoriteBtn.style.display = 'none';
                                }

                                // Додаємо нашу кнопку якщо її ще немає
                                const existingBtn = container.querySelector('.selector--subs');
                                if (!existingBtn) {
                                    const personCard = selector.closest('.person');
                                    if (personCard) {
                                        const actorName = personCard.querySelector('.person--name')?.textContent;
                                        const actorImage = personCard.querySelector('.person--poster img')?.src;
                                        const actorId = window.location.href.split('/').pop() || Date.now().toString();
                                        
                                        const actorInfo = {
                                            id: actorId,
                                            name: actorName || 'Актор',
                                            image: actorImage || '',
                                            url: window.location.href
                                        };

                                        const button = createSubscriptionButton(actorInfo);
                                        container.appendChild(button);
                                    }
                                }
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Ініціалізація
    function init() {
        console.log('Ініціалізація плагіна FavoriteActors v2...');
        
        loadFavoriteActors();
        
        // Спробуємо обидва методи модифікації
        modifyActorCard();
        observeActorCards();
        
        addMenuButton();
        
        console.log('Плагін FavoriteActors v2 успішно ініціалізовано');
    }

    // Запуск
    if (window.Lampa && Lampa.API && Lampa.API.plugin) {
        Lampa.API.plugin({
            name: 'FavoriteActors',
            version: '2.0'
        });
        
        init();
    } else {
        document.addEventListener('lampa-loaded', function() {
            if (Lampa.API && Lampa.API.plugin) {
                Lampa.API.plugin({
                    name: 'FavoriteActors',
                    version: '2.0'
                });
            }
            init();
        });
    }

})();