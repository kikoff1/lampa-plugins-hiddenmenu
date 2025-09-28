(function() {
    "use strict";

    // ==== ПРИХОВАННЯ СТАНДАРТНОЇ КНОПКИ "ПІДПИСАТИСЯ" ====
    function hideSubscribeButton() {
        if (document.getElementById('hide-subscribe-style')) return;
        const style = document.createElement('style');
        style.id = 'hide-subscribe-style';
        style.textContent = `.button--subscribe { display: none !important; }`;
        document.head.appendChild(style);
    }

    var PLUGIN_NAME = "persons_plugin";
    var PERSONS_KEY = "saved_persons";
    var PAGE_SIZE = 20;
    var currentPersonId = null;

    var pluginTranslations = {
        persons_title: { ru:"Персоны", en:"Persons", uk:"Персони" },
        subscriibbe: { ru:"Подписаться", en:"subscriibbe", uk:"Підписатися" },
        unsubscriibbe: { ru:"Отписаться", en:"Unsubscriibbe", uk:"Відписатися" },
        persons_not_found: { ru:"Персоны не найдены", en:"No persons found", uk:"Особи не знайдені" }
    };

    var ICON_SVG = '<svg height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="currentColor"/></svg>';

    function getCurrentLanguage() { return localStorage.getItem('language') || 'en'; }
    function initStorage() { if(!Lampa.Storage.get(PERSONS_KEY)) Lampa.Storage.set(PERSONS_KEY, []); }
    function getPersonIds() { return Lampa.Storage.get(PERSONS_KEY, []); }

    function togglePersonSubscription(personId){
        var personIds = getPersonIds();
        var index = personIds.indexOf(personId);
        if(index===-1) personIds.push(personId);
        else personIds.splice(index,1);
        Lampa.Storage.set(PERSONS_KEY, personIds);
        return index===-1;
    }

    function isPersonsubscriibbed(personId){ return getPersonIds().includes(personId); }

    function addButtonToContainer(bottomBlock){
        var existing = bottomBlock.querySelector('.button--subscriibbe-plugin');
        if(existing) existing.remove();

        var subscribed = isPersonsubscriibbed(currentPersonId);
        var text = subscribed ? Lampa.Lang.translate('persons_plugin_unsubscriibbe') : Lampa.Lang.translate('persons_plugin_subscriibbe');

        var btn = document.createElement('div');
        btn.className = 'full-start__button selector button--subscriibbe-plugin';
        btn.classList.add(subscribed?'button--unsubscriibbe':'button--subscriibbe');
        btn.setAttribute('data-focusable','true');
        btn.innerHTML = `<svg width="25" height="30" viewBox="0 0 25 30" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6.01892 24C6.27423 27.3562 9.07836 30 12.5 30C15.9216 30 18.7257 27.3562 18.981 24H15.9645C15.7219 25.6961 14.2632 27 12.5 27C10.7367 27 9.27804 25.6961 9.03542 24H6.01892Z" fill="currentColor"/>
            <path d="M3.81972 14.5957V10.2679C3.81972 5.41336 7.7181 1.5 12.5 1.5C17.2819 1.5 21.1803 5.41336 21.1803 10.2679V14.5957C21.1803 15.8462 21.5399 17.0709 22.2168 18.1213L23.0727 19.4494C24.2077 21.2106 22.9392 23.5 20.9098 23.5H4.09021C2.06084 23.5 0.792282 21.2106 1.9273 19.4494L2.78317 18.1213C3.46012 17.0709 3.81972 15.8462 3.81972 14.5957Z" stroke="currentColor" stroke-width="2.5" fill="transparent"/>
        </svg><span>${text}</span>`;

        btn.addEventListener('hover:enter', function(){
            var added = togglePersonSubscription(currentPersonId);
            btn.classList.remove('button--subscriibbe','button--unsubscriibbe');
            btn.classList.add(added?'button--unsubscriibbe':'button--subscriibbe');
            btn.querySelector('span').textContent = added? Lampa.Lang.translate('persons_plugin_unsubscriibbe') : Lampa.Lang.translate('persons_plugin_subscriibbe');
            updatePersonsList();
        });

        var container = bottomBlock.querySelector('.full-start__buttons');
        if(container) container.append(btn); else bottomBlock.append(btn);
    }

    function addsubscriibbeButton(){ 
        if(!currentPersonId) return;
        var block = document.querySelector('.person-start__bottom');
        if(block) addButtonToContainer(block);
        else {
            let attempts=0;
            const max=10;
            function retry(){
                attempts++;
                var b = document.querySelector('.person-start__bottom');
                if(b) addButtonToContainer(b);
                else if(attempts<max) setTimeout(retry,300);
            }
            setTimeout(retry,300);
        }
    }

    function updatePersonsList(){
        var activity = Lampa.Activity.active();
        if(activity && activity.component==='category_full' && activity.source===PLUGIN_NAME) Lampa.Activity.reload();
    }

    function addButtonStyles(){
        if(document.getElementById('subscriibbe-button-styles')) return;
        var css = `
            .full-start__button.selector.button--subscriibbe-plugin.button--subscriibbe { color: #4CAF50; }
            .full-start__button.selector.button--subscriibbe-plugin.button--unsubscriibbe { color: #F44336; }
        `;
        var style = document.createElement('style'); style.id='subscriibbe-button-styles'; style.textContent=css; document.head.appendChild(style);
    }

    function PersonsService(){
        var cache={};
        this.list = function(params,onComplete){
            var page = parseInt(params.page,10)||1;
            var start=(page-1)*PAGE_SIZE, end=start+PAGE_SIZE;
            var ids=getPersonIds().slice(start,end);
            if(ids.length===0){ onComplete({results:[],page:page,total_pages:Math.ceil(getPersonIds().length/PAGE_SIZE),total_results:getPersonIds().length}); return; }

            var results=[], loaded=0, lang=getCurrentLanguage();

            ids.forEach(function(personId){
                if(cache[personId]){ results.push(cache[personId]); loaded++; if(loaded===ids.length) onComplete({results, page, total_pages:Math.ceil(getPersonIds().length/PAGE_SIZE), total_results:getPersonIds().length}); return; }

                var url=Lampa.TMDB.api(`person/${personId}?api_key=${Lampa.TMDB.key()}&language=${lang}`);
                new Lampa.Reguest().silent(url,function(response){
                    try{
                        var json=typeof response==='string'?JSON.parse(response):response;
                        if(json && json.id){
                            var card={id:json.id,title:json.name,name:json.name,poster_path:json.profile_path,type:"person",source:"tmdb",media_type:"person"};
                            cache[personId]=card;
                            results.push(card);
                        }
                    }catch(e){}
                    loaded++; if(loaded===ids.length) onComplete({results, page, total_pages:Math.ceil(getPersonIds().length/PAGE_SIZE), total_results:getPersonIds().length});
                },function(){ loaded++; if(loaded===ids.length) onComplete({results, page, total_pages:Math.ceil(getPersonIds().length/PAGE_SIZE), total_results:getPersonIds().length}); });
            });
        };
    }

    function startPlugin(){
        hideSubscribeButton();
        initStorage();
        addButtonStyles();

        Lampa.Lang.add({
            persons_plugin_title: pluginTranslations.persons_title,
            persons_plugin_subscriibbe: pluginTranslations.subscriibbe,
            persons_plugin_unsubscriibbe: pluginTranslations.unsubscriibbe,
            persons_plugin_not_found: pluginTranslations.persons_not_found
        });

        var service = new PersonsService();
        Lampa.Api.sources[PLUGIN_NAME]=service;

        var menuItem=$('<li class="menu__item selector" data-action="'+PLUGIN_NAME+'"><div class="menu__ico">'+ICON_SVG+'</div><div class="menu__text">'+Lampa.Lang.translate('persons_plugin_title')+'</div></li>');
        menuItem.on("hover:enter",function(){ Lampa.Activity.push({component:"category_full",source:PLUGIN_NAME,title:Lampa.Lang.translate('persons_plugin_title'),page:1,url:PLUGIN_NAME+'__main'}); });
        $(".menu .menu__list").eq(0).append(menuItem);

        function waitForContainer(cb){ let attempts=0; const max=15; function check(){ attempts++; if(document.querySelector('.person-start__bottom')) cb(); else if(attempts<max) setTimeout(check,200);} setTimeout(check,200); }

        function checkCurrentActivity(){
            var act=Lampa.Activity.active();
            if(act && act.component==='actor'){ currentPersonId=parseInt(act.id || act.params?.id || location.pathname.match(/\/actor\/(\d+)/)?.[1],10); if(currentPersonId) waitForContainer(addsubscriibbeButton); }
        }

        Lampa.Listener.follow('activity',function(e){
            if(e.type==='start' && e.component==='actor' && e.object?.id){ currentPersonId=parseInt(e.object.id,10); waitForContainer(addsubscriibbeButton); }
            else if(e.type==='resume' && e.component==='category_full' && e.object?.source===PLUGIN_NAME){ setTimeout(()=>Lampa.Activity.reload(),100); }
        });

        // Перехоплюємо клік на картку персони, щоб відкривалась actor page
        Lampa.Listener.follow('full',function(e){
            if(e.type==='open' && e.card && e.card.type==='person' && e.card.id){
                Lampa.Activity.push({
                    component:'actor',
                    source:'tmdb',
                    id:e.card.id,
                    title:e.card.title,
                    poster_path:e.card.poster_path
                });
            }
        });

        setTimeout(checkCurrentActivity,1500);
    }

    if(window.appready) startPlugin();
    else Lampa.Listener.follow('app',function(e){ if(e.type==='ready') startPlugin(); });

})();
