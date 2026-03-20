// =============================================
//  EDITOR CENTRAL · FUT 7 EL JAGUAR
//  v3 — Imagen como objeto arrastrable + crop
// =============================================

var par       = new URLSearchParams(window.location.search);
var categoria = par.get('categoria') || '';
var disenoId  = par.get('id')        || '';

var KEY_DISENOS    = 'disenos_credencial';
var KEY_ASIGNACION = 'diseno_asignado_';

var CANVAS_W = 680;
var CANVAS_H = 430;
var zoom     = 100;

// ── ESTADO ────────────────────────────────────
var estado = {
    nombre:        'Sin nombre',
    bgColor1:      '#1d4ed8',
    bgColor2:      '#0a1628',
    bgDireccion:   '135deg',
    bgImagen:      null,
    bgOpacidad:    80,
    bgBlur:        0,
    bgSize:        'cover',
    bgSizeVal:     100,
    bgPosX:        50,
    bgPosY:        50,
    elementos:     []
};

var historial  = [];
var rehacer    = [];
var elSel      = null;
var toolActiva = null;

var drag = { on:false, id:null, sx:0, sy:0, ox:0, oy:0, scale:1 };
var rsz  = { on:false, id:null, handle:'', sx:0, sy:0, ox:0, oy:0, ow:0, oh:0, scale:1 };
var cropState  = { on:false, id:null, sx:0, sy:0, ocx:0, ocy:0 };
var cropActivo = null; // id del elemento en modo crop actualmente

// ══════════════════════════════════════════════
//  FUENTES (30)
// ══════════════════════════════════════════════
var FUENTES = [
    { id:'bebas',        label:'Bebas Neue',       css:"'Bebas Neue',cursive",           cat:'Display' },
    { id:'anton',        label:'Anton',             css:"'Anton',sans-serif",              cat:'Display' },
    { id:'oswald',       label:'Oswald',            css:"'Oswald',sans-serif",             cat:'Display' },
    { id:'teko',         label:'Teko',              css:"'Teko',sans-serif",               cat:'Display' },
    { id:'barlow',       label:'Barlow Condensed',  css:"'Barlow Condensed',sans-serif",   cat:'Display' },
    { id:'blackhan',     label:'Black Han Sans',    css:"'Black Han Sans',sans-serif",     cat:'Display' },
    { id:'aldrich',      label:'Aldrich',           css:"'Aldrich',sans-serif",            cat:'Display' },
    { id:'rajdhani',     label:'Rajdhani',          css:"'Rajdhani',sans-serif",           cat:'Display' },
    { id:'exo',          label:'Exo 2',             css:"'Exo 2',sans-serif",              cat:'Display' },
    { id:'chakra',       label:'Chakra Petch',      css:"'Chakra Petch',sans-serif",       cat:'Display' },
    { id:'outfit',       label:'Outfit',            css:"'Outfit',sans-serif",             cat:'Texto'   },
    { id:'inter',        label:'Inter',             css:"'Inter',sans-serif",              cat:'Texto'   },
    { id:'poppins',      label:'Poppins',           css:"'Poppins',sans-serif",            cat:'Texto'   },
    { id:'montserrat',   label:'Montserrat',        css:"'Montserrat',sans-serif",         cat:'Texto'   },
    { id:'roboto',       label:'Roboto Condensed',  css:"'Roboto Condensed',sans-serif",   cat:'Texto'   },
    { id:'lato',         label:'Lato',              css:"'Lato',sans-serif",               cat:'Texto'   },
    { id:'nunito',       label:'Nunito',            css:"'Nunito',sans-serif",             cat:'Texto'   },
    { id:'mulish',       label:'Mulish',            css:"'Mulish',sans-serif",             cat:'Texto'   },
    { id:'playfair',     label:'Playfair Display',  css:"'Playfair Display',serif",        cat:'Serif'   },
    { id:'merriweather', label:'Merriweather',      css:"'Merriweather',serif",            cat:'Serif'   },
    { id:'lora',         label:'Lora',              css:"'Lora',serif",                    cat:'Serif'   },
    { id:'cinzel',       label:'Cinzel',            css:"'Cinzel',serif",                  cat:'Serif'   },
    { id:'orbitron',     label:'Orbitron',          css:"'Orbitron',sans-serif",           cat:'Tech'    },
    { id:'audiowide',    label:'Audiowide',         css:"'Audiowide',sans-serif",          cat:'Tech'    },
    { id:'iceland',      label:'Iceland',           css:"'Iceland',cursive",               cat:'Tech'    },
    { id:'quantico',     label:'Quantico',          css:"'Quantico',sans-serif",           cat:'Tech'    },
    { id:'saira',        label:'Saira Condensed',   css:"'Saira Condensed',sans-serif",    cat:'Tech'    },
    { id:'creepster',    label:'Creepster',         css:"'Creepster',cursive",             cat:'Deco'    },
    { id:'permanent',    label:'Permanent Marker',  css:"'Permanent Marker',cursive",      cat:'Deco'    },
    { id:'russo',        label:'Russo One',         css:"'Russo One',sans-serif",          cat:'Deco'    },
];

(function() {
    var link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Anton&family=Oswald:wght@400;700&family=Teko:wght@400;600;700&family=Barlow+Condensed:wght@400;600;700;900&family=Black+Han+Sans&family=Aldrich&family=Rajdhani:wght@400;600;700&family=Exo+2:wght@400;700;900&family=Chakra+Petch:wght@400;700&family=Outfit:wght@300;400;600;700;900&family=Inter:wght@400;600;700&family=Poppins:wght@400;600;700&family=Montserrat:wght@400;700;900&family=Roboto+Condensed:wght@400;700&family=Lato:wght@400;700&family=Nunito:wght@400;600;700&family=Mulish:wght@400;700&family=Playfair+Display:wght@400;700&family=Merriweather:wght@400;700&family=Lora:wght@400;700&family=Cinzel:wght@400;700&family=Orbitron:wght@400;700;900&family=Audiowide&family=Iceland&family=Quantico:wght@400;700&family=Saira+Condensed:wght@400;700;900&family=Creepster&family=Permanent+Marker&family=Russo+One&display=swap';
    document.head.appendChild(link);
})();

// ── PLANTILLAS ──────────────────────────────
var PLANTILLAS = [
    { id:'azul',   label:'Azul',   c1:'#1d4ed8', c2:'#0a1628' },
    { id:'verde',  label:'Verde',  c1:'#166534', c2:'#052e16' },
    { id:'rojo',   label:'Rojo',   c1:'#991b1b', c2:'#450a0a' },
    { id:'negro',  label:'Negro',  c1:'#1a1a1a', c2:'#000000' },
    { id:'morado', label:'Morado', c1:'#6d28d9', c2:'#2e1065' },
    { id:'dorado', label:'Dorado', c1:'#92400e', c2:'#451a03' },
    { id:'teal',   label:'Teal',   c1:'#0f766e', c2:'#042f2e' },
    { id:'gris',   label:'Gris',   c1:'#374151', c2:'#111827' },
    { id:'rosa',   label:'Rosa',   c1:'#9d174d', c2:'#500724' },
    { id:'cafe',   label:'Cafe',   c1:'#78350f', c2:'#292524' },
];

// ══════════════════════════════════════════════
//  STORAGE
// ══════════════════════════════════════════════
function getDisenos()       { return JSON.parse(localStorage.getItem(KEY_DISENOS)) || []; }
function saveDisenos(d)     { localStorage.setItem(KEY_DISENOS, JSON.stringify(d)); }
function getAsignado(c)     { return localStorage.getItem(KEY_ASIGNACION + c) || null; }
function setAsignado(c, i)  { if (i) localStorage.setItem(KEY_ASIGNACION + c, i); else localStorage.removeItem(KEY_ASIGNACION + c); }

// ══════════════════════════════════════════════
//  ELEMENTOS DEFAULT
// ══════════════════════════════════════════════
function elementosDefault() {
    return [
        // Título arriba centrado
        { id:'el_titulo', tipo:'texto', x:20, y:18, w:640, h:70, visible:true, opacity:100,
          texto:'FUT 7 EL JAGUAR', fuente:'bebas', fontSize:52, color:'#ffffff',
          bold:true, italic:false, align:'center', letterSpacing:3,
          strokeWidth:0, strokeColor:'#000000', nombre:'Titulo' },
        // Foto jugador izquierda
        { id:'el_foto', tipo:'foto', x:28, y:110, w:200, h:240, visible:true, radio:10, opacity:100,
          borderWidth:2, borderColor:'rgba(255,255,255,0.4)', borderBlur:0, nombre:'Foto Jugador' },
        // Rectángulo EQUIPO
        { id:'el_rect_equipo', tipo:'rect', x:250, y:130, w:400, h:60, visible:true, opacity:100,
          bgColor:'rgba(255,255,255,0.9)', borderColor:'rgba(255,255,255,0)', borderWidth:0,
          borderStyle:'solid', borderBlur:0, radio:8, backdropBlur:0, nombre:'Campo Equipo' },
        // Label EQUIPO
        { id:'el_lbl_equipo', tipo:'texto', x:250, y:108, w:200, h:22, visible:true, opacity:100,
          texto:'EQUIPO:', fuente:'outfit', fontSize:14, color:'#ffffff',
          bold:true, italic:false, align:'left', letterSpacing:1,
          strokeWidth:0, strokeColor:'#000000', nombre:'Label Equipo' },
        // Rectángulo NOMBRE
        { id:'el_rect_nombre', tipo:'rect', x:250, y:255, w:400, h:60, visible:true, opacity:100,
          bgColor:'rgba(255,255,255,0.9)', borderColor:'rgba(255,255,255,0)', borderWidth:0,
          borderStyle:'solid', borderBlur:0, radio:8, backdropBlur:0, nombre:'Campo Nombre' },
        // Label NOMBRE
        { id:'el_lbl_nombre', tipo:'texto', x:250, y:233, w:200, h:22, visible:true, opacity:100,
          texto:'NOMBRE:', fuente:'outfit', fontSize:14, color:'#ffffff',
          bold:true, italic:false, align:'left', letterSpacing:1,
          strokeWidth:0, strokeColor:'#000000', nombre:'Label Nombre' },
        // Número abajo derecha
        { id:'el_num', tipo:'texto', x:560, y:355, w:100, h:55, visible:true, opacity:100,
          texto:'#10', fuente:'bebas', fontSize:38, color:'rgba(255,255,255,0.45)',
          bold:false, italic:false, align:'right', letterSpacing:0,
          strokeWidth:0, strokeColor:'#000000', nombre:'Numero' }
    ];
}

// ══════════════════════════════════════════════
//  CARGAR DISENO
// ══════════════════════════════════════════════
function cargarDiseno() {
    if (!disenoId) { estado.elementos = elementosDefault(); renderTodo(); return; }
    var ds = getDisenos();
    var d  = ds.find(function(x) { return x.id === disenoId; });
    if (!d) { estado.elementos = elementosDefault(); renderTodo(); return; }

    estado.nombre      = d.nombre      || 'Sin nombre';
    estado.bgColor1    = d.bgColor1    || d.colorFondo  || '#1d4ed8';
    estado.bgColor2    = d.bgColor2    || d.colorFondo2 || '#0a1628';
    estado.bgDireccion = d.bgDireccion || '135deg';
    estado.bgImagen    = d.bgImagen    || d.imagen       || null;
    estado.bgOpacidad  = d.bgOpacidad  !== undefined ? d.bgOpacidad  : 80;
    estado.bgBlur      = d.bgBlur      !== undefined ? d.bgBlur      : 0;
    estado.bgSize      = d.bgSize      || 'cover';
    estado.bgSizeVal   = d.bgSizeVal   !== undefined ? d.bgSizeVal   : 100;
    estado.bgPosX      = d.bgPosX      !== undefined ? d.bgPosX      : 50;
    estado.bgPosY      = d.bgPosY      !== undefined ? d.bgPosY      : 50;
    estado.elementos   = (d.elementos && d.elementos.length) ? d.elementos : elementosDefault();

    document.getElementById('nombreInput').value   = estado.nombre;
    document.getElementById('bgColor1').value      = estado.bgColor1;
    document.getElementById('bgColor2').value      = estado.bgColor2;
    document.getElementById('bgImgOp').value       = estado.bgOpacidad;
    document.getElementById('bgOpVal').textContent = estado.bgOpacidad + '%';
    sincronizarControlsFondo();

    if (estado.bgImagen) {
        document.getElementById('bgImgThumb').src           = estado.bgImagen;
        document.getElementById('bgImgThumb').style.display = 'block';
    }
    renderTodo();
}

// ══════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════
function renderTodo() { renderFondo(); renderElementos(); renderCapas(); renderPlantillas(); }

function renderFondo() {
    var bg = document.getElementById('canvasBg');
    bg.style.background = 'linear-gradient(' + estado.bgDireccion + ',' + estado.bgColor1 + ',' + estado.bgColor2 + ')';

    var ov = document.getElementById('canvasImgOverlay');
    if (estado.bgImagen) {
        var sizeVal = estado.bgSize === 'cover' ? 'cover' : estado.bgSize === 'contain' ? 'contain' : estado.bgSizeVal + '%';
        ov.style.backgroundImage    = 'url(' + estado.bgImagen + ')';
        ov.style.backgroundSize     = sizeVal;
        ov.style.backgroundPosition = estado.bgPosX + '% ' + estado.bgPosY + '%';
        ov.style.backgroundRepeat   = 'no-repeat';
        ov.style.opacity            = estado.bgOpacidad / 100;
        if (estado.bgBlur > 0) {
            var exp = estado.bgBlur * 2;
            ov.style.filter = 'blur(' + estado.bgBlur + 'px)';
            ov.style.margin = '-' + exp + 'px';
            ov.style.width  = 'calc(100% + ' + (exp * 2) + 'px)';
            ov.style.height = 'calc(100% + ' + (exp * 2) + 'px)';
        } else {
            ov.style.filter = 'none';
            ov.style.margin = '0'; ov.style.width = '100%'; ov.style.height = '100%';
        }
    } else {
        ov.style.backgroundImage = 'none'; ov.style.opacity = '1';
        ov.style.filter = 'none'; ov.style.margin = '0'; ov.style.width = '100%'; ov.style.height = '100%';
    }

    var prev = document.getElementById('bgGradPreview');
    if (prev) prev.style.background = 'linear-gradient(' + estado.bgDireccion + ',' + estado.bgColor1 + ',' + estado.bgColor2 + ')';

    var imgControls = document.getElementById('imgControls');
    if (imgControls) imgControls.style.display = estado.bgImagen ? '' : 'none';
}

function sincronizarControlsFondo() {
    var sliders = { bgBlur:'bgBlurVal', bgPosX:'bgPosXVal', bgPosY:'bgPosYVal' };
    var suf     = { bgBlur:'px', bgPosX:'%', bgPosY:'%' };
    Object.keys(sliders).forEach(function(id) {
        var el = document.getElementById(id), lbl = document.getElementById(sliders[id]);
        if (el)  el.value        = estado[id];
        if (lbl) lbl.textContent = estado[id] + suf[id];
    });
    var sizeEl = document.getElementById('bgSizeSelect');
    if (sizeEl) sizeEl.value = estado.bgSize;
    var sizeVal = document.getElementById('bgSizeVal');
    if (sizeVal) sizeVal.value = estado.bgSizeVal;
    var sizeRow = document.getElementById('bgSizeRow');
    if (sizeRow) sizeRow.style.display = estado.bgSize === 'custom' ? '' : 'none';
}

function actualizarFondo() {
    estado.bgColor1   = document.getElementById('bgColor1').value;
    estado.bgColor2   = document.getElementById('bgColor2').value;
    estado.bgOpacidad = parseInt(document.getElementById('bgImgOp').value);

    function rs(id, valId, suf, key) {
        var el = document.getElementById(id), lbl = document.getElementById(valId);
        if (el) { estado[key] = parseInt(el.value); if (lbl) lbl.textContent = estado[key] + suf; }
    }
    rs('bgBlur', 'bgBlurVal', 'px', 'bgBlur');
    rs('bgPosX', 'bgPosXVal', '%',  'bgPosX');
    rs('bgPosY', 'bgPosYVal', '%',  'bgPosY');

    var sizeEl = document.getElementById('bgSizeSelect');
    if (sizeEl) {
        estado.bgSize = sizeEl.value;
        var row = document.getElementById('bgSizeRow');
        if (row) row.style.display = estado.bgSize === 'custom' ? '' : 'none';
    }
    var sizeValEl = document.getElementById('bgSizeVal');
    if (sizeValEl) estado.bgSizeVal = parseInt(sizeValEl.value);

    renderFondo();
}

// cargarImagenFondo: ahora crea elemento 'imagen' en el canvas
function cargarImagenFondo(input) {
    var file = input.files[0]; if (!file) return;
    if (file.size > 8*1024*1024) { mostrarToast('Imagen demasiado grande (max 8MB)'); return; }
    var reader = new FileReader();
    reader.onload = function(e) {
        empujarHistorial();
        var id = 'el_img_' + Date.now();
        var elImg = {
            id: id, tipo: 'imagen', visible: true, opacity: 100, nombre: 'Imagen',
            x: 0, y: 0, w: CANVAS_W, h: CANVAS_H,
            src: e.target.result,
            cropX: 0, cropY: 0,
            imgW: CANVAS_W, imgH: CANVAS_H,
            radio: 0, borderWidth: 0, borderColor: '#ffffff', borderBlur: 0,
            feather: 0,
            sombra: false, sombraBlur: 20, sombraColor: 'rgba(0,0,0,0.5)'
        };
        // Insertar al fondo de la pila
        estado.elementos.unshift(elImg);

        // Limpiar overlay de fondo si existía
        estado.bgImagen = null;
        var thumb = document.getElementById('bgImgThumb');
        if (thumb) thumb.style.display = 'none';
        var bgInp = document.getElementById('bgImgInput');
        if (bgInp) bgInp.value = '';

        renderTodo();
        seleccionar(id);
        mostrarToast('Imagen agregada — doble clic para recortar');
    };
    reader.readAsDataURL(file);
}

function quitarImagenFondo() {
    // Quitar overlay de fondo
    estado.bgImagen = null;
    var thumb = document.getElementById('bgImgThumb');
    if (thumb) thumb.style.display = 'none';
    var bgInp = document.getElementById('bgImgInput');
    if (bgInp) bgInp.value = '';
    // También eliminar primer elemento imagen si existe
    var primerImg = estado.elementos.find(function(e){ return e.tipo === 'imagen'; });
    if (primerImg) {
        empujarHistorial();
        estado.elementos = estado.elementos.filter(function(e){ return e.id !== primerImg.id; });
        renderElementos(); renderCapas();
    }
    renderFondo();
}

// ══════════════════════════════════════════════
//  RENDER ELEMENTOS
// ══════════════════════════════════════════════
function renderElementos() {
    var canvas = document.getElementById('credCanvas');
    canvas.querySelectorAll('.el').forEach(function(e) { e.remove(); });
    estado.elementos.forEach(function(el) { canvas.appendChild(crearElDOM(el)); });
}

function crearElDOM(el) {
    var div = document.createElement('div');
    div.className    = 'el el-' + el.tipo + (elSel === el.id ? ' selected' : '');
    div.id           = 'dom_' + el.id;
    div.dataset.elId = el.id;
    div.style.left   = el.x + 'px';
    div.style.top    = el.y + 'px';
    div.style.width  = el.w + 'px';
    div.style.height = el.h + 'px';
    div.style.opacity = (el.opacity != null ? el.opacity : 100) / 100;
    div.style.zIndex  = estado.elementos.indexOf(el) + 2;
    div.style.display = el.visible ? '' : 'none';

    var ring = document.createElement('div');
    ring.className = 'el-hover-ring';
    div.appendChild(ring);

    // ── TEXTO ──
    if (el.tipo === 'texto') {
        div.style.color         = el.color  || '#fff';
        div.style.fontFamily    = fuenteCSS(el.fuente);
        div.style.fontSize      = (el.fontSize || 16) + 'px';
        div.style.fontWeight    = el.bold   ? '700'    : '400';
        div.style.fontStyle     = el.italic ? 'italic' : 'normal';
        div.style.textAlign     = el.align  || 'left';
        div.style.lineHeight    = '1.15';
        div.style.whiteSpace    = 'nowrap';
        div.style.letterSpacing = (el.letterSpacing || 0) + 'px';
        var shadows = [];
        var sw = el.strokeWidth || 0;
        if (sw > 0) {
            var sc = el.strokeColor || '#000';
            shadows.push('-'+sw+'px -'+sw+'px 0 '+sc, sw+'px -'+sw+'px 0 '+sc,
                         '-'+sw+'px  '+sw+'px 0 '+sc,  sw+'px  '+sw+'px 0 '+sc);
        }
        if (el.sombra) shadows.push((el.sombraX||0)+'px '+(el.sombraY||2)+'px '+(el.sombraBlur||8)+'px '+(el.sombraColor||'rgba(0,0,0,0.8)'));
        div.style.textShadow = shadows.length ? shadows.join(',') : 'none';
        div.textContent = el.texto || '';
    }

    // ── IMAGEN (arrastrable con crop) ──
    if (el.tipo === 'imagen') {
        div.style.borderRadius = (el.radio || 0) + 'px';
        div.style.overflow     = 'hidden';

        var bwI = el.borderWidth || 0;
        if (bwI > 0) div.style.border = bwI + 'px solid ' + (el.borderColor || '#fff');

        var bshI = [];
        if ((el.borderBlur||0) > 0 && bwI > 0)
            bshI.push('0 0 ' + el.borderBlur + 'px ' + (el.borderColor||'#fff'));
        if (el.sombra)
            bshI.push('0 4px ' + (el.sombraBlur||20) + 'px ' + (el.sombraColor||'rgba(0,0,0,0.5)'));
        if (bshI.length) div.style.boxShadow = bshI.join(',');

        // Feather: difuminar bordes del marco con mask radial
        if ((el.feather||0) > 0) {
            var f = el.feather;
            var pct1 = Math.max(0, 50 - f) + '%';
            var pct2 = Math.min(100, 50 + f) + '%';
            var mask = 'radial-gradient(ellipse at center, black ' + pct1 + ', transparent ' + pct2 + ')';
            div.style.webkitMaskImage = mask;
            div.style.maskImage = mask;
        } else {
            div.style.webkitMaskImage = '';
            div.style.maskImage = '';
        }

        if (el.src) {
            var imgEl = document.createElement('img');
            imgEl.src = el.src;
            imgEl.draggable = false;
            imgEl.style.cssText = [
                'position:absolute',
                'left:' + (-(el.cropX||0)) + 'px',
                'top:'  + (-(el.cropY||0)) + 'px',
                'width:'  + (el.imgW || el.w) + 'px',
                'height:' + (el.imgH || el.h) + 'px',
                'display:block',
                'pointer-events:none',
                'user-select:none',
                '-webkit-user-drag:none'
            ].join(';');
            imgEl.id = 'img_inner_' + el.id;
            div.appendChild(imgEl);

            var cropHint = document.createElement('div');
            cropHint.className = 'crop-hint';
            cropHint.id = 'cropHint_' + el.id;
            cropHint.textContent = 'Doble clic para recortar · ESC para salir';
            div.appendChild(cropHint);
        } else {
            var phI = document.createElement('div');
            phI.className = 'el-foto-placeholder';
            phI.textContent = '🖼️';
            div.appendChild(phI);
        }
    }

    // ── FOTO jugador ──
    if (el.tipo === 'foto') {
        div.style.borderRadius = (el.radio != null ? el.radio : 8) + 'px';

        // Borde y sombra sobre el div externo (handles siempre visibles)
        var bw = el.borderWidth || 0;
        if (bw > 0) div.style.border = bw + 'px solid ' + (el.borderColor || '#fff');
        var boxSh = [];
        if ((el.borderBlur || 0) > 0) {
            boxSh.push('0 0 ' + el.borderBlur + 'px ' + (el.borderColor || '#fff'));
        }
        if (el.sombra) boxSh.push('0 4px ' + (el.sombraBlur||10) + 'px ' + (el.sombraColor||'rgba(0,0,0,0.6)'));
        if (boxSh.length) div.style.boxShadow = boxSh.join(',');

        // Contenedor interno: contiene la imagen + aplica el feather
        var fotoWrap = document.createElement('div');
        fotoWrap.style.cssText = 'position:absolute;inset:0;border-radius:inherit;overflow:hidden;pointer-events:none';

        // Feather: mask radial aplicado al wrap interno (no toca los handles)
        if ((el.borderBlur||0) > 0) {
            var f = el.borderBlur;
            var pct1 = Math.max(0, 50 - f) + '%';
            var pct2 = Math.min(100, 50 + f) + '%';
            var mask = 'radial-gradient(ellipse at center, black ' + pct1 + ', transparent ' + pct2 + ')';
            fotoWrap.style.webkitMaskImage = mask;
            fotoWrap.style.maskImage = mask;
        }

        if (el.src) {
            var imgF = document.createElement('img');
            imgF.src = el.src;
            imgF.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
            fotoWrap.appendChild(imgF);
        } else {
            var phF = document.createElement('div');
            phF.className = 'el-foto-placeholder';
            phF.textContent = '👤';
            fotoWrap.appendChild(phF);
        }
        div.appendChild(fotoWrap);
    }

    // ── RECTANGULO ──
    if (el.tipo === 'rect') {
        var inner = document.createElement('div');
        inner.style.width        = '100%';
        inner.style.height       = '100%';
        inner.style.background   = el.bgColor || 'rgba(255,255,255,0.12)';
        inner.style.borderRadius = (el.radio || 0) + 'px';
        var bw2 = el.borderWidth || 0;
        if (bw2 > 0) inner.style.border = bw2 + 'px ' + (el.borderStyle||'solid') + ' ' + (el.borderColor||'rgba(255,255,255,0.5)');
        if ((el.backdropBlur||0) > 0) {
            inner.style.backdropFilter       = 'blur(' + el.backdropBlur + 'px)';
            inner.style.webkitBackdropFilter = 'blur(' + el.backdropBlur + 'px)';
        }
        var bsh = [];
        if ((el.borderBlur||0) > 0 && bw2 > 0) {
            bsh.push('0 0 ' + el.borderBlur + 'px ' + (el.borderColor||'#fff'));
            bsh.push('inset 0 0 ' + Math.round(el.borderBlur/2) + 'px ' + (el.borderColor||'#fff'));
        }
        if (el.sombra) bsh.push((el.sombraX||0)+'px '+(el.sombraY||4)+'px '+(el.sombraBlur||10)+'px '+(el.sombraColor||'rgba(0,0,0,0.5)'));
        if (bsh.length) inner.style.boxShadow = bsh.join(',');
        div.appendChild(inner);
    }

    // ── LINEA ──
    if (el.tipo === 'linea') {
        div.style.background   = el.color  || 'rgba(255,255,255,0.7)';
        div.style.borderRadius = '2px';
        div.style.height       = (el.grosor || 2) + 'px';
        div.style.marginTop    = ((el.h - (el.grosor||2)) / 2) + 'px';
        if ((el.lineBlur||0) > 0) div.style.boxShadow = '0 0 ' + el.lineBlur + 'px ' + (el.color||'#fff');
    }

    // Handles
    if (!el.bloqueado) {
        ['tl','tc','tr','ml','mr','bl','bc','br'].forEach(function(h) {
            var hd = document.createElement('div');
            hd.className      = 'resize-handle rh-' + h;
            hd.dataset.handle = h;
            div.appendChild(hd);
        });
        div.addEventListener('mousedown', onElMousedown);
        div.addEventListener('dblclick', function(e) {
            e.stopPropagation();
            if (el.tipo === 'texto')  iniciarEdicionTexto(el.id);
            if (el.tipo === 'imagen') iniciarCropImagen(el.id);
        });
        div.addEventListener('contextmenu', function(e) {
            e.preventDefault(); e.stopPropagation();
            seleccionar(el.id); mostrarCtxMenu(e.clientX, e.clientY);
        });
    }
    return div;
}

// ══════════════════════════════════════════════
//  MODO RECORTE (crop) — toggle con doble clic
// ══════════════════════════════════════════════
function iniciarCropImagen(id) {
    var el  = getEl(id); if (!el || el.tipo !== 'imagen' || !el.src) return;
    var dom = document.getElementById('dom_' + id); if (!dom) return;

    // Si ya está en modo crop → salir
    if (cropActivo === id) {
        salirCropImagen(id);
        return;
    }
    // Si hay otro crop activo → cerrar primero
    if (cropActivo) salirCropImagen(cropActivo);

    cropActivo = id;
    dom.querySelectorAll('.resize-handle').forEach(function(h){ h.style.display = 'none'; });
    dom.classList.add('crop-mode');
    var hint = document.getElementById('cropHint_' + id);
    if (hint) hint.classList.add('visible');

    var canvRect = document.getElementById('credCanvas').getBoundingClientRect();
    var scale    = canvRect.width / CANVAS_W;

    function onCropDown(e) {
        if (e.button !== 0) return;
        if (e.target.classList.contains('resize-handle')) return;
        e.stopPropagation(); e.preventDefault();
        cropState.on  = true;
        cropState.id  = id;
        cropState.sx  = e.clientX;
        cropState.sy  = e.clientY;
        cropState.ocx = el.cropX || 0;
        cropState.ocy = el.cropY || 0;
    }
    function onCropMove(e) {
        if (!cropState.on || cropState.id !== id) return;
        var dx   = (e.clientX - cropState.sx) / scale;
        var dy   = (e.clientY - cropState.sy) / scale;
        var maxX = Math.max(0, (el.imgW || el.w) - el.w);
        var maxY = Math.max(0, (el.imgH || el.h) - el.h);
        el.cropX = Math.max(0, Math.min(maxX, Math.round(cropState.ocx - dx)));
        el.cropY = Math.max(0, Math.min(maxY, Math.round(cropState.ocy - dy)));
        var img = document.getElementById('img_inner_' + id);
        if (img) { img.style.left = (-el.cropX) + 'px'; img.style.top = (-el.cropY) + 'px'; }
    }
    function onCropUp() {
        if (cropState.on) { cropState.on = false; empujarHistorial(); }
    }
    function onCropKey(e) {
        if (e.key === 'Escape' || e.key === 'Enter') {
            salirCropImagen(id);
            e.stopPropagation();
        }
    }

    // Guardar refs en el DOM para poder limpiarlas al salir
    dom._cropDown = onCropDown;
    dom._cropMove = onCropMove;
    dom._cropUp   = onCropUp;
    dom._cropKey  = onCropKey;

    dom.addEventListener('mousedown', onCropDown);
    document.addEventListener('mousemove', onCropMove);
    document.addEventListener('mouseup', onCropUp);
    document.addEventListener('keydown', onCropKey);

    mostrarToast('Modo recorte — arrastra la imagen · doble clic o ESC para salir');
}

function salirCropImagen(id) {
    var dom = document.getElementById('dom_' + id); if (!dom) return;
    if (dom._cropDown) dom.removeEventListener('mousedown', dom._cropDown);
    if (dom._cropMove) document.removeEventListener('mousemove', dom._cropMove);
    if (dom._cropUp)   document.removeEventListener('mouseup',   dom._cropUp);
    if (dom._cropKey)  document.removeEventListener('keydown',   dom._cropKey);
    dom._cropDown = dom._cropMove = dom._cropUp = dom._cropKey = null;

    dom.querySelectorAll('.resize-handle').forEach(function(h){ h.style.display = ''; });
    dom.classList.remove('crop-mode');
    var hint = document.getElementById('cropHint_' + id);
    if (hint) hint.classList.remove('visible');
    cropActivo = null;
    cropState.on = false;
    renderProps();
}

// ══════════════════════════════════════════════
//  SELECCION
// ══════════════════════════════════════════════
function seleccionar(id) {
    elSel = id;
    document.querySelectorAll('.el').forEach(function(d) { d.classList.toggle('selected', d.dataset.elId === id); });
    document.querySelectorAll('.layer-item').forEach(function(li) { li.classList.toggle('activa', li.dataset.elId === id); });
    renderProps();
}
function deseleccionar(e) {
    var t = [document.getElementById('canvasArea'),document.getElementById('credCanvas'),document.getElementById('canvasBg'),document.getElementById('canvasImgOverlay'),document.getElementById('canvasWrap')];
    if (e && !t.includes(e.target)) return;
    // Salir de crop si estaba activo
    if (cropActivo) salirCropImagen(cropActivo);
    elSel = null;
    document.querySelectorAll('.el.selected').forEach(function(d){d.classList.remove('selected');});
    document.querySelectorAll('.layer-item.activa').forEach(function(li){li.classList.remove('activa');});
    renderProps(); ocultarCtxMenu();
}

// ══════════════════════════════════════════════
//  DRAG & RESIZE
// ══════════════════════════════════════════════
function onElMousedown(e) {
    if (e.button !== 0) return;
    var isH = e.target.classList.contains('resize-handle');
    var id  = this.dataset.elId;
    e.stopPropagation(); seleccionar(id); ocultarCtxMenu();
    var el = getEl(id);
    var cr = document.getElementById('credCanvas').getBoundingClientRect();
    var sc = cr.width / CANVAS_W;

    // Si este elemento está en modo crop, el drag lo maneja iniciarCropImagen → no mover marco
    if (cropActivo === id && !isH) return;

    if (isH) {
        rsz.on=true; rsz.id=id; rsz.handle=e.target.dataset.handle;
        rsz.sx=e.clientX; rsz.sy=e.clientY; rsz.ox=el.x; rsz.oy=el.y;
        rsz.ow=el.w; rsz.oh=el.h;
        rsz.scale=sc;
    } else {
        drag.on=true; drag.id=id; drag.sx=e.clientX; drag.sy=e.clientY; drag.ox=el.x; drag.oy=el.y; drag.scale=sc;
    }
    e.preventDefault();
}

document.addEventListener('mousemove', function(e) {
    if (drag.on) {
        var el=getEl(drag.id); if(!el) return;
        el.x=Math.max(0,Math.min(CANVAS_W-el.w,Math.round(drag.ox+(e.clientX-drag.sx)/drag.scale)));
        el.y=Math.max(0,Math.min(CANVAS_H-el.h,Math.round(drag.oy+(e.clientY-drag.sy)/drag.scale)));
        var dom=document.getElementById('dom_'+drag.id);
        if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
        actualizarPosEnProps(el);
    }
    if (rsz.on) {
        var el=getEl(rsz.id); if(!el) return;
        var dx=(e.clientX-rsz.sx)/rsz.scale, dy=(e.clientY-rsz.sy)/rsz.scale, h=rsz.handle;

        // ── Imagen: el marco Y la foto crecen juntos (handles siempre visibles) ──
        if (el.tipo==='imagen') {
            var nx=el.x, ny=el.y, nw=el.w, nh=el.h;
            if(h==='br'||h==='mr'||h==='tr') nw=Math.max(40,Math.round(rsz.ow+dx));
            if(h==='bl'||h==='ml'||h==='tl'){nw=Math.max(40,Math.round(rsz.ow-dx));nx=Math.round(rsz.ox+dx);if(nw<=40)nx=rsz.ox+rsz.ow-40;}
            if(h==='br'||h==='bc'||h==='bl') nh=Math.max(40,Math.round(rsz.oh+dy));
            if(h==='tr'||h==='tc'||h==='tl'){nh=Math.max(40,Math.round(rsz.oh-dy));ny=Math.round(rsz.oy+dy);if(nh<=40)ny=rsz.oy+rsz.oh-40;}
            if(h==='tc'||h==='bc'){nx=el.x;nw=el.w;}
            if(h==='ml'||h==='mr'){ny=el.y;nh=el.h;}
            // Marco y foto crecen igual — crop ajusta si se sale
            var scaleX = nw / el.w;
            var scaleY = nh / el.h;
            el.x=nx; el.y=ny; el.w=nw; el.h=nh;
            el.imgW = Math.round((el.imgW||nw) * scaleX);
            el.imgH = Math.round((el.imgH||nh) * scaleY);
            // Ajustar crop para que no se salga del nuevo tamaño de imagen
            el.cropX = Math.max(0, Math.min(el.imgW - el.w, Math.round((el.cropX||0) * scaleX)));
            el.cropY = Math.max(0, Math.min(el.imgH - el.h, Math.round((el.cropY||0) * scaleY)));
            var domImg = document.getElementById('dom_'+el.id);
            if(domImg){
                domImg.style.left=el.x+'px'; domImg.style.top=el.y+'px';
                domImg.style.width=el.w+'px'; domImg.style.height=el.h+'px';
            }
            var imgInner = document.getElementById('img_inner_'+el.id);
            if(imgInner){
                imgInner.style.width=el.imgW+'px'; imgInner.style.height=el.imgH+'px';
                imgInner.style.left=(-el.cropX)+'px'; imgInner.style.top=(-el.cropY)+'px';
            }
            actualizarPosEnProps(el);
            return;
        }

        // ── Resto de elementos: redimensionar el marco ──
        var nx=el.x,ny=el.y,nw2=el.w,nh2=el.h;
        if(h==='br'||h==='mr'||h==='tr') nw2=Math.max(20,Math.round(rsz.ow+dx));
        if(h==='bl'||h==='ml'||h==='tl'){nw2=Math.max(20,Math.round(rsz.ow-dx));nx=Math.round(rsz.ox+dx);if(nw2<=20)nx=rsz.ox+rsz.ow-20;}
        if(h==='br'||h==='bc'||h==='bl') nh2=Math.max(10,Math.round(rsz.oh+dy));
        if(h==='tr'||h==='tc'||h==='tl'){nh2=Math.max(10,Math.round(rsz.oh-dy));ny=Math.round(rsz.oy+dy);if(nh2<=10)ny=rsz.oy+rsz.oh-10;}
        if(h==='tc'||h==='bc'){nx=el.x;nw2=el.w;} if(h==='ml'||h==='mr'){ny=el.y;nh2=el.h;}
        el.x=nx;el.y=ny;el.w=nw2;el.h=nh2;
        var dom2=document.getElementById('dom_'+rsz.id);
        if(dom2){dom2.style.left=el.x+'px';dom2.style.top=el.y+'px';dom2.style.width=el.w+'px';dom2.style.height=el.h+'px';}
        actualizarPosEnProps(el);
    }
});

document.addEventListener('mouseup', function(){
    if(drag.on||rsz.on) empujarHistorial();
    drag.on=false; rsz.on=false;
});

// ══════════════════════════════════════════════
//  EDICION INLINE TEXTO
// ══════════════════════════════════════════════
function iniciarEdicionTexto(id) {
    var el=getEl(id); if(!el||el.tipo!=='texto') return;
    var dom=document.getElementById('dom_'+id); if(!dom) return;
    dom.querySelectorAll('.resize-handle').forEach(function(h){h.style.display='none';});
    dom.contentEditable='true'; dom.focus();
    var range=document.createRange(); range.selectNodeContents(dom);
    var sel=window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    function onInput(){ el.texto=dom.textContent; el.w=Math.max(60,dom.scrollWidth+4); dom.style.width=el.w+'px'; renderCapas(); }
    function onBlur(){ dom.contentEditable='false'; el.texto=dom.textContent||''; dom.querySelectorAll('.resize-handle').forEach(function(h){h.style.display='';}); dom.removeEventListener('input',onInput); dom.removeEventListener('blur',onBlur); empujarHistorial(); renderProps(); }
    function onKD(e){ if(e.key==='Escape')dom.blur(); if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();dom.blur();} e.stopPropagation(); }
    dom.addEventListener('input',onInput); dom.addEventListener('blur',onBlur); dom.addEventListener('keydown',onKD);
}

// ══════════════════════════════════════════════
//  HERRAMIENTAS E INSERTAR
// ══════════════════════════════════════════════
function setTool(tipo) {
    toolActiva=tipo;
    document.querySelectorAll('.tool-btn').forEach(function(b){b.classList.remove('active');});
    var btn=document.getElementById('tool-'+tipo); if(btn) btn.classList.add('active');
    document.getElementById('insertHint').classList.add('visible');
    document.getElementById('canvasArea').style.cursor='crosshair';
}
function clearTool() {
    toolActiva=null;
    document.querySelectorAll('.tool-btn').forEach(function(b){b.classList.remove('active');});
    document.getElementById('insertHint').classList.remove('visible');
    document.getElementById('canvasArea').style.cursor='default';
}
document.getElementById('credCanvas').addEventListener('click', function(e) {
    if (!toolActiva) return;
    // Permitir insertar en cualquier punto del canvas, incluso sobre otros elementos
    var rect=this.getBoundingClientRect(), sc=rect.width/CANVAS_W;
    empujarHistorial();
    insertar(toolActiva, Math.round((e.clientX-rect.left)/sc), Math.round((e.clientY-rect.top)/sc));
    clearTool();
});

function insertar(tipo, cx, cy) {
    var id='el_'+Date.now();
    var el={id:id,tipo:tipo,visible:true,opacity:100,nombre:tipo};

    if(tipo==='texto'){
        el.x=cx-75;el.y=cy-15;el.w=150;el.h=30;
        el.texto='Texto';el.fuente='bebas';el.fontSize=22;el.color='#ffffff';
        el.bold=false;el.italic=false;el.align='left';el.letterSpacing=0;
        el.strokeWidth=0;el.strokeColor='#000000';el.nombre='Texto';
    }
    if(tipo==='rect'){
        el.x=cx-60;el.y=cy-30;el.w=120;el.h=60;
        el.bgColor='rgba(255,255,255,0.15)';el.borderColor='rgba(255,255,255,0.5)';
        el.borderWidth=1;el.borderStyle='solid';el.borderBlur=0;el.radio=6;el.backdropBlur=0;el.nombre='Rectangulo';
    }
    if(tipo==='linea'){
        el.x=cx-60;el.y=cy;el.w=120;el.h=6;
        el.color='rgba(255,255,255,0.7)';el.grosor=2;el.lineBlur=0;el.nombre='Linea';
    }
    if(tipo==='foto'){
        el.x=cx-55;el.y=cy-55;el.w=110;el.h=110;
        el.radio=8;el.borderWidth=0;el.borderColor='#ffffff';el.borderBlur=0;el.nombre='Foto';
    }
    if(tipo==='imagen'){
        el.x=cx-100;el.y=cy-75;el.w=200;el.h=150;
        el.src=null;el.cropX=0;el.cropY=0;el.imgW=200;el.imgH=150;
        el.radio=0;el.borderWidth=0;el.borderColor='#ffffff';el.borderBlur=0;
        el.feather=0;el.sombra=false;el.sombraBlur=20;el.sombraColor='rgba(0,0,0,0.5)';el.nombre='Imagen';
        // Abrir selector de archivo automáticamente
        setTimeout(function(){
            var inp=document.createElement('input');inp.type='file';inp.accept='image/*';
            inp.onchange=function(ev){
                var f=ev.target.files[0]; if(!f) return;
                var r=new FileReader();
                r.onload=function(re){
                    el.src=re.target.result;
                    el.imgW=el.w; el.imgH=el.h;
                    var dom=document.getElementById('dom_'+el.id);
                    if(dom){dom.replaceWith(crearElDOM(el));}
                    renderProps();
                };
                r.readAsDataURL(f);
            };
            inp.click();
        }, 100);
    }

    el.x=Math.max(0,Math.min(CANVAS_W-el.w,el.x));
    el.y=Math.max(0,Math.min(CANVAS_H-el.h,el.y));
    estado.elementos.push(el);
    document.getElementById('credCanvas').appendChild(crearElDOM(el));
    renderCapas(); seleccionar(id);
}

// ══════════════════════════════════════════════
//  PROPS DINAMICAS
// ══════════════════════════════════════════════
function renderProps() {
    var el=getEl(elSel);
    var content=document.getElementById('propsContent');
    var empty=document.getElementById('propsEmpty');
    var title=document.getElementById('propsTitle');
    var delBtn=document.getElementById('propsDelBtn');

    if (!el) {
        content.style.display='none'; empty.style.display='';
        title.textContent='PROPIEDADES'; delBtn.style.display='none';
        // Ocultar botón duplicar también
        var dupBtn=document.getElementById('propsDupBtn');
        if(dupBtn) dupBtn.style.display='none';
        return;
    }
    empty.style.display='none'; content.style.display='';
    title.textContent=(el.nombre||el.tipo).toUpperCase();
    delBtn.style.display=el.bloqueado?'none':'';
    var dupBtn2=document.getElementById('propsDupBtn');
    if(dupBtn2) dupBtn2.style.display=el.bloqueado?'none':'';
    var html='';

    // Posicion / Tamano
    html+='<div class="prop-group"><div class="prop-group-title">Posicion y Tamano</div>';
    html+='<div class="prop-row"><span class="prop-lbl">X</span><input class="prop-input w52" id="px" type="number" value="'+Math.round(el.x)+'" oninput="setProp(\'x\',+this.value)">';
    html+='<span class="prop-lbl" style="text-align:right;padding-right:4px">Y</span><input class="prop-input w52" id="py" type="number" value="'+Math.round(el.y)+'" oninput="setProp(\'y\',+this.value)"></div>';
    html+='<div class="prop-row"><span class="prop-lbl">W</span><input class="prop-input w52" id="pw" type="number" value="'+Math.round(el.w)+'" oninput="setProp(\'w\',+this.value)">';
    html+='<span class="prop-lbl" style="text-align:right;padding-right:4px">H</span><input class="prop-input w52" id="ph" type="number" value="'+Math.round(el.h)+'" oninput="setProp(\'h\',+this.value)"></div></div>';

    // Opacidad
    html+='<div class="prop-group"><div class="prop-group-title">Opacidad</div><div class="prop-row">';
    html+='<input type="range" class="prop-range" min="0" max="100" value="'+(el.opacity!=null?el.opacity:100)+'" oninput="setProp(\'opacity\',+this.value);document.getElementById(\'popval\').textContent=this.value+\'%\'">';
    html+='<span class="prop-range-val" id="popval">'+(el.opacity!=null?el.opacity:100)+'%</span></div></div>';

    // ── TEXTO ──
    if (el.tipo==='texto') {
        html+='<div class="prop-group"><div class="prop-group-title">Texto</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Contenido</span><input class="prop-input wfull" type="text" value="'+escHtml(el.texto||'')+'" oninput="setProp(\'texto\',this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.color||'#fff')+'" oninput="setProp(\'color\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Tamano</span><input class="prop-input w52" type="number" value="'+(el.fontSize||16)+'" min="6" max="200" oninput="setProp(\'fontSize\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Fuente</span><select class="prop-select" onchange="setProp(\'fuente\',this.value)">';
        ['Display','Texto','Serif','Tech','Deco'].forEach(function(cat){
            html+='<optgroup label="'+cat+'">';
            FUENTES.filter(function(f){return f.cat===cat;}).forEach(function(f){
                html+='<option value="'+f.id+'"'+(f.id===el.fuente?' selected':'')+'>'+f.label+'</option>';
            });
            html+='</optgroup>';
        });
        html+='</select></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Estilo</span><div class="prop-toggles" style="flex:1">';
        html+='<button class="prop-toggle'+(el.bold?' on':'')+'" onclick="setProp(\'bold\',!getEl(elSel).bold);renderElementos();renderProps()"><b>B</b></button>';
        html+='<button class="prop-toggle'+(el.italic?' on':'')+'" onclick="setProp(\'italic\',!getEl(elSel).italic);renderElementos();renderProps()"><i>I</i></button>';
        html+='<button class="prop-toggle'+(el.align==='left'?' on':'')+'" onclick="setProp(\'align\',\'left\');renderElementos();renderProps()">L</button>';
        html+='<button class="prop-toggle'+(el.align==='center'?' on':'')+'" onclick="setProp(\'align\',\'center\');renderElementos();renderProps()">C</button>';
        html+='<button class="prop-toggle'+(el.align==='right'?' on':'')+'" onclick="setProp(\'align\',\'right\');renderElementos();renderProps()">R</button>';
        html+='</div></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Espaciado</span>';
        html+='<input type="range" class="prop-range" min="-5" max="30" value="'+(el.letterSpacing||0)+'" oninput="setProp(\'letterSpacing\',+this.value);document.getElementById(\'lsval\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="lsval">'+(el.letterSpacing||0)+'px</span></div></div>';
        html+='<div class="prop-group"><div class="prop-group-title">Contorno de Letra</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.strokeColor||'#000000')+'" oninput="setProp(\'strokeColor\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Grosor</span><input class="prop-input w52" type="number" value="'+(el.strokeWidth||0)+'" min="0" max="20" oninput="setProp(\'strokeWidth\',+this.value)"></div></div>';
        html+='<div class="prop-group"><div class="prop-group-title">Sombra</div>';
        html+='<div class="prop-row"><button class="prop-toggle'+(el.sombra?' on':'')+'" style="flex:1" onclick="setProp(\'sombra\',!getEl(elSel).sombra);renderElementos();renderProps()">'+(el.sombra?'Con sombra':'Sin sombra')+'</button></div>';
        if (el.sombra) {
            html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.sombraColor||'#000000')+'" oninput="setProp(\'sombraColor\',this.value)">';
            html+='<span class="prop-lbl" style="margin-left:4px">Blur</span><input class="prop-input w52" type="number" value="'+(el.sombraBlur||8)+'" min="0" max="60" oninput="setProp(\'sombraBlur\',+this.value)"></div>';
            html+='<div class="prop-row"><span class="prop-lbl">X</span><input class="prop-input w52" type="number" value="'+(el.sombraX||0)+'" min="-30" max="30" oninput="setProp(\'sombraX\',+this.value)">';
            html+='<span class="prop-lbl" style="margin-left:4px">Y</span><input class="prop-input w52" type="number" value="'+(el.sombraY||2)+'" min="-30" max="30" oninput="setProp(\'sombraY\',+this.value)"></div>';
        }
        html+='</div>';
    }

    // ── IMAGEN ──
    if (el.tipo==='imagen') {
        html+='<div class="prop-group"><div class="prop-group-title">Imagen</div>';
        html+='<div class="prop-row" style="flex-direction:column;gap:5px">';
        html+='<button onclick="document.getElementById(\'imgFileInput\').click()" style="padding:6px;background:var(--sel-bg);border:1px solid rgba(79,142,247,0.35);color:var(--accent);border-radius:6px;font-size:0.72rem;font-weight:700;cursor:pointer;">🖼️ Cambiar imagen</button>';
        html+='<button onclick="iniciarCropImagen(elSel)" style="padding:6px;background:rgba(224,184,74,0.12);border:1px solid rgba(224,184,74,0.4);color:#e0b84a;border-radius:6px;font-size:0.72rem;font-weight:700;cursor:pointer;">✥ Modo recorte (o doble clic)</button>';
        html+='<input type="file" id="imgFileInput" accept="image/*" style="display:none" onchange="cambiarSrcImagen(this)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Radio</span>';
        html+='<input type="range" class="prop-range" min="0" max="300" value="'+(el.radio||0)+'" oninput="setProp(\'radio\',+this.value);document.getElementById(\'imgRadVal\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="imgRadVal">'+(el.radio||0)+'px</span></div></div>';

        html+='<div class="prop-group"><div class="prop-group-title">Zoom / Recorte</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Ancho img</span>';
        html+='<input class="prop-input" style="flex:1" type="number" value="'+(el.imgW||el.w)+'" min="'+el.w+'" max="'+(el.w*6)+'" oninput="setProp(\'imgW\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Alto img</span>';
        html+='<input class="prop-input" style="flex:1" type="number" value="'+(el.imgH||el.h)+'" min="'+el.h+'" max="'+(el.h*6)+'" oninput="setProp(\'imgH\',+this.value)"></div>';
        html+='<div class="prop-row" style="align-items:center">';
        html+='<span class="prop-lbl" style="font-size:0.65rem;color:var(--text3);flex:1">Crop X:'+(el.cropX||0)+'px Y:'+(el.cropY||0)+'px</span>';
        html+='<button onclick="setProp(\'cropX\',0);setProp(\'cropY\',0);renderElementos();renderProps()" style="padding:3px 8px;background:var(--surface3);border:1px solid var(--border2);color:var(--text2);border-radius:5px;font-size:0.68rem;cursor:pointer;">Reset</button></div></div>';

        html+='<div class="prop-group"><div class="prop-group-title">Borde</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.borderColor||'#ffffff')+'" oninput="setProp(\'borderColor\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Grosor</span><input class="prop-input w52" type="number" value="'+(el.borderWidth||0)+'" min="0" max="20" oninput="setProp(\'borderWidth\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Glow</span>';
        html+='<input type="range" class="prop-range" min="0" max="40" value="'+(el.borderBlur||0)+'" oninput="setProp(\'borderBlur\',+this.value);document.getElementById(\'imgBlVal\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="imgBlVal">'+(el.borderBlur||0)+'px</span></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Feather</span>';
        html+='<input type="range" class="prop-range" min="0" max="50" value="'+(el.feather||0)+'" oninput="setProp(\'feather\',+this.value);document.getElementById(\'imgFtVal\').textContent=this.value+\'%\'">';
        html+='<span class="prop-range-val" id="imgFtVal">'+(el.feather||0)+'%</span></div></div>';

        html+='<div class="prop-group"><div class="prop-group-title">Sombra</div>';
        html+='<div class="prop-row"><button class="prop-toggle'+(el.sombra?' on':'')+'" style="flex:1" onclick="setProp(\'sombra\',!getEl(elSel).sombra);renderElementos();renderProps()">'+(el.sombra?'Con sombra':'Sin sombra')+'</button></div>';
        if (el.sombra) {
            html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.sombraColor||'rgba(0,0,0,0.5)')+'" oninput="setProp(\'sombraColor\',this.value)">';
            html+='<span class="prop-lbl" style="margin-left:4px">Blur</span><input class="prop-input w52" type="number" value="'+(el.sombraBlur||20)+'" min="0" max="80" oninput="setProp(\'sombraBlur\',+this.value)"></div>';
        }
        html+='</div>';
    }

    // ── FOTO jugador ──
    if (el.tipo==='foto') {
        html+='<div class="prop-group"><div class="prop-group-title">Foto Jugador</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Radio</span><input class="prop-input" type="number" value="'+(el.radio!=null?el.radio:8)+'" min="0" max="300" oninput="setProp(\'radio\',+this.value)"></div>';
        html+='<div class="prop-row" style="flex-direction:column;gap:4px">';
        html+='<button onclick="document.getElementById(\'fotoFileInput\').click()" style="padding:6px;background:var(--sel-bg);border:1px solid rgba(79,142,247,0.35);color:var(--accent);border-radius:6px;font-size:0.72rem;font-weight:700;cursor:pointer;">Subir foto de prueba</button>';
        html+='<input type="file" id="fotoFileInput" accept="image/*" style="display:none" onchange="cargarFotoEl(this)"></div></div>';
        html+='<div class="prop-group"><div class="prop-group-title">Borde</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.borderColor||'#ffffff')+'" oninput="setProp(\'borderColor\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Grosor</span><input class="prop-input w52" type="number" value="'+(el.borderWidth||0)+'" min="0" max="20" oninput="setProp(\'borderWidth\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Difuminado</span>';
        html+='<input type="range" class="prop-range" min="0" max="40" value="'+(el.borderBlur||0)+'" oninput="setProp(\'borderBlur\',+this.value);document.getElementById(\'fotoblval\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="fotoblval">'+(el.borderBlur||0)+'px</span></div></div>';
        html+='<div class="prop-group"><div class="prop-group-title">Sombra</div>';
        html+='<div class="prop-row"><button class="prop-toggle'+(el.sombra?' on':'')+'" style="flex:1" onclick="setProp(\'sombra\',!getEl(elSel).sombra);renderElementos();renderProps()">'+(el.sombra?'Con sombra':'Sin sombra')+'</button></div>';
        if (el.sombra) {
            html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.sombraColor||'#000000')+'" oninput="setProp(\'sombraColor\',this.value)">';
            html+='<span class="prop-lbl" style="margin-left:4px">Blur</span><input class="prop-input w52" type="number" value="'+(el.sombraBlur||10)+'" min="0" max="60" oninput="setProp(\'sombraBlur\',+this.value)"></div>';
        }
        html+='</div>';
    }

    // ── RECTANGULO ──
    if (el.tipo==='rect') {
        html+='<div class="prop-group"><div class="prop-group-title">Relleno</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.bgColor||'#ffffff')+'" oninput="setProp(\'bgColor\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Radio</span><input class="prop-input w52" type="number" value="'+(el.radio||0)+'" min="0" max="300" oninput="setProp(\'radio\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Cristal blur</span>';
        html+='<input type="range" class="prop-range" min="0" max="30" value="'+(el.backdropBlur||0)+'" oninput="setProp(\'backdropBlur\',+this.value);document.getElementById(\'bbval\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="bbval">'+(el.backdropBlur||0)+'px</span></div></div>';
        html+='<div class="prop-group"><div class="prop-group-title">Borde</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.borderColor||'#ffffff')+'" oninput="setProp(\'borderColor\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Grosor</span><input class="prop-input w52" type="number" value="'+(el.borderWidth||0)+'" min="0" max="20" oninput="setProp(\'borderWidth\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Estilo</span><select class="prop-select" onchange="setProp(\'borderStyle\',this.value)">';
        ['solid','dashed','dotted','double','groove','ridge'].forEach(function(s){ html+='<option value="'+s+'"'+(el.borderStyle===s?' selected':'')+'>'+s+'</option>'; });
        html+='</select></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Glow</span>';
        html+='<input type="range" class="prop-range" min="0" max="40" value="'+(el.borderBlur||0)+'" oninput="setProp(\'borderBlur\',+this.value);document.getElementById(\'blval\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="blval">'+(el.borderBlur||0)+'px</span></div></div>';
        html+='<div class="prop-group"><div class="prop-group-title">Sombra</div>';
        html+='<div class="prop-row"><button class="prop-toggle'+(el.sombra?' on':'')+'" style="flex:1" onclick="setProp(\'sombra\',!getEl(elSel).sombra);renderElementos();renderProps()">'+(el.sombra?'Con sombra':'Sin sombra')+'</button></div>';
        if (el.sombra) {
            html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.sombraColor||'#000000')+'" oninput="setProp(\'sombraColor\',this.value)">';
            html+='<span class="prop-lbl" style="margin-left:4px">Blur</span><input class="prop-input w52" type="number" value="'+(el.sombraBlur||8)+'" min="0" max="60" oninput="setProp(\'sombraBlur\',+this.value)"></div>';
            html+='<div class="prop-row"><span class="prop-lbl">X</span><input class="prop-input w52" type="number" value="'+(el.sombraX||0)+'" min="-30" max="30" oninput="setProp(\'sombraX\',+this.value)">';
            html+='<span class="prop-lbl" style="margin-left:4px">Y</span><input class="prop-input w52" type="number" value="'+(el.sombraY||4)+'" min="-30" max="30" oninput="setProp(\'sombraY\',+this.value)"></div>';
        }
        html+='</div>';
    }

    // ── LINEA ──
    if (el.tipo==='linea') {
        html+='<div class="prop-group"><div class="prop-group-title">Linea</div>';
        html+='<div class="prop-row"><span class="prop-lbl">Color</span><input type="color" class="prop-color" value="'+colorToHex(el.color||'#ffffff')+'" oninput="setProp(\'color\',this.value)">';
        html+='<span class="prop-lbl" style="margin-left:4px">Grosor</span><input class="prop-input w52" type="number" value="'+(el.grosor||2)+'" min="1" max="30" oninput="setProp(\'grosor\',+this.value)"></div>';
        html+='<div class="prop-row"><span class="prop-lbl">Glow</span>';
        html+='<input type="range" class="prop-range" min="0" max="30" value="'+(el.lineBlur||0)+'" oninput="setProp(\'lineBlur\',+this.value);document.getElementById(\'linblval\').textContent=this.value+\'px\'">';
        html+='<span class="prop-range-val" id="linblval">'+(el.lineBlur||0)+'px</span></div></div>';
    }

    content.innerHTML = html;
}

function actualizarPosEnProps(el) {
    var f={px:Math.round(el.x),py:Math.round(el.y),pw:Math.round(el.w),ph:Math.round(el.h)};
    Object.keys(f).forEach(function(id){var inp=document.getElementById(id);if(inp)inp.value=f[id];});
}

function setProp(prop, val) {
    var el=getEl(elSel); if(!el) return;
    el[prop]=val;
    var dom=document.getElementById('dom_'+el.id); if(!dom) return;

    if(prop==='x'){dom.style.left=val+'px';return;}
    if(prop==='y'){dom.style.top=val+'px';return;}
    if(prop==='w'){dom.style.width=val+'px';return;}
    if(prop==='h'){dom.style.height=val+'px';return;}
    if(prop==='opacity'){dom.style.opacity=val/100;return;}

    // Actualización directa de imagen sin re-render completo
    if(el.tipo==='imagen' && (prop==='imgW'||prop==='imgH'||prop==='cropX'||prop==='cropY')){
        var img=document.getElementById('img_inner_'+el.id);
        if(img){
            img.style.width  = (el.imgW||el.w)+'px';
            img.style.height = (el.imgH||el.h)+'px';
            img.style.left   = (-(el.cropX||0))+'px';
            img.style.top    = (-(el.cropY||0))+'px';
        }
        return;
    }

    if(el.tipo==='texto'){
        if(prop==='texto'){dom.textContent=val;reponerHandles(dom,el);return;}
        if(prop==='color'){dom.style.color=val;return;}
        if(prop==='fontSize'){dom.style.fontSize=val+'px';return;}
        if(prop==='bold'){dom.style.fontWeight=val?'700':'400';return;}
        if(prop==='italic'){dom.style.fontStyle=val?'italic':'normal';return;}
        if(prop==='align'){dom.style.textAlign=val;return;}
        if(prop==='fuente'){dom.style.fontFamily=fuenteCSS(val);return;}
        if(prop==='letterSpacing'){dom.style.letterSpacing=val+'px';return;}
    }
    if(el.tipo==='linea'){
        if(prop==='color'){dom.style.background=val;return;}
        if(prop==='grosor'){dom.style.height=val+'px';dom.style.marginTop=((el.h-val)/2)+'px';return;}
    }

    var nuevo=crearElDOM(el); dom.replaceWith(nuevo); renderCapas();
}

function reponerHandles(dom, el) {
    dom.querySelectorAll('.resize-handle').forEach(function(h){h.remove();});
    if(!el.bloqueado){['tl','tc','tr','ml','mr','bl','bc','br'].forEach(function(h){var hd=document.createElement('div');hd.className='resize-handle rh-'+h;hd.dataset.handle=h;dom.appendChild(hd);});}
}

// ══════════════════════════════════════════════
//  FOTO JUGADOR
// ══════════════════════════════════════════════
function cargarFotoEl(input) {
    var el=getEl(elSel); if(!el||el.tipo!=='foto') return;
    var file=input.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(e){el.src=e.target.result;var dom=document.getElementById('dom_'+el.id);if(dom){dom.replaceWith(crearElDOM(el));}empujarHistorial();};
    reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
//  CAMBIAR SRC DE IMAGEN
// ══════════════════════════════════════════════
function cambiarSrcImagen(input) {
    var el=getEl(elSel); if(!el||el.tipo!=='imagen') return;
    var file=input.files[0]; if(!file) return;
    var reader=new FileReader();
    reader.onload=function(e){
        el.src=e.target.result;
        el.cropX=0; el.cropY=0;
        var dom=document.getElementById('dom_'+el.id);
        if(dom){dom.replaceWith(crearElDOM(el));}
        empujarHistorial(); renderProps();
    };
    reader.readAsDataURL(file);
}

// ══════════════════════════════════════════════
//  CAPAS
// ══════════════════════════════════════════════
function renderCapas() {
    var lista=document.getElementById('layersList'); lista.innerHTML='';
    estado.elementos.slice().reverse().forEach(function(el){
        var item=document.createElement('div');
        item.className='layer-item'+(elSel===el.id?' activa':'')+(el.bloqueado?' bloqueada':'');
        item.dataset.elId=el.id;
        item.innerHTML='<span class="layer-icon">'+iconoCapa(el.tipo)+'</span><span class="layer-name">'+(el.nombre||el.tipo)+'</span><span class="layer-eye" onclick="event.stopPropagation();toggleVisible(\''+el.id+'\')">'+(el.visible?'👁':'🚫')+'</span>';
        item.onclick=function(){seleccionar(el.id);};
        lista.appendChild(item);
    });
}
function iconoCapa(t){ return {texto:'T',foto:'F',rect:'R',linea:'L',imagen:'I'}[t]||'?'; }
function toggleVisible(id){ var el=getEl(id);if(!el)return;el.visible=!el.visible;var dom=document.getElementById('dom_'+id);if(dom)dom.style.display=el.visible?'':'none';renderCapas(); }

// ══════════════════════════════════════════════
//  CONTEXT MENU
// ══════════════════════════════════════════════
function mostrarCtxMenu(x,y){var m=document.getElementById('ctxMenu');m.style.left=x+'px';m.style.top=y+'px';m.classList.add('visible');}
function ocultarCtxMenu(){document.getElementById('ctxMenu').classList.remove('visible');}
document.addEventListener('click',function(e){if(!document.getElementById('ctxMenu').contains(e.target))ocultarCtxMenu();});

function ctxAccion(accion){
    ocultarCtxMenu(); if(!elSel) return;
    var idx=estado.elementos.findIndex(function(e){return e.id===elSel;}); if(idx<0) return;
    empujarHistorial();
    var tmp,el;
    if(accion==='arriba'&&idx<estado.elementos.length-1){tmp=estado.elementos[idx];estado.elementos[idx]=estado.elementos[idx+1];estado.elementos[idx+1]=tmp;}
    if(accion==='abajo'&&idx>0){tmp=estado.elementos[idx];estado.elementos[idx]=estado.elementos[idx-1];estado.elementos[idx-1]=tmp;}
    if(accion==='frente'){el=estado.elementos.splice(idx,1)[0];estado.elementos.push(el);}
    if(accion==='fondo-capa'){el=estado.elementos.splice(idx,1)[0];estado.elementos.unshift(el);}
    if(accion==='duplicar'){var c=JSON.parse(JSON.stringify(estado.elementos[idx]));c.id='el_'+Date.now();c.x+=15;c.y+=15;c.nombre=(c.nombre||'')+'copia';estado.elementos.push(c);}
    if(accion==='centrarH'){el=getEl(elSel);if(el)el.x=Math.round((CANVAS_W-el.w)/2);}
    if(accion==='centrarV'){el=getEl(elSel);if(el)el.y=Math.round((CANVAS_H-el.h)/2);}
    if(accion==='eliminar'){eliminarSeleccionado();return;}
    renderElementos();renderCapas();seleccionar(elSel);
}

// ══════════════════════════════════════════════
//  ELIMINAR / HISTORIAL
// ══════════════════════════════════════════════
function eliminarSeleccionado(){
    if(!elSel)return; var el=getEl(elSel); if(el&&el.bloqueado)return;
    empujarHistorial(); estado.elementos=estado.elementos.filter(function(e){return e.id!==elSel;});
    var dom=document.getElementById('dom_'+elSel); if(dom)dom.remove();
    elSel=null; renderCapas(); renderProps();
}
function empujarHistorial(){
    historial.push(JSON.stringify(estado.elementos));
    if(historial.length>30) historial.shift();
    rehacer = []; // limpiar rehacer al hacer nueva acción
}
function deshacer(){
    if(!historial.length) return;
    rehacer.push(JSON.stringify(estado.elementos));
    estado.elementos=JSON.parse(historial.pop());
    elSel=null; renderElementos();renderCapas();renderProps(); mostrarToast('↩ Deshacer');
}
function rehacerAccion(){
    if(!rehacer.length) return;
    historial.push(JSON.stringify(estado.elementos));
    estado.elementos=JSON.parse(rehacer.pop());
    elSel=null; renderElementos();renderCapas();renderProps(); mostrarToast('↪ Rehacer');
}

// ══════════════════════════════════════════════
//  PLANTILLAS
// ══════════════════════════════════════════════
function renderPlantillas(){
    var grid=document.getElementById('plantillasGrid'); grid.innerHTML='';
    PLANTILLAS.forEach(function(p){
        var btn=document.createElement('button'); btn.className='plantilla-mini';
        btn.style.background='linear-gradient(135deg,'+p.c1+','+p.c2+')'; btn.title=p.label;
        btn.innerHTML='<span>'+p.label+'</span>';
        btn.onclick=function(){empujarHistorial();estado.bgColor1=p.c1;estado.bgColor2=p.c2;document.getElementById('bgColor1').value=p.c1;document.getElementById('bgColor2').value=p.c2;renderFondo();document.querySelectorAll('.plantilla-mini').forEach(function(b){b.classList.remove('activa');});btn.classList.add('activa');};
        grid.appendChild(btn);
    });
}

// ══════════════════════════════════════════════
//  GUARDAR
// ══════════════════════════════════════════════
function guardarDiseno(){
    var nombreVal = document.getElementById('nombreInput').value.trim() || 'Mi Diseno';
    var disenos=getDisenos(); var id=disenoId||('d_'+Date.now());
    var obj={
        id:id, nombre:nombreVal,
        bgColor1:estado.bgColor1, bgColor2:estado.bgColor2, bgDireccion:estado.bgDireccion,
        bgImagen:estado.bgImagen, bgOpacidad:estado.bgOpacidad, bgBlur:estado.bgBlur,
        bgSize:estado.bgSize, bgSizeVal:estado.bgSizeVal, bgPosX:estado.bgPosX, bgPosY:estado.bgPosY,
        elementos:estado.elementos,
        colorFondo:estado.bgColor1, colorFondo2:estado.bgColor2, imagen:estado.bgImagen, opacidad:estado.bgOpacidad,
        fechaGuardado: Date.now()
    };
    var idx=disenos.findIndex(function(x){return x.id===id;}); if(idx>=0)disenos[idx]=obj; else disenos.push(obj);
    saveDisenos(disenos);
    disenoId=id;
    estado.nombre=nombreVal;
    // Auto-asignar a categoría si hay una
    if(categoria) setAsignado(categoria, id);
    mostrarToast('✓ Diseno guardado');
}

// ══════════════════════════════════════════════
//  ASIGNACION
// ══════════════════════════════════════════════
function abrirAsignacion(){ if(!categoria){mostrarToast('Sin categoria');return;} document.getElementById('modalCatName').textContent=categoria; document.getElementById('modalAsignacion').classList.add('open'); }
function cerrarAsignacion(){ document.getElementById('modalAsignacion').classList.remove('open'); }
function confirmarAsignacion(){ if(!disenoId)guardarDiseno(); setAsignado(categoria,disenoId); cerrarAsignacion(); mostrarToast('Asignado a '+categoria); }

// ══════════════════════════════════════════════
//  ZOOM
// ══════════════════════════════════════════════
function cambiarZoom(delta){ zoom=Math.max(25,Math.min(200,zoom+delta)); document.getElementById('canvasWrap').style.transform='scale('+(zoom/100)+')'; document.getElementById('zoomVal').textContent=zoom+'%'; }
document.getElementById('canvasArea').addEventListener('wheel',function(e){e.preventDefault();cambiarZoom(e.deltaY<0?10:-10);},{passive:false});

// ══════════════════════════════════════════════
//  ATAJOS
// ══════════════════════════════════════════════
document.addEventListener('keydown',function(e){
    if(document.activeElement&&document.activeElement.contentEditable==='true')return;
    if(document.activeElement&&['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName))return;
    if(e.key==='Escape'){clearTool();deseleccionar(null);}
    if(e.key==='Delete'||e.key==='Backspace')eliminarSeleccionado();
    if((e.ctrlKey||e.metaKey)&&e.key==='z'){deshacer();e.preventDefault();}
    if((e.ctrlKey||e.metaKey)&&(e.key==='y'||(e.shiftKey&&e.key==='Z'))){rehacerAccion();e.preventDefault();}
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){guardarDiseno();e.preventDefault();}
    if((e.ctrlKey||e.metaKey)&&e.key==='d'&&elSel){
        empujarHistorial();
        var elD=getEl(elSel);
        if(elD){var cD=JSON.parse(JSON.stringify(elD));cD.id='el_'+Date.now();cD.x+=15;cD.y+=15;cD.nombre=(cD.nombre||'')+'copia';estado.elementos.push(cD);renderElementos();renderCapas();seleccionar(cD.id);}
        e.preventDefault();
    }
    if(elSel&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){
        var el=getEl(elSel);if(!el)return; var step=e.shiftKey?10:1;
        if(e.key==='ArrowLeft') el.x=Math.max(0,el.x-step);
        if(e.key==='ArrowRight')el.x=Math.min(CANVAS_W-el.w,el.x+step);
        if(e.key==='ArrowUp')   el.y=Math.max(0,el.y-step);
        if(e.key==='ArrowDown') el.y=Math.min(CANVAS_H-el.h,el.y+step);
        var dom=document.getElementById('dom_'+elSel);if(dom){dom.style.left=el.x+'px';dom.style.top=el.y+'px';}
        actualizarPosEnProps(el);e.preventDefault();
    }
});

document.getElementById('canvasArea').addEventListener('mousedown',function(e){if(e.target===this)deseleccionar(e);});
document.getElementById('credCanvas').addEventListener('mousedown',function(e){var f=[this,document.getElementById('canvasBg'),document.getElementById('canvasImgOverlay')];if(f.includes(e.target)&&!toolActiva)deseleccionar(e);});

// ══════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════
function getEl(id){return estado.elementos.find(function(e){return e.id===id;})||null;}
function fuenteCSS(id){var f=FUENTES.find(function(x){return x.id===id;});return f?f.css:"'Outfit',sans-serif";}
function escHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function colorToHex(c){if(!c||c==='transparent')return'#000000';if(c.startsWith('#')&&(c.length===4||c.length===7))return c;var m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(m){var h=function(n){return('0'+parseInt(n).toString(16)).slice(-2);};return'#'+h(m[1])+h(m[2])+h(m[3]);}return'#ffffff';}
function mostrarToast(msg){var t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(function(){t.classList.remove('show');},2600);}

// ══════════════════════════════════════════════
//  ARRANQUE
// ══════════════════════════════════════════════
cargarDiseno();