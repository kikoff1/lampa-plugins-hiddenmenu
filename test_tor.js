// v2 IIFE
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
        ru: 'Проверить серверы',
        en: 'Check servers',
        uk: 'Перевірити сервери',
        zh: '检查服务器'
      },
      bat_check_done: {
        ru: 'Проверка завершена',
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
        ru: 'Проверка…',
        en: 'Checking…',
        uk: 'Перевірка…',
        zh: '检查中…'
      },
      bat_status_server_ok: {
        ru: 'Сервер доступен',
        en: 'Server available',
        uk: 'Сервер доступний',
        zh: '服务器可用'
      },
      bat_status_server_warn: {
        ru: 'Сервер отвечает (ограничения)',
        en: 'Server responds (restricted)',
        uk: 'Сервер відповідає (обмеження)',
        zh: '服务器响应（受限）'
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
   * 2) Список серверів
   * ========================= */
  var serversInfo = [
    { base: 'ts_maxvol_pro', name: 'ts.maxvol.pro', settings: { url: 'ts.maxvol.pro' } },
    { base: 'lam_maxvol_pro_ts', name: 'lam.maxvol.pro/ts', settings: { url: 'lam.maxvol.pro/ts' } },
    { base: 'tytowqus_deploy_cx_ts', name: 'tytowqus.deploy.cx/ts', settings: { url: 'tytowqus.deploy.cx/ts' } },
    { base: '109_120_158_107_8090', name: '109.120.158.107:8090', settings: { url: '109.120.158.107:8090' } },
    { base: '185_252_215_15_8080', name: '185.252.215.15:8080', settings: { url: '185.252.215.15:8080' } }
  ];

  var STORAGE_KEY = 'bat_torrserver_selected';
  var NO_SERVER = 'no_server';

  var COLOR_OK = '#1aff00';
  var COLOR_BAD = '#ff2e36';
  var COLOR_WARN = '#f3d900';
  var COLOR_UNKNOWN = '#8c8c8c';

  var cache = { data: {}, ttl: 30000 };

  function protocolCandidates(url) {
    if (/^https?:\/\//i.test(url)) return [''];
    return ['http://', 'https://'];
  }

  /* =========================
   * 3) SPEED TEST (як у Lampa)
   * ========================= */
  function speedTest(url, timeout) {
    return new Promise(function (resolve) {
      var start = Date.now();
      var last = start;
      var loaded = 0;
      var maxSpeed = 0;

      Lampa.Request.get(
        url,
        {},
        function () {
          resolve({ ok: true, speed: maxSpeed.toFixed(1) });
        },
        function () {
          resolve({ ok: false });
        },
        {
          timeout: timeout || 8000,
          onprogress: function (e) {
            if (!e || !e.loaded) return;

            var now = Date.now();
            var dt = (now - last) / 1000;
            var db = e.loaded - loaded;

            if (dt > 0) {
              var mbps = (db * 8) / (1024 * 1024 * dt);
              maxSpeed = Math.max(maxSpeed, mbps);
            }

            loaded = e.loaded;
            last = now;
          }
        }
      );
    });
  }

  /* =========================
   * 4) HEALTH + SPEED
   * ========================= */
  function checkServer(server) {
    var protos = protocolCandidates(server.settings.url);
    var size = 5242880; // 5MB
    var urls = protos.map(p => p + server.settings.url + '/download/' + size);

    return new Promise(function (resolve) {
      var i = 0;

      function next() {
        if (i >= urls.length) {
          resolve({ color: COLOR_BAD, labelKey: 'bat_status_server_bad', speed: null });
          return;
        }

        speedTest(urls[i++], 8000).then(function (res) {
          if (res.ok && res.speed) {
            resolve({
              color: COLOR_OK,
              labelKey: 'bat_status_server_ok',
              speed: res.speed
            });
          } else {
            next();
          }
        });
      }

      next();
    });
  }

  /* =========================
   * 5) UI helpers
   * ========================= */
  function setItemStatus(item, color, labelKey, speed) {
    item.find('.bat-dot').css('background', color);
    item.find('.bat-status').text(Lampa.Lang.translate(labelKey));

    if (speed) {
      item.find('.bat-speed')
        .text(' - ' + speed + ' ' + Lampa.Lang.translate('bat_speed_mbps'))
        .css('color', COLOR_OK);
    } else {
      item.find('.bat-speed').text('');
    }
  }

  /* =========================
   * 6) Modal
   * ========================= */
  function openModal() {
    var modal = $('<div></div>');
    var list = $('<div></div>');
    modal.append(list);

    serversInfo.forEach(function (s) {
      var item = $(
        "<div class='selector' data-base='" + s.base + "'>" +
        "<span class='bat-dot'></span> " +
        s.name +
        "<span class='bat-speed'></span> " +
        "<span class='bat-status'></span>" +
        "</div>"
      );

      setItemStatus(item, COLOR_WARN, 'bat_status_checking_server');

      list.append(item);

      checkServer(s).then(function (res) {
        setItemStatus(item, res.color, res.labelKey, res.speed);
      });
    });

    Lampa.Modal.open({
      title: Lampa.Lang.translate('bat_torrserver'),
      html: modal,
      size: 'medium'
    });
  }

  /* =========================
   * 7) Init
   * ========================= */
  function start() {
    translate();

    Lampa.Settings.listener.follow('open', function (e) {
      if (e.name === 'server') {
        var btn = $('<div class="settings-param selector"></div>');
        btn.text(Lampa.Lang.translate('bat_torrserver'));
        btn.on('hover:enter', openModal);
        e.body.append(btn);
      }
    });
  }

  if (window.appready) start();
  else {
    Lampa.Listener.follow('app', function (e) {
      if (e.type === 'ready') start();
    });
  }

})();
