document.addEventListener('DOMContentLoaded', () => {
    // Tasas de cambio fijas relativas al Peso Argentino (ARS)
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

    // Obtener elementos del HTML
    const inputMonto = document.getElementById('monto');
    const selectOrigen = document.getElementById('moneda-origen');
    const selectDestino = document.getElementById('moneda-destino');
    const btnConvertir = document.getElementById('btn-convertir');
    const btnIntercambiar = document.getElementById('btn-intercambiar');
    const btnLimpiar = document.getElementById('btn-limpiar');
    const txtResultado = document.getElementById('resultado-texto');
    const txtTipoCambio = document.getElementById('tipo-cambio-texto');
    const gridPegatinas = document.getElementById('grid-pegatinas');

    let pegatinas = JSON.parse(localStorage.getItem('pegatinas_guardadas')) || [];

    function calcular() {
        const monto = parseFloat(inputMonto.value) || 0;
        const origen = selectOrigen.value;
        const destino = selectDestino.value;

        // Convertir monto
        const montoEnARS = monto / tasas[origen];
        const resultadoFinal = montoEnARS * tasas[destino];

        // Tipo de cambio unitario
        const valorUnitario = (1 / tasas[origen]) * tasas[destino];

        txtResultado.textContent = `${monto.toLocaleString('es-AR')} ${origen} = ${resultadoFinal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ${destino}`;
        txtTipoCambio.textContent = `Tipo de cambio: 1 ${origen} = ${valorUnitario.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 4})} ${destino}`;

        return {
            montoOrigen: monto.toLocaleString('es-AR'),
            origen: origen,
            montoDestino: resultadoFinal.toLocaleString('es-AR', {minimumFractionDigits: 2, maximumFractionDigits: 2}),
            destino: destino,
            hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
    }

    function agregarPegatina(datos) {
        if (!datos || parseFloat(inputMonto.value) <= 0) return;
        
        pegatinas.unshift(datos);
        localStorage.setItem('pegatinas_guardadas', JSON.stringify(pegatinas));
        mostrarPegatinas();
    }

    function mostrarPegatinas() {
        gridPegatinas.innerHTML = '';

        if (pegatinas.length === 0) {
            gridPegatinas.innerHTML = '<p style="font-size:0.85rem; color:#94a3b8;">No hay pegatinas aún.</p>';
            return;
        }

        pegatinas.forEach(p => {
            const item = document.createElement('div');
            item.className = 'pegatina';
            item.innerHTML = `
                <div class="pegatina-titulo">CONVERSIÓN</div>
                <div class="pegatina-monto">${p.montoDestino} ${p.destino}</div>
                <div class="pegatina-detalle">${banderas[p.origen]} ${p.montoOrigen} ${p.origen} ➔ ${banderas[p.destino]} ${p.destino}</div>
                <div class="pegatina-fecha">Hora: ${p.hora}</div>
            `;
            gridPegatinas.appendChild(item);
        });
    }

    // Eventos
    btnConvertir.addEventListener('click', () => {
        const datos = calcular();
        agregarPegatina(datos);
    });

    btnIntercambiar.addEventListener('click', () => {
        const aux = selectOrigen.value;
        selectOrigen.value = selectDestino.value;
        selectDestino.value = aux;
        calcular();
    });

    btnLimpiar.addEventListener('click', () => {
        pegatinas = [];
        localStorage.removeItem('pegatinas_guardadas');
        mostrarPegatinas();
    });

    inputMonto.addEventListener('input', calcular);
    selectOrigen.addEventListener('change', calcular);
    selectDestino.addEventListener('change', calcular);

    // Inicializar al cargar la página
    calcular();
    mostrarPegatinas();
});
