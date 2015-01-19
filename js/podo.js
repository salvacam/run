var inicio = true,
    verMapa = true; 
var coordenadas;
var wpid; 
var btIniciar, recorrido, btBorrar, btHistorial, btMostrar, cajaMapa; 
var info, cambiar, borrar; 
var distanciaTotal = 0; 
var distanciaActual = 0;
var hoy, distanciaHoy;
var precision = 80;
var mapa; 
var marcadorInicial, marcadorFinal;
var polylinea, polylineaCoord = [];
var texto = "<br/>Para iniciar/parar el podometro pulsa<br/> <img src='./img/iniciar.png'>" +
    "<br/><br/><br/>Para mostrar/ocultar el mapa pulsa<br/> <img src='./img/mapa.png'>" +
    "<br/>Inicio: <img src='./img/pedestriancrossing.png'> Actual: <img src='./img/pin.png'>" +
    "<br/><br/><br/>Para ver historial de distancias pulsa<br/> <img src='./img/historial.png'>";
    
function redondeo(numero, decimales) {
    var flotante = parseFloat(numero);
    var resultado = Math.round(flotante * Math.pow(10, decimales)) / Math.pow(10, decimales);
    return resultado;
}

function calcularDistancia(coordenadasOrigen, coordenadasDestino) {
    var radianesLatInicio = gradosARadianes(coordenadasOrigen.latitude);
    var radianesLongInicio = gradosARadianes(coordenadasOrigen.longitude);
    var radianesLatDestino = gradosARadianes(coordenadasDestino.latitude);
    var radianesLongDestino = gradosARadianes(coordenadasDestino.longitude);
    var Radio = 6371; // radio de la Tierra en Km
    var resultado = Math.acos(Math.sin(radianesLatInicio) * Math.sin(radianesLatDestino) +
        Math.cos(radianesLatInicio) * Math.cos(radianesLatDestino) *
        Math.cos(radianesLongInicio - radianesLongDestino)) * Radio;
    return redondeo(resultado, 3);
}

function gradosARadianes(grados) {
    var radianes = (grados * Math.PI) / 180;
    return radianes;
}

function mostrarMapa(posicion) {
    if (verMapa) {
        var googleLatLong = new google.maps.LatLng(posicion.coords.latitude, posicion.coords.longitude);
        var opcionesMapa = {
            zoom: 17,
            center: googleLatLong,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        mapa = new google.maps.Map(cajaMapa, opcionesMapa);
        if (marcadorInicial !== null && marcadorInicial !== undefined)
            marcadorInicial.setMap(mapa);
        if (marcadorFinal !== null && marcadorFinal !== undefined)
            marcadorFinal.setMap(mapa);
        if (polylinea)
            polylinea.setMap(mapa);
        verMapa = false;
    } else {
        mapa = null;
        if (marcadorInicial !== null && marcadorInicial !== undefined)
            marcadorInicial.setMap(null);
        if (marcadorFinal !== null && marcadorFinal !== undefined)
            marcadorFinal.setMap(null);
        if (polylinea)
            polylinea.setMap(null);
        cajaMapa.innerHTML = texto;
        verMapa = true;
    }
}

function ver1(posicion) {
    if (marcadorFinal)
        marcadorFinal.setAnimation(google.maps.Animation.BOUNCE);
    if (posicion.coords.accuracy <= precision &&
        (posicion.coords.latitude != coordenadas.latitude || posicion.coords.longitude != coordenadas.longitude)) {
        var googleLatLong = new google.maps.LatLng(posicion.coords.latitude, posicion.coords.longitude);

        if (mapa)
            mapa.setCenter(googleLatLong);

        //añadir punto a la polylinea
        polylineaCoord.push(googleLatLong);
        if (polylinea == null || polylinea == undefined) {
            polylinea = new google.maps.Polyline({
                path: polylineaCoord,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            if (mapa)
                polylinea.setMap(mapa);
        } else {
            polylinea.setPath(polylineaCoord);
        }

        marcadorFinal.setPosition(googleLatLong);

        var coordenadasNew = {
            latitude: posicion.coords.latitude,
            longitude: posicion.coords.longitude
        }
        var distanciaCalculada = parseFloat(redondeo(calcularDistancia(coordenadas, coordenadasNew), 3));
        if (!isNaN(distanciaCalculada)) {
            distanciaActual = redondeo(distanciaActual + distanciaCalculada, 3);
            distanciaHoy = redondeo(distanciaHoy + distanciaCalculada, 3);
            distanciaTotal = redondeo(distanciaTotal + distanciaCalculada, 3);
			recorrido.innerHTML = distanciaActual + " km ahora<br/>" + distanciaHoy + " km hoy<br/>" + distanciaTotal + " km en total";
        }

        coordenadas = {
            latitude: posicion.coords.latitude,
            longitude: posicion.coords.longitude
        }
    }
}

function ver(posicion) {
    coordenadas = {
        latitude: posicion.coords.latitude,
        longitude: posicion.coords.longitude
    }

    var googleLatLongInicio = new google.maps.LatLng(posicion.coords.latitude, posicion.coords.longitude);
    marcadorInicial = new google.maps.Marker({
        position: googleLatLongInicio,
        icon: './img/pedestriancrossing.png'
    });
    if (mapa)
        marcadorInicial.setMap(mapa);

    marcadorFinal = new google.maps.Marker({
        position: googleLatLongInicio,
        animation: google.maps.Animation.BOUNCE
    });
    if (mapa)
        marcadorFinal.setMap(mapa);

    if (polylinea)
        polylinea.setMap(null);
    polylineaCoord = [];
    polylineaCoord.push(googleLatLongInicio);

    var geo_options = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };

    recorrido.innerHTML = distanciaActual + " km ahora<br/>" + distanciaHoy + " km hoy<br/>" +distanciaTotal + " km en total";
    wpid = navigator.geolocation.watchPosition(ver1, null, geo_options);
}

function comenzar() {
    if (inicio) {
        if (polylinea) {
            polylinea.setMap(null);
            polylinea = null;
        }
        if (marcadorFinal)
            marcadorFinal.setMap(null);
        if (marcadorInicial)
            marcadorInicial.setMap(null);
        navigator.geolocation.getCurrentPosition(ver, null);
        inicio = false;
        btHistorial.setAttribute("hidden","");
    } else {
        distanciaActual = 0;
        recorrido.innerHTML = distanciaHoy + " km hoy<br/>" +distanciaTotal + " km en total";
        if(!isNaN(distanciaTotal))
            localStorage.setItem("podo_distanciaTotal", distanciaTotal);        
        if(!isNaN(distanciaHoy))
            localStorage.setItem("podo_"+hoy, distanciaHoy);
        console.log(wpid);
        if (wpid !== null || wpid !== undefined) {
            console.log("cerrar: " + wpid);
            navigator.geolocation.clearWatch(wpid);
        }
        inicio = true;
        if (marcadorFinal)
            marcadorFinal.setAnimation(null);
        polylineaCoord = [];        
        btHistorial.removeAttribute("hidden");
    }
}

function init() {
    btIniciar = document.getElementById("btIniciar");
    recorrido = document.getElementById("recorrido");
    btMostrar = document.getElementById("btMostrar");
    btBorrar = document.getElementById("btBorrar");
    btHistorial = document.getElementById("btHistorial");
    cajaMapa = document.getElementById("cajaMapa");

    btHistorial.removeAttribute("hidden");
    cajaMapa.innerHTML = texto;
    if (localStorage.getItem("podo_distanciaTotal")) {
        distanciaTotal = redondeo(localStorage.getItem("podo_distanciaTotal"), 3);
    } else {
        distanciaTotal = 0;
        localStorage.setItem("podo_distanciaTotal", distanciaTotal);
    }
    var fecha = new Date();
    var mes = (fecha.getMonth()+1);    
    if(mes <10){
        mes = 0+""+mes;
    }
    hoy = fecha.getFullYear()+""+ mes +""+fecha.getDate();
    console.log(hoy);
    
    if (localStorage.getItem("podo_"+hoy)) {
        distanciaHoy = redondeo(localStorage.getItem("podo_"+hoy), 3);
    } else {
        distanciaHoy = 0;
        localStorage.setItem("podo_"+hoy, distanciaHoy);
    }    

    recorrido.innerHTML = distanciaHoy + " km hoy<br/>" +distanciaTotal + " km en total";

    if (navigator.geolocation) {
        btMostrar.addEventListener("click", function () {
            if (verMapa)
                navigator.geolocation.getCurrentPosition(mostrarMapa, null);
            else
                mostrarMapa();
        });
        btIniciar.addEventListener("click", function () {
            comenzar();
        });
    } else {
        cajaMapa.innerHTML = "No hay soporte de geolocalización";
    }
}

window.addEventListener("load", init);
