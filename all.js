(function () {
  "use strict";

  var timer = setInterval(function () {
    if (typeof Lampa !== "undefined") {
      clearInterval(timer);

      Lampa.Utils.putScriptAsync(
        [

          "https://kikoff1.github.io/lampa-plugins/popular_actors.js",  // популярні актори
          "https://kikoff1.github.io/lampa-plugins/favorite_actors.js". // улюьлені актори

          
        ],
        function () {},
      );
    }
  }, 200);
})();
