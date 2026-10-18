// Tasas de cambio fijas tomadas de referencia respecto a USD (dólar)
const tasasDeCambio = {
    USD: 1.0,
    ARS: 1333.33,
    EUR: 0.92,
    GBP: 0.79,
    BRL: 5.05
};

const banderas = {
    ARS: '🇦🇷',
    USD: '🇺🇸',
    EUR: '🇪🇺',
    GBP: '🇬🇧',
    BRL: '🇧🇷'
};

// Referencias a elementos del DOM
const inputMonto = document.getElementById('monto');
const selectOrigen = document.getElementById('moneda-origen');
const selectDestino = document.getElementById('moneda-destino');
const btnConvertir = document.getElementById('btn-convertir');
const btnIntercambiar = document.getElementById('btn-intercambiar');
const btnLimpiar = document.getElementById('btn-limpiar');
const txtResultado = document.getElementById('resultado-texto');
const txtTipoCambio = document.getElementById('tipo-cambio-texto');
const gridPegatinas = document.getElementById('grid-pegatinas');

// Cargar pegatinas guardadas de localStorage al iniciar
let listaPegatinas = JSON.parse(localStorage.getItem('pegatinas_divisas')) || [];

function formatearNumero(numero) {
    return new Intl.NumberFormat('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numero);
}

function calcularConversion() {
    const monto = parseFloat(inputMonto.value);
    const origen = selectOrigen.value;
    const destino = selectDestino.value;

    if (isNaN(monto) || monto <= 0) {
        txtResultado.textContent = "Ingresa un monto válido";
        txtTipoCambio.textContent = "";
        return null;
    }

    // Convertir de moneda origen a USD y luego a la moneda destino
    const montoEnUSD = monto / tasasDeCambio[origen];
    const montoFinal = montoEnUSD * tasasDeCambio[destino];

    // Calcular tipo de cambio individual (1 unidad de origen a destino)
    const tipoCambioUnitario = (1 / tasasDeCambio[origen]) * tasasDeCambio[destino];

    const resultadoFormateado = `${formatearNumero(monto)} ${origen} = ${formatearNumero(montoFinal)} ${destino}`;
    const tipoCambioFormateado = `Tipo de cambio: 1 ${origen} = ${formatearNumero(tipoCambioUnitario)} ${destino}`;

    txtResultado.textContent = resultadoFormateado;
    txtTipoCambio.textContent = tipoCambioFormateado;

    return {
        montoOrigen: formatearNumero(monto),
        monedaOrigen: origen,
        montoDestino: formatearNumero(montoFinal),
        monedaDestino: destino,
        fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
}

function crearPegatina(datos) {
    if (!datos) return;

    listaPegatinas.unshift(datos); // Agregar al inicio de la lista
    localStorage.setItem('pegatinas_divisas', JSON.stringify(listaPegatinas));
    renderizarPegatinas();
}

function renderizarPegatinas() {
    gridPegatinas.innerHTML = '';

    if (listaPegatinas.length === 0) {
        gridPegatinas.innerHTML = '<p style="color: #94a3b8; font-size: 0.9rem;">No hay pegatinas guardadas aún.</p>';
        return;
    }

    listaPegatinas.forEach((p) => {
        const div = document.createElement('div');
        div.className = 'pegatina';
        div.innerHTML = `
            <div class="pegatina-titulo">CONVERSIÓN</div>
            <div class="pegatina-monto">${p.montoDestino} ${p.monedaDestino}</div>
            <div class="pegatina-detalle">${banderas[p.monedaOrigen]} ${p.montoOrigen} ${p.monedaOrigen} ➔ ${banderas[p.monedaDestino]} ${p.monedaDestino}</div>
            <div class="pegatina-fecha">Hoy ${p.fecha} hs</div>
        `;
        gridPegatinas.appendChild(div);
    });
}

// Event Listeners
btnConvertir.addEventListener('click', () => {
    const datosConversion = calcularConversion();
    if (datosConversion) {
        crearPegatina(datosConversion);
    }
});

btnIntercambiar.addEventListener('click', () => {
    const temp = selectOrigen.value;
    selectOrigen.value = selectDestino.value;
    selectDestino.value = temp;
    calcularConversion();
});

btnLimpiar.addEventListener('click', () => {
    listaPegatinas = [];
    localStorage.removeItem('pegatinas_divisas');
    renderizarPegatinas();
});

inputMonto.addEventListener('input', calcularConversion);
selectOrigen.addEventListener('change', calcularConversion);
selectDestino.addEventListener('change', calcularConversion);

// Inicializar al cargar la página
calcularConversion();
renderizarPegatinas();
