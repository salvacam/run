document.addEventListener('DOMContentLoaded', function () {
  	app.init();
});

var app = {
  
  	play: document.getElementById('play'),
  	reset: document.getElementById('reset'),
	removeLastRun: document.getElementById('removeLastRun'),
	lastRunDiv: document.getElementById('lastRun'),

  	setDiv: document.getElementById('setDiv'),
	chronoDiv: document.getElementById('chronoDiv'),	

  	workValue: document.getElementById('workValue'),
	workValueData: 5,
	workValueInt: 0.5,
  	workValueMin: 0.5,
	workValueMax: 10,
	  
	noticeValue: document.getElementById('noticeValue'),
	noticeValueData: 0.5,
	noticeValueCurrent: 0.5,
	noticeValueInt: 0.5,
	noticeValueMin: 0.5,
	noticeValueMax: 10,

	lastRunValue: document.getElementById('lastRunValue'),
	lastRunData: 0,

	wpid: null,
	coords: null,
	geo_options: {
		enableHighAccuracy: true,
		maximumAge: 30000,
		timeout: 27000
	},
	precision: 80,

	distanceDone: document.getElementById('distanceDone'),
	distanceDoneValue: 0,

  	audio: new Audio(),
  	modalReset: document.getElementById('modalReset'),

  	playSound: function(srcSound){
		app.audio.src = "./sound/" + srcSound + ".ogg";
		app.audio.play();
  	},
  
  	init: function() {
    	app.play.addEventListener('click', app.initChrono);
		app.reset.addEventListener('click', app.resetChrono);
		app.removeLastRun.addEventListener('click', app.deleteLastRun);	

		if (localStorage.getItem("run_lastRun")) {
			app.lastRunData = parseFloat(localStorage.getItem("run_lastRun")).toFixed(3);			
			if (parseFloat(app.lastRunData).toFixed(3) > 0.0) {
				app.lastRunDiv.classList.remove("hide");
				app.lastRunValue.innerText = app.lastRunData;
			}
		}

    	let classnameLess = document.getElementsByClassName('lessBtn');
    	for (var i = 0; i < classnameLess.length; i++) {
    		classnameLess[i].addEventListener('click', app.lessValue);
		}

    	let classnameMore = document.getElementsByClassName('moreBtn');
    	for (var i = 0; i < classnameMore.length; i++) {
			classnameMore[i].addEventListener('click', app.moreValue);
		}


	    if ('serviceWorker' in navigator) {
      		navigator.serviceWorker
        		.register('service-worker.js')
        		.then(function() {
          		//console.log('Service Worker Registered');
        	});
    	}
  	},

	initChrono: function() {
		app.noticeValueCurrent = app.noticeValueData;
		setDiv.classList.add("hide");
		chronoDiv.classList.remove("hide");		

		/* TODO refactorizar */
		document.getElementsByTagName("html")[0].classList.add('work');
		document.getElementsByClassName("jumbotron")[0].classList.add('work');
		/* TODO refactorizar */

		//init GPS
		app.distanceDoneValue = 0;
		app.distanceDone.innerText = parseFloat(app.distanceDoneValue).toFixed(3);

		navigator.geolocation.getCurrentPosition(app.getPosition, null);
	},

	getPosition: function(position) {
		app.coords = {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		};

		app.wpid = navigator.geolocation.watchPosition(app.watchPosition, null, app.geo_options);
	},

	watchPosition: function(position) {

		//if (position.coords.accuracy <= app.precision &&
		if (position.coords.latitude != app.coords.latitude || 
			position.coords.longitude != app.coords.longitude) {
	
			let coordNew = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			}
			
			let distanceCalculated = parseFloat(app.calculateDistance(app.coords, coordNew)).toFixed(3);
			if (!isNaN(distanceCalculated)) {
				app.distanceDoneValue = parseFloat(app.distanceDoneValue) + parseFloat(distanceCalculated);
				app.distanceDone.innerText = parseFloat(app.distanceDoneValue).toFixed(3);
		
        		if(!isNaN(app.distanceDoneValue)) {
					app.lastRunData = parseFloat(app.lastRunData) + parseFloat(app.distanceDoneValue).toFixed(3);
					localStorage.setItem("run_lastRun",  app.lastRunData);
					app.lastRunValue.innerText = parseFloat(app.lastRunData).toFixed(3);
				}
			}
	
			app.coords = {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			}
	
			//app.noticeValueCurrent = app.noticeValueData;
			if (app.distanceDoneValue >= app.noticeValueCurrent) {
				app.playSound('end');
				app.notifyMe(app.distanceDoneValue);
				app.noticeValueCurrent = parseFloat(app.noticeValueCurrent) + parseFloat(app.noticeValueData);
			}

			if (app.distanceDoneValue  >= app.workValueData) {
				app.playSound('gong');
				setTimeout(function () {
					app.showConfig();
				}, 10000);
			}			
		}
	},

	calculateDistance: function(coordSource, coordDestination) {
		let radiansLatSource = app.degreesToRadians(coordSource.latitude);
		let radiansLongSource = app.degreesToRadians(coordSource.longitude);
		let radiansLatDestination = app.degreesToRadians(coordDestination.latitude);
		let radiansLongDestination = app.degreesToRadians(coordDestination.longitude);
		const Radio = 6371; // radio de la Tierra en Km
		let result = Math.acos(Math.sin(radiansLatSource) * Math.sin(radiansLatDestination) +
			Math.cos(radiansLatSource) * Math.cos(radiansLatDestination) *
			Math.cos(radiansLongSource - radiansLongDestination)) * Radio;
		return result.toFixed(3);
		/*
			var resultado = Math.acos(Math.sin(radianesLatInicio) * Math.sin(radianesLatDestino) +
				Math.cos(radianesLatInicio) * Math.cos(radianesLatDestino) *
				Math.cos(radianesLongInicio - radianesLongDestino)) * Radio;
		*/
	},

	degreesToRadians: function(degrees) {
		let radians = (degrees * Math.PI) / 180;
		return radians;
	},

	resetChrono: function() {
		app.modalReset.classList.remove('hide');

		document.getElementById('okReset').addEventListener('click', () => {  				
			app.modalReset.classList.add('hide');
			document.getElementById('okReset').removeEventListener('click', ()=> {});
			app.showConfig();
		});

		document.getElementById('closeReset').addEventListener('click', () => {  				
			app.modalReset.classList.add('hide');
			document.getElementById('closeReset').removeEventListener('click', ()=> {});
		});		
	},

	deleteLastRun: function() {
		app.modalReset.classList.remove('hide');

		document.getElementById('okReset').addEventListener('click', () => {  				
			app.modalReset.classList.add('hide');
			document.getElementById('okReset').removeEventListener('click', ()=> {});
			localStorage.removeItem("run_lastRun");
			app.lastRunDiv.classList.add("hide");
		});

		document.getElementById('closeReset').addEventListener('click', () => {  				
			app.modalReset.classList.add('hide');
			document.getElementById('closeReset').removeEventListener('click', ()=> {});
		});		
	},

	showConfig: function() {
		if (parseFloat(app.lastRunData).toFixed(3) > 0.0) {
			app.lastRunDiv.classList.remove("hide");
		}
        if (app.wpid !== null || app.wpid !== undefined) {
            //console.log("cerrar: " + app.wpid);
            navigator.geolocation.clearWatch(app.wpid);
		}
		
		 /* TODO refactorizar */
		document.getElementsByTagName("html")[0].classList.remove('work');
		document.getElementsByClassName("jumbotron")[0].classList.remove('work');
		document.getElementsByTagName("html")[0].classList.remove('rest');
		document.getElementsByClassName("jumbotron")[0].classList.remove('rest');
		 /* TODO refactorizar */
		app.setDiv.classList.remove("hide");
		app.chronoDiv.classList.add("hide");
	},

	lessValue: function(type) {
		if (typeof type === "object"){
			type = type.target.getAttribute('data-type');
		}
		switch(type) {
  			case 'work':
				app.workValueData = parseFloat(app.workValue.innerText) - app.workValueInt;
				app.workValue.innerText = app.workValueData;
				if (parseFloat(app.workValueData) < app.workValueMin) {
					app.workValueData = app.workValueMin;
					app.workValue.innerText = app.workValueMin;
				}
  				break;
			case 'notice':
				app.noticeValueData = parseFloat(app.noticeValue.innerText) - app.noticeValueInt;
				app.noticeValue.innerText = app.noticeValueData;
				if (parseFloat(app.noticeValueData) < app.noticeValueMin) {
					app.noticeValueData = app.noticeValueMin;
					app.noticeValue.innerText = app.noticeValueMin;
				}
				break;
		}
	},

	moreValue: function(type) {
		if (typeof type === "object"){
			type = type.target.getAttribute('data-type');
		}
		switch(type) {
			case 'work':
				app.workValueData = parseFloat(app.workValue.innerText) + app.workValueInt;
				app.workValue.innerText = app.workValueData;
				if (parseFloat(app.workValueData) > app.workValueMax) {
					app.workValueData = app.workValueMax;
					app.workValue.innerText = app.workValueMax;
				}
				break;
			case 'notice':
				app.noticeValueData = parseFloat(app.noticeValue.innerText) + app.noticeValueInt;
				app.noticeValue.innerText = app.noticeValueData;
				if (parseFloat(app.noticeValueData) > app.noticeValueMax) {
					app.noticeValueData = app.noticeValueMax;
					app.noticeValue.innerText = app.noticeValueMax;
				}
				break;
		}
	},

	notifyMe: function(numeroKm) {
		let textNotification = parseFloat(numeroKm).toFixed(3) + " km";
	
		if (Notification) {
			if (Notification.permission !== "granted") {
			  Notification.requestPermission();
			}
			Notification.requestPermission(function(result) {
			  if (result === 'granted') {
				navigator.serviceWorker.ready.then(function(registration) {
				  var title = "Podometro";
				  var options = {
					body:  textNotification,
					badge: "img/icon-48x48.png",
					icon: "img/icon-48x48.png",
					tag:  "Podometro"
				  };
				  registration.showNotification(title, options);              
				});
			  }
			});
		}
	}
};
