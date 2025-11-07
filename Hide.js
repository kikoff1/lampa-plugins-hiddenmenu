(function() {
	'use strict';

  // ==========================
  // 🈴 МОВНА ПІДТРИМКА
  // ==========================
	Lampa.Lang.add({
		search: { ru: 'Поиск', en: 'Search', uk: 'Пошук', zh: '搜索' },
		settings: { ru: 'Настройки', en: 'Settings', uk: 'Налаштування', zh: '设置' },
		premium: { ru: 'Премиум', en: 'Premium', uk: 'Преміум', zh: '高级' },
		profile: { ru: 'Профиль', en: 'Profile', uk: 'Профіль', zh: '个人资料' },
		feed: { ru: 'Новости', en: 'Feed', uk: 'Новини', zh: '动态' },
		notice: { ru: 'Уведомления', en: 'Notifications', uk: 'Сповіщення', zh: '通知' },
		broadcast: { ru: 'Вещание', en: 'Broadcast', uk: 'Мовлення', zh: '广播' },
		fullscreen: { ru: 'Полноэкранный режим', en: 'Fullscreen mode', uk: 'Повноекранний режим', zh: '全屏模式' },
		reload: { ru: 'Обновление страницы', en: 'Page reload', uk: 'Оновлення сторінки', zh: '页面重新加载' },
		blackfriday: { ru: 'Черная пятница', en: 'Black Friday', uk: 'Чорна п’ятниця', zh: '黑色星期五' },
		split: { ru: 'Разделитель', en: 'Divider', uk: 'Розділювач', zh: '分隔符' },
		time: { ru: 'Время', en: 'Time', uk: 'Годинник', zh: '时间' },
		name_menu: { ru: 'Отображать в шапке', en: 'Display in header', uk: 'Відображати у шапці', zh: '在标题中显示' },
		name_plugin: { ru: 'Настройка шапки', en: 'Header settings', uk: 'Налаштування шапки', zh: '帽子设置' },
		plugin_description: { ru: 'Плагин для настройки шапки', en: 'Plugin for customizing the header', uk: 'Плагін для налаштування шапки', zh: '用于配置上限的插件' }
	});

  // ==========================
  // ⚙️ ОСНОВНИЙ ПЛАГІН
  // ==========================
	function startPlugin() {
		var manifest = {
			type: 'other',
			version: '0.3.0',
			name: Lampa.Lang.translate('name_plugin'),
			description: Lampa.Lang.translate('plugin_description'),
			component: 'head_filter',
		};
		Lampa.Manifest.plugins = manifest;

		// ==========================
		// 🧩 НАЛАШТУВАННЯ ЕЛЕМЕНТІВ
		// ==========================
		var head = {
			'head_filter_show_search': {name:Lampa.Lang.translate('search'), element: '.open--search'},
			'head_filter_show_settings': {name:Lampa.Lang.translate('settings'), element: '.open--settings'}, 
			'head_filter_show_premium': {name:Lampa.Lang.translate('premium'), element: '.open--premium'}, 
			'head_filter_show_profile': {name: Lampa.Lang.translate('profile'), element: '.open--profile'}, 
			'head_filter_show_feed': {name: Lampa.Lang.translate('feed'), element: '.open--feed'}, 
			'head_filter_show_notice': {name: Lampa.Lang.translate('notice'), element: '.open--notice'},
			'head_filter_show_broadcast': {name: Lampa.Lang.translate('broadcast'), element: '.open--broadcast'},
			'head_filter_show_fullscreen': {name: Lampa.Lang.translate('fullscreen'), element: '.full-screen'}, 
			'head_filter_show_reload': {name: Lampa.Lang.translate('reload'), element: '.m-reload-screen'},
			'head_filter_show_blackfriday': {name: Lampa.Lang.translate('blackfriday'), element: '.black-friday__button'}, 
			'head_filter_show_split': {name: Lampa.Lang.translate('split'), element: '.head__split'}, 
			'head_filter_show_time': {name: Lampa.Lang.translate('time'), element: '.head__time'}, 
		};

		// ==========================
		// 👁️ ФУНКЦІЯ ПОКАЗУ/ПРИХОВАННЯ
		// ==========================
		function showHideElement(element, show) {
			if ($(element).length) {
				if (show) $(element).show();
				else $(element).hide();
			}
		}

		// ==========================
		// 🧠 СЛУХАЧ ЗМІН
		// ==========================
		Lampa.Storage.listener.follow('change', function(event) {
			if (event.name == 'activity') {
				setTimeout(function() {
					Object.keys(head).forEach(function(key) {
						var show_element = Lampa.Storage.get(key, true); 
						showHideElement(head[key].element, show_element);     
					});
					applyHeadOrder();
				}, 1000);
			} else if (event.name in head) {
				var show_element = Lampa.Storage.get(event.name, true); 
				showHideElement(head[event.name].element, show_element);     
			}
		});

    // ==========================
    // 🧩 ДОДАЄМО НАЛАШТУВАННЯ
    // ==========================
		Lampa.Template.add('settings_head_filter',`<div></div>`);

		Lampa.SettingsApi.addParam({
			component: 'interface',
			param: { type: 'button' },
			field: {
				name: Lampa.Lang.translate('name_plugin'),
				description: Lampa.Lang.translate('plugin_description')
			},
			onChange: ()=>{
				Lampa.Settings.create('head_filter',{
					onBack: ()=> Lampa.Settings.create('interface')
				})
			}
		});   

		Lampa.SettingsApi.addParam({
			component: 'head_filter',
			param: { type: 'title' },
			field: { name:Lampa.Lang.translate('name_menu') }
		});   

		Object.keys(head).forEach(function(key) {
			Lampa.SettingsApi.addParam({
				component: 'head_filter',
				param: {
					name: key,
					type: 'trigger',
					default: true
				},
				field: { name: head[key].name },
				onRender: function(item) {
					addMoveButtons(item, key);
				}
			});
		});

		// ==========================
		// ⬆️⬇️ SVG ІКОНИ
		// ==========================
		var moveUpIcon = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 12L11 3L20 12" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';
		var moveDownIcon = '<svg width="22" height="14" viewBox="0 0 22 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2 2L11 11L20 2" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>';

		// ==========================
		// 🎚️ ДОДАТИ КНОПКИ ПЕРЕМІЩЕННЯ
		// ==========================
		function addMoveButtons(item, key) {
			var $item = $(item);
			var name = head[key].name;
			var $up = $('<div class="menu-hide-move move-up selector">' + moveUpIcon + '</div>');
			var $down = $('<div class="menu-hide-move move-down selector">' + moveDownIcon + '</div>');
			
			$item.append($up);
			$item.append($down);

			$up.on('hover:enter', function(e) {
				e.stopPropagation();
				var $prev = $item.prev('.settings-param');
				if ($prev.length) {
					$item.insertBefore($prev);
					saveHeadOrder();
					Lampa.Noty.show(Lampa.Lang.translate('settings_saved'));
				}
			});

			$down.on('hover:enter', function(e) {
				e.stopPropagation();
				var $next = $item.next('.settings-param');
				if ($next.length) {
					$item.insertAfter($next);
					saveHeadOrder();
					Lampa.Noty.show(Lampa.Lang.translate('settings_saved'));
				}
			});
		}

		// ==========================
		// 💾 ЗБЕРЕЖЕННЯ ПОРЯДКУ
		// ==========================
		function saveHeadOrder() {
			var sort = [];
			$('.settings--head_filter .settings-param .settings-param__name').each(function() {
				var name = $(this).text().trim();
				if (name) sort.push(name);
			});
			Lampa.Storage.set('head_filter_sort', sort);
		}

		// ==========================
		// 🔄 ВІДНОВЛЕННЯ ПОРЯДКУ
		// ==========================
		function applyHeadOrder() {
			var items = Lampa.Storage.get('head_filter_sort', []);
			if (items.length) {
				var $menu = $('.head');
				items.forEach(function(name) {
					Object.keys(head).forEach(function(key) {
						if (head[key].name === name) {
							var $el = $(head[key].element);
							if ($el.length) $menu.append($el);
						}
					});
				});
			}
		}

		// ==========================
		// 🎨 ДОДАТКОВІ СТИЛІ
		// ==========================
		var style = `
			.menu-hide-move {
				width: 30px !important;
				height: 30px !important;
				display: flex !important;
				align-items: center !important;
				justify-content: center !important;
				margin-left: 8px !important;
				cursor: pointer !important;
			}
			.menu-hide-move svg {
				width: 20px !important;
				height: 14px !important;
			}
			.menu-hide-move.active {
				color: var(--focus-color);
			}
		`;
		$('<style>').html(style).appendTo('head');
	}

	// ==========================
	// 🚀 ІНІЦІАЛІЗАЦІЯ ПЛАГІНА
	// ==========================
	if (window.appready) {
		startPlugin();
	} else {
		Lampa.Listener.follow('app', function(e) {
			if (e.type == 'ready') startPlugin();
		});
	}
})();
