// в2 IIFE - самовикликаюча функція для ізоляції плагіна    
(function () {    
  'use strict';    
    
  /* =========================    
   * 1) Локалізація    
   * ========================= */    
  function translate() {    
    Lampa.Lang.add({    
      bat_torrserver: {    
        ru: 'Каталог TorrServers',    
        en: 'TorrServers catalog',    
        uk: 'Каталог TorrServers',    
        zh: 'TorrServer目录'    
      },    
      bat_torrserver_description: {    
        ru: 'Нажмите для выбора TorrServer из',    
        en: 'Click to select TorrServer from',    
        uk: 'Натисніть для вибору TorrServer з',    
        zh: '点击从目录中选择TorrServer'    
      },    
      bat_torrserver_current: {    
        ru: 'Текущий выбор:',    
        en: 'Current selection:',    
        uk: 'Поточний вибір:',    
        zh: '当前选择：'    
      },    
      bat_torrserver_none: {    
        ru: 'Не выбран',    
        en: 'Not selected',    
        uk: 'Не вибрано',    
        zh: '未选择'    
      },    
      bat_torrserver_selected_label: {    
        ru: 'Выбрано:',    
        en: 'Selected:',    
        uk: 'Обрано:',    
        zh: '已选择：'    
      },    
    
      bat_check_servers: {    
        ru: 'Проверить доступность серверов',    
        en: 'Check servers availability',    
        uk: 'Перевірити доступність серверів',    
        zh: '检查服务器可用性'    
      },    
      bat_check_done: {    
        ru: 'Проверку завершено',    
        en: 'Check completed',    
        uk: 'Перевірку завершено',    
        zh: '检查完成'    
      },    
    
      // Speed-based status    
      bat_status_checking_server: {    
        ru: 'Проверка сервера…',    
        en: 'Checking server…',    
        uk: 'Перевірка сервера…',    
        zh: '检查服务器…'    
      },    
      bat_status_server_ok: {    
        ru: 'Сервер доступен',    
        en: 'Server available',    
        uk: 'Сервер доступний',    
        zh: '服务器可用'    
      },    
      bat_status_server_bad: {    
        ru: 'Сервер недоступен',    
        en: 'Server unavailable',    
        uk: 'Сервер недоступний',    
        zh: '服务器不可用'    
      },    
      bat_status_unknown: {    
        ru: 'Не проверен',    
        en: 'Unchecked',    
        uk: 'Не перевірено',    
        zh: '未检查'    
      }    
    });    
  }    
    
  var Lang = { translate: translate };    
    
  /* =========================    
   * 2) Список TorrServers    
   * ========================= */    
  var serversInfo = [    
    {    
      base: 'ts_maxvol_pro',    
      name: 'ts.maxvol.pro',    
      settings: { url: 'ts.maxvol.pro', login: '', password: '' }    
    },    
    {    
      base: 'lam_maxvol_pro_ts',    
      name: 'lam.maxvol.pro/ts',    
      settings: { url: 'lam.maxvol.pro/ts', login: '', password: '' }    
    },    
    {    
      base: 'tytowqus_deploy_cx_ts',    
      name: 'tytowqus.deploy.cx/ts',    
      settings: { url: 'tytowqus.deploy.cx/ts', login: '', password: '' }    
    },    
    {    
      base: '109_120_158_107_8090',    
      name: '109.120.158.107:8090',    
      settings: { url: '109.120.158.107:8090', login: '', password: '' }    
    },    
    {    
      base: '185_252_215_15_8080',    
      name: '185.252.215.15:8080',    
      settings: { url: '185.252.215.15:8080', login: '', password: '' }    
    },    
    {    
      base: '78_40_195_218_9118_ts',    
      name: '78.40.195.218:9118/ts',    
      settings: { url: '78.40.195.218:9118/ts', login: '', password: '' }    
    },    
    {    
      base: '45_144_154_144_8090',    
      name: '45.144.154.144:8090',    
      settings: { url: '45.144.154.144:8090', login: '', password: '' }    
    },    
    {    
      base: '77_238_228_41_8290',    
      name: '77.238.228.41:8290',    
      settings: { url: '77.238.228.41:8290', login: '', password: '' }    
    },    
    {    
      base: '178_150_255_251_8090',    
      name: '178.150.255.251:8090',    
      settings: { url: '178.150.255.251:8090', login: '', password: '' }    
    },    
    {    
      base: '46_174_120_237_8090',    
      name: '46.174.120.237:8090',    
      settings: { url: '46.174.120.237:8090', login: '', password: '' }    
    }    
  ];    
    
  /* =========================    
   * 3) Константи/хелпери    
   * ========================= */    
  var STORAGE_KEY = 'bat_torrserver_selected';    
  var NO_SERVER = 'no_server';    
    
  // Кольори    
  var COLOR_OK = '#1aff00';    
  var COLOR_BAD = '#ff2e36';    
  var COLOR_WARN = '#f3d900';    
  var COLOR_UNKNOWN = '#8c8c8c';    
    
  // Кеш: speed 30 сек    
  var cache = {    
    data: {},    
    ttlSpeed: 30 * 1000,    
    get: function (key) {    
      var v = this.data[key];    
      if (v && Date.now() < v.expiresAt) return v;    
      return null;    
    },    
    set: function (key, value, ttl) {    
      this.data[key] = { value: value, expiresAt: Date.now() + ttl };    
    }    
  };    
    
  function notifyDone() {    
    var text = Lampa.Lang.translate('bat_check_done');    
    try {    
      if (Lampa.Noty && typeof Lampa.Noty.show === 'function') {    
        Lampa.Noty.show(text);    
        return;    
      }    
      if (Lampa.Toast && typeof Lampa.Toast.show === 'function') {    
        Lampa.Toast.show(text);    
        return;    
      }    
    } catch (e) {}    
    alert(text);    
  }    
    
  function getSelectedBase() {    
    return Lampa.Storage.get(STORAGE_KEY, NO_SERVER);    
  }    
    
  function getServerByBase(base) {    
    return serversInfo.find(function (s) { return s.base === base; });    
  }    
    
  function applySelectedServer(base) {    
    if (!base || base === NO_SERVER) return false;    
    
    var s = getServerByBase(base);    
    if (!s || !s.settings) return false;    
    
    var settings = s.settings;    
    
    Lampa.Storage.set('torrserver_url', settings.url);    
    Lampa.Storage.set('torrserver_login', settings.login || '');    
    Lampa.Storage.set('torrserver_password', settings.password || '');    
    
    return true;    
  }    
    
  function updateSelectedLabelInSettings() {    
    var base = getSelectedBase();    
    var server = getServerByBase(base);    
    var name = server ? server.name : Lampa.Lang.translate('bat_torrserver_none');    
    var text = Lampa.Lang.translate('bat_torrserver_selected_label') + " " + name;    
    $('.bat-torrserver-selected').text(text);    
  }    
    
  // Протоколи: якщо протокол вже заданий у url — лише ""    
  function protocolCandidatesFor(url) {    
    if (/^https?:\/\//i.test(url)) return [''];    
    return ['http://', 'https://']; // спочатку http для TorrServer    
  }    
    
  // Послідовно пробуємо URL і повертаємо перший результат    
  function ajaxTryUrls(urls, timeout) {    
    return new Promise(function (resolve) {    
      var idx = 0;    
    
      function attempt() {    
        if (idx >= urls.length) {    
          resolve({ ok: false, xhr: null, url: null, network: true });    
          return;    
        }    
    
        var url = urls[idx++];    
        $.ajax({    
          url: url,    
          method: 'GET',    
          timeout: timeout,    
          success: function (data, textStatus, xhr) {    
            resolve({ ok: true, xhr: xhr, url: url, data: data });    
          },    
          error: function (xhr) {    
            var status = xhr && typeof xhr.status === 'number' ? xhr.status : 0;    
            var isNetwork = (status === 0);    
            if (isNetwork) attempt();    
            else resolve({ ok: false, xhr: xhr, url: url, network: false });    
          }    
        });    
      }    
    
      attempt();    
    });    
  }    
    
  /* =========================    
   * 4) Перевірка швидкості (замість health/connection)    
   * ========================= */    
    
  // Speed test candidates для TorrServer    
  function speedUrlCandidates(server) {    
    var url = server.settings.url;    
    var protos = protocolCandidatesFor(url);    
    
    return protos.map(function (p) { return p + url + '/download/300'; });    
  }    
    
  // Speed test для TorrServer - аналогічно до speedtest.js    
  function runSpeedChecks(servers) {    
    var map = {}; // base -> {color,labelKey}    
    
    var requests = servers.map(function (server) {    
      return new Promise(function (resolve) {    
        var urls = speedUrlCandidates(server);    
        var cacheKey = 'speed::' + server.base + '::' + urls.join('|');    
        var cached = cache.get(cacheKey);    
    
        if (cached) {    
          map[server.base] = cached.value;    
          resolve();    
          return;    
        }    
    
        // Використовуємо логіку з speedtest.js    
        var xmlHTTP = new XMLHttpRequest();    
        var startTime;    
        var speedDetected = false;    
    
        function testSpeed(url) {    
          return new Promise(function (resolveSpeed) {    
            xmlHTTP.open('GET', url + '?vr=' + Date.now(), true);    
            xmlHTTP.responseType = 'arraybuffer';    
    
            xmlHTTP.onprogress = function(e) {    
              if (!startTime || speedDetected) return;    
    
              var load = e.timeStamp - startTime;    
              if (load > 1000) { // Чекаємо 1 секунду для вимірювання    
                var speed = Math.ceil(e.loaded * 8000 / load); // Біт в секунду    
                var speedMbps = speed / 1000 / 1000;    
    
                if (speedMbps > 0.1) { // Якщо є хоч якась швидкість    
                  speedDetected = true;    
                  xmlHTTP.abort();    
                  resolveSpeed(true);    
                }    
              }    
            };    
    
            xmlHTTP.onreadystatechange = function (e) {    
              if (xmlHTTP.readyState === 2) {    
                startTime = e.timeStamp;    
              }    
            };    
    
            xmlHTTP.onload = function() {    
              resolveSpeed(speedDetected);    
            };    
    
            xmlHTTP.onerror = function() {    
              resolveSpeed(false);    
            };    
    
            xmlHTTP.ontimeout = function() {    
              resolveSpeed(false);    
            };    
    
            xmlHTTP.timeout = 5000; // 5 секунд таймаут    
            xmlHTTP.send();    
          });    
        }    
    
        // Пробуємо перший URL    
        testSpeed(urls[0]).then(function (success) {    
          var val = success    
            ? { color: COLOR_OK, labelKey: 'bat_status_server_ok' }    
            : { color: COLOR_BAD, labelKey: 'bat_status_server_bad' };    
    
          map[server.base] = val;    
          cache.set(cacheKey, val, cache.ttlSpeed);    
          resolve();    
        });    
      });    
    });    
    
    return Promise.all(requests).then(function () { return map; });    
  }    
    
  /* =========================    
   * 5) Модалка (UI) + "лампочка"    
   * ========================= */    
    
  function injectStyleOnce() {    
    if (window.__bat_torrserver_modal_style__) return;    
    window.__bat_torrserver_modal_style__ = true;    
    
    var css =    
      ".bat-torrserver-modal{display:flex;flex-direction:column;gap:1em}" +    
      ".bat-torrserver-modal__head{display:flex;align-items:center;justify-content:space-between;gap:1em}" +    
      ".bat-torrserver-modal__current-label{font-size:.9em;opacity:.7}" +    
      ".bat-torrserver-modal__current-value{font-size:1.1em}" +    
    
      ".bat-torrserver-modal__list{display:flex;flex-direction:column;gap:.6em}" +    
      ".bat-torrserver-modal__item{display:flex;align-items:center;justify-content:space-between;gap:1em;padding:.8em 1em;border-radius:.7em;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08)}" +    
      ".bat-torrserver-modal__item.is-selected,.bat-torrserver-modal__item.focus{border-color:#fff}" +    
    
      ".bat-torrserver-modal__left{display:flex;align-items:center;gap:.65em;min-width:0}" +    
      ".bat-torrserver-modal__dot{width:.55em;height:.55em;border-radius:50%;background:" + COLOR_UNKNOWN + ";box-shadow:0 0 .6em rgba(0,0,0,.35);flex:0 0 auto}" +    
      ".bat-torrserver-modal__name{font-size:1em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +    
      ".bat-torrserver-modal__status{font-size:.85em;opacity:.75;text-align:right;flex:0 0 auto}" +    
    
      ".bat-torrserver-modal__actions{display:flex;gap:.6em;flex-wrap:wrap}" +    
      ".bat-torrserver-modal__action{padding:.55em .9em;border-radius:.6em;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2)}" +    
      ".bat-torrserver-modal__action.focus{border-color:#fff}";    
    
    var style = document.createElement('style');    
    style.type = 'text/css';    
    style.appendChild(document.createTextNode(css));    
    document.head.appendChild(style);    
  }    
    
  function buildServerItem(base, name) {    
    var item = $(    
      "<div class='bat-torrserver-modal__item selector' data-base='" + base + "'>" +    
        "<div class='bat-torrserver-modal__left'>" +    
          "<span class='bat-torrserver-modal__dot'></span>" +    
          "<div class='bat-torrserver-modal__name'></div>" +    
        "</div>" +    
        "<div class='bat-torrserver-modal__status'></div>" +    
      "</div>"    
    );    
    
    item.find('.bat-torrserver-modal__name').text(name);  
      item.find('.bat-torrserver-modal__name').text(name);  
    item.find('.bat-torrserver-modal__status').text(Lampa.Lang.translate('bat_status_checking_server'));  
    item.find('.bat-torrserver-modal__dot').css('background-color', COLOR_UNKNOWN);  
  
    return item;  
  }  
  
  function setItemStatus(item, color, labelKey) {  
    item.find('.bat-torrserver-modal__dot').css('background-color', color);  
    item.find('.bat-torrserver-modal__status').text(Lampa.Lang.translate(labelKey));  
  }  
  
  function applySelection(list, base) {  
    list.find('.bat-torrserver-modal__item').removeClass('is-selected');  
    list.find("[data-base='" + base + "']").addClass('is-selected');  
  }  
  
  function updateCurrentLabel(wrapper, base) {  
    var server = getServerByBase(base);  
    var label = server ? server.name : Lampa.Lang.translate('bat_torrserver_none');  
    wrapper.find('.bat-torrserver-modal__current-value').text(label).data('base', base);  
  }  
  
  // Перевірка на основі швидкості як у speedtest.js  
  function checkServerSpeed(server, item) {  
    var url = server.settings.url;  
    var protos = protocolCandidatesFor(url);  
      
    // Пробуємо кожен протокол по черзі  
    function tryProtocol(protocolIndex) {  
      if (protocolIndex >= protos.length) {  
        setItemStatus(item, COLOR_BAD, 'bat_status_server_bad');  
        return;  
      }  
  
      var testUrl = protos[protocolIndex] + url + '/download/300';  
      var startTime = Date.now();  
      var loadedBytes = 0;  
        
      var xhr = new XMLHttpRequest();  
      xhr.open('GET', testUrl, true);  
      xhr.responseType = 'blob';  
        
      xhr.onprogress = function(e) {  
        if (e.lengthComputable) {  
          loadedBytes = e.loaded;  
          var elapsed = (Date.now() - startTime) / 1000;  
          var speed = (loadedBytes / elapsed) / 1024 / 1024; // Mbps  
            
          // Якщо швидкість більше 0.1 Mbps, вважаємо сервер доступним  
          if (speed > 0.1) {  
            xhr.abort();  
            setItemStatus(item, COLOR_OK, 'bat_status_server_ok');  
          }  
        }  
      };  
        
      xhr.onload = function() {  
        if (xhr.status === 200) {  
          setItemStatus(item, COLOR_OK, 'bat_status_server_ok');  
        } else {  
          tryProtocol(protocolIndex + 1);  
        }  
      };  
        
      xhr.onerror = function() {  
        tryProtocol(protocolIndex + 1);  
      };  
        
      xhr.timeout = 5000;  
      xhr.ontimeout = function() {  
        tryProtocol(protocolIndex + 1);  
      };  
        
      xhr.send();  
    }  
      
    tryProtocol(0);  
  }  
  
  function runSpeedCheck(list) {  
    var items = list.find('.bat-torrserver-modal__item');  
      
    items.each(function() {  
      var base = $(this).data('base');  
      var server = getServerByBase(base);  
      if (server) {  
        checkServerSpeed(server, $(this));  
      }  
    });  
  }  
  
  function openTorrServerModal() {  
    injectStyleOnce();  
  
    var selected = getSelectedBase();  
  
    var modal = $(  
      "<div class='bat-torrserver-modal'>" +  
        "<div class='bat-torrserver-modal__head'>" +  
          "<div class='bat-torrserver-modal__current'>" +  
            "<div class='bat-torrserver-modal__current-label'>" + Lampa.Lang.translate('bat_torrserver_current') + "</div>" +  
            "<div class='bat-torrserver-modal__current-value'></div>" +  
          "</div>" +  
          "<div class='bat-torrserver-modal__actions'>" +  
            "<div class='bat-torrserver-modal__action selector' data-action='check'>" +  
              Lampa.Lang.translate('bat_check_servers') +  
            "</div>" +  
          "</div>" +  
        "</div>" +  
        "<div class='bat-torrserver-modal__list'></div>" +  
      "</div>"  
    );  
  
    var list = modal.find('.bat-torrserver-modal__list');  
    var head = modal.find('.bat-torrserver-modal__head');  
  
    // Додаємо сервери до списку  
    serversInfo.forEach(function(server) {  
      var item = buildServerItem(server.base, server.name);  
      list.append(item);  
    });  
  
    // Встановлюємо поточний вибір  
    applySelection(list, selected);  
    updateCurrentLabel(head, selected);  
  
    // Обробники подій  
    modal.on('hover:enter', '.bat-torrserver-modal__item', function() {  
      var base = $(this).data('base');  
      applySelection(list, base);  
      updateCurrentLabel(head, base);  
    });  
  
    modal.on('hover:enter', '[data-action="check"]', function() {  
      runSpeedCheck(list);  
    });  
  
    // Відкриваємо модалку  
    Lampa.Modal.open({  
      title: Lampa.Lang.translate('bat_torrserver'),  
      html: modal,  
      size: 'medium',  
      scroll_to_center: true,  
      select: modal.find('.bat-torrserver-modal__item').first(),  
      onBack: function() {  
        var selectedBase = head.find('.bat-torrserver-modal__current-value').data('base') || NO_SERVER;  
        applySelectedServer(selectedBase);  
        updateSelectedLabelInSettings();  
          
        Lampa.Modal.close();  
        Lampa.Controller.toggle('settings_component');  
      }  
    });  
  
    // Автоматична перевірка при відкритті  
    runSpeedCheck(list);  
  }  
  
  /* =========================  
   * 6) Інтеграція в Налаштування → TorrServer  
   * ========================= */  
  function torrserverSetting() {  
    applySelectedServer(getSelectedBase());  
  
    Lampa.Settings.listener.follow('open', function(e) {  
      if (e.name === 'server') {  
        $('.bat-torrserver-catalog-btn').remove();  
  
        var btn = $('<div class="settings-param selector bat-torrserver-catalog-btn" data-type="button">' +  
          '<div class="settings-param__name">' + Lampa.Lang.translate('bat_torrserver') + '</div>' +  
          '<div class="settings-param__descr">' +  
            Lampa.Lang.translate('bat_torrserver_description') + " " + serversInfo.length +  
            '<div class="bat-torrserver-selected" style="margin-top:.35em;opacity:.85"></div>' +  
          '</div>' +  
        '</div>');  
  
        btn.on('hover:enter', function() {  
          openTorrServerModal();  
        });  
  
        $('[data-name="torrserver_url"]', e.body).after(btn);  
  
        updateSelectedLabelInSettings();  
  
        if (Lampa.Storage.field('torrserver_use_link')) {  
          btn.show();  
        } else {  
          btn.hide();  
        }  
      }  
    });  
  }  
  
  /* =========================  
   * 7) Запуск плагіна  
   * ========================= */  
  Lampa.Platform.tv();  
  
  function add() {  
    Lang.translate();  
    torrserverSetting();  
  }  
  
  function startPlugin() {  
    window.plugin_bat_torrserver_ready = true;  
  
    if (window.appready) add();  
    else {  
      Lampa.Listener.follow('app', function(e) {  
        if (e.type === 'ready') add();  
      });  
    }  
  }  
  
  if (!window.plugin_bat_torrserver_ready) startPlugin();  
  
})();
