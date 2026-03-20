// =============================================
//  JUGADORES · CROMOS · FUT 7 EL JAGUAR
// =============================================

const urlParams = new URLSearchParams(window.location.search);
const categoria = urlParams.get('categoria');
const equipo    = urlParams.get('equipo');

if (!categoria || !equipo) location.href = '../menu/menu.html';

// ── Storage ──
const storageKey       = `jugadores_${categoria}_${equipo}`;
const storageKeyGlobal = `jugadores_activos_${categoria}`;
const storageKeyConfig = `config_${categoria}`;

// ── Colores de equipo ──
const JERSEY_COLORS = [
    '#1d4ed8','#dc2626','#16a34a','#7c3aed',
    '#ea580c','#0891b2','#be185d','#854d0e',
    '#065f46','#1e3a5f','#6d28d9','#b45309',
    '#0f766e','#9f1239','#1e40af','#166534'
];

function getJerseyColor(nombre) {
    let h = 0;
    for (let i = 0; i < nombre.length; i++) h = nombre.charCodeAt(i) + ((h << 5) - h);
    return JERSEY_COLORS[Math.abs(h) % JERSEY_COLORS.length];
}

function shadeColor(hex, pct) {
    let n = parseInt(hex.slice(1), 16);
    const r = Math.min(255, Math.max(0, (n >> 16) + pct));
    const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + pct));
    const b = Math.min(255, Math.max(0, (n & 0xff) + pct));
    return `#${((r<<16)|(g<<8)|b).toString(16).padStart(6,'0')}`;
}

function hexToRgba(hex, alpha) {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n>>16)&255},${(n>>8)&255},${n&255},${alpha})`;
}

const teamColor     = getJerseyColor(equipo || '');
const teamColorDark = shadeColor(teamColor, -35);

// ── Inyectar CSS vars del equipo ──
document.documentElement.style.setProperty('--team-color', teamColor);
document.documentElement.style.setProperty('--team-color-dark', teamColorDark);
document.documentElement.style.setProperty('--team-color-alpha', hexToRgba(teamColor, 0.18));

// ── SVG camiseta header ──
function jerseySmallSVG(color) {
    const dark = shadeColor(color, -30);
    return `<svg viewBox="0 0 48 54" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="hjg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}"/>
                <stop offset="100%" stop-color="${dark}"/>
            </linearGradient>
        </defs>
        <path d="M9 7 L3 17 L12 20 L12 42 L36 42 L36 20 L45 17 L39 7 L31 11 Q24 14 17 11 Z"
              fill="url(#hjg)" stroke="rgba(255,255,255,0.22)" stroke-width="1"/>
        <path d="M17 11 Q20 15 24 15 Q28 15 31 11" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1"/>
    </svg>`;
}

// ── SVG camiseta banner ──
function jerseyBannerSVG(color) {
    const dark = shadeColor(color, -30);
    return `<svg viewBox="0 0 80 90" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bjg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="${color}"/>
                <stop offset="100%" stop-color="${dark}"/>
            </linearGradient>
        </defs>
        <ellipse cx="40" cy="86" rx="22" ry="3" fill="rgba(0,0,0,0.25)"/>
        <path d="M15 12 L5 28 L20 32 L20 70 L60 70 L60 32 L75 28 L65 12 L52 18 Q40 22 28 18 Z"
              fill="url(#bjg)" stroke="rgba(255,255,255,0.2)" stroke-width="1.5"/>
        <path d="M28 18 Q34 24 40 24 Q46 24 52 18" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
        <path d="M20 32 L20 46 Q30 43 38 44 L38 30 Q29 31 20 32 Z" fill="rgba(255,255,255,0.06)"/>
    </svg>`;
}

// ── Inyectar header y banner ──
document.getElementById('teamEmblem').innerHTML   = jerseySmallSVG(teamColor);
document.getElementById('bannerJersey').innerHTML = jerseyBannerSVG(teamColor);
document.getElementById('tituloEquipo').textContent = equipo || 'Equipo';
document.getElementById('headerCat').textContent    = categoria || '';
document.getElementById('bannerNombre').textContent = equipo || 'Equipo';
document.getElementById('bannerCat').textContent    = `${categoria} · Temporada 2025`;

// ── Volver ──
document.getElementById('btnVolver').onclick = () =>
    location.href = `equipos.html?categoria=${encodeURIComponent(categoria)}`;

// ── Ir a galería de diseños de credencial ──
function irADisenoCredencial() {
    var p = new URLSearchParams(window.location.search);
    var cat = p.get('categoria') || '';
    var eq  = p.get('equipo')    || '';
    location.href = 'galeria-disenos.html?categoria=' + encodeURIComponent(cat) + '&equipo=' + encodeURIComponent(eq);
}

// ── Ir a credenciales (impresión) ──
function irACredenciales() {
    var p = new URLSearchParams(window.location.search);
    var cat = p.get('categoria') || '';
    var eq  = p.get('equipo')    || '';
    location.href = 'credenciales.html?categoria=' + encodeURIComponent(cat) + '&equipo=' + encodeURIComponent(eq);
}

const lista = document.getElementById('listaJugadores');
let jugadorAEliminar = null;

// ══════════════════════════════════════
//  PARTÍCULAS DE FONDO
// ══════════════════════════════════════
(function initParticles() {
    const c = document.getElementById('particles');
    const cols = [teamColor, shadeColor(teamColor, 40), '#ffffff', '#c8a84b'];
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const s = Math.random() * 4 + 1.5;
        p.style.cssText = `
            width:${s}px; height:${s}px;
            left:${Math.random()*100}%;
            background:${cols[Math.floor(Math.random()*cols.length)]};
            animation-duration:${Math.random()*16+10}s;
            animation-delay:${Math.random()*14}s;
        `;
        c.appendChild(p);
    }
})();

// ══════════════════════════════════════
//  TOAST
// ══════════════════════════════════════
function mostrarToast(msg, tipo = 'exito') {
    let t = document.getElementById('toast-jug');
    if (!t) { t = document.createElement('div'); t.id = 'toast-jug'; document.body.appendChild(t); }
    t.style.background = tipo === 'exito'
        ? 'linear-gradient(135deg,#22c55e,#16a34a)'
        : 'linear-gradient(135deg,#ef4444,#dc2626)';
    t.style.color  = '#fff';
    t.style.border = tipo === 'exito' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(239,68,68,0.4)';
    t.textContent  = msg;
    t.style.opacity   = '1';
    t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._t);
    t._t = setTimeout(() => {
        t.style.opacity   = '0';
        t.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}

// ══════════════════════════════════════
//  MODALES
// ══════════════════════════════════════
function mostrarModalEliminar(index, nombre, numero) {
    jugadorAEliminar = index;
    document.getElementById('nombreEliminar').textContent = `${nombre} #${numero}`;
    document.getElementById('overlayModal').classList.add('activo');
    document.getElementById('modalEliminar').classList.add('activo');
}
function ocultarModalEliminar() {
    document.getElementById('overlayModal').classList.remove('activo');
    document.getElementById('modalEliminar').classList.remove('activo');
    jugadorAEliminar = null;
}
function confirmarEliminarJugador() {
    if (jugadorAEliminar === null) return;
    const jugadores = cargarJugadores();
    const nombre = jugadores[jugadorAEliminar].nombre;
    jugadores.splice(jugadorAEliminar, 1);
    guardarJugadores(jugadores);
    mostrarToast(`✓ ${nombre} eliminado de la plantilla`);
    ocultarModalEliminar();
    mostrarJugadores();
}

function mostrarModalRefuerzo(titulo, texto) {
    document.getElementById('tituloModalRefuerzo').textContent = titulo;
    document.getElementById('textoModalRefuerzo').textContent  = texto;
    document.getElementById('overlayModal').classList.add('activo');
    document.getElementById('modalRefuerzo').classList.add('activo');
}
function ocultarModalRefuerzo() {
    document.getElementById('overlayModal').classList.remove('activo');
    document.getElementById('modalRefuerzo').classList.remove('activo');
}

document.getElementById('overlayModal').addEventListener('click', () => {
    ocultarModalEliminar();
    ocultarModalRefuerzo();
});

// ══════════════════════════════════════
//  CONFIGURACIÓN Y HELPERS
// ══════════════════════════════════════
function cargarConfigCategoria() {
    return JSON.parse(localStorage.getItem(storageKeyConfig)) || {};
}

function calcularEdad(fechaNacimiento) {
    const hoy = new Date(), nac = new Date(fechaNacimiento);
    let edad  = hoy.getFullYear() - nac.getFullYear();
    const mes = hoy.getMonth() - nac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad;
}

function esEdadRefuerzo(edad) {
    const cfg = cargarConfigCategoria();
    if (!cfg.permitirRefuerzos || !cfg.refuerzos || !Array.isArray(cfg.refuerzos)) return false;
    return cfg.refuerzos.some(r => parseInt(edad) >= r.min && parseInt(edad) <= r.max);
}

function estaEnRangoNormal(edad) {
    const cfg = cargarConfigCategoria();
    if (cfg.edadMin && cfg.edadMax)
        return parseInt(edad) >= cfg.edadMin && parseInt(edad) <= cfg.edadMax;
    return true;
}

function contarRefuerzosActivos() {
    return cargarJugadores().filter(j => !j.baja && esEdadRefuerzo(j.edad || calcularEdad(j.fechaNacimiento))).length;
}

function getLimiteRefuerzos() {
    return cargarConfigCategoria().cantidadRefuerzos || 0;
}

// ══════════════════════════════════════
//  STORAGE
// ══════════════════════════════════════
function cargarJugadores() {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
}
function guardarJugadores(jugadores) {
    localStorage.setItem(storageKey, JSON.stringify(jugadores));
    actualizarJugadoresActivos();
    actualizarStats();
}
function cargarJugadoresActivos() {
    return JSON.parse(localStorage.getItem(storageKeyGlobal)) || [];
}
function actualizarJugadoresActivos() {
    const equipos = JSON.parse(localStorage.getItem(`equipos_${categoria}`)) || [];
    const activos = [];
    equipos.forEach(eq => {
        const jugs = JSON.parse(localStorage.getItem(`jugadores_${categoria}_${eq}`)) || [];
        jugs.forEach(j => { if (!j.baja) activos.push(j.nombre.toLowerCase().trim()); });
    });
    localStorage.setItem(storageKeyGlobal, JSON.stringify(activos));
}

function actualizarStats() {
    const jugs    = cargarJugadores();
    const activos = jugs.filter(j => !j.baja).length;
    const baja    = jugs.filter(j =>  j.baja).length;
    const refuerz = jugs.filter(j => !j.baja && esEdadRefuerzo(j.edad || calcularEdad(j.fechaNacimiento))).length;

    document.getElementById('statActivos').textContent   = activos;
    document.getElementById('statBaja').textContent      = baja;
    document.getElementById('statRefuerzos').textContent = refuerz;
    document.getElementById('bannerTotal').textContent   = jugs.length;
}

// ══════════════════════════════════════
//  FORMULARIO
// ══════════════════════════════════════
function mostrarFormulario() {
    document.getElementById('formAgregar').classList.add('activo');
    ['nombreJugador','numeroJugador','fotoJugador'].forEach(id => document.getElementById(id).value = '');
    document.getElementById('fechaNacimiento').value = '';
    ['errorNombre','errorNumero','errorFecha'].forEach(id => document.getElementById(id).textContent = '');
    document.getElementById('nombreJugador').focus();
}

function ocultarFormulario() {
    document.getElementById('formAgregar').classList.remove('activo');
}

function guardarJugador() {
    const nombre   = document.getElementById('nombreJugador').value.trim();
    const numero   = document.getElementById('numeroJugador').value.trim();
    const fechaNac = document.getElementById('fechaNacimiento').value;
    const foto     = document.getElementById('fotoJugador').value.trim();
    let valido = true;

    if (!nombre) { document.getElementById('errorNombre').textContent = 'El nombre es obligatorio'; valido = false; }
    else document.getElementById('errorNombre').textContent = '';
    if (!numero) { document.getElementById('errorNumero').textContent = 'El número es obligatorio'; valido = false; }
    else document.getElementById('errorNumero').textContent = '';
    if (!fechaNac) { document.getElementById('errorFecha').textContent = 'La fecha de nacimiento es obligatoria'; valido = false; }
    else document.getElementById('errorFecha').textContent = '';
    if (!valido) return;

    const cfg  = cargarConfigCategoria();
    const edad = calcularEdad(fechaNac);

    if (cfg.edadMin && cfg.edadMax) {
        const dentroRango   = edad >= cfg.edadMin && edad <= cfg.edadMax;
        const esRefuerzoVal = cfg.permitirRefuerzos && cfg.refuerzos &&
                              cfg.refuerzos.some(r => parseInt(edad) >= r.min && parseInt(edad) <= r.max);

        if (dentroRango) {
            // jugador normal, pasa directo

        } else if (esRefuerzoVal) {

            // Ordenar slots de más restrictivo (rango más pequeño) a menos restrictivo
            const slotsOrdenados = cfg.refuerzos
                .map((r, i) => ({ ...r, indiceOriginal: i, rango: r.max - r.min }))
                .sort((a, b) => a.rango - b.rango);

            // Contar cuántos jugadores activos ya ocupan cada slot
            // siguiendo el mismo orden de más restrictivo a menos restrictivo
            const jugadoresActivos = cargarJugadores().filter(j => !j.baja);
            const slotsOcupados = slotsOrdenados.map(() => false);

            jugadoresActivos.forEach(j => {
                const eRef = parseInt(j.edad || calcularEdad(j.fechaNacimiento));
                // Asignar al primer slot (más restrictivo) disponible que acepte esta edad
                for (let i = 0; i < slotsOrdenados.length; i++) {
                    const s = slotsOrdenados[i];
                    if (!slotsOcupados[i] && eRef >= s.min && eRef <= s.max) {
                        slotsOcupados[i] = true;
                        break;
                    }
                }
            });

            // Buscar si hay algún slot libre que acepte la edad del nuevo jugador
            // también en orden de más restrictivo a menos restrictivo
            const haySlotLibre = slotsOrdenados.some((s, i) =>
                !slotsOcupados[i] && parseInt(edad) >= s.min && parseInt(edad) <= s.max
            );

            if (!haySlotLibre) {
                const rangos = cfg.refuerzos.map((r, i) => `Refuerzo ${i+1}: ${r.min}-${r.max}`).join(', ');
                document.getElementById('errorFecha').textContent =
                    `No hay slots de refuerzo disponibles para ${edad} años. (${rangos})`;
                return;
            }

        } else {
            let msg = `La edad del jugador (${edad} años) no está en el rango permitido (${cfg.edadMin}-${cfg.edadMax} años)`;
            if (cfg.permitirRefuerzos && cfg.refuerzos?.length > 0) {
                const rangos = cfg.refuerzos.map((r, i) => `Refuerzo ${i+1}: ${r.min}-${r.max}`).join(', ');
                msg += `. Rangos de refuerzo: ${rangos}`;
            }
            document.getElementById('errorFecha').textContent = msg;
            return;
        }
    }

    const activos = cargarJugadoresActivos();
    if (activos.includes(nombre.toLowerCase())) {
        document.getElementById('errorNombre').textContent = 'Este jugador ya está activo en otro equipo de esta categoría';
        return;
    }

    const jugadores = cargarJugadores();
    jugadores.push({ nombre, numero, fechaNacimiento: fechaNac, edad, foto: foto || null, baja: false, pagado: false });
    guardarJugadores(jugadores);
    ocultarFormulario();
    mostrarJugadores();
    mostrarToast(`✓ ${nombre} fichado`);
}

// ══════════════════════════════════════
//  MOSTRAR JUGADORES — CROMOS
// ══════════════════════════════════════
function mostrarJugadores() {
    const jugadores = cargarJugadores();
    lista.innerHTML = '';
    actualizarStats();

    const vacio = document.getElementById('estadoVacio');
    if (jugadores.length === 0) { vacio.style.display = 'flex'; return; }
    vacio.style.display = 'none';

    const dorsalColors = ['#3b82f6','#ef4444','#22c55e','#f97316','#a855f7','#06b6d4'];

    jugadores.forEach((j, index) => {
        const edad        = j.edad || calcularEdad(j.fechaNacimiento);
        const esRefuerzo  = esEdadRefuerzo(edad);
        const enRango     = estaEnRangoNormal(edad);
        const dorsalColor = dorsalColors[index % dorsalColors.length];

        const card = document.createElement('div');
        card.className = 'tarjeta' + (j.baja ? ' baja' : '');
        card.dataset.index = index;
        const dealRotate = index % 2 === 0 ? '-4deg' : '4deg';
        card.style.setProperty('--deal-rotate', dealRotate);
        card.style.animationDelay = `${index * 0.07}s`;

        if (esRefuerzo && !j.baja) {
            const etiq = document.createElement('div');
            etiq.className   = 'etiqueta-refuerzo';
            etiq.textContent = '⭐ REFUERZO';
            card.appendChild(etiq);
        }

        const btnEdit = document.createElement('button');
        btnEdit.className = 'btn-editar-jugador';
        btnEdit.innerHTML = '✏️';
        btnEdit.title     = 'Editar';
        btnEdit.onclick   = (e) => { e.stopPropagation(); activarEdicionJugador(card, index); };

        const btnDel = document.createElement('button');
        btnDel.className = 'btn-eliminar-jugador';
        btnDel.innerHTML = '✕';
        btnDel.title     = 'Eliminar';
        btnDel.onclick   = (e) => { e.stopPropagation(); mostrarModalEliminar(index, j.nombre, j.numero); };

        // ── CABECERA DEL CROMO ──
        const cromoHeader = document.createElement('div');
        cromoHeader.className = 'cromo-header';

        const headerBg   = document.createElement('div'); headerBg.className   = 'cromo-header-bg';
        const headerDeco = document.createElement('div'); headerDeco.className = 'cromo-header-deco';
        const dorsalEl   = document.createElement('div');
        dorsalEl.className   = 'cromo-dorsal';
        dorsalEl.textContent = j.numero;

        const fotoContainer = document.createElement('div');
        fotoContainer.className = 'foto-container';

        const img = document.createElement('img');
        img.src = j.foto || 'https://via.placeholder.com/72';
        img.alt = j.nombre;
        img.dataset.index = index;

        const fotoOverlay = document.createElement('div');
        fotoOverlay.className   = 'foto-overlay';
        fotoOverlay.textContent = '📷 Cambiar';

        fotoContainer.appendChild(img);
        fotoContainer.appendChild(fotoOverlay);

        img.onclick = (e) => {
            e.stopPropagation();
            if (!card.classList.contains('editando')) subirFotoJugador(index);
        };
        fotoContainer.addEventListener('dragover', (e) => {
            e.preventDefault(); fotoContainer.classList.add('drag-over');
            fotoOverlay.textContent = '⬇️ Soltar';
        });
        fotoContainer.addEventListener('dragleave', () => {
            fotoContainer.classList.remove('drag-over');
            fotoOverlay.textContent = '📷 Cambiar';
        });
        fotoContainer.addEventListener('drop', (e) => {
            e.preventDefault(); fotoContainer.classList.remove('drag-over');
            procesarImagenDrop(e, index);
        });

        cromoHeader.appendChild(headerBg);
        cromoHeader.appendChild(headerDeco);
        cromoHeader.appendChild(dorsalEl);
        cromoHeader.appendChild(fotoContainer);

        // ── CUERPO DEL CROMO ──
        const cromoBody = document.createElement('div');
        cromoBody.className = 'cromo-body';

        const nombreEl = document.createElement('p');
        nombreEl.className   = 'jugador-nombre';
        nombreEl.textContent = j.nombre;

        const numEl = document.createElement('p');
        numEl.className   = 'numero-playera';
        numEl.textContent = `#${j.numero}`;
        numEl.style.color = dorsalColor;

        const edadEl = document.createElement('p');
        edadEl.className   = 'jugador-edad';
        edadEl.textContent = `${edad} años`;
        if (!enRango && !esRefuerzo) edadEl.classList.add('edad-fuera-rango');

        const fechaEl = document.createElement('p');
        fechaEl.className   = 'fecha-nacimiento jugador-fecha';
        fechaEl.textContent = `📅 ${j.fechaNacimiento}`;

        cromoBody.appendChild(nombreEl);
        cromoBody.appendChild(numEl);
        cromoBody.appendChild(edadEl);
        cromoBody.appendChild(fechaEl);

        // ── CONTROLES ──
        const controles = document.createElement('div');
        controles.className = 'controles-jugador';

        const ctrlBaja = document.createElement('div');
        ctrlBaja.className = 'control-item';
        ctrlBaja.innerHTML = `
            <span>Estado</span>
            <label class="switch">
                <input type="checkbox" ${!j.baja ? 'checked' : ''} onchange="toggleBaja(${index})">
                <span class="slider"></span>
            </label>`;

        const ctrlPago = document.createElement('div');
        ctrlPago.className = 'control-item';
        ctrlPago.innerHTML = `
            <span>Pago</span>
            <label class="switch">
                <input type="checkbox" ${j.pagado ? 'checked' : ''} onchange="togglePago(${index})">
                <span class="slider"></span>
            </label>`;

        controles.appendChild(ctrlBaja);
        controles.appendChild(ctrlPago);

        card.appendChild(btnEdit);
        card.appendChild(btnDel);
        card.appendChild(cromoHeader);
        card.appendChild(cromoBody);
        card.appendChild(controles);

        lista.appendChild(card);
    });
}

// ══════════════════════════════════════
//  FOTO — UPLOAD Y DROP
// ══════════════════════════════════════
function procesarImagenDrop(e, index) {
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) {
        mostrarToast('⚠️ Arrastra una imagen válida', 'error'); return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
        const jugs = cargarJugadores();
        jugs[index].foto = ev.target.result;
        guardarJugadores(jugs);
        mostrarJugadores();
        mostrarToast('✓ Foto actualizada');
    };
    reader.readAsDataURL(file);
}

function subirFotoJugador(index) {
    const input   = document.createElement('input');
    input.type    = 'file'; input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const jugs = cargarJugadores();
            jugs[index].foto = ev.target.result;
            guardarJugadores(jugs);
            mostrarJugadores();
            mostrarToast('✓ Foto actualizada');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// ══════════════════════════════════════
//  EDICIÓN INLINE
// ══════════════════════════════════════
function activarEdicionJugador(card, index) {
    const jugs = cargarJugadores();
    const j    = jugs[index];

    card.classList.add('editando');
    card.querySelector('.btn-editar-jugador').style.display  = 'none';
    card.querySelector('.btn-eliminar-jugador').style.display = 'none';

    const cromoBody = card.querySelector('.cromo-body');
    const controles = card.querySelector('.controles-jugador');
    controles.style.display = 'none';

    const nombreP = cromoBody.querySelector('.jugador-nombre');
    const numP    = cromoBody.querySelector('.numero-playera');
    const fechaP  = cromoBody.querySelector('.jugador-fecha');

    const inNombre = document.createElement('input');
    inNombre.type = 'text'; inNombre.value = j.nombre; inNombre.placeholder = 'Nombre';

    const inNumero = document.createElement('input');
    inNumero.type = 'number'; inNumero.value = j.numero; inNumero.placeholder = '#'; inNumero.min = '0';

    const inFecha = document.createElement('input');
    inFecha.type = 'date'; inFecha.value = j.fechaNacimiento;

    nombreP.replaceWith(inNombre);
    numP.replaceWith(inNumero);
    fechaP.replaceWith(inFecha);

    const botonesDiv = document.createElement('div');
    botonesDiv.className = 'botones-edicion';

    const btnAcept = document.createElement('button');
    btnAcept.className   = 'btn-edicion btn-aceptar-edit';
    btnAcept.textContent = '✓ Guardar';
    btnAcept.onclick     = () => guardarEdicionJugador(index, inNombre.value, inNumero.value, inFecha.value);

    const btnCanc = document.createElement('button');
    btnCanc.className   = 'btn-edicion btn-cancelar-edit';
    btnCanc.textContent = 'Cancelar';
    btnCanc.onclick     = () => mostrarJugadores();

    botonesDiv.appendChild(btnCanc);
    botonesDiv.appendChild(btnAcept);
    card.appendChild(botonesDiv);
}

function guardarEdicionJugador(index, nombre, numero, fecha) {
    if (!nombre.trim() || !numero.toString().trim() || !fecha) {
        mostrarToast('⚠️ Todos los campos son obligatorios', 'error'); return;
    }
    const jugs = cargarJugadores();
    jugs[index].nombre          = nombre.trim();
    jugs[index].numero          = numero.toString().trim();
    jugs[index].fechaNacimiento = fecha;
    jugs[index].edad            = calcularEdad(fecha);
    guardarJugadores(jugs);
    mostrarJugadores();
    mostrarToast('✓ Jugador actualizado');
}

// ══════════════════════════════════════
//  TOGGLE BAJA / PAGO
// ══════════════════════════════════════
function toggleBaja(index) {
    const jugs = cargarJugadores();
    const j    = jugs[index];
    const edad = j.edad || calcularEdad(j.fechaNacimiento);

    if (j.baja && esEdadRefuerzo(edad)) {
        const activos = contarRefuerzosActivos();
        const limite  = getLimiteRefuerzos();
        if (activos >= limite) {
            mostrarModalRefuerzo(
                'Límite de Refuerzos',
                `Ya hay ${activos} refuerzo(s) activo(s) y el límite es ${limite}. Primero da de baja a otro refuerzo.`
            );
            mostrarJugadores();
            return;
        }
    }

    jugs[index].baja = !jugs[index].baja;
    guardarJugadores(jugs);
    mostrarJugadores();
}

function togglePago(index) {
    const jugs = cargarJugadores();
    jugs[index].pagado = !jugs[index].pagado;
    guardarJugadores(jugs);
}

// Enter en form
document.getElementById('nombreJugador').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') guardarJugador();
});

// ── Init ──
actualizarJugadoresActivos();
mostrarJugadores();