var recorrido, btBorrar, lista; //elementos html
var listaDist = [];
var enlacesBorrar;


function redondeo(numero, decimales) {
    var flotante = parseFloat(numero);
    var resultado = Math.round(flotante * Math.pow(10, decimales)) / Math.pow(10, decimales);
    return resultado;
}

function formaterFecha(fecha) {
    return fecha.substr(6, 2) + "/" + fecha.substr(4, 2) + "/" + fecha.substr(0, 4);
}

function eliminar() {
    if (confirm("¿Eliminar todas los datos?")) {
        console.log("borra todo");
        if (localStorage.length > 0) {
            for (var i in localStorage) {
                if (i.substring(0, 5) == "podo_") {
                    console.log(i);
                    localStorage.removeItem(i);
                }
            }
        }
        init();
    }
}

function borrarUnidad(id) {
    var fechaF = formaterFecha(id);
    if (confirm("¿Quieres borrar la distancia del dia " + fechaF + "?")) {
        localStorage.removeItem("podo_" + id);
        verDatos();
    }
}


function verDatos() {
    listaDist = [];
    aux = 0;
    if (localStorage.length > 0) {
        for (var i in localStorage) {
            if (i.substring(0, 5) == "podo_" &&
                i !== 'podo_distanciaTotal' && i !== 'podo_hoy') {
                var fecha = i.substr(5, i.length - 1);
                var dist = localStorage.getItem(i);
                aux += parseFloat(dist);
                var podo = {
                    fecha: fecha,
                    distancia: dist
                }
                listaDist.push(podo);
            }
        }
    }

    if (aux != distanciaTotal) {
        if (!isNaN(aux)) {
            distanciaTotal = aux;
            localStorage.setItem("podo_distanciaTotal", distanciaTotal);
            recorrido.textContent = distanciaTotal + " km en total";
        }
    }

    listaDist.sort(function (a, b) {
        if (a.fecha > b.fecha)
            return -1;
        if (a.fecha < b.fecha)
            return 1;
        return 0;
    });

    if (lista.hasChildNodes()) {
        while (lista.childNodes.length >= 1) {
            lista.removeChild(lista.firstChild);
        }
    }

    for (var i = 0; i < listaDist.length; i++) {
        var fecha = listaDist[i].fecha;
        var fechaF = formaterFecha(fecha);
        var dist = listaDist[i].distancia;

        var li = document.createElement("li");

        var div = document.createElement("div");
        div.setAttribute("class", "dato");

        var spanF = document.createElement("span");
        spanF.setAttribute("class", "fecha");
        spanF.textContent = fechaF;

        var spanD = document.createElement("span");
        spanD.setAttribute("class", "distancia");
        spanD.textContent = dist + " km";

        var borrarDist = document.createElement("a");
        borrarDist.setAttribute("href", "#");

        var imagen = document.createElement("img");
        imagen.setAttribute("src", "../img/borrar1.png");
        imagen.setAttribute("alt", "borrar");
        imagen.setAttribute("class", "borrarUd");
        imagen.setAttribute("data-id", fecha);

        borrarDist.appendChild(imagen);
        div.appendChild(spanF);
        div.appendChild(spanD);
        div.appendChild(borrarDist);
        li.appendChild(div);
        lista.appendChild(li);
    }
    enlacesBorrar = document.getElementsByClassName("borrarUd");
    for (var i = 0; i < enlacesBorrar.length; i++) {

        enlacesBorrar[i].addEventListener("click", function (e) {
            var id = e.target.getAttribute("data-id");
            borrarUnidad(id);
        });
    }
}

function init() {
    recorrido = document.getElementById("recorridoH");
    btBorrar = document.getElementById("btBorrar");
    lista = document.getElementById("lista");

    if (localStorage.getItem("podo_distanciaTotal")) {
        distanciaTotal = redondeo(localStorage.getItem("podo_distanciaTotal"), 3);
    } else {
        distanciaTotal = 0;
        localStorage.setItem("podo_distanciaTotal", distanciaTotal);
    }
    recorrido.textContent = distanciaTotal + " km en total";

    verDatos();

    btBorrar.addEventListener("click", function () {
        eliminar()
    });
}

window.addEventListener("load", init);
