// ==========================================
// 1. CONFIGURACIÓN Y VARIABLES
// ==========================================

const monedas = {
    ARS: { nombre: "Peso argentino", bandera: "🇦🇷" },
    USD: { nombre: "Dólar estadounidense", bandera: "🇺🇸" },
    EUR: { nombre: "Euro", bandera: "🇪🇺" },
    GBP: { nombre: "Libra esterlina", bandera: "🇬🇧" },
    BRL: { nombre: "Real brasileño", bandera: "🇧🇷" }
};

// Tasas aproximadas de respaldo si falla la conexión.
// No representan necesariamente el cambio actual.
const tasasRespaldo = {
    USD: 1,
    ARS: 1333.33,
    EUR: 0.86,
    GBP: 0.74,
    BRL: 5.40
};

let tasas = { ...tasasRespaldo };
let fuenteTasas = "respaldo";
let fechaTasas = "";

let ultimaConversion = null;

let pegatinas = cargarPegatinas();

const formulario = document.getElementById("formulario");
const montoInput = document.getElementById("monto");
const origenInput = document.getElementById("origen");
const destinoInput = document.getElementById("destino");

const textoResultado = document.getElementById("textoResultado");
const tipoCambio = document.getElementById("tipoCambio");
const estadoTasa = document.getElementById("estadoTasa");
const mensaje = document.getElementById("mensaje");

const coleccion = document.getElementById("coleccionPegatinas");
const coleccionVacia = document.getElementById("coleccionVacia");
const contador = document.getElementById("contador");


// ==========================================
// 2. FORMATO DE NÚMEROS
// ==========================================

function formatoNumero(numero, moneda) {
    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: moneda,
        maximumFractionDigits: 2
    }).format(numero);
}

function formatoCantidad(numero) {
    return new Intl.NumberFormat("es-AR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}


// ==========================================
// 3. OBTENER TIPOS DE CAMBIO
// ==========================================

async function cargarTasas() {
    estadoTasa.textContent = "Actualizando tipos de cambio...";

    try {
        const respuesta = await fetch(
            "https://open.er-api.com/v6/latest/USD"
        );

        if (!respuesta.ok) {
            throw new Error("No se pudo consultar el servicio.");
        }

        const datos = await respuesta.json();

        if (
            datos.result !== "success" ||
            !datos.rates ||
            !datos.time_last_update_utc
        ) {
            throw new Error("Respuesta de cambio inválida.");
        }

        const codigos = Object.keys(monedas);

        for (const codigo of codigos) {
            if (
                typeof datos.rates[codigo] !== "number" ||
                datos.rates[codigo] <= 0
            ) {
                throw new Error(
                    `No se encontró la tasa de ${codigo}.`
                );
            }
        }

        tasas = {};

        codigos.forEach(codigo => {
            tasas[codigo] = datos.rates[codigo];
        });

        fuenteTasas = "online";
        fechaTasas = datos.time_last_update_utc;

        estadoTasa.textContent =
            "Tipos de cambio consultados en línea. " +
            "Última actualización: " + fechaTasas;

    } catch (error) {
        tasas = { ...tasasRespaldo };
        fuenteTasas = "respaldo";
        fechaTasas = "";

        estadoTasa.textContent =
            "No se pudo conectar al servicio. " +
            "Se usan tasas de ejemplo, no cotizaciones actuales.";
    }
}


// ==========================================
// 4. CONVERTIR DIVISAS
// ==========================================

formulario.addEventListener("submit", function(event) {
    event.preventDefault();
    convertir();
});

function convertir() {
    const monto = Number(montoInput.value);
    const origen = origenInput.value;
    const destino = destinoInput.value;

    if (!Number.isFinite(monto) || monto <= 0) {
        mensaje.textContent =
            "Ingresá un monto válido mayor que cero.";
        return;
    }

    if (!tasas[origen] || !tasas[destino]) {
        mensaje.textContent =
            "No hay tasas disponibles para esas monedas.";
        return;
    }

    // Las tasas están expresadas tomando USD como referencia.
    const resultado = monto / tasas[origen] * tasas[destino];

    if (!Number.isFinite(resultado)) {
        mensaje.textContent =
            "No se pudo realizar la conversión.";
        return;
    }

    const cambio = tasas[destino] / tasas[origen];

    textoResultado.textContent =
        `${formatoCantidad(monto)} ${origen} = ` +
        `${formatoNumero(resultado, destino)}`;

    tipoCambio.textContent =
        `Tipo de cambio: 1 ${origen} = ` +
        `${formatoCantidad(cambio)} ${destino}`;

    ultimaConversion = {
        monto,
        origen,
        destino,
        resultado,
        cambio
    };

    // Cada conversión exitosa crea una nueva pegatina.
    crearPegatina(ultimaConversion);

    mensaje.textContent =
        "¡Conversión realizada! Tu nueva pegatina ya está en la colección.";
}


// ==========================================
// 5. INTERCAMBIAR MONEDAS
// ==========================================

document.getElementById("intercambiar")
    .addEventListener("click", function() {
        const anterior = origenInput.value;

        origenInput.value = destinoInput.value;
        destinoInput.value = anterior;

        // Si ya se había convertido un monto, lo recalculamos.
        if (ultimaConversion) {
            convertir();
        }
    });


// ==========================================
// 6. CREAR PEGATINA
// ==========================================

function crearPegatina(conversion) {
    const pegatina = {
        id: crearId(),
        monto: conversion.monto,
        origen: conversion.origen,
        destino: conversion.destino,
        resultado: conversion.resultado,
        cambio: conversion.cambio,
        fecha: new Date().toISOString(),
        estrellas: 0
    };

    pegatinas.unshift(pegatina);

    guardarPegatinas();
    mostrarPegatinas();
}

function crearId() {
    if (crypto.randomUUID) {
        return crypto.randomUUID();
    }

    return Date.now().toString() +
        Math.random().toString(36).slice(2);
}


// ==========================================
// 7. MOSTRAR TODAS LAS PEGATINAS
// ==========================================

function mostrarPegatinas() {
    coleccion.replaceChildren();

    contador.textContent =
        pegatinas.length === 1
            ? "1 pegatina"
            : `${pegatinas.length} pegatinas`;

    coleccionVacia.classList.toggle(
        "oculto",
        pegatinas.length > 0
    );

    pegatinas.forEach(pegatina => {
        const tarjeta = document.createElement("article");
        tarjeta.className = "pegatina";

        // Bandera
        const bandera = document.createElement("div");
        bandera.className = "bandera";
        bandera.textContent = monedas[pegatina.destino].bandera;

        // Código de moneda
        const codigo = document.createElement("h3");
        codigo.className = "codigo-moneda";
        codigo.textContent = pegatina.destino;

        // Nombre de moneda
        const nombre = document.createElement("p");
        nombre.className = "nombre-moneda";
        nombre.textContent = monedas[pegatina.destino].nombre;

        // Resultado
        const valor = document.createElement("p");
        valor.className = "valor-pegatina";
        valor.textContent = formatoNumero(
            pegatina.resultado,
            pegatina.destino
        );

        // Detalle de la conversión
        const detalle = document.createElement("p");
        detalle.className = "detalle-pegatina";
        detalle.textContent =
            `${formatoCantidad(pegatina.monto)} ${pegatina.origen} → ${pegatina.destino}`;

        // Fecha y hora
        const fecha = document.createElement("p");
        fecha.className = "detalle-pegatina";

        const fechaValida = new Date(pegatina.fecha);

        fecha.textContent = Number.isNaN(fechaValida.getTime())
            ? "Fecha no disponible"
            : fechaValida.toLocaleString("es-AR", {
                dateStyle: "short",
                timeStyle: "short"
            });

        // Estrellas para valorar la pegatina
        const estrellas = document.createElement("div");
        estrellas.className = "estrellas";
        estrellas.setAttribute("aria-label", "Valorar pegatina");

        for (let i = 1; i <= 5; i++) {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "estrella";
            boton.textContent = "★";

            if (i <= pegatina.estrellas) {
                boton.classList.add("activa");
            }

            boton.setAttribute(
                "aria-label",
                `Valorar con ${i} estrellas`
            );

            boton.setAttribute(
                "aria-pressed",
                String(i === pegatina.estrellas)
            );

            boton.addEventListener("click", () => {
                pegatina.estrellas = i;
                guardarPegatinas();
                mostrarPegatinas();
            });

            estrellas.appendChild(boton);
        }

        // Botón para eliminar una sola pegatina
        const pie = document.createElement("div");
        pie.className = "pie-pegatina";

        const eliminar = document.createElement("button");
        eliminar.type = "button";
        eliminar.className = "boton-eliminar";
        eliminar.textContent = "🗑 Eliminar";

        eliminar.addEventListener("click", () => {
            eliminarPegatina(pegatina.id);
        });

        pie.appendChild(eliminar);

        tarjeta.append(
            bandera,
            codigo,
            nombre,
            valor,
            detalle,
            fecha,
            estrellas,
            pie
        );

        coleccion.appendChild(tarjeta);
    });
}


// ==========================================
// 8. ELIMINAR UNA PEGATINA
// ==========================================

function eliminarPegatina(id) {
    pegatinas = pegatinas.filter(
        pegatina => pegatina.id !== id
    );

    guardarPegatinas();
    mostrarPegatinas();

    mensaje.textContent = "Pegatina eliminada.";
}


// ==========================================
// 9. BORRAR TODA LA COLECCIÓN
// ==========================================

document.getElementById("borrarTodo")
    .addEventListener("click", function() {
        if (pegatinas.length === 0) {
            mensaje.textContent =
                "Todavía no hay pegatinas para borrar.";
            return;
        }

        const confirmar = confirm(
            "¿Seguro que querés borrar todas las pegatinas?"
        );

        if (!confirmar) return;

        pegatinas = [];

        guardarPegatinas();
        mostrarPegatinas();

        mensaje.textContent =
            "Se borraron todas las pegatinas.";
    });


// ==========================================
// 10. GUARDAR EN EL NAVEGADOR
// ==========================================

function guardarPegatinas() {
    try {
        localStorage.setItem(
            "miColeccionDivisas",
            JSON.stringify(pegatinas)
        );
    } catch (error) {
        mensaje.textContent =
            "No se pudieron guardar los cambios en este navegador.";
    }
}

function cargarPegatinas() {
    try {
        const guardadas = localStorage.getItem(
            "miColeccionDivisas"
        );

        if (!guardadas) return [];

        const datos = JSON.parse(guardadas);

        if (!Array.isArray(datos)) return [];

        // Evitamos cargar datos incompletos o inválidos.
        return datos.filter(p =>
            p &&
            typeof p.id === "string" &&
            monedas[p.origen] &&
            monedas[p.destino] &&
            Number.isFinite(p.monto) &&
            Number.isFinite(p.resultado) &&
            typeof p.fecha === "string"
        ).map(p => ({
            ...p,
            estrellas: Number.isInteger(p.estrellas) &&
                p.estrellas >= 0 &&
                p.estrellas <= 5
                    ? p.estrellas
                    : 0
        }));

    } catch (error) {
        return [];
    }
}


// ==========================================
// 11. INICIAR APLICACIÓN
// ==========================================

mostrarPegatinas();
cargarTasas();
