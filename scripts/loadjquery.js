(function(undefined) {
	if (typeof jQuery === 'undefined') {
		var buffer = [];
		$ = function(s) {
			buffer.push(s);
		};
		var script = document.createElement('script');
		script.type = 'text/javascript';
		script.async = false;
		script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.8/jquery.js';
		script.onload = function() {
			for (var i = buffer.length; i--; )
				$(buffer[i]);
		};
		document.head.appendChild(script);
	}
})();