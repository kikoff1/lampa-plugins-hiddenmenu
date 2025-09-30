// Спрощена версія плагіна
(function() {
    'use strict';

    const STORAGE_KEY = 'favorite_actors_v2';
    let favoriteActors = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    function saveActors() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favoriteActors));
    }

    function isFavorite(actorId) {
        return favoriteActors.some(a => a.id === actorId);
    }

    function toggleFavorite(actorInfo) {
        const index = favoriteActors.findIndex(a => a.id === actorInfo.id);
        if (index > -1) {
            favoriteActors.splice(index, 1);
            Lampa.Notify.show('Видалено з улюблених');
        } else {
            favoriteActors.push(actorInfo);
            Lampa.Notify.show('Додано до улюблених');
        }
        saveActors();
        updateButtons();
    }

    function createFavoriteButton(actorInfo) {
        const btn = document.createElement('div');
        btn.className = 'selector--button selector--favorite-custom';
        btn.innerHTML = `
            <div class="selector--icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="${isFavorite(actorInfo.id) ? 'red' : 'currentColor'}">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
            </div>
            <div class="selector--title">${isFavorite(actorInfo.id) ? 'Відписатися' : 'Підписатися'}</div>
        `;
        
        btn.onclick = (e) => {
            e.stopPropagation();
            toggleFavorite(actorInfo);
        };
        
        return btn;
    }

    function updateButtons() {
        document.querySelectorAll('.selector--favorite-custom').forEach(btn => {
            const title = btn.querySelector('.selector--title');
            const svg = btn.querySelector('svg');
            const actorId = btn.closest('.person--card')?.dataset?.id;
            
            if (title && actorId) {
                title.textContent = isFavorite(actorId) ? 'Відписатися' : 'Підписатися';
                svg.style.fill = isFavorite(actorId) ? 'red' : 'currentColor';
            }
        });
    }

    function initButtons() {
        setInterval(() => {
            document.querySelectorAll('.person--selector .selector').forEach(container => {
                if (!container.querySelector('.selector--favorite-custom')) {
                    const favoriteBtn = container.querySelector('.selector--favorite');
                    if (favoriteBtn) favoriteBtn.style.display = 'none';
                    
                    const personCard = container.closest('.person');
                    if (personCard) {
                        const name = personCard.querySelector('.person--name')?.textContent;
                        const image = personCard.querySelector('.person--poster img')?.src;
                        const id = window.location.href.split('/').pop() || Date.now().toString();
                        
                        container.appendChild(createFavoriteButton({
                            id: id,
                            name: name || 'Актор',
                            image: image || ''
                        }));
                    }
                }
            });
        }, 1000);
    }

    function initMenu() {
        // Додаємо пункт меню
        const menuItem = document.createElement('div');
        menuItem.className = 'main--item';
        menuItem.innerHTML = `
            <div class="main--icon">❤️</div>
            <div class="main--title">Улюблені актори</div>
        `;
        
        menuItem.onclick = () => {
            const html = `
                <div class="fullscreen-page">
                    <div class="fullscreen-page--head">
                        <div class="fullscreen-page--title">Улюблені актори</div>
                    </div>
                    <div class="fullscreen-page--content">
                        <div class="person-view">
                            ${favoriteActors.length ? favoriteActors.map(actor => `
                                <div class="person--card">
                                    <div class="person--poster">
                                        <img src="${actor.image}" alt="${actor.name}" onerror="this.style.display='none'">
                                        <div class="person--actions">
                                            <div class="selector--button" onclick="event.stopPropagation(); (${toggleFavorite.toString()})(${JSON.stringify(actor)})">
                                                <div class="selector--icon">❌</div>
                                                <div class="selector--title">Видалити</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="person--name">${actor.name}</div>
                                </div>
                            `).join('') : '<div style="padding: 20px; text-align: center;">Немає улюблених акторів</div>'}
                        </div>
                    </div>
                </div>
            `;
            
            Lampa.Page.show({
                html: html,
                onReady: function() {
                    console.log('Сторінка улюблених акторів завантажена');
                }
            });
        };
        
        // Додаємо в меню
        const observer = new MutationObserver(() => {
            const menu = document.querySelector('.main--menu');
            if (menu && !menu.querySelector('.main--item:last-child').textContent.includes('Улюблені')) {
                menu.appendChild(menuItem);
            }
        });
        observer.observe(document.body, {childList: true, subtree: true});
    }

    // Запуск
    if (window.Lampa) {
        initButtons();
        initMenu();
    } else {
        document.addEventListener('lampa-loaded', () => {
            initButtons();
            initMenu();
        });
    }

})();