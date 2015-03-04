// Modular JS file
CORE_JS = (function ($) {

	// Breakpoints
	var variableName = '',

		init = function () {
			// runs straigh away
			$("html").removeClass("no-js").addClass("has-js");

			// runs like jQuery normally would when everything is ready
			// run all functions for the site inside the domReady function
			$(domReady); // same as $(document).ready (function () {...});
		},


		// this runs only when we know the whole DOM is ready
		domReady = function () {
		};

	return {
		go : init
	};

})(jQuery);

CORE_JS.go();
