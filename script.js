document.addEventListener('DOMContentLoaded', () => {
    // Tasas de cambio (base Peso Argentino)
    const tasas = {
        ARS: 1,
        USD: 0.00075,  // 1 USD = 1333.33 ARS
        EUR: 0.00069,
        GBP: 0.00059,
        BRL: 0.0038
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

    // Recuperar pegatinas guardadas en localStorage
    let pegatinas = JSON.parse(localStorage.getItem('pegatinas_divisas')) || [];

    // Función principal para calcular la conversión
    function calcular() {
        const monto = parseFloat(inputMonto.value) || 0;
        const origen = selectOrigen.value;
        const destino = selectDestino.value;

        // Conversión a ARS y luego a la moneda destino
        const montoEnARS = monto / tasas[origen];
        const resultadoFinal = montoEnARS * tasas[destino];

        // Calcular tipo de cambio unitario
        const valorUnitario = (1 / tasas[origen]) * tasas[destino];

        // Formatear números
        const montoOrigenFormat = monto.toLocaleString('es-AR');
        const resultadoFormat = resultadoFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const tipoCambioFormat = (1 / valorUnitario).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        // Actualizar textos en pantalla (Sección Resultado)
        txtResultado.textContent = `${montoOrigenFormat} ${origen} = ${resultadoFormat} ${destino}`;
        txtTipoCambio.textContent = `Tipo de cambio: 1 ${destino} = ${tipoCambioFormat} ${origen}`;

        return {
            montoOrigen: montoOrigenFormat,
            origen: origen,
            montoDestino: resultadoFormat,
            destino: destino,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    // Función para guardar una nueva pegatina
    function crearPegatina() {
        const datos = calcular();
        if (parseFloat(inputMonto.value) <= 0) return;

        pegatinas.unshift(datos);
        localStorage.setItem('pegatinas_divisas', JSON.stringify(pegatinas));
        renderizarPegatinas();
    }

    // Dibujar las pegatinas en el panel de la derecha
    function renderizarPegatinas() {
        gridPegatinas.innerHTML = '';

        if (pegatinas.length === 0) {
            gridPegatinas.innerHTML = '<p style="color: #64748b; font-size: 0.9rem;">No hay pegatinas guardadas aún.</p>';
            return;
        }

        pegatinas.forEach(p => {
            const card = document.createElement('div');
            card.className = 'pegatina';
            card.innerHTML = `
                <div class="badge-nueva">NUEVA</div>
                <div class="pegatina-monto">${p.montoDestino} ${p.destino}</div>
                <div class="pegatina-detalle">${banderas[p.origen]} ${p.montoOrigen} ${p.origen} ➔ ${banderas[p.destino]} ${p.destino}</div>
                <div class="pegatina-fecha">${p.hora} hs</div>
            `;
            gridPegatinas.appendChild(card);
        });
    }

    // Eventos
    btnConvertir.addEventListener('click', crearPegatina);

    btnIntercambiar.addEventListener('click', () => {
        const temp = selectOrigen.value;
        selectOrigen.value = selectDestino.value;
        selectDestino.value = temp;
        calcular();
    });

    btnLimpiar.addEventListener('click', () => {
        pegatinas = [];
        localStorage.removeItem('pegatinas_divisas');
        renderizarPegatinas();
    });

    inputMonto.addEventListener('input', calcular);
    selectOrigen.addEventListener('change', calcular);
    selectDestino.addEventListener('change', calcular);

    // Inicializar al cargar la página
    calcular();
    renderizarPegatinas();
});
