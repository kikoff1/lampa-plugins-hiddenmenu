(function () {  
    'use strict';  
  
    var ActorsPlugin = {  
        settings: {  
            showActors: true  
        },  
  
        init: function() {  
            this.addActorsButton();  
        },  
  
        addActorsButton: function() {  
            const ico = '<svg xmlns="http://www.w3.org/2000/svg" width="2.2em" height="2.2em" viewBox="0 0 48 48"><g fill="none" stroke="currentColor" stroke-width="4"><path stroke-linejoin="round" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z"/><path d="M30 24v-4.977C30 16.226 28.136 14 24 14s-6 2.226-6 5.023V24"/><path stroke-linejoin="round" d="M30 24h-6v-4.977C24 16.226 25.864 14 30 14s6 2.226 6 5.023V24h-6Zm-18 0h6v-4.977C24 16.226 22.136 14 18 14s-6 2.226-6 5.023V24h6Z"/></g></svg>';  
              
            const button = $(`<li class="menu__item selector" data-action="actors">  
                <div class="menu__ico">${ico}</div>  
                <div class="menu__text">Актори</div>  
            </li>`);  
  
            button.on('hover:enter', this.showActors.bind(this));  
            $('.menu .menu__list').eq(0).append(button);  
        },  
  
        showActors: function() {  
            Lampa.Activity.push({  
                url: "person/popular",  
                title: "Актори",  
                component: "category_full",  
                source: "tmdb",  
                card_type: true,  
                page: 1  
            });  
        }  
    };  
  
    function startPlugin() {  
        if (window.ActorsPlugin) return;  
        window.ActorsPlugin = ActorsPlugin;  
  
        if (window.appready) {  
            ActorsPlugin.init();  
        } else {  
            Lampa.Listener.follow('app', e => {  
                if (e.type === 'ready') ActorsPlugin.init();  
            });  
        }  
    }  
  
    if (!window.actors_plugin_ready) {  
        window.actors_plugin_ready = true;  
        startPlugin();  
    }  
})();