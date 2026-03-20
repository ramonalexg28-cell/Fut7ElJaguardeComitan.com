// ========== FUNCIONES AUXILIARES Y UTILIDADES ==========

// Función para volver al menú
function volverAtras() {
    window.location.href = RUTA_MENU;
}

// Debug: Verificar estado del localStorage al cargar
window.addEventListener('DOMContentLoaded', () => {
    console.log('🔍 Verificando datos guardados...');
    console.log('Rol guardado:', localStorage.getItem(storageKeyRol) ? 'SÍ' : 'NO');
    console.log('Equipos en rol:', localStorage.getItem(storageKeyEquiposEnRol));
    
    const rolGuardado = JSON.parse(localStorage.getItem(storageKeyRol));
    if (rolGuardado) {
        console.log('✅ Jornadas encontradas:', rolGuardado.length);
    }
});

// Función para ordenar partidos: Descansos → No jugados → Agregados → Jugados
function ordenarPartidos(partidosJornada, jornadaIdx) {
    // MANTENER ORDEN ORIGINAL - No reordenar por estado
    return partidosJornada.map((partido, pIdx) => ({
        partido: partido,
        indiceOriginal: pIdx
    }));
}

// Mostrar estadísticas del torneo
function mostrarEstadisticas(numEquipos, jornadas) {
    const estadisticasContainer = document.getElementById('estadisticasContainer');
    const navegacionContainer = document.getElementById('navegacionContainer');
    
    estadisticasContainer.style.display = 'block';
    navegacionContainer.style.display = 'flex';

    const numJornadas = jornadas.length;
    const partidosPorJornada = Math.floor(numEquipos / 2);
    const totalPartidos = numJornadas * partidosPorJornada;

    document.getElementById('statEquipos').textContent = numEquipos;
    document.getElementById('statJornadas').textContent = numJornadas;
    document.getElementById('statPartidosJornada').textContent = partidosPorJornada;
    document.getElementById('statTotalPartidos').textContent = totalPartidos;
}

// Actualizar estado de navegación
function actualizarNavegacion() {
    const infoJornada = document.getElementById('infoJornada');
    const btnAnterior = document.getElementById('btnAnterior');
    const btnSiguiente = document.getElementById('btnSiguiente');
    const btnPrimera = document.getElementById('btnPrimera');
    const btnUltima = document.getElementById('btnUltima');

    infoJornada.textContent = `Jornada ${jornadaActual + 1} de ${todasLasJornadas.length}`;
    
    btnAnterior.disabled = jornadaActual === 0;
    btnPrimera.disabled = jornadaActual === 0;
    btnSiguiente.disabled = jornadaActual === todasLasJornadas.length - 1;
    btnUltima.disabled = jornadaActual === todasLasJornadas.length - 1;
}

// Event listener para Enter en el buscador de jornadas
document.addEventListener('DOMContentLoaded', () => {
    const inputBuscar = document.getElementById('inputBuscarJornada');
    if (inputBuscar) {
        inputBuscar.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                irAJornada();
            }
        });
    }
});