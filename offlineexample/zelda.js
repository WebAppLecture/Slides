$(function() {
	var zelda = $('#link');
	var world = zelda.parent();
	var direction = 0;
	
	setInterval(function() {
		if(direction === 0)
			return;
		else if(direction == 1)
			zelda.css('bottom', '+=3');
		else if(direction == 3)
			zelda.css('bottom', '-=3');
		else
			zelda.css('left', (direction > 0 ? '-' : '+') + '=3');
		
		if(zelda.offset().top < world.offset().top)
			zelda.css('bottom', 1 + world.height() - zelda.height());
		else if(zelda.offset().top + zelda.height() > 2 + world.height() + world.offset().top)
			zelda.css('bottom', 0);
		else if(zelda.offset().left < world.offset().left)
			zelda.css('left', 0);
		else if(zelda.offset().left + zelda.width() > world.width() + world.offset().left)
			zelda.css('left', world.width() - zelda.width());
	}, 25);
	
	var setAni = function(dir, press) {		
		if(!press) {
			zelda.destroy();
			direction = 0;
		}
		else {
			direction = dir;
		
			if(dir < 0) {
				zelda.addClass('mirror');
				dir *= -1;
			} else
				zelda.removeClass('mirror');
				
			zelda.sprite({ fps : 25, no_of_frames : 6 }).spState(dir);
		}
	};
	
	var keypress = function(event) {
		var up = event.type === 'keyup';
		
		switch (event.keyCode) {
			case 37://Linke Pfeiltaste
				setAni(2, !up);
				break;
			case 38://Pfeiltaste nach oben
				setAni(1, !up);
				break;
			case 39://Rechte Pfeiltaste
				setAni(-2, !up);
				break;
			case 40://Pfeiltaste nach unten
				setAni(3, !up);
				break;
			default:
				return true;
		}
		 
		return false;
	};

	$('html').bind('keydown', keypress);
	$('html').bind('keyup', keypress);
});