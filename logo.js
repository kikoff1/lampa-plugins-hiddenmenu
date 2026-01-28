(function () {
	"use strict";

	/* =======================
	   LOCALIZATION
	======================= */

	var LANG = {
		ru: {
			logos: "Логотипы",
			logos_desc: "Настройки отображения логотипов",
			back: "Назад",
			back_desc: "Вернуться в настройки интерфейса",
			enable: "Отображать",
			disable: "Скрыть",
			logos_instead: "Логотипы вместо названий",
			logos_instead_desc: "Отображает логотипы фильмов вместо текста",
			logo_lang: "Язык логотипа",
			logo_lang_desc: "Приоритетный язык для поиска логотипа",
			size: "Размер логотипа",
			size_desc: "Разрешение загружаемого изображения",
			anim_type: "Тип анимации логотипов",
			anim_type_desc: "Способ анимации логотипов",
			text_height: "Логотип по высоте текста",
			text_height_desc: "Размер логотипа равен высоте текста",
			clear_cache: "Сбросить кеш логотипов",
			clear_cache_desc: "Нажмите для очистки кеша изображений",
			clear_confirm: "Сбросить кеш?",
			yes: "Да",
			no: "Нет",
			original: "Оригинал",
			as_lampa: "Как в Lampa"
		},
		uk: {
			logos: "Логотипи",
			logos_desc: "Налаштування відображення логотипів",
			back: "Назад",
			back_desc: "Повернутися до налаштувань інтерфейсу",
			enable: "Показувати",
			disable: "Приховати",
			logos_instead: "Логотипи замість назв",
			logos_instead_desc: "Відображає логотипи фільмів замість тексту",
			logo_lang: "Мова логотипу",
			logo_lang_desc: "Пріоритетна мова для пошуку логотипу",
			size: "Розмір логотипу",
			size_desc: "Роздільна здатність завантажуваного зображення",
			anim_type: "Тип анімації логотипів",
			anim_type_desc: "Спосіб анімації логотипів",
			text_height: "Логотип за висотою тексту",
			text_height_desc: "Розмір логотипу дорівнює висоті тексту",
			clear_cache: "Очистити кеш логотипів",
			clear_cache_desc: "Натисніть для очищення кешу",
			clear_confirm: "Очистити кеш?",
			yes: "Так",
			no: "Ні",
			original: "Оригінал",
			as_lampa: "Як у Lampa"
		}
	};

	function t(key) {
		var lang = Lampa.Storage.get("language", "ru");
		if (!LANG[lang]) lang = "ru";
		return LANG[lang][key] || key;
	}

	/* =======================
	   ORIGINAL PLUGIN (1:1)
	======================= */

	var DISABLE_CACHE = false;

	function startPlugin() {
		var SAFE_DELAY = 200;
		var FADE_OUT_TEXT = 300;
		var MORPH_HEIGHT = 400;
		var FADE_IN_IMG = 400;

		var TARGET_WIDTH = "7em";
		var PADDING_TOP_EM = 0;
		var PADDING_BOTTOM_EM = 0.2;

		window.logoplugin = true;

		function animateHeight(el, start, end, dur, cb) {
			var st = null;
			function step(ts) {
				if (!st) st = ts;
				var p = Math.min((ts - st) / dur, 1);
				var e = 1 - Math.pow(1 - p, 3);
				el.style.height = start + (end - start) * e + "px";
				p < 1 ? requestAnimationFrame(step) : cb && cb();
			}
			requestAnimationFrame(step);
		}

		function animateOpacity(el, s, e, d, cb) {
			var st = null;
			function step(ts) {
				if (!st) st = ts;
				var p = Math.min((ts - st) / d, 1);
				var k = 1 - Math.pow(1 - p, 3);
				el.style.opacity = s + (e - s) * k;
				p < 1 ? requestAnimationFrame(step) : cb && cb();
			}
			requestAnimationFrame(step);
		}

		function getCacheKey(type, id, lang) {
			return "logo_cache_width_based_v1_" + type + "_" + id + "_" + lang;
		}

		function applyFinalStyles(img, cont, has_tagline, text_h) {
			if (cont) {
				cont.style.height = "";
				cont.style.overflow = "";
				cont.style.display = "";
				cont.style.transition = "none";
				cont.style.boxSizing = "";
			}

			img.style.margin = "0";
			img.style.paddingTop = PADDING_TOP_EM + "em";

			var pb = window.innerWidth < 768 && has_tagline ? 0.5 : PADDING_BOTTOM_EM;
			img.style.paddingBottom = pb + "em";

			var use_text_h = Lampa.Storage.get("logo_use_text_height", false);

			if (use_text_h && text_h) {
				img.style.height = text_h + "px";
				img.style.width = "auto";
			} else {
				img.style.width = window.innerWidth < 768 ? "100%" : TARGET_WIDTH;
				img.style.height = "auto";
			}

			img.style.maxWidth = "100%";
			img.style.objectFit = "contain";
			img.style.objectPosition = "left bottom";
			img.style.opacity = "1";
		}

		Lampa.Listener.follow("full", function (e) {
			if (e.type !== "complite" || Lampa.Storage.get("logo_glav") == "1") return;

			var data = e.data.movie;
			var type = data.name ? "tv" : "movie";

			var title = e.object.activity.render().find(".full-start-new__title");
			var dom = title[0];
			if (!dom) return;

			var lang =
				Lampa.Storage.get("logo_lang") ||
				Lampa.Storage.get("language");

			var size = Lampa.Storage.get("logo_size", "original");
			var cache = getCacheKey(type, data.id, lang);

			function startAnim(url, save) {
				if (save && !DISABLE_CACHE) Lampa.Storage.set(cache, url);

				var img = new Image();
				img.src = url;
				img.style.opacity = "0";

				var start_h = dom.getBoundingClientRect().height;

				img.onload = function () {
					setTimeout(function () {
						var anim = Lampa.Storage.get("logo_animation_type", "css");

						if (anim === "js") {
							animateOpacity(dom, 1, 0, FADE_OUT_TEXT, function () {
								title.empty().append(img);
								dom.style.height = start_h + "px";

								var target_h = dom.getBoundingClientRect().height;

								animateHeight(dom, start_h, target_h, MORPH_HEIGHT, function () {
									applyFinalStyles(img, dom, false, start_h);
								});

								setTimeout(function () {
									animateOpacity(img, 0, 1, FADE_IN_IMG);
								}, MORPH_HEIGHT - 100);
							});
						} else {
							title.css({ opacity: "0" });
							setTimeout(function () {
								title.empty().append(img).css({ opacity: "1" });
								applyFinalStyles(img, dom, false, start_h);
								img.style.transition =
									"opacity " + FADE_IN_IMG / 1000 + "s";
								img.style.opacity = "1";
							}, FADE_OUT_TEXT);
						}
					}, SAFE_DELAY);
				};
			}

			var cached = Lampa.Storage.get(cache);
			if (cached && cached !== "none") {
				startAnim(cached, false);
				return;
			}

			if (!data.id) return;

			$.get(
				Lampa.TMDB.api(
					type +
						"/" +
						data.id +
						"/images?api_key=" +
						Lampa.TMDB.key() +
						"&include_image_language=" +
						lang +
						",en,null"
				),
				function (api) {
					if (!api.logos || !api.logos.length) return;

					var logo =
						api.logos.find(function (l) {
							return l.iso_639_1 === lang;
						}) ||
						api.logos.find(function (l) {
							return l.iso_639_1 === "en";
						}) ||
						api.logos[0];

					startAnim(
						Lampa.TMDB.image(
							"/t/p/" + size + logo.file_path.replace(".svg", ".png")
						),
						true
					);
				}
			);
		});
	}

	/* =======================
	   SETTINGS
	======================= */

	var C = "logo_settings_nested";

	Lampa.Settings.listener.follow("open", function (e) {
		if (e.name === "main") {
			Lampa.SettingsApi.addComponent({ component: C, name: t("logos") });
			Lampa.Settings.main().update();
		}
	});

	Lampa.SettingsApi.addParam({
		component: "interface",
		param: { type: "static" },
		field: { name: t("logos"), description: t("logos_desc") 
  icon: "picture" 
},
		onRender: function (i) {
			i.on("hover:enter", function () {
				Lampa.Settings.create(C);
			});
		}
	});

	Lampa.SettingsApi.addParam({
		component: C,
		param: { name: "logo_glav", type: "select", values: { 0: t("enable"), 1: t("disable") }, default: "0" },
		field: { name: t("logos_instead"), description: t("logos_instead_desc") }
	});

	Lampa.SettingsApi.addParam({
		component: C,
		param: { name: "logo_lang", type: "select", values: { "": t("as_lampa"), ru: "Русский", uk: "Українська", en: "English" } },
		field: { name: t("logo_lang"), description: t("logo_lang_desc") }
	});

	Lampa.SettingsApi.addParam({
		component: C,
		param: { name: "logo_size", type: "select", values: { w300: "w300", w500: "w500", w780: "w780", original: t("original") }, default: "original" },
		field: { name: t("size"), description: t("size_desc") }
	});

	Lampa.SettingsApi.addParam({
		component: C,
		param: { name: "logo_animation_type", type: "select", values: { js: "JavaScript", css: "CSS" }, default: "css" },
		field: { name: t("anim_type"), description: t("anim_type_desc") }
	});

	Lampa.SettingsApi.addParam({
		component: C,
		param: { name: "logo_use_text_height", type: "trigger" },
		field: { name: t("text_height"), description: t("text_height_desc") }
	});

	Lampa.SettingsApi.addParam({
		component: C,
		param: { type: "button" },
		field: { name: t("clear_cache"), description: t("clear_cache_desc") },
		onChange: function () {
			Lampa.Select.show({
				title: t("clear_confirm"),
				items: [{ title: t("yes"), confirm: true }, { title: t("no") }],
				onSelect: function (a) {
					if (a.confirm) {
						Object.keys(localStorage).forEach(function (k) {
							if (k.indexOf("logo_cache_width_based_v1_") === 0)
								localStorage.removeItem(k);
						});
						location.reload();
					}
				}
			});
		}
	});

	if (!window.logoplugin) startPlugin();
})();


