// IIFE - самовикликаюча функція для ізоляції плагіна  
(function () {  
  'use strict';  
  
  // Додаємо локалізацію  
  function translate() {  
    Lampa.Lang.add({  
      bat_torrserver_test: {  
        ru: 'Тест Каталог TorrServers',  
        uk: 'Тест Каталог TorrServers'  
      }  
    });  
  }  
  
  function init() {  
    console.log('TorrServer catalog: Plugin initialization started');  
      
    Lampa.Settings.listener.follow('open', function (e) {  
      console.log('TorrServer catalog: Settings opened:', e.name);  
        
      if (e.name == 'server') {  
        console.log('TorrServer catalog: Server settings detected');  
          
        setTimeout(function() {  
          let target = $('[data-name="torrserver_url_two"]', e.body);  
          console.log('TorrServer catalog: Target element found:', target.length > 0);  
            
          if (target.length) {  
            let btn = $(`<div class="settings-param selector" data-type="button">  
              <div class="settings-param__name">🔧 ${Lampa.Lang.translate('bat_torrserver_test')}</div>  
              <div class="settings-param__descr">Тестова кнопка для перевірки інтеграції</div>  
            </div>`);  
  
            btn.on('hover:enter', () => {  
              console.log('TorrServer catalog: Test button clicked!');  
              Lampa.Noty.show('Тестова кнопка працює!');  
            });  
  
            target.after(btn);  
            console.log('TorrServer catalog: Button added successfully');  
          } else {  
            console.error('TorrServer catalog: Target element not found');  
          }  
        }, 100);  
      }  
    });  
  }  
  
  function start() {  
    translate();  
    init();  
  }  
  
  if (window.appready) start();  
  else {  
    Lampa.Listener.follow('app', function (e) {  
      if (e.type === 'ready') start();  
    });  
  }  
})();
