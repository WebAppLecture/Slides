onmessage = function(event) {
	if(event.data) {
		var obj = JSON.parse(event.data);
		run(obj.start, obj.end);
	} else
		run(2, 100);
};

function run(s, e) {
	var n = s;
		
	while(n < e) {
		var k = Math.sqrt(n);
		var found = false;
		
		for(var i = 2; i <= k; i++)
			if( n % i === 0) {
				found = true;
				break;
			}
			
		if(!found)
			postMessage(n.toString());
			
		n++;
	}	
}