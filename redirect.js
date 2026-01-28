(function() {   
    'use strict';   
    Lampa.Platform.tv();   
      
    // Додаємо локалізацію  
    Lampa.Lang.add({  
        location_redirect_title: {  
            ru: 'Смена сервера',  
            uk: 'Зміна сервера',  
            en: 'Change server'  
        },  
        location_redirect_current: {  
            ru: 'Текущий',  
            uk: 'Поточний',  
            en: 'Current'  
        },  
        location_redirect_select_domain: {  
            ru: 'Выберите домен Lampa',  
            uk: 'Виберіть домен Lampa',  
            en: 'Choose Lampa domain'  
        }  
    });  
      
    var icon_server_redirect = '';  
      
    function startMe() {   
        if (window.location.search!='?redirect=1') {   
            if(window.location.hostname!=Lampa.Storage.get('location_server')) {   
                if (Lampa.Storage.get('location_server')!='-' && Lampa.Storage.get('location_server')!='')   
                    window.location.href = 'http://'+Lampa.Storage.get('location_server')+'?redirect=1';   
            }   
        } else {   
            Lampa.Storage.set('location_server','-');   
        }   
          
        Lampa.SettingsApi.addComponent({   
            component: 'location_redirect',   
            name: Lampa.Lang.translate('location_redirect_title'),   
            icon: icon_server_redirect   
        });   
          
        Lampa.SettingsApi.addParam({   
            component: 'location_redirect',   
            param: {   
                name: 'location_server',   
                type: 'select',   
                values: {   
                    '-': Lampa.Lang.translate('location_redirect_current'),   
                    'lampaua.mooo.com': 'lampaua.mooo.com',   
                    'lampa.mx': 'lampa.mx'   
                },   
                default: '-'   
            },   
            field: {   
                name: Lampa.Lang.translate('location_redirect_select_domain')   
            },   
            onChange: function (value) {   
                startMe();   
            }   
        });   
    }   
      
    if(window.appready) startMe();   
    else {   
        Lampa.Listener.follow('app', function(e) {   
            if(e.type == 'ready') {   
                startMe();   
            }   
        });   
    }   
})();