// Super Simple Favorite Actors Plugin
lampa_plugin_favorite_actors = {
    init: function() {
        console.log("Simple Favorite Actors Plugin loaded!");
        
        this.favorites = JSON.parse(localStorage.getItem('simple_fav_actors') || '[]');
        
        // Додаємо кнопку в меню
        this.addMenu();
        
        // Додаємо кнопки на картки акторів
        this.addActorButtons();
        
        // Спостерігаємо за змінами
        this.startWatching();
    },
    
    addMenu: function() {
        setInterval(() => {
            const menu = document.querySelector('.main--menu');
            if (menu && !menu.querySelector('.simple-fav-actors')) {
                const item = document.createElement('div');
                item.className = 'main--item simple-fav-actors';
                item.innerHTML = `
                    <div class="main--icon">❤️</div>
                    <div class="main--title">Мої актори (${this.favorites.length})</div>
                `;
                item.onclick = () => this.showFavorites();
                menu.appendChild(item);
            }
        }, 1000);
    },
    
    addActorButtons: function() {
        setInterval(() => {
            document.querySelectorAll('.person--selector').forEach(card => {
                if (card.querySelector('.simple-fav-btn')) return;
                
                const container = card.querySelector('.selector');
                const nameElem = card.closest('.person')?.querySelector('.person--name');
                
                if (container && nameElem) {
                    const name = nameElem.textContent.trim();
                    const isFav = this.favorites.some(a => a.name === name);
                    
                    const btn = document.createElement('div');
                    btn.className = 'selector--button simple-fav-btn';
                    btn.innerHTML = `
                        <div class="selector--icon">${isFav ? '❤️' : '🤍'}</div>
                        <div class="selector--title">${isFav ? 'Відписатися' : 'Підписатися'}</div>
                    `;
                    
                    btn.onclick = (e) => {
                        e.stopPropagation();
                        this.toggleFavorite(name);
                    };
                    
                    container.appendChild(btn);
                }
            });
        }, 2000);
    },
    
    toggleFavorite: function(actorName) {
        const actor = {name: actorName, id: actorName};
        const index = this.favorites.findIndex(a => a.name === actorName);
        
        if (index > -1) {
            this.favorites.splice(index, 1);
            this.showMessage(`Видалено ${actorName}`);
        } else {
            this.favorites.push(actor);
            this.showMessage(`Додано ${actorName}`);
        }
        
        localStorage.setItem('simple_fav_actors', JSON.stringify(this.favorites));
        this.updateAllButtons();
    },
    
    updateAllButtons: function() {
        document.querySelectorAll('.simple-fav-btn').forEach(btn => {
            const name = btn.closest('.person')?.querySelector('.person--name')?.textContent?.trim();
            if (name) {
                const isFav = this.favorites.some(a => a.name === name);
                btn.querySelector('.selector--icon').textContent = isFav ? '❤️' : '🤍';
                btn.querySelector('.selector--title').textContent = isFav ? 'Відписатися' : 'Підписатися';
            }
        });
        
        // Оновлюємо меню
        const menuItem = document.querySelector('.simple-fav-actors .main--title');
        if (menuItem) {
            menuItem.textContent = `Мої актори (${this.favorites.length})`;
        }
    },
    
    showFavorites: function() {
        const html = `
            <div style="padding:20px">
                <h1 style="color:white; margin-bottom:20px">Мої улюблені актори</h1>
                ${this.favorites.length ? 
                    this.favorites.map(actor => `
                        <div style="background:#333; padding:15px; margin:10px 0; border-radius:8px; display:flex; justify-content:space-between; align-items:center">
                            <span style="color:white">${actor.name}</span>
                            <button onclick="lampa_plugin_favorite_actors.removeActor('${actor.name}')" 
                                    style="background:red; color:white; border:none; padding:5px 10px; border-radius:4px">
                                Видалити
                            </button>
                        </div>
                    `).join('') :
                    '<div style="color:#888; text-align:center; padding:40px">Ще немає улюблених акторів</div>'
                }
            </div>
        `;
        
        Lampa.Page?.show({html: html}) || alert("Сторінка улюблених акторів:\n" + this.favorites.map(a => a.name).join('\n'));
    },
    
    removeActor: function(name) {
        this.toggleFavorite(name);
        this.showFavorites();
    },
    
    showMessage: function(text) {
        Lampa.Notify?.show(text) || console.log(text);
    },
    
    startWatching: function() {
        setInterval(() => {
            this.updateAllButtons();
        }, 5000);
    }
};

// Автозапуск
if (window.Lampa) {
    lampa_plugin_favorite_actors.init();
} else {
    document.addEventListener('lampa-loaded', () => {
        lampa_plugin_favorite_actors.init();
    });
}