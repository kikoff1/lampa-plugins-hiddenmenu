// v2 IIFE - самовикликаюча функція для ізоляції плагіна
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
      bat_check_servers_desc: {
        ru: 'Выполняет проверку доступности TorrServers',
        en: 'Checks TorrServers availability',
        uk: 'Виконує перевірку доступності TorrServers',
        zh: '执行TorrServer可用性检查'
      },
      bat_check_done: {
        ru: 'Проверку завершено',
        en: 'Check completed',
        uk: 'Перевірку завершено',
        zh: '检查完成'
      },
      bat_speed_mbps: {
        ru: 'Мбит/с',
        en: 'Mbps',
        uk: 'Мбіт/с',
        zh: 'Mbps'
      },
      bat_speed_testing: {
        ru: 'Тест швидкості…',
        en: 'Speed test…',
        uk: 'Тест швидкості…',
        zh: '速度测试…'
      },
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
      bat_status_server_warn: {
        ru: 'Сервер отвечает (ограничения)',
        en: 'Server responds (restrictions)',
        uk: 'Сервер відповідає (обмеження)',
        zh: '服务器有响应（受限）'
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
    { base: 'ts_maxvol_pro', name: 'ts.maxvol.pro', settings: { url: 'ts.maxvol.pro' } },
    { base: 'lam_maxvol_pro_ts', name: 'lam.maxvol.pro/ts', settings: { url: 'lam.maxvol.pro/ts' } },
    { base: 'tytowqus_deploy_cx_ts', name: 'tytowqus.deploy.cx/ts', settings: { url: 'tytowqus.deploy.cx/ts' } },
    { base: '109_120_158_107_8090', name: '109.120.158.107:8090', settings: { url: '109.120.158.107:8090' } },
    { base: '185_252_215_15_8080', name: '185.252.215.15:8080', settings: { url: '185.252.215.15:8080' } },
    { base: '78_40_195_218_9118_ts', name: '78.40.195.218:9118/ts', settings: { url: '78.40.195.218:9118/ts' } }
  ];

  /* =========================
   * 3) Хелпери
   * ========================= */
  var STORAGE_KEY = 'bat_torrserver_selected';
  var NO_SERVER = 'no_server';

  var COLOR_OK = '#1aff00';
  var COLOR_BAD = '#ff2e36';
  var COLOR_WARN = '#f3d900';
  var COLOR_UNKNOWN = '#8c8c8c';

  function protocolCandidatesFor(url) {
    if (/^https?:\/\//i.test(url)) return [''];
    return ['http://', 'https://'];
  }

  /* =========================
   * 4) HEALTH (через проксі)
   * ========================= */
  function healthUrlCandidates(server) {
    var url = server.settings.url;
    var protos = protocolCandidatesFor(url);

    // CORS workaround через проксі
    return protos.map(function (p) {
      return 'https://cub.red/proxy/' + p + url + '/download/300';
    });
  }

  function ajaxTryUrls(urls, timeout) {
    return new Promise(function (resolve) {
      var i = 0;
      function next() {
        if (i >= urls.length) {
          resolve({ ok: false, network: true });
          return;
        }
        $.ajax({
          url: urls[i++],
          timeout: timeout,
          success: function () {
            resolve({ ok: true });
          },
          error: function (xhr) {
            if (xhr && xhr.status === 0) next();
            else resolve({ ok: false, network: false });
          }
        });
      }
      next();
    });
  }

  function runHealthChecks(servers) {
    var map = {};
    return new Promise(function (resolve) {
      var idx = 0;
      function next() {
        if (idx >= servers.length) return resolve(map);
        var s = servers[idx++];
        ajaxTryUrls(healthUrlCandidates(s), 5000).then(function (res) {
          map[s.base] = res.ok
            ? { color: COLOR_OK, labelKey: 'bat_status_server_ok', speed: '0.0' }
            : res.network === false
            ? { color: COLOR_WARN, labelKey: 'bat_status_server_warn', speed: null }
            : { color: COLOR_BAD, labelKey: 'bat_status_server_bad', speed: null };
          setTimeout(next, 100);
        });
      }
      next();
    });
  }

  /* =========================
   * 5) UI (без змін)
   * ========================= */
  function openTorrServerModal() {
    var modal = $('<div>Плагін працює. Перевірка серверів…</div>');
    Lampa.Modal.open({
      title: Lampa.Lang.translate('bat_torrserver'),
      html: modal,
      size: 'medium'
    });

    runHealthChecks(serversInfo).then(function () {
      Lampa.Noty.show(Lampa.Lang.translate('bat_check_done'));
    });
  }

  /* =========================
   * 6) Інтеграція в Settings
   * ========================= */
  function torrserverSetting() {
    Lampa.Settings.listener.follow('open', function (e) {
      if (e.name === 'server') {
        var btn = $('<div class="settings-param selector">' +
          '<div class="settings-param__name">' + Lampa.Lang.translate('bat_torrserver') + '</div>' +
          '</div>');
        btn.on('hover:enter', openTorrServerModal);
        $('[data-name="torrserver_url"]', e.body).after(btn);
      }
    });
  }

  /* =========================
   * 7) Старт
   * ========================= */
  Lampa.Platform.tv();

  function start() {
    Lang.translate();
    torrserverSetting();
  }

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }

})();
