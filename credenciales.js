// =============================================
//  CREDENCIALES · FUT 7 EL JAGUAR
// =============================================

const urlParams = new URLSearchParams(window.location.search);
const categoria = urlParams.get('categoria');
const equipo    = urlParams.get('equipo');

if (!categoria || !equipo) location.href = '../menu/menu.html';

const storageKey       = `jugadores_${categoria}_${equipo}`;
const storageKeyConfig = `config_${categoria}`;

// ── Titulos ──
document.getElementById('headerTitle').textContent = 'Credenciales';
document.getElementById('headerSub').textContent   = `${equipo} · ${categoria}`;
document.getElementById('qrEquipoNombre').textContent = equipo;
document.getElementById('qrEquipoCat').textContent    = `${categoria} · Temporada 2025`;

// ── Volver ──
document.getElementById('btnVolver').onclick = () =>
    location.href = `jugadores.html?categoria=${encodeURIComponent(categoria)}&equipo=${encodeURIComponent(equipo)}`;

// ── Diseño asignado a la categoría ──
function getDisenoAsignado() {
    var id = localStorage.getItem('diseno_asignado_' + categoria);
    if (!id) return null;
    var disenos = JSON.parse(localStorage.getItem('disenos_credencial')) || [];
    return disenos.find(function(d){ return d.id === id; }) || null;
}

// ── Diseño asignado a la categoría ──
function getDisenoAsignado() {
    var id = localStorage.getItem('diseno_asignado_' + categoria);
    if (!id) return null;
    var disenos = JSON.parse(localStorage.getItem('disenos_credencial')) || [];
    return disenos.find(function(d){ return d.id === id; }) || null;
}

// ── Helpers de color ──
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

const teamColor = getJerseyColor(equipo);

// ── Storage ──
function cargarJugadores() {
    return JSON.parse(localStorage.getItem(storageKey)) || [];
}

function cargarConfig() {
    return JSON.parse(localStorage.getItem(storageKeyConfig)) || {};
}

function calcularEdad(fecha) {
    const hoy = new Date(), nac = new Date(fecha);
    let e = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) e--;
    return e;
}

function esRefuerzo(edad) {
    const cfg = cargarConfig();
    if (cfg.permitirRefuerzos && cfg.refuerzos && Array.isArray(cfg.refuerzos))
        return cfg.refuerzos.includes(parseInt(edad));
    return false;
}

// ── Seleccionados ──
let seleccionados = new Set();

function actualizarUI() {
    const count = seleccionados.size;
    document.getElementById('countSelected').textContent = count;
    document.getElementById('btnPrint').disabled = count === 0;
    document.getElementById('toolbarInfo').textContent =
        count === 0
            ? 'Toca una credencial para seleccionarla'
            : `${count} jugador${count !== 1 ? 'es' : ''} seleccionado${count !== 1 ? 's' : ''}`;

    const total = cargarJugadores().filter(j => !j.baja).length;
    const btnSel = document.getElementById('btnSelectAll');
    btnSel.textContent = seleccionados.size === total
        ? '☑ Deseleccionar todos'
        : '☐ Seleccionar todos';

    // Actualizar visual de cards
    document.querySelectorAll('.jug-card').forEach(card => {
        const idx = parseInt(card.dataset.index);
        if (seleccionados.has(idx)) {
            card.classList.add('seleccionado');
            card.querySelector('.jug-check').textContent = '✓';
        } else {
            card.classList.remove('seleccionado');
            card.querySelector('.jug-check').textContent = '';
        }
    });
}

function toggleJugador(index) {
    if (seleccionados.has(index)) seleccionados.delete(index);
    else seleccionados.add(index);
    actualizarUI();
}

function toggleSelectAll() {
    const jugadores = cargarJugadores().filter(j => !j.baja);
    if (seleccionados.size === jugadores.length) {
        seleccionados.clear();
    } else {
        jugadores.forEach((_, i) => seleccionados.add(i));
    }
    actualizarUI();
}

// ── Render lista de jugadores ──
function renderJugadores() {
    const jugadores = cargarJugadores().filter(j => !j.baja);
    const grid      = document.getElementById('jugadoresGrid');
    const vacio     = document.getElementById('estadoVacio');

    document.getElementById('headerCount').textContent = jugadores.length;

    if (jugadores.length === 0) {
        grid.innerHTML   = '';
        vacio.style.display = 'flex';
        return;
    }
    vacio.style.display = 'none';
    grid.innerHTML = '';

    jugadores.forEach((j, index) => {
        const edad = j.edad || calcularEdad(j.fechaNacimiento);
        const ref  = esRefuerzo(edad);

        const card = document.createElement('div');
        card.className    = 'jug-card';
        card.dataset.index = index;
        card.onclick = () => toggleJugador(index);

        card.innerHTML = `
            ${ref ? '<div class="jug-badge-refuerzo">⭐ Refuerzo</div>' : ''}
            <div class="jug-check"></div>
            <img class="jug-foto"
                 src="${j.foto || 'https://via.placeholder.com/54'}"
                 alt="${j.nombre}"
                 onerror="this.src='https://via.placeholder.com/54'">
            <div class="jug-info">
                <div class="jug-nombre">${j.nombre}</div>
                <div class="jug-dorsal">#${j.numero}</div>
                <div class="jug-edad">${edad} años · ${j.fechaNacimiento || ''}</div>
            </div>
        `;

        grid.appendChild(card);
    });

    actualizarUI();
}

// ══════════════════════════════════════
//  GENERAR CREDENCIAL HTML (para imprimir)
// ══════════════════════════════════════
function generarCredencialHTML(j, color) {
    const edad      = j.edad || calcularEdad(j.fechaNacimiento);
    const ref       = esRefuerzo(edad);
    const diseno    = getDisenoAsignado();
    const darkColor = shadeColor(color, -30);
    const fotoSrc   = j.foto || 'https://via.placeholder.com/60';

    // Si hay diseño personalizado asignado, usarlo
    if (diseno) {
        const c1   = diseno.colorFondo  || color;
        const c2   = diseno.colorFondo2 || darkColor;
        const ct   = diseno.colorTitulo || '#ffffff';
        const cd   = diseno.colorDatos  || '#ffffff';
        const cn   = diseno.colorNumero || '#ffffff';
        const font = diseno.fuente === 'bebas'  ? "'Bebas Neue',cursive"  :
                     diseno.fuente === 'oswald' ? "'Oswald',sans-serif"   :
                     diseno.fuente === 'anton'  ? "'Anton',sans-serif"    :
                     diseno.fuente === 'teko'   ? "'Teko',sans-serif"     :
                                                  "'Outfit',sans-serif";
        const bgStyle = diseno.imagen
            ? 'background-image:url(' + diseno.imagen + ');background-size:cover;background-position:center;opacity:' + ((diseno.opacidad||100)/100)
            : '';
        const overlayStyle = diseno.imagen
            ? 'background:linear-gradient(135deg,' + c1 + '88,' + c2 + '88)'
            : 'background:linear-gradient(135deg,' + c1 + ',' + c2 + ')';

        return `
        <div class="credencial">
            <div class="cred-header" style="position:relative;height:38%;display:flex;align-items:center;padding:2mm 3mm;gap:2mm;">
                <div style="position:absolute;inset:0;${bgStyle}"></div>
                <div style="position:absolute;inset:0;${overlayStyle}"></div>
                <div class="cred-header-pattern"></div>
                <div class="cred-dorsal-bg" style="color:${cn}">${j.numero}</div>
                <img class="cred-foto" src="${fotoSrc}" alt="${j.nombre}" onerror="this.src='https://via.placeholder.com/60'">
                <div class="cred-header-info" style="position:relative;z-index:1">
                    <div class="cred-nombre" style="color:${ct};font-family:${font}">${j.nombre.toUpperCase()}</div>
                    <div class="cred-num" style="color:${ct};opacity:0.8">#${j.numero} · ${equipo.toUpperCase()}</div>
                    <div style="font-family:${font};font-size:2.5mm;color:${ct};opacity:0.7;letter-spacing:0.5mm">FUT 7 EL JAGUAR</div>
                </div>
            </div>
            <div class="cred-body">
                <div class="cred-datos">
                    <div class="cred-dato-row"><span class="cred-dato-label">Categoría</span><span class="cred-dato-value">${categoria}</span></div>
                    <div class="cred-dato-row"><span class="cred-dato-label">Nacimiento</span><span class="cred-dato-value">${j.fechaNacimiento || 'N/D'}</span></div>
                    <div class="cred-dato-row"><span class="cred-dato-label">Edad</span><span class="cred-dato-value">${edad} años</span></div>
                    ${ref ? '<span class="cred-badge-refuerzo">⭐ Refuerzo</span>' : ''}
                </div>
                <div class="cred-club">
                    <div class="cred-club-logo">🐆</div>
                    <div class="cred-club-nombre">FUT 7<br>EL JAGUAR</div>
                </div>
            </div>
            <div class="cred-footer" style="background:${c1}22;border-top:0.3mm solid ${c1}44">
                <span class="cred-footer-text" style="color:${c1}">Fut 7 El Jaguar · Credencial Oficial</span>
                <span class="cred-temporada">${categoria}</span>
            </div>
        </div>`;
    }

    // Sin diseño personalizado — diseño por defecto
    return `
    <div class="credencial">
        <div class="cred-header" style="background:linear-gradient(135deg,${color},${darkColor});">
            <div class="cred-header-pattern"></div>
            <div class="cred-dorsal-bg">${j.numero}</div>
            <img class="cred-foto" src="${fotoSrc}" alt="${j.nombre}"
                 onerror="this.src='https://via.placeholder.com/60'">
            <div class="cred-header-info">
                <div class="cred-nombre">${j.nombre.toUpperCase()}</div>
                <div class="cred-num">#${j.numero} · ${equipo.toUpperCase()}</div>
            </div>
        </div>
        <div class="cred-body">
            <div class="cred-datos">
                <div class="cred-dato-row"><span class="cred-dato-label">Categoría</span><span class="cred-dato-value">${categoria}</span></div>
                <div class="cred-dato-row"><span class="cred-dato-label">Nacimiento</span><span class="cred-dato-value">${j.fechaNacimiento || 'N/D'}</span></div>
                <div class="cred-dato-row"><span class="cred-dato-label">Edad</span><span class="cred-dato-value">${edad} años</span></div>
                ${ref ? '<span class="cred-badge-refuerzo">⭐ Refuerzo</span>' : ''}
            </div>
            <div class="cred-club">
                <div class="cred-club-logo">🐆</div>
                <div class="cred-club-nombre">FUT 7<br>EL JAGUAR</div>
            </div>
        </div>
        <div class="cred-footer">
            <span class="cred-footer-text">Fut 7 El Jaguar · Credencial Oficial</span>
            <span class="cred-temporada">T2025</span>
        </div>
    </div>`;
}

// ══════════════════════════════════════
//  IMPRIMIR SELECCIONADOS
//  Agrupa de 4 en 4 por página (2x2)
// ══════════════════════════════════════
function imprimirSeleccionados() {
    if (seleccionados.size === 0) return;

    const jugadores = cargarJugadores().filter(j => !j.baja);
    const lista     = [...seleccionados].sort((a,b) => a-b).map(i => jugadores[i]);

    // Agrupar en páginas de 4
    const paginas = [];
    for (let i = 0; i < lista.length; i += 4) {
        paginas.push(lista.slice(i, i + 4));
    }

    let html = '';
    paginas.forEach((pagina, pi) => {
        if (pi > 0) html += '<div style="page-break-before:always"></div>';
        html += '<div class="print-grid">';
        pagina.forEach(j => {
            html += `<div class="print-grid-item cut-guide">
                ${generarCredencialHTML(j, teamColor)}
            </div>`;
        });
        // Rellenar espacios vacíos para mantener el grid
        const restantes = 4 - pagina.length;
        for (let r = 0; r < restantes; r++) {
            html += '<div class="print-grid-item"></div>';
        }
        html += '</div>';
    });

    const zona = document.getElementById('zonaPrint');
    zona.innerHTML = html;

    // Pequeña pausa para que el DOM renderice las imágenes
    setTimeout(() => window.print(), 300);
}

// ══════════════════════════════════════
//  QR CAPITÁN
//  Genera una URL con los datos del equipo
//  codificados como parámetros
// ══════════════════════════════════════
function generarQR() {
    const jugadores = cargarJugadores().filter(j => !j.baja);
    if (jugadores.length === 0) {
        alert('No hay jugadores activos para generar el QR.');
        return;
    }

    // Construir URL de la lista pública
    // Usamos la misma página credenciales con modo=lista
    const baseURL = window.location.href.split('?')[0];
    const params  = new URLSearchParams({
        categoria: categoria,
        equipo:    equipo,
        modo:      'lista'
    });
    const listaURL = `${baseURL}?${params.toString()}`;

    // Limpiar QR anterior
    const canvas = document.getElementById('qrCanvas');
    canvas.innerHTML = '';

    // Generar QR
    new QRCode(canvas, {
        text:          listaURL,
        width:         200,
        height:        200,
        colorDark:     '#0a1628',
        colorLight:    '#ffffff',
        correctLevel:  QRCode.CorrectLevel.M
    });

    // Mostrar modal
    document.getElementById('overlayQR').classList.add('activo');
    document.getElementById('modalQR').classList.add('activo');
}

function cerrarQR() {
    document.getElementById('overlayQR').classList.remove('activo');
    document.getElementById('modalQR').classList.remove('activo');
}

document.getElementById('overlayQR').addEventListener('click', cerrarQR);

function imprimirQR() {
    const canvas   = document.getElementById('qrCanvas');
    const qrImg    = canvas.querySelector('img') || canvas.querySelector('canvas');
    const qrSrc    = qrImg ? (qrImg.src || qrImg.toDataURL()) : '';

    const zona = document.getElementById('zonaPrint');
    zona.innerHTML = `
        <div class="print-qr-page">
            <div class="print-qr-titulo">FUT 7 EL JAGUAR</div>
            <div class="print-qr-sub">${equipo.toUpperCase()} · ${categoria.toUpperCase()}</div>
            <div class="print-qr-box">
                <img src="${qrSrc}" style="width:60mm;height:60mm;display:block;">
            </div>
            <div class="print-qr-instruccion">
                Escanea este código QR para ver la lista completa de jugadores del equipo con sus credenciales.
            </div>
            <div class="print-qr-sub" style="font-size:3mm;">Temporada 2025</div>
        </div>`;

    setTimeout(() => window.print(), 200);
}

// ══════════════════════════════════════
//  MODO LISTA (cuando se abre desde QR)
//  Muestra las credenciales del equipo
//  en formato visual para el celular
// ══════════════════════════════════════
function modoLista() {
    // Ocultar toolbar y header de acciones
    document.querySelector('.toolbar').style.display = 'none';

    // Cambiar header
    document.getElementById('headerTitle').textContent = 'Lista del Equipo';

    // Renderizar como lista visual (no seleccionable)
    const jugadores = cargarJugadores().filter(j => !j.baja);
    const grid      = document.getElementById('jugadoresGrid');

    document.getElementById('headerCount').textContent = jugadores.length;

    if (jugadores.length === 0) {
        document.getElementById('estadoVacio').style.display = 'flex';
        return;
    }

    // Estilo de lista para móvil
    grid.style.gridTemplateColumns = '1fr';
    grid.style.maxWidth = '480px';
    grid.style.margin   = '0 auto';
    grid.innerHTML = '';

    jugadores.forEach((j, index) => {
        const edad = j.edad || calcularEdad(j.fechaNacimiento);
        const ref  = esRefuerzo(edad);

        const card = document.createElement('div');
        card.className = 'jug-card';
        card.style.cursor = 'default';
        card.style.pointerEvents = 'none';

        card.innerHTML = `
            ${ref ? '<div class="jug-badge-refuerzo">⭐ Refuerzo</div>' : ''}
            <img class="jug-foto"
                 src="${j.foto || 'https://via.placeholder.com/54'}"
                 alt="${j.nombre}"
                 style="width:64px;height:64px;"
                 onerror="this.src='https://via.placeholder.com/64'">
            <div class="jug-info">
                <div class="jug-nombre" style="font-size:1.1rem">${j.nombre}</div>
                <div class="jug-dorsal" style="font-size:0.85rem">#${j.numero}</div>
                <div class="jug-edad">${edad} años · ${j.fechaNacimiento || ''}</div>
            </div>
            <div style="margin-left:auto;font-family:'Bebas Neue',cursive;font-size:2rem;
                        color:${teamColor};opacity:0.5;">#${j.numero}</div>
        `;
        grid.appendChild(card);
    });
}

// ══════════════════════════════════════
//  INIT
// ══════════════════════════════════════
const modo = urlParams.get('modo');

if (modo === 'lista') {
    modoLista();
} else {
    renderJugadores();
}