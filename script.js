// ======================================
// CONVERSOR DE DIVISAS
// ======================================

// Tasas de ejemplo
// Todas están calculadas tomando USD como referencia.

const tasas = {
    USD: 1,
    ARS: 1333.33,
    EUR: 0.86,
    GBP: 0.74,
    BRL: 5.40
};


// Banderas de cada moneda

const banderas = {
    USD: "🇺🇸",
    ARS: "🇦🇷",
    EUR: "🇪🇺",
    GBP: "🇬🇧",
    BRL: "🇧🇷"
};


// Nombres de las monedas

const nombres = {
    USD: "Dólar",
    ARS: "Peso Argentino",
    EUR: "Euro",
    GBP: "Libra",
    BRL: "Real"
};


// ======================================
// FUNCIÓN CONVERTIR
// ======================================

function convertir() {

    const monto = parseFloat(
        document.getElementById("monto").value
    );

    const origen = document.getElementById("monedaOrigen").value;

    const destino = document.getElementById("monedaDestino").value;


    // Comprobar que exista un monto

    if (isNaN(monto) || monto <= 0) {

        alert("Por favor, ingresá un monto válido.");

        return;
    }


    // Convertir primero a USD

    const montoUSD = monto / tasas[origen];


    // Convertir de USD a la moneda destino

    const resultado = montoUSD * tasas[destino];


    // Formatear números

    const montoFormateado = formatoNumero(monto);

    const resultadoFormateado = formatoNumero(resultado);


    // Mostrar resultado

    document.getElementById("textoResultado").textContent =
        `${montoFormateado} ${origen} = ${resultadoFormateado} ${destino}`;


    // Calcular tipo de cambio

    const cambio = tasas[destino] / tasas[origen];

    const cambioFormateado = formatoNumero(cambio);


    document.getElementById("tipoCambio").textContent =
        `Tipo de cambio: 1 ${origen} = ${cambioFormateado} ${destino}`;


    // Crear la pegatina

    crearPegatina(
        monto,
        origen,
        resultado,
        destino
    );
}


// ======================================
// FORMATO DE NÚMEROS
// ======================================

function formatoNumero(numero) {

    return numero.toLocaleString("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}


// ======================================
// CREAR PEGATINA
// ======================================

function crearPegatina(
    monto,
    origen,
    resultado,
    destino
) {

    const contenedor =
        document.getElementById("contenedorPegatinas");


    // Crear elemento

    const pegatina =
        document.createElement("div");

    pegatina.classList.add("pegatina");


    // Fecha actual

    const fecha = new Date();

    const fechaTexto =
        fecha.toLocaleDateString("es-AR");


    const horaTexto =
        fecha.toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit"
        });


    // Contenido de la pegatina

    pegatina.innerHTML = `

        <span class="nueva">
            NUEVA
        </span>

        <div class="bandera">
            ${banderas[destino]}
        </div>

        <h3>
            ${destino} - ${nombres[destino]}
        </h3>

        <div class="valor">
            ${formatoNumero(resultado)}
        </div>

        <div class="info">
            ${formatoNumero(monto)}
            ${origen}
            →
            ${destino}
        </div>

        <div class="info">
            📅 ${fechaTexto}
        </div>

        <div class="info">
            🕐 ${horaTexto}
        </div>

    `;


    // Agregar al principio

    contenedor.prepend(pegatina);


    // Guardar en el navegador

    guardarPegatinas();
}


// ======================================
// INTERCAMBIAR MONEDAS
// ======================================

function intercambiarMonedas() {

    const origen =
        document.getElementById("monedaOrigen");

    const destino =
        document.getElementById("monedaDestino");


    const temporal = origen.value;

    origen.value = destino.value;

    destino.value = temporal;
}


// ======================================
// BORRAR PEGATINAS
// ======================================

function borrarPegatinas() {

    const contenedor =
        document.getElementById("contenedorPegatinas");


    if (contenedor.children.length === 0) {

        return;
    }


    const confirmar =
        confirm(
            "¿Querés borrar todas las pegatinas?"
        );


    if (confirmar) {

        contenedor.innerHTML = "";

        localStorage.removeItem(
            "pegatinas"
        );
    }
}


// ======================================
// GUARDAR PEGATINAS
// ======================================

function guardarPegatinas() {

    const contenedor =
        document.getElementById("contenedorPegatinas");


    localStorage.setItem(
        "pegatinas",
        contenedor.innerHTML
    );
}


// ======================================
// CARGAR PEGATINAS
// ======================================

function cargarPegatinas() {

    const guardadas =
        localStorage.getItem("pegatinas");


    if (guardadas) {

        document.getElementById(
            "contenedorPegatinas"
        ).innerHTML = guardadas;
    }
}


// Cargar las pegatinas cuando abre la página

window.onload = cargarPegatinas;
