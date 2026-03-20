function mostrarToast(mensaje, tipo = 'exito') {
    let toast = document.getElementById('toast-notif');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-notif';
        toast.style.cssText = `
            position:fixed; bottom:2rem; left:50%; transform:translateX(-50%) translateY(20px);
            padding:0.8rem 1.8rem; border-radius:12px; font-family:'Outfit',sans-serif;
            font-size:0.85rem; font-weight:600; letter-spacing:0.5px;
            z-index:9999; opacity:0; transition:all 0.3s ease; white-space:nowrap;
            box-shadow:0 8px 30px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);
    }
    toast.style.background = tipo === 'exito'
        ? 'linear-gradient(135deg,#22c55e,#16a34a)'
        : 'linear-gradient(135deg,#ef4444,#dc2626)';
    toast.style.color = '#fff';
    toast.style.border = tipo === 'exito'
        ? '1px solid rgba(34,197,94,0.4)'
        : '1px solid rgba(239,68,68,0.4)';
    toast.textContent = mensaje;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}
// ========== GESTIÓN DE CATEGORÍAS ==========

let categoriaActual = null;
let categoriaEditando = null;
let categoriaAEliminar = null;

// Cargar categoría guardada al inicio
window.addEventListener('DOMContentLoaded', () => {
    cargarCategorias();
    const categoriaGuardada = localStorage.getItem('categoriaSeleccionada');
    if (categoriaGuardada) {
        categoriaActual = categoriaGuardada;
        document.getElementById('selectedText').textContent = categoriaGuardada;
        mostrarOpciones();
    }
});

function cargarCategorias() {
    const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
    const container = document.getElementById("optionsContainer");
    
    container.innerHTML = '';
    
    categorias.forEach(categoria => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        if (categoria === categoriaActual) {
            optionDiv.classList.add('selected');
        }
        
        optionDiv.innerHTML = `
            <span class="option-text">${categoria}</span>
            <div class="option-actions">
                <button class="btn-icon" onclick="editarCategoria('${categoria}'); event.stopPropagation();" title="Editar">✏️</button>
                <button class="btn-icon" onclick="mostrarModalEliminar('${categoria}'); event.stopPropagation();" title="Eliminar">🗑️</button>
            </div>
        `;
        
        optionDiv.addEventListener('click', () => {
            seleccionarCategoria(categoria);
        });
        
        container.appendChild(optionDiv);
    });
}

function toggleOptions() {
    const select = document.getElementById('customSelect');
    const container = document.getElementById('optionsContainer');
    
    select.classList.toggle('open');
    container.classList.toggle('open');
}

function seleccionarCategoria(categoria) {
    categoriaActual = categoria;
    localStorage.setItem('categoriaSeleccionada', categoria);
    
    document.getElementById('selectedText').textContent = categoria;
    
    toggleOptions();
    cargarCategorias();
    mostrarOpciones();
}

function mostrarOpciones() {
    const panel = document.getElementById("opcionesCategoria");
    const textoCategoria = document.getElementById("textoCategoria");
    
    if (categoriaActual) {
        panel.classList.remove("oculto");
        textoCategoria.textContent = categoriaActual;
    } else {
        panel.classList.add("oculto");
    }
}

function mostrarFormularioCrear() {
    categoriaEditando = null;
    document.getElementById('tituloModal').textContent = '⚡ Nueva Categoría ⚡';
    document.getElementById('nombreCategoria').value = '';
    document.getElementById('errorNombre').textContent = '';
    document.getElementById('modalCategoria').classList.add('activo');
    document.getElementById('overlay').classList.add('activo');
    document.getElementById('nombreCategoria').focus();
}

function editarCategoria(categoria) {
    categoriaEditando = categoria;
    document.getElementById('tituloModal').textContent = '✏️ Editar Categoría';
    document.getElementById('nombreCategoria').value = categoria;
    document.getElementById('errorNombre').textContent = '';
    document.getElementById('modalCategoria').classList.add('activo');
    document.getElementById('overlay').classList.add('activo');
    document.getElementById('nombreCategoria').focus();
}

function cerrarModal() {
    document.getElementById('modalCategoria').classList.remove('activo');
    document.getElementById('overlay').classList.remove('activo');
    categoriaEditando = null;
}

function guardarCategoria() {
    const nombre = document.getElementById('nombreCategoria').value.trim();
    const errorDiv = document.getElementById('errorNombre');

    if (nombre === "") {
        errorDiv.textContent = "⚠️ El nombre no puede estar vacío";
        return;
    }

    const categorias = JSON.parse(localStorage.getItem("categorias")) || [];

    if (categoriaEditando) {
        // Editar categoría existente
        if (categorias.includes(nombre) && nombre !== categoriaEditando) {
            errorDiv.textContent = "⚠️ Esta categoría ya existe";
            return;
        }
        
        const index = categorias.indexOf(categoriaEditando);
        categorias[index] = nombre;
        
        // Actualizar categoría seleccionada si es la que se está editando
        if (categoriaActual === categoriaEditando) {
            categoriaActual = nombre;
            localStorage.setItem('categoriaSeleccionada', nombre);
            document.getElementById('selectedText').textContent = nombre;
        }
        
        // el de editar:
        mostrarToast(`✓ Categoría actualizada a "${nombre}"`);
    } else {
        // Crear nueva categoría
        if (categorias.includes(nombre)) {
            errorDiv.textContent = "⚠️ Esta categoría ya existe";
            return;
        }
        
        categorias.push(nombre);
        
// el de crear:
mostrarToast(`✓ Categoría "${nombre}" creada`);
    }

    localStorage.setItem("categorias", JSON.stringify(categorias));
    cerrarModal();
    cargarCategorias();
    mostrarOpciones();
}

function mostrarModalEliminar(categoria) {
    categoriaAEliminar = categoria;
    document.getElementById('categoriaEliminar').textContent = categoria;
    document.getElementById('modalEliminar').classList.add('activo');
    document.getElementById('overlay').classList.add('activo');
}

function cerrarModalEliminar() {
    document.getElementById('modalEliminar').classList.remove('activo');
    document.getElementById('overlay').classList.remove('activo');
    categoriaAEliminar = null;
}

function confirmarEliminar() {
    if (!categoriaAEliminar) return;
    
    const categorias = JSON.parse(localStorage.getItem("categorias")) || [];
    const index = categorias.indexOf(categoriaAEliminar);
    
    if (index > -1) {
        categorias.splice(index, 1);
        localStorage.setItem("categorias", JSON.stringify(categorias));
        
        // Si se eliminó la categoría seleccionada, limpiar selección
        if (categoriaActual === categoriaAEliminar) {
            categoriaActual = null;
            localStorage.removeItem('categoriaSeleccionada');
            document.getElementById('selectedText').textContent = '🏆 Selecciona una Categoría';
            document.getElementById('opcionesCategoria').classList.remove('activo');
        }
            mostrarToast(`✓ Categoría "${categoriaAEliminar}" eliminada`, 'exito');        
    }
    
    cerrarModalEliminar();
    cargarCategorias();
}

function cerrarTodo() {
    cerrarModal();
    cerrarModalEliminar();
    
    // Cerrar selector si está abierto
    document.getElementById('customSelect').classList.remove('open');
    document.getElementById('optionsContainer').classList.remove('open');
}

// Cerrar selector al hacer clic fuera
document.addEventListener('click', (e) => {
    const select = document.getElementById('customSelect');
    const container = document.getElementById('optionsContainer');
    const selectorContainer = document.querySelector('.selector-container');
    
    if (!selectorContainer.contains(e.target)) {
        select.classList.remove('open');
        container.classList.remove('open');
    }
});

// Enter para guardar
document.getElementById('nombreCategoria').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        guardarCategoria();
    }
});