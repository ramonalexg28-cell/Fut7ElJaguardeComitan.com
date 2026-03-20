// ========== CONFIGURACIÓN Y VARIABLES GLOBALES ==========

const storageKeyHorariosGlobal = 'horarios_global';
const storageKeyColoresCategorias = 'colores_categorias';

let horariosAsignados = JSON.parse(localStorage.getItem(storageKeyHorariosGlobal)) || {};
let estadosVistaCategorias = {}; // 'visible', 'gris', 'oculto'
let semanaActual = 0;
let fechaBase = new Date();
let partidoDraggeando = null;
let celdaDraggeando = null;
let categoriasAbiertas = {}; // {categoria: true/false}
let jornadasAbiertas = {}; // {'categoria_jornada': true/false}

// Cargar colores guardados o usar predeterminados
let coloresCategorias = JSON.parse(localStorage.getItem(storageKeyColoresCategorias)) || {
    'Varonil': '#d4edda',
    'Femenil': '#f8d7da',
    'Veteranos': '#fff3cd',
    'Sub 21': '#d1ecf1',
    'Sub 15': '#e2d5f5',
    'Mixto': '#fce5cd',
    'Demo': '#e0e0e0'
};

const horarios = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'];
const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// ========== GESTIÓN DE COLORES ==========

function cambiarColorCategoria(categoria) {
    const colorActual = coloresCategorias[categoria] || '#e0e0e0';
    
    // Crear un input temporal de tipo color
    const input = document.createElement('input');
    input.type = 'color';
    input.value = colorActual;
    
    input.onchange = function() {
        coloresCategorias[categoria] = input.value;
        localStorage.setItem(storageKeyColoresCategorias, JSON.stringify(coloresCategorias));
        
        // Actualizar el color mostrado
        const colorDisplay = document.querySelector(`#color-display-${categoria.replace(/\s+/g, '-')}`);
        if (colorDisplay) {
            colorDisplay.style.backgroundColor = input.value;
        }
        
        // Regenerar agenda para mostrar nuevos colores
        generarAgenda();
    };
    
    input.click();
}

// ========== FUNCIONES DE VALIDACIÓN ==========

// Verificar si un partido está marcado como jugado en rol de juegos
function esPartidoJugado(categoria, numeroJornada, indexPartido) {
    const partidosJugados = JSON.parse(localStorage.getItem(`partidos_jugados_${categoria}`)) || {};
    const key = `j${numeroJornada - 1}-p${indexPartido}`;
    return partidosJugados[key] === true;
}

// Verificar si un partido ya está asignado en la agenda
function partidoYaAsignado(categoria, local, visitante) {
    for (const key in horariosAsignados) {
        const partido = horariosAsignados[key];
        if (partido.categoria === categoria && 
            !partido.esDescanso &&
            partido.local === local && 
            partido.visitante === visitante) {
            return true;
        }
    }
    return false;
}

// ========== FUNCIONES DE FECHA Y SEMANA ==========

function obtenerLunesSemana(fecha, offset) {
    const fechaCalculo = new Date(fecha);
    fechaCalculo.setDate(fechaCalculo.getDate() + (offset * 7));
    const dia = fechaCalculo.getDay();
    const diff = fechaCalculo.getDate() - dia + (dia === 0 ? -6 : 1);
    return new Date(fechaCalculo.setDate(diff));
}

function generarFechasSemana() {
    const lunes = obtenerLunesSemana(fechaBase, semanaActual);
    const fechas = [];
    const domingo = new Date(lunes);
    domingo.setDate(domingo.getDate() - 1);
    
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(domingo);
        fecha.setDate(fecha.getDate() + i);
        fechas.push(fecha);
    }
    return fechas;
}

function formatearFecha(fecha) {
    const dia = fecha.getDate();
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return `${dia}/${meses[fecha.getMonth()]}`;
}

function actualizarInfoSemana() {
    const fechas = generarFechasSemana();
    const primerDia = fechas[0];
    const ultimoDia = fechas[6];
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    document.getElementById('semanaInfo').textContent = 
        `${primerDia.getDate()} ${meses[primerDia.getMonth()]} - ${ultimoDia.getDate()} ${meses[ultimoDia.getMonth()]} ${primerDia.getFullYear()}`;
    
    fechas.forEach((fecha, i) => {
        document.getElementById(`header-${i}`).textContent = 
            `${diasSemana[fecha.getDay()]} ${formatearFecha(fecha)}`;
    });
}

function cambiarSemana(direccion) {
    semanaActual += direccion;
    actualizarInfoSemana();
    generarAgenda();
    cargarCategorias();
}

// ========== FUNCIONES DE GESTIÓN ==========

function esJornadaPendiente(categoria, numeroJornada) {
    const rol = JSON.parse(localStorage.getItem(`rol_${categoria}`)) || [];
    const partidos = rol[numeroJornada - 1];
    if (!partidos) return false;

    let partidosAsignados = 0;
    const totalPartidos = partidos.length;

    for (const key in horariosAsignados) {
        const partido = horariosAsignados[key];
        if (partido.categoria === categoria && partido.jornada === numeroJornada) {
            partidosAsignados++;
        }
    }

    return partidosAsignados < totalPartidos;
}

function eliminarPartido(key) {
    if (confirm('¿Eliminar este partido del horario?')) {
        delete horariosAsignados[key];
        localStorage.setItem(storageKeyHorariosGlobal, JSON.stringify(horariosAsignados));
        generarAgenda();
        cargarCategorias();
    }
}

// ========== FUNCIONES PARA EVENTOS/RETAS PERSONALIZADOS ==========

function mostrarModalEvento(fechaKey, hora) {
    const key = `${fechaKey}_${hora}`;
    
    console.log('📝 Creando evento para key:', key);
    
    // Verificar si ya hay algo asignado
    if (horariosAsignados[key]) {
        alert('⚠️ Este horario ya está ocupado.\n\nElimina el contenido actual primero.');
        return;
    }
    
    const nombreEvento = prompt('📝 Ingresa el nombre del evento o quien apartó:\n\n(Ejemplo: "Reta Juan", "Evento Especial", etc.)');
    
    if (nombreEvento && nombreEvento.trim() !== '') {
        try {
            // Limpiar el nombre de caracteres problemáticos
            const nombreLimpio = nombreEvento
                .trim()
                .replace(/[<>]/g, '') // Eliminar < y >
                .replace(/["'`]/g, '') // Eliminar comillas
                .substring(0, 50); // Máximo 50 caracteres
            
            if (nombreLimpio === '') {
                alert('⚠️ El nombre no puede estar vacío.');
                return;
            }
            
            horariosAsignados[key] = {
                esEvento: true,
                nombreEvento: nombreLimpio
            };
            
            console.log('✅ Evento creado:', horariosAsignados[key]);
            
            // Guardar en localStorage
            try {
                localStorage.setItem(storageKeyHorariosGlobal, JSON.stringify(horariosAsignados));
                console.log('💾 Guardado en localStorage exitosamente');
            } catch (storageError) {
                console.error('❌ Error al guardar en localStorage:', storageError);
                alert('Error al guardar. El evento no se guardó.');
                delete horariosAsignados[key];
                return;
            }
            
            console.log('🔄 Regenerando agenda...');
            generarAgenda();
            console.log('✅ Agenda regenerada exitosamente');
            
        } catch (error) {
            console.error('❌ Error al crear evento:', error);
            alert('Error al guardar el evento. Intenta de nuevo.');
            delete horariosAsignados[key];
        }
    } else {
        console.log('⚠️ Usuario canceló o nombre vacío');
    }
}

function volverAtras() {
    window.location.href = '../menu/menu.html';
}

// ========== INICIALIZACIÓN ==========
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando horarios...');
    actualizarInfoSemana();
    cargarCategorias();
    generarAgenda();
    console.log('✅ Horarios cargados correctamente');
});

function partidoProgramado(categoria, local, visitante) {
    const ahora = new Date(); // fecha Y hora actual

    for (const key in horariosAsignados) {
        const p = horariosAsignados[key];
        if (p.categoria === categoria && !p.esDescanso &&
            p.local === local && p.visitante === visitante) {
            
            // key tiene formato "2026-3-10_09:00"
            const [fechaParte, horaParte] = key.split('_');
            const [anio, mes, dia] = fechaParte.split('-');
            const [horas, minutos] = horaParte.split(':');
            
            const fechaHoraPartido = new Date(anio, mes - 1, dia, horas, minutos, 0);
            
            if (fechaHoraPartido > ahora) return true; // aún no se juega
        }
    }
    return false;
}

// Función de emergencia para limpiar datos corruptos
function limpiarDatosCorruptos() {
    if (confirm('⚠️ ATENCIÓN\n\n¿Estás seguro de que quieres limpiar todos los horarios asignados?\n\nEsto borrará todos los partidos y eventos programados.\n\n✅ SÍ = Borrar todo\n❌ NO = Cancelar')) {
        localStorage.removeItem(storageKeyHorariosGlobal);
        alert('✅ Datos limpiados. La página se recargará.');
        location.reload();
    }
}