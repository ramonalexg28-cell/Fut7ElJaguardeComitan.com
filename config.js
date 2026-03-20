// ========== CONFIGURACIÓN Y VARIABLES GLOBALES ==========

// Variables globales del estado de la aplicación
let jornadaActual = 0;
let todasLasJornadas = [];
let vistaActual = 'individual';
let modoAgregarActivo = {}; // {jornadaIdx: true/false}

// Variable para drag & drop
let partidoArrastrado = null;
let esPartidoAgregado = false;

// Variables para sistema de sugerencias
let rolSugerido = null;
let partidosJugadosSugerencia = null;

// Obtener categoría de la URL
const urlParams = new URLSearchParams(window.location.search);
const categoria = urlParams.get('categoria') || 'Demo';

// Ruta al menú (ajustar según estructura de carpetas)
const RUTA_MENU = '../menu/menu.html';

// Actualizar título
document.getElementById('tituloRol').textContent = `🏆 ROL ${categoria.toUpperCase()} 🏆`;

// Claves de localStorage
const storageKeyEquipos = `equipos_${categoria}`;
const storageKeyRol = `rol_${categoria}`;
const storageKeyJornadasJugadas = `jornadas_jugadas_${categoria}`;
const storageKeyEquiposEnRol = `equipos_en_rol_${categoria}`;
const storageKeyPartidosJugados = `partidos_jugados_${categoria}`;
const storageKeyPartidosAgregados = `partidos_agregados_${categoria}`;
const storageKeyPartidosMovidos = `partidos_movidos_${categoria}`;

// Referencias a elementos DOM
const jornadasContainer = document.getElementById("jornadasContainer");
const btnGenerar = document.getElementById("btnGenerar");
const btnEliminar = document.getElementById("btnEliminar");

// Función para obtener el botón agregar (puede no existir aún)
function getBtnAgregar() {
    return document.getElementById("btnAgregar");
}

// Función global para toggle modo agregar en sugerencias
function toggleModoAgregarSugerencia(jornadaIdx) {
    modoAgregarActivo[jornadaIdx] = !modoAgregarActivo[jornadaIdx];
    mostrarVistaSugerencia();
    console.log(`🔄 Modo agregar en J${jornadaIdx + 1}:`, modoAgregarActivo[jornadaIdx]);
}

