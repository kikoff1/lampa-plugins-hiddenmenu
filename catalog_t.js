// IIFE - самовикликаюча функція для ізоляції плагіна    
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
    
      bat_status_checking_server: {    
        ru: 'Проверка сервера…',    
        en: 'Checking server…',    
        uk: 'Перевірка сервера…',    
        zh: '正在检查服务器…'    
      },    
      bat_status_server_ok: {    
        ru: 'Доступен',    
        en: 'Available',    
        uk: 'Доступний',    
        zh: '可用'    
      },    
      bat_status_server_bad: {    
        ru: 'Недоступен',    
        en: 'Unavailable',    
        uk: 'Недоступний',    
        zh: '不可用'    
      }    
    });    
  }    
    
  /* =========================    
   * 2) Список серверів    
   * ========================= */    
  var serversInfo = [    
    { base: 'ts_maxvol_pro', name: 'ts.maxvol.pro', settings: { url: 'ts.maxvol.pro', login: '', password: '' } },    
    { base: 'lam_maxvol_pro_ts', name: 'lam.maxvol.pro/ts', settings: { url: 'lam.maxvol.pro/ts', login: '', password: '' } },    
    { base: 'tytowqus_deploy_cx_ts', name: 'tytowqus.deploy.cx/ts', settings: { url: 'tytowqus.deploy.cx/ts', login: '', password: '' } },    
    { base: '109_120_158_107_8090', name: '109.120.158.107:8090', settings: { url: '109.120.158.107:8090', login: '', password: '' } },    
    { base: '185_252_215_15_8080', name: '185.252.215.15:8080', settings: { url: '185.252.215.15:8080', login: '', password: '' } },    
    { base: '78_40_195_218_9118_ts', name: '78.40.195.218:9118/ts', settings: { url: '78.40.195.218:9118/ts', login: '', password: '' } },    
    { base: '45_144_154_144_8090', name: '45.144.154.144:8090', settings: { url: '45.144.154.144:8090', login: '', password: '' } },    
    { base: '77_238_228_41_8290', name: '77.238.228.41:8290', settings: { url: '77.238.228.41:8290', login: '', password: '' } },    
    { base: '178_150_255_251_8090', name: '178.150.255.251:8090', settings: { url: '178.150.255.251:8090', login: '', password: '' } },    
    { base: '46_174_120_237_8090', name: '46.174.120.237:8090', settings: { url: '46.174.120.237:8090', login: '', password: '' } }    
  ];    
    
  /* =========================    
   * 3) Константи та хелпери    
   * ========================= */    
  var NO_SERVER = 'none';    
  var COLOR_OK = '#4CAF50';    
  var COLOR_BAD = '#F44336';    
  var COLOR_UNKNOWN = '#9E9E9E';    
    
  // Кешування для перевірок    
  var cache = {    
    get: function(key) {    
      try {    
        var item = localStorage.getItem('bat_torrserver_cache_' + key);    
        return item ? JSON.parse(item) : null;    
      } catch (e) { return null; }    
    },    
    set: function(key, value, ttl) {    
      try {    
        localStorage.setItem('bat_torrserver_cache_' + key, JSON.stringify({    
          value: value,    
          expires: Date.now() + ttl    
        }));    
      } catch (e) {}    
    },    
    ttlHealth: 30000, // 30 секунд    
    ttlConnection: 900000 // 15 хвилин    
  };    
    
  // Отримання сервера за base    
  function getServerByBase(base) {    
    return serversInfo.find(function(s) { return s.base === base; });    
  }    
    
  // Отримання поточного вибору    
  function getSelectedBase() {    
    var selected = Lampa.Storage.get('bat_torrserver_selected');    
    if (selected && selected !== NO_SERVER) {    
      return selected;    
    }    
    var currentUrl = Lampa.Storage.get('torrserver_url') || Lampa.Storage.get('torrserver_url_two');    
    if (!currentUrl) return NO_SERVER;    
    var server = serversInfo.find(function(s) {    
      return s.settings.url === currentUrl;    
    });    
    return server ? server.base : NO_SERVER;    
  }    
    
  // Застосування вибраного сервера    
  function applySelectedServer(base) {    
    if (base === NO_SERVER) return;    
    var server = getServerByBase(base);    
    if (!server) return;    
    var useTwo = Lampa.Storage.field('torrserver_use_link') === 'two';    
    var storageKey = useTwo ? 'torrserver_url_two' : 'torrserver_url';    
    Lampa.Storage.set(storageKey, server.settings.url);    
    Lampa.Storage.set('bat_torrserver_selected', base);    
  }    
    
  // Кандидати протоколів для URL    
  function protocolCandidatesFor(url) {    
    if (/^https?:\/\//i.test(url)) return [''];    
    return ['http://', 'https://'];    
  }    
    
  // Спроба AJAX з кількома URL    
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
   * 4) Перевірки на основі швидкості  
   * ========================= */  
  
  // Генерація URL для перевірки швидкості як у speedtest.js  
  function healthUrlCandidates(server) {  
    var url = server.settings.url;  
    var protos = protocolCandidatesFor(url);  
  
    return protos.map(function (p) { return p + url + '/download/300'; });  
  }  
  
  // Перевірка швидкості як у speedtest.js [1](#36-0)   
  function checkServerSpeed(server, item) {  
    var urls = healthUrlCandidates(server);  
    var urlIndex = 0;  
  
    function tryNextUrl() {  
      if (urlIndex >= urls.length) {  
        setItemStatus(item, COLOR_BAD, 'bat_status_server_bad');  
        return;  
      }  
  
      var testUrl = urls[urlIndex++];  
      var startTime = Date.now();  
      var loadedBytes = 0;  
      var speedMbps = 0;  
        
      var xhr = new XMLHttpRequest();  
      xhr.open('GET', testUrl + '?vr=' + Date.now(), true);  
      xhr.responseType = 'arraybuffer';  
  
      xhr.onprogress = function(e) {  
        if (!startTime || e.timeStamp <= startTime) return;  
  
        var loadTime = e.timeStamp - startTime;  
        if (loadTime > 0) {  
          speedMbps = (e.loaded * 8 / loadTime / 1000 / 1000).toFixed(2);  
            
          // Якщо швидкість понад 0.1 Mbps, вважаємо сервер доступним  
          if (parseFloat(speedMbps) > 0.1) {  
            xhr.abort();  
            setItemStatus(item, COLOR_OK, 'bat_status_server_ok');  
          }  
        }  
      };  
  
      xhr.onload = function() {  
        if (parseFloat(speedMbps) > 0.1) {  
          setItemStatus(item, COLOR_OK, 'bat_status_server_ok');  
        } else {  
          setItemStatus(item, COLOR_BAD, 'bat_status_server_bad');  
        }  
      };  
  
      xhr.onerror = function() {  
        tryNextUrl();  
      };  
  
      xhr.ontimeout = function() {  
        tryNextUrl();  
      };  
  
      xhr.timeout = 5000;  
      xhr.send();  
    }  
  
    tryNextUrl();  
  }  
  
  // Масова перевірка всіх серверів  
  function runHealthChecks(servers) {  
    var map = {}; // base -> {color,labelKey}  
  
    servers.forEach(function (server) {  
      var item = $('.bat-torrserver-modal__item[data-base="' + server.base + '"]');  
      if (item.length) {  
        checkServerSpeed(server, item);  
      }  
    });  
  
    return Promise.resolve(map);  
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
  
  function updateSelectedLabelInSettings() {  
    var selected = getSelectedBase();  
    var server = getServerByBase(selected);  
    var label = server ? server.name : Lampa.Lang.translate('bat_torrserver_none');  
    $('.bat-torrserver-selected').html(Lampa.Lang.translate('bat_torrserver_selected_label') + ' ' + label);  
  }  
  
  function openTorrServerModal() {  
    injectStyleOnce();  
  
    var selected = getSelectedBase();  
  
    var modal = $(  
      "<div class='bat-torrserver-modal'>" +  
        "<div class='bat-torrserver-modal__head'>" +  
          "<div class='bat-torrserver-modal__current'>" +  
            "<div class='bat-torrserver-modal__current-label'></div>" +  
            "<div class='bat-torrserver-modal__current-value'></div>" +  
          "</div>" +  
          "<div class='bat-torrserver-modal__actions'>" +  
            "<div class='bat-torrserver-modal__action selector' data-check='servers'>" +  
              Lampa.Lang.translate('bat_check_servers') +  
            "</div>" +  
          "</div>" +  
        "</div>" +  
        "<div class='bat-torrserver-modal__list'></div>" +  
      "</div>"  
    );  
  
    // Заповнюємо поточний вибір  
    modal.find('.bat-torrserver-modal__current-label').text(Lampa.Lang.translate('bat_torrserver_current'));  
    updateCurrentLabel(modal, selected);  
  
    // Створюємо список серверів  
    var list = modal.find('.bat-torrserver-modal__list');  
    serversInfo.forEach(function (server) {  
      var item = buildServerItem(server.base, server.name);  
      list.append(item);  
    });  
  
    // Встановлюємо початковий вибір  
    applySelection(list, selected);  
  
    // Обробники вибору сервера  
    list.on('hover:enter', '.bat-torrserver-modal__item', function () {  
      var base = $(this).data('base');  
      applySelection(list, base);  
      updateCurrentLabel(modal, base);  
    });  
  
    // Обробник перевірки  
    modal.find('[data-check="servers"]').on('hover:enter', function () {  
      var btn = $(this);  
      btn.addClass('disabled').text(Lampa.Lang.translate('bat_check_done'));  
        
      runHealthChecks(serversInfo).then(function () {  
        setTimeout(function () {  
          btn.removeClass('disabled').text(Lampa.Lang.translate('bat_check_servers'));  
        }, 2000);  
      });  
    });  
  
    // Відкриваємо модалку  
    Lampa.Modal.open({  
      title: Lampa.Lang.translate('bat_torrserver'),  
      html: modal,  
      size: 'small',  
      onBack: function () {  
        Lampa.Modal.close();  
        Lampa.Controller.toggle('settings_component');  
      },  
      onSelect: function () {  
        Lampa.Controller.collectionAppend(modal.find('.selector'));  
      }  
    });  
  
    // Автоматична перевірка при відкритті  
    runHealthUI();  
  }  
  
  /* =========================  
   * 6) Інтеграція в Налаштування → TorrServer (робочий варіант)  
   * ========================= */  
  function init() {  
    Lampa.Settings.listener.follow('open', function (e) {  
      if (e.name == 'server') {  
        let btn = $(`<div class="settings-param selector" data-type="button">  
          <div class="settings-param__name">📋 ${Lampa.Lang.translate('bat_torrserver')}</div>  
          <div class="settings-param__descr">${Lampa.Lang.translate('bat_torrserver_description')} ${serversInfo.length}  
            <div class="bat-torrserver-selected" style="margin-top:.35em;opacity:.85"></div>  
          </div>  
        </div>`)  
  
        btn.on('hover:enter', () => {  
          openTorrServerModal()  
        })  
  
        $('[data-name="torrserver_url_two"]',e.body).after(btn)  
          
        // Оновлюємо мітку  
        updateSelectedLabelInSettings()  
      }  
    })  
  }  
  
  /* =========================  
   * 7) Запуск плагіна  
   * ========================= */  
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
