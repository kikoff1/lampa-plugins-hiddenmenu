// v3 IIFE - самовикликаюча функція для ізоляції плагіна
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
      bat_speed_mbps: {
        ru: 'Мбит/с',
        en: 'Mbps',
        uk: 'Мбіт/с',
        zh: 'Mbps'
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

  /* =========================
   * 2) TorrServers
   * ========================= */
  var serversInfo = [
    { base: 'lam_maxvol_pro_ts', name: 'lam.maxvol.pro/ts', settings: { url: 'lam.maxvol.pro/ts' } },
    { base: '109_120_158_107_8090', name: '109.120.158.107:8090', settings: { url: '109.120.158.107:8090' } }
  ];

  /* =========================
   * 3) Helpers / constants
   * ========================= */
  var COLOR_OK = '#1aff00';
  var COLOR_BAD = '#ff2e36';
  var COLOR_WARN = '#f3d900';
  var COLOR_UNKNOWN = '#8c8c8c';

  function protocolCandidatesFor(url) {
    if (/^\d+\.\d+\.\d+\.\d+/.test(url)) return ['http://'];
    if (/^https?:\/\//i.test(url)) return [''];
    return ['http://', 'https://'];
  }

  function healthUrlCandidates(server) {
    var url = server.settings.url;
    var protos = protocolCandidatesFor(url);

    return protos.map(function (p) {
      var direct = p + url + '/download/300';
      return {
        direct: direct,
        proxy: 'https://cub.red/proxy/' + encodeURIComponent(direct)
      };
    });
  }

  /* =========================
   * 4) Hybrid request
   * ========================= */
  function tryHybridRequest(candidates, timeout) {
    return new Promise(function (resolve) {
      var i = 0;

      function next() {
        if (i >= candidates.length) {
          resolve({ ok: false, network: true });
          return;
        }

        var c = candidates[i++];

        // 1️⃣ Native request (NO CORS)
        if (Lampa.Request) {
          Lampa.Request.get({
            url: c.direct,
            timeout: timeout,
            success: function () {
              resolve({ ok: true });
            },
            error: function () {
              proxyTry();
            }
          });
        } else {
          proxyTry();
        }

        // 2️⃣ Proxy fallback
        function proxyTry() {
          $.ajax({
            url: c.proxy,
            method: 'GET',
            timeout: timeout,
            success: function () {
              resolve({ ok: true });
            },
            error: function () {
              next();
            }
          });
        }
      }

      next();
    });
  }

  /* =========================
   * 5) Health check
   * ========================= */
  function runHealthChecks(servers) {
    var map = {};
    var index = 0;

    return new Promise(function (resolve) {
      function next() {
        if (index >= servers.length) {
          resolve(map);
          return;
        }

        var server = servers[index++];
        var urls = healthUrlCandidates(server);

        tryHybridRequest(urls, 5000).then(function (res) {
          map[server.base] = res.ok
            ? { color: COLOR_OK, labelKey: 'bat_status_server_ok', speed: '0.0' }
            : { color: COLOR_BAD, labelKey: 'bat_status_server_bad', speed: null };
          next();
        });
      }

      next();
    });
  }

  /* =========================
   * 6) Init
   * ========================= */
  function start() {
    translate();
    runHealthChecks(serversInfo);
  }

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }

})();
