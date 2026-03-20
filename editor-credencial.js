// =============================================
//  EDITOR DE CREDENCIAL · FUT 7 EL JAGUAR
// =============================================

var par       = new URLSearchParams(window.location.search);
var categoria = par.get('categoria') || '';
var disenoId  = par.get('id')        || '';

document.getElementById('headerSub').textContent = categoria || 'Sin categoría';

var KEY_DISENOS = 'disenos_credencial';

// ═══════════════════════════════════════
//  ESTADO DEL EDITOR
// ═══════════════════════════════════════
var estado = {
    nombre:    'Sin nombre',
    bgColor1:  '#1d4ed8',
    bgColor2:  '#0a1628',
    bgImagen:  null,
    bgOpacidad: 80,
    elementos: []   // [{id, tipo, x, y, w, h, visible, ...props}]
};

var elSeleccionado = null;
var zoom = 100;
var CANVAS_W = 600;
var CANVAS_H = 400;

// drag state
var drag = { activo:false, elId:null, startX:0, startY:0, origX:0, origY:0 };
// resize state
var resize = { activo:false, elId:null, handle:'', startX:0, startY:0, origX:0, origY:0, origW:0, origH:0 };

// fuentes
var FUENTES = [
    { id:'bebas',  label:'Bebas Neue',  css:"'Bebas Neue',cursive" },
    { id:'outfit', label:'Outfit',      css:"'Outfit',sans-serif" },
    { id:'oswald', label:'Oswald',      css:"'Oswald',sans-serif" },
    { id:'anton',  label:'Anton',       css:"'Anton',sans-serif" },
    { id:'teko',   label:'Teko',        css:"'Teko',sans-serif" }
];

// ═══════════════════════════════════════
//  CARGAR DISEÑO
// ═══════════════════════════════════════
function cargarDiseno() {
    if (!disenoId) { crearNuevo(); return; }
    var disenos = JSON.parse(localStorage.getItem(KEY_DISENOS)) || [];
    var d = disenos.find(function(x){ return x.id === disenoId; });
    if (!d) { crearNuevo(); return; }

    estado.nombre     = d.nombre     || 'Sin nombre';
    estado.bgColor1   = d.bgColor1   || d.colorFondo  || '#1d4ed8';
    estado.bgColor2   = d.bgColor2   || d.colorFondo2 || '#0a1628';
    estado.bgImagen   = d.bgImagen   || d.imagen || null;
    estado.bgOpacidad = d.bgOpacidad !== undefined ? d.bgOpacidad : 80;
    estado.elementos  = d.elementos  || elementosDefault();

    document.getElementById('nombreHdr').textContent = estado.nombre;
    document.getElementById('bgColor1').value  = estado.bgColor1;
    document.getElementById('bgColor2').value  = estado.bgColor2;
    document.getElementById('bgImgOp').value   = estado.bgOpacidad;
    document.getElementById('bgOpVal').textContent = estado.bgOpacidad + '%';

    if (estado.bgImagen) {
        document.getElementById('bgImgThumb').src           = estado.bgImagen;
        document.getElementById('bgImgThumb').style.display = 'block';
    }

    renderCanvas();
}

function crearNuevo() {
    estado.elementos = elementosDefault();
    renderCanvas();
}

function elementosDefault() {
    return [
        { id:'el_bg_rect', tipo:'rect', x:0, y:0, w:600, h:400, visible:true,
          bgColor:'transparent', borderColor:'transparent', borderWidth:0, opacity:100, radio:0, bloqueado:true, nombre:'Fondo' },
        { id:'el_foto', tipo:'foto', x:20, y:80, w:120, h:120, visible:true, nombre:'Foto Jugador' },
        { id:'el_titulo', tipo:'texto', x:160, y:30, w:400, h:50, visible:true,
          texto:'FUT 7 EL JAGUAR', fuente:'bebas', fontSize:28, color:'#ffffff',
          bold:false, italic:false, align:'left', opacity:100, nombre:'Título' },
        { id:'el_nombre', tipo:'texto', x:160, y:150, w:380, h:35, visible:true,
          texto:'NOMBRE DEL JUGADOR', fuente:'outfit', fontSize:16, color:'#ffffff',
          bold:true, italic:false, align:'left', opacity:100, nombre:'Nombre' },
        { id:'el_datos', tipo:'texto', x:160, y:195, w:280, h:25, visible:true,
          texto:'#10 · Categoría · Equipo', fuente:'outfit', fontSize:11, color:'rgba(255,255,255,0.8)',
          bold:false, italic:false, align:'left', opacity:100, nombre:'Datos' },
        { id:'el_num', tipo:'texto', x:500, y:340, w:80, h:50, visible:true,
          texto:'#10', fuente:'bebas', fontSize:32, color:'rgba(255,255,255,0.5)',
          bold:false, italic:false, align:'right', opacity:100, nombre:'Número' }
    ];
}

// ═══════════════════════════════════════
//  RENDER CANVAS
// ═══════════════════════════════════════
function renderCanvas() {
    var canvas = document.getElementById('credCanvas');

    // Fondo
    var bg = document.getElementById('canvasBg');
    bg.style.background = 'linear-gradient(135deg,' + estado.bgColor1 + ',' + estado.bgColor2 + ')';

    // Imagen de fondo
    var ov = document.getElementById('canvasImgOverlay');
    if (estado.bgImagen) {
        ov.style.backgroundImage    = 'url(' + estado.bgImagen + ')';
        ov.style.backgroundSize     = '85%';
        ov.style.backgroundPosition = 'center';
        ov.style.backgroundRepeat   = 'no-repeat';
        ov.style.opacity            = estado.bgOpacidad / 100;
        ov.style.webkitMaskImage    = 'radial-gradient(ellipse 65% 80% at center, black 30%, transparent 80%)';
        ov.style.maskImage          = 'radial-gradient(ellipse 65% 80% at center, black 30%, transparent 80%)';
    } else {
        ov.style.backgroundImage = 'none';
        ov.style.opacity         = '1';
        ov.style.maskImage       = 'none';
        ov.style.webkitMaskImage = 'none';
    }

    // Eliminar elementos viejos (excepto bg y overlay)
    var viejos = canvas.querySelectorAll('.el');
    viejos.forEach(function(v){ v.remove(); });

    // Renderizar elementos
    estado.elementos.forEach(function(el) {
        if (!el.visible) return;
        var div = crearElDOM(el);
        canvas.appendChild(div);
    });

    renderCapas();
}

function crearElDOM(el) {
    var div = document.createElement('div');
    div.className = 'el el-' + el.tipo;
    div.id        = 'dom_' + el.id;
    div.dataset.elId = el.id;
    div.style.left   = el.x + 'px';
    div.style.top    = el.y + 'px';
    div.style.width  = el.w + 'px';
    div.style.height = el.h + 'px';
    div.style.opacity = (el.opacity !== undefined ? el.opacity : 100) / 100;
    div.style.zIndex  = estado.elementos.indexOf(el) + 1;

    if (elSeleccionado === el.id) div.classList.add('selected');

    if (el.tipo === 'texto') {
        div.style.color      = el.color || '#fff';
        div.style.fontFamily = fuenteCSS(el.fuente);
        div.style.fontSize   = (el.fontSize || 16) + 'px';
        div.style.fontWeight = el.bold   ? '700' : '400';
        div.style.fontStyle  = el.italic ? 'italic' : 'normal';
        div.style.textAlign  = el.align  || 'left';
        div.style.lineHeight = '1.2';
        div.style.display    = 'flex';
        div.style.alignItems = 'center';
        div.textContent      = el.texto || '';
    }

    if (el.tipo === 'foto') {
        div.style.background   = 'rgba(255,255,255,0.15)';
        div.style.border       = '2px solid rgba(255,255,255,0.4)';
        div.style.borderRadius = '8px';
        div.style.display      = 'flex';
        div.style.alignItems   = 'center';
        div.style.justifyContent = 'center';
        div.style.fontSize     = Math.min(el.w, el.h) * 0.4 + 'px';
        div.textContent        = '👤';
    }

    if (el.tipo === 'rect') {
        var inner = document.createElement('div');
        inner.style.width        = '100%';
        inner.style.height       = '100%';
        inner.style.background   = el.bgColor      || 'rgba(255,255,255,0.1)';
        inner.style.border       = (el.borderWidth || 0) + 'px solid ' + (el.borderColor || 'transparent');
        inner.style.borderRadius = (el.radio || 0) + 'px';
        div.appendChild(inner);
    }

    // Handles de resize (solo si no está bloqueado)
    if (!el.bloqueado) {
        ['tl','tc','tr','ml','mr','bl','bc','br'].forEach(function(h) {
            var handle = document.createElement('div');
            handle.className = 'resize-handle rh-' + h;
            handle.dataset.handle = h;
            div.appendChild(handle);
        });
    }

    // Eventos drag
    if (!el.bloqueado) {
        div.addEventListener('mousedown', function(e) {
            if (e.target.classList.contains('resize-handle')) return;
            e.stopPropagation();
            seleccionar(el.id);
            var rect = document.getElementById('credCanvas').getBoundingClientRect();
            var scale = CANVAS_W / rect.width;
            drag.activo = true;
            drag.elId   = el.id;
            drag.startX = e.clientX;
            drag.startY = e.clientY;
            drag.origX  = el.x;
            drag.origY  = el.y;
        });

        div.addEventListener('mousedown', function(e) {
            if (!e.target.classList.contains('resize-handle')) return;
            e.stopPropagation();
            var rect = document.getElementById('credCanvas').getBoundingClientRect();
            resize.activo  = true;
            resize.elId    = el.id;
            resize.handle  = e.target.dataset.handle;
            resize.startX  = e.clientX;
            resize.startY  = e.clientY;
            resize.origX   = el.x;
            resize.origY   = el.y;
            resize.origW   = el.w;
            resize.origH   = el.h;
            resize.rectW   = rect.width;
            resize.rectH   = rect.height;
        });
    } else {
        div.style.pointerEvents = 'none';
    }

    return div;
}

// ═══════════════════════════════════════
//  DRAG & RESIZE - GLOBAL EVENTS
// ═══════════════════════════════════════
document.addEventListener('mousemove', function(e) {
    var rect  = document.getElementById('credCanvas').getBoundingClientRect();
    var scaleX = CANVAS_W / rect.width;
    var scaleY = CANVAS_H / rect.height;
    var dx = (e.clientX - (drag.activo ? drag.startX : resize.startX)) * scaleX;
    var dy = (e.clientY - (drag.activo ? drag.startY : resize.startY)) * scaleY;

    if (drag.activo) {
        var el = getEl(drag.elId);
        if (!el) return;
        el.x = Math.max(0, Math.min(CANVAS_W - el.w, drag.origX + dx));
        el.y = Math.max(0, Math.min(CANVAS_H - el.h, drag.origY + dy));
        var dom = document.getElementById('dom_' + drag.elId);
        if (dom) { dom.style.left = el.x + 'px'; dom.style.top = el.y + 'px'; }
        actualizarPropPos();
    }

    if (resize.activo) {
        var el  = getEl(resize.elId);
        if (!el) return;
        var h   = resize.handle;
        var nx  = resize.origX, ny = resize.origY;
        var nw  = resize.origW, nh = resize.origH;
        var dxR = (e.clientX - resize.startX) * scaleX;
        var dyR = (e.clientY - resize.startY) * scaleY;

        if (h === 'br' || h === 'mr' || h === 'tr') nw = Math.max(20, resize.origW + dxR);
        if (h === 'bl' || h === 'ml' || h === 'tl') { nw = Math.max(20, resize.origW - dxR); nx = resize.origX + (resize.origW - nw); }
        if (h === 'bl' || h === 'bc' || h === 'br') nh = Math.max(10, resize.origH + dyR);
        if (h === 'tl' || h === 'tc' || h === 'tr') { nh = Math.max(10, resize.origH - dyR); ny = resize.origY + (resize.origH - nh); }

        el.x = nx; el.y = ny; el.w = nw; el.h = nh;
        var dom = document.getElementById('dom_' + resize.elId);
        if (dom) { dom.style.left = nx + 'px'; dom.style.top = ny + 'px'; dom.style.width = nw + 'px'; dom.style.height = nh + 'px'; }
        actualizarPropPos();
    }
});

document.addEventListener('mouseup', function() {
    drag.activo   = false;
    resize.activo = false;
});

// ═══════════════════════════════════════
//  SELECCIÓN
// ═══════════════════════════════════════
function seleccionar(id) {
    elSeleccionado = id;
    document.querySelectorAll('.el').forEach(function(d){ d.classList.remove('selected'); });
    var dom = document.getElementById('dom_' + id);
    if (dom) dom.classList.add('selected');
    renderProps();
    renderCapas();
}

function deseleccionar(e) {
    if (e.target.id === 'canvasArea' || e.target.id === 'credCanvas' ||
        e.target.id === 'canvasBg'   || e.target.id === 'canvasImgOverlay') {
        elSeleccionado = null;
        document.querySelectorAll('.el').forEach(function(d){ d.classList.remove('selected'); });
        renderProps();
        renderCapas();
    }
}

function getEl(id) {
    return estado.elementos.find(function(e){ return e.id === id; }) || null;
}

// ═══════════════════════════════════════
//  PANEL DE PROPIEDADES
// ═══════════════════════════════════════
function renderProps() {
    var empty   = document.getElementById('propsEmpty');
    var content = document.getElementById('propsContent');

    if (!elSeleccionado) {
        empty.style.display   = 'block';
        content.style.display = 'none';
        content.innerHTML     = '';
        return;
    }

    var el = getEl(elSeleccionado);
    if (!el) return;

    empty.style.display   = 'none';
    content.style.display = 'block';

    var html = '';

    // POSICIÓN Y TAMAÑO
    html += '<div class="prop-group">';
    html += '<div class="prop-group-title">Posición y Tamaño</div>';
    html += '<div class="prop-row"><span class="prop-lbl">X</span><input class="prop-input w60" type="number" id="px" value="' + Math.round(el.x) + '" oninput="setProp(\'x\',+this.value)"></div>';
    html += '<div class="prop-row"><span class="prop-lbl">Y</span><input class="prop-input w60" type="number" id="py" value="' + Math.round(el.y) + '" oninput="setProp(\'y\',+this.value)"></div>';
    html += '<div class="prop-row"><span class="prop-lbl">Ancho</span><input class="prop-input w60" type="number" id="pw" value="' + Math.round(el.w) + '" oninput="setProp(\'w\',+this.value)"></div>';
    html += '<div class="prop-row"><span class="prop-lbl">Alto</span><input class="prop-input w60" type="number" id="ph" value="' + Math.round(el.h) + '" oninput="setProp(\'h\',+this.value)"></div>';
    html += '<div class="prop-row"><span class="prop-lbl">Opacidad</span><input class="prop-range" type="range" min="0" max="100" value="' + (el.opacity||100) + '" oninput="setProp(\'opacity\',+this.value);document.getElementById(\'propOpVal\').textContent=this.value+\'%\'"><span class="prop-range-val" id="propOpVal">' + (el.opacity||100) + '%</span></div>';
    html += '</div>';

    // TEXTO
    if (el.tipo === 'texto') {
        html += '<div class="prop-group">';
        html += '<div class="prop-group-title">Texto</div>';
        html += '<div class="prop-row"><input class="prop-input wfull" type="text" id="ptexto" value="' + (el.texto||'').replace(/"/g,'&quot;') + '" oninput="setProp(\'texto\',this.value)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Fuente</span><select class="prop-select" id="pfuente" onchange="setProp(\'fuente\',this.value)">';
        FUENTES.forEach(function(f) {
            html += '<option value="' + f.id + '"' + (el.fuente===f.id?' selected':'') + '>' + f.label + '</option>';
        });
        html += '</select></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Tamaño</span><input class="prop-input w60" type="number" id="pfontSize" value="' + (el.fontSize||16) + '" oninput="setProp(\'fontSize\',+this.value)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Color</span><input class="prop-color" type="color" id="pcolor" value="' + (el.color && el.color.indexOf('rgba')===-1 ? el.color : '#ffffff') + '" oninput="setProp(\'color\',this.value)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Alineación</span><select class="prop-select" id="palign" onchange="setProp(\'align\',this.value)">';
        ['left','center','right'].forEach(function(a){
            html += '<option value="'+a+'"'+(el.align===a?' selected':'')+'>'+a+'</option>';
        });
        html += '</select></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Negrita</span><input type="checkbox" '+(el.bold?'checked':'')+' onchange="setProp(\'bold\',this.checked)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Cursiva</span><input type="checkbox" '+(el.italic?'checked':'')+' onchange="setProp(\'italic\',this.checked)"></div>';
        html += '</div>';
    }

    // RECTÁNGULO
    if (el.tipo === 'rect') {
        html += '<div class="prop-group">';
        html += '<div class="prop-group-title">Rectángulo</div>';
        html += '<div class="prop-row"><span class="prop-lbl">Relleno</span><input class="prop-color" type="color" id="pbgColor" value="' + (el.bgColor && el.bgColor !== 'transparent' ? el.bgColor : '#ffffff') + '" oninput="setProp(\'bgColor\',this.value)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Borde color</span><input class="prop-color" type="color" id="pborderColor" value="' + (el.borderColor && el.borderColor !== 'transparent' ? el.borderColor : '#ffffff') + '" oninput="setProp(\'borderColor\',this.value)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Borde grosor</span><input class="prop-input w60" type="number" min="0" max="20" id="pborderWidth" value="' + (el.borderWidth||0) + '" oninput="setProp(\'borderWidth\',+this.value)"></div>';
        html += '<div class="prop-row"><span class="prop-lbl">Radio bordes</span><input class="prop-input w60" type="number" min="0" max="200" id="pradio" value="' + (el.radio||0) + '" oninput="setProp(\'radio\',+this.value)"></div>';
        html += '</div>';
    }

    // NOMBRE CAPA
    html += '<div class="prop-group">';
    html += '<div class="prop-group-title">Nombre de capa</div>';
    html += '<div class="prop-row"><input class="prop-input wfull" type="text" value="' + (el.nombre||'') + '" oninput="setProp(\'nombre\',this.value)"></div>';
    html += '</div>';

    // ELIMINAR
    if (!el.bloqueado) {
        html += '<div class="prop-group">';
        html += '<button class="btn-prop-del" onclick="eliminarEl(\'' + el.id + '\')">🗑️ Eliminar elemento</button>';
        html += '</div>';
    }

    content.innerHTML = html;
}

function actualizarPropPos() {
    var el = getEl(elSeleccionado);
    if (!el) return;
    var px = document.getElementById('px');
    var py = document.getElementById('py');
    var pw = document.getElementById('pw');
    var ph = document.getElementById('ph');
    if (px) px.value = Math.round(el.x);
    if (py) py.value = Math.round(el.y);
    if (pw) pw.value = Math.round(el.w);
    if (ph) ph.value = Math.round(el.h);
}

function setProp(prop, val) {
    var el = getEl(elSeleccionado);
    if (!el) return;
    el[prop] = val;
    // Actualizar DOM sin re-render completo
    var dom = document.getElementById('dom_' + el.id);
    if (!dom) return;

    if (prop === 'x') { dom.style.left   = val + 'px'; return; }
    if (prop === 'y') { dom.style.top    = val + 'px'; return; }
    if (prop === 'w') { dom.style.width  = val + 'px'; return; }
    if (prop === 'h') { dom.style.height = val + 'px'; return; }
    if (prop === 'opacity') { dom.style.opacity = val / 100; return; }

    // Para cambios que requieren re-render del elemento
    var nuevo = crearElDOM(el);
    dom.replaceWith(nuevo);
}

// ═══════════════════════════════════════
//  CAPAS
// ═══════════════════════════════════════
function renderCapas() {
    var lista = document.getElementById('layersList');
    lista.innerHTML = '';
    var copiaRev = estado.elementos.slice().reverse();
    copiaRev.forEach(function(el) {
        var item = document.createElement('div');
        item.className = 'layer-item' + (elSeleccionado === el.id ? ' activa' : '');
        item.innerHTML =
            '<span class="layer-icon">' + iconoCapa(el.tipo) + '</span>' +
            '<span class="layer-nombre">' + (el.nombre || el.tipo) + '</span>' +
            '<span class="layer-vis" onclick="event.stopPropagation();toggleVisible(\'' + el.id + '\')">' +
                (el.visible ? '👁️' : '🚫') +
            '</span>';
        item.onclick = function() { seleccionar(el.id); };
        lista.appendChild(item);
    });
}

function iconoCapa(tipo) {
    if (tipo === 'texto') return '🔤';
    if (tipo === 'foto')  return '📷';
    if (tipo === 'rect')  return '🟦';
    return '📄';
}

function toggleVisible(id) {
    var el = getEl(id);
    if (!el) return;
    el.visible = !el.visible;
    renderCanvas();
    if (elSeleccionado === id) seleccionar(id);
}

// ═══════════════════════════════════════
//  AGREGAR ELEMENTOS
// ═══════════════════════════════════════
function agregarElemento(tipo) {
    var id  = 'el_' + Date.now();
    var el  = { id:id, tipo:tipo, x:50, y:50, w:150, h:40, visible:true, opacity:100, nombre:tipo };

    if (tipo === 'texto') {
        el.texto    = 'Texto';
        el.fuente   = 'bebas';
        el.fontSize = 20;
        el.color    = '#ffffff';
        el.bold     = false;
        el.italic   = false;
        el.align    = 'left';
        el.nombre   = 'Texto';
    }
    if (tipo === 'rect') {
        el.w           = 200;
        el.h           = 60;
        el.bgColor     = 'rgba(255,255,255,0.15)';
        el.borderColor = 'rgba(255,255,255,0.5)';
        el.borderWidth = 1;
        el.radio       = 6;
        el.nombre      = 'Rectángulo';
    }
    if (tipo === 'foto') {
        el.w      = 100;
        el.h      = 100;
        el.nombre = 'Foto';
    }

    estado.elementos.push(el);
    renderCanvas();
    seleccionar(id);
}

function eliminarEl(id) {
    estado.elementos = estado.elementos.filter(function(e){ return e.id !== id; });
    elSeleccionado = null;
    renderCanvas();
    renderProps();
}

// ═══════════════════════════════════════
//  FONDO
// ═══════════════════════════════════════
function abrirBgPanel() {
    document.getElementById('modalBg').style.display = 'flex';
}
function cerrarBgPanel() {
    document.getElementById('modalBg').style.display = 'none';
}

function actualizarFondo() {
    estado.bgColor1   = document.getElementById('bgColor1').value;
    estado.bgColor2   = document.getElementById('bgColor2').value;
    estado.bgOpacidad = parseInt(document.getElementById('bgImgOp').value);
    renderCanvas();
}

function cargarImagenFondo(input) {
    var file = input.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        estado.bgImagen = e.target.result;
        document.getElementById('bgImgThumb').src           = estado.bgImagen;
        document.getElementById('bgImgThumb').style.display = 'block';
        renderCanvas();
    };
    reader.readAsDataURL(file);
}

function quitarImagenFondo() {
    estado.bgImagen = null;
    document.getElementById('bgImgThumb').style.display = 'none';
    document.getElementById('bgImgInput').value = '';
    renderCanvas();
}

// ═══════════════════════════════════════
//  GUARDAR
// ═══════════════════════════════════════
function guardarDiseno() {
    var disenos = JSON.parse(localStorage.getItem(KEY_DISENOS)) || [];
    var id      = disenoId || ('d_' + Date.now());
    var obj = {
        id:          id,
        nombre:      estado.nombre,
        bgColor1:    estado.bgColor1,
        bgColor2:    estado.bgColor2,
        bgImagen:    estado.bgImagen,
        bgOpacidad:  estado.bgOpacidad,
        elementos:   estado.elementos,
        // compatibilidad con diseño-credencial.js
        colorFondo:  estado.bgColor1,
        colorFondo2: estado.bgColor2,
        imagen:      estado.bgImagen,
        opacidad:    estado.bgOpacidad
    };
    var idx = disenos.findIndex(function(x){ return x.id === id; });
    if (idx >= 0) disenos[idx] = obj;
    else          disenos.push(obj);
    localStorage.setItem(KEY_DISENOS, JSON.stringify(disenos));
    disenoId = id;
    mostrarToast('✓ Diseño guardado');
}

// ═══════════════════════════════════════
//  ZOOM
// ═══════════════════════════════════════
function cambiarZoom(delta) {
    zoom = Math.max(30, Math.min(200, zoom + delta));
    var canvas = document.getElementById('credCanvas');
    var scale  = zoom / 100;
    canvas.style.transform = 'scale(' + scale + ')';
    document.getElementById('zoomVal').textContent = zoom + '%';
}

// ═══════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════
function fuenteCSS(id) {
    var f = FUENTES.find(function(x){ return x.id === id; });
    return f ? f.css : "'Outfit',sans-serif";
}

function mostrarToast(msg) {
    var t = document.getElementById('toast-ed');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast-ed';
        t.style.cssText = 'position:fixed;bottom:2rem;left:50%;transform:translateX(-50%) translateY(20px);padding:0.7rem 1.5rem;border-radius:10px;font-family:Outfit,sans-serif;font-size:0.85rem;font-weight:700;z-index:9999;opacity:0;transition:all 0.3s;background:linear-gradient(135deg,#22c55e,#16a34a);color:#fff;border:1px solid rgba(34,197,94,0.4);white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,0.3);';
        document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1'; t.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(t._t);
    t._t = setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(-50%) translateY(20px)'; }, 3000);
}

// ═══════════════════════════════════════
//  INIT
// ═══════════════════════════════════════
cargarDiseno();