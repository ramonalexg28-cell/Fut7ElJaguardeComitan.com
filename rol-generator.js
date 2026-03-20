// ========== GENERACIÓN Y GESTIÓN DEL ROL ==========

// Cargar datos iniciales
function cargarDatos() {
    const equipos = JSON.parse(localStorage.getItem(storageKeyEquipos)) || [];
    const equiposEnRol = JSON.parse(localStorage.getItem(storageKeyEquiposEnRol)) || [];
    const rolGuardado = JSON.parse(localStorage.getItem(storageKeyRol)) || null;

    if (rolGuardado && rolGuardado.length > 0) {
        todasLasJornadas = rolGuardado;
        
        // Usar equipos en rol si existen, sino usar equipos actuales
        const numEquipos = equiposEnRol.length > 0 ? equiposEnRol.length : equipos.length;
        
        mostrarEstadisticas(numEquipos, rolGuardado);
        
        // Asegurarse de que jornadaActual esté en rango válido
        if (jornadaActual >= rolGuardado.length) {
            jornadaActual = 0;
        }
        
        mostrarRolSegunVista();
        btnGenerar.disabled = true;
        
        // Mostrar botón agregar equipos
        const btnAgregar = getBtnAgregar();
        if (btnAgregar) {
            btnAgregar.style.display = 'inline-block';
        }
        
        // Verificar si hay jornadas completas guardadas (equipos agregados)
        const jornadasCompletasAntes = parseInt(localStorage.getItem(`jornadasCompletasAntes_${categoria}`)) || 0;
        if (jornadasCompletasAntes > 0) {
            const btnSugerencia = document.querySelector('.btn-vista-sugerencia');
            if (btnSugerencia) {
                btnSugerencia.style.display = 'inline-block';
                console.log("✅ Botón sugerencia mostrado (hay jornadas previas)");
            }
        }
    } else if (equipos.length < 2) {
        jornadasContainer.innerHTML = `
            <div class="mensaje-info">
                ⚽ Necesitas al menos 2 equipos para generar un rol de juegos.
                <strong>¡Ve a "Equipos" para agregar equipos!</strong>
            </div>
        `;
        btnGenerar.disabled = true;
        
        // Ocultar botón agregar equipos
        const btnAgregar = getBtnAgregar();
        if (btnAgregar) {
            btnAgregar.style.display = 'none';
        }
    } else {
        jornadasContainer.innerHTML = `
            <div class="mensaje-info">
                🏆 Tienes ${equipos.length} equipos registrados.
                <strong>¡Presiona "Crear Rol" para generar el calendario de partidos!</strong>
                <br><br>
                Se generarán ${equipos.length % 2 === 0 ? equipos.length - 1 : equipos.length} jornadas épicas.
            </div>
        `;
        
        // Ocultar botón agregar equipos
        const btnAgregar = getBtnAgregar();
        if (btnAgregar) {
            btnAgregar.style.display = 'none';
        }
    }
}

// Generar rol completo (algoritmo Round-Robin)
function generarRol() {
    const equipos = JSON.parse(localStorage.getItem(storageKeyEquipos)) || [];
    
    if (equipos.length < 2) {
        alert("⚠️ Necesitas al menos 2 equipos para generar un rol.");
        return;
    }

    console.log("🚀 Botón presionado, llamando animación..."); // Debug
    
    // Mostrar animación de carga INMEDIATAMENTE
    mostrarAnimacionCarga("🏆 Generando Rol de Juegos 🏆");

    // Esperar a que la animación termine (2.8 segundos)
    setTimeout(() => {
        console.log("⚙️ Generando rol..."); // Debug
        
        // LIMPIAR DATOS ANTERIORES ANTES DE GENERAR NUEVO ROL
        console.log("🧹 Limpiando datos de rol anterior...");
        localStorage.removeItem(`jornadasCompletas_${categoria}`);
        localStorage.removeItem(`jornadasDoradas_${categoria}`);
        localStorage.removeItem(`jornadasCompletasAntes_${categoria}`);
        localStorage.removeItem(storageKeyPartidosJugados);
        localStorage.removeItem(storageKeyPartidosAgregados);
        localStorage.removeItem(storageKeyPartidosMovidos);
        localStorage.removeItem(storageKeyJornadasJugadas);
        
        const numEquipos = equipos.length;
        const esImpar = numEquipos % 2 !== 0;
        
        let equiposRotacion = [...equipos];
        if (esImpar) equiposRotacion.push(null);

        const totalEquipos = equiposRotacion.length;
        const numJornadas = totalEquipos - 1;
        const jornadas = [];

        for (let jornada = 0; jornada < numJornadas; jornada++) {
            const partidosJornada = [];
            
            for (let i = 0; i < totalEquipos / 2; i++) {
                const equipo1 = equiposRotacion[i];
                const equipo2 = equiposRotacion[totalEquipos - 1 - i];
                
                if (equipo1 === null) {
                    partidosJornada.push({ descanso: equipo2 });
                } else if (equipo2 === null) {
                    partidosJornada.push({ descanso: equipo1 });
                } else {
                    partidosJornada.push({ local: equipo1, visitante: equipo2 });
                }
            }
            
            jornadas.push(partidosJornada);
            const ultimo = equiposRotacion.pop();
            equiposRotacion.splice(1, 0, ultimo);
        }

        localStorage.setItem(storageKeyRol, JSON.stringify(jornadas));
        localStorage.setItem(storageKeyEquiposEnRol, JSON.stringify(equipos));
        todasLasJornadas = jornadas;
        jornadaActual = 0;
        
        mostrarEstadisticas(numEquipos, jornadas);
        mostrarRolSegunVista();
        btnGenerar.disabled = true;
        
        // Mostrar botón agregar equipos
        const btnAgregar = getBtnAgregar();
        if (btnAgregar) {
            btnAgregar.style.display = 'inline-block';
        }
        
        // Ocultar botón de sugerencia (no hay equipos agregados aún)
        const btnSugerencia = document.querySelector('.btn-vista-sugerencia');
        if (btnSugerencia) {
            btnSugerencia.style.display = 'none';
        }

        console.log("✅ Rol generado exitosamente"); // Debug
        alert(`✅ ¡Rol generado exitosamente!\n\n📊 ${numJornadas} jornadas creadas\n⚽ ${numEquipos} equipos participantes`);
    }, 2800);
}

// Eliminar rol de juegos (LIMPIEZA COMPLETA)
function eliminarRol() {
    if (confirm("⚠️ ¿Estás seguro de que quieres eliminar el rol de juegos?\n\nEsta acción borrará ABSOLUTAMENTE TODO (rol, partidos jugados, jornadas doradas, etc.)\n\n🗑️ No se puede deshacer.")) {
        console.log("🗑️ Eliminando TODOS los datos del rol...");
        
        // ELIMINAR ABSOLUTAMENTE TODO
        localStorage.removeItem(storageKeyRol);
        localStorage.removeItem(storageKeyJornadasJugadas);
        localStorage.removeItem(storageKeyEquiposEnRol);
        localStorage.removeItem(storageKeyPartidosJugados);
        localStorage.removeItem(storageKeyPartidosAgregados);
        localStorage.removeItem(storageKeyPartidosMovidos);
        
        // ELIMINAR DATOS DE JORNADAS DORADAS Y COMPLETAS
        localStorage.removeItem(`jornadasCompletas_${categoria}`);
        localStorage.removeItem(`jornadasDoradas_${categoria}`);
        localStorage.removeItem(`jornadasCompletasAntes_${categoria}`);
        
        // LIMPIAR VARIABLES GLOBALES
        todasLasJornadas = [];
        jornadaActual = 0;
        rolSugerido = null;
        partidosJugadosSugerencia = null;
        
        document.getElementById('estadisticasContainer').style.display = 'none';
        document.getElementById('navegacionContainer').style.display = 'none';
        
        jornadasContainer.innerHTML = `
            <div class="mensaje-info">
                ✅ Rol eliminado exitosamente.
                <strong>¡Presiona "Crear Rol" para generar uno nuevo!</strong>
            </div>
        `;
        btnGenerar.disabled = false;
        
        // Ocultar botón agregar equipos
        const btnAgregar = getBtnAgregar();
        if (btnAgregar) {
            btnAgregar.style.display = 'none';
        }
        
        // Ocultar botón de sugerencia
        const btnSugerencia = document.querySelector('.btn-vista-sugerencia');
        if (btnSugerencia) {
            btnSugerencia.style.display = 'none';
        }
        
        console.log("✅ Limpieza completa realizada");
    }
}

// Descargar PDF optimizado con diseño personalizado
async function descargarPDF() {
    const { jsPDF } = window.jspdf;
    
    // Crear contenedor temporal para el PDF
    const contenedorPDF = document.createElement('div');
    contenedorPDF.id = 'contenedor-pdf-temp';
    contenedorPDF.style.cssText = `
        position: absolute;
        left: -9999px;
        top: 0;
        width: 1000px;
        background: white;
        padding: 30px;
        font-family: 'Rubik', sans-serif;
    `;
    
    // Calcular tamaño de jornadas según cantidad
    const numJornadas = todasLasJornadas.length;
    let columnas = 2;
    let tamañoJornada = 'grande';
    
    if (numJornadas <= 4) {
        columnas = 2;
        tamañoJornada = 'grande';
    } else if (numJornadas <= 9) {
        columnas = 3;
        tamañoJornada = 'mediano';
    } else if (numJornadas <= 16) {
        columnas = 4;
        tamañoJornada = 'pequeño';
    } else {
        columnas = 5;
        tamañoJornada = 'muy-pequeño';
    }
    
    // Título principal
    contenedorPDF.innerHTML = `
        <div style="text-align: center; margin-bottom: 25px; border-bottom: 5px solid #000; padding-bottom: 20px;">
            <h1 style="font-family: 'Bangers', cursive; font-size: 56px; margin: 0; color: #667eea; text-shadow: 3px 3px 0 #000; letter-spacing: 3px;">
                FUT 7 EL JAGUAR
            </h1>
            <h2 style="font-family: 'Bangers', cursive; font-size: 38px; margin: 10px 0 0 0; color: #ff6b6b; text-shadow: 2px 2px 0 #000;">
                ${categoria.toUpperCase()}
            </h2>
        </div>
        <div id="jornadas-pdf-grid" style="
            display: grid;
            grid-template-columns: repeat(${columnas}, 1fr);
            gap: ${tamañoJornada === 'grande' ? '20px' : tamañoJornada === 'mediano' ? '15px' : tamañoJornada === 'pequeño' ? '12px' : '8px'};
            width: 100%;
        "></div>
    `;
    
    const jornadasGrid = contenedorPDF.querySelector('#jornadas-pdf-grid');
    
    // Generar cada jornada
    todasLasJornadas.forEach((partidosJornada, index) => {
        const jornadaDiv = document.createElement('div');
        
        // Estilos según tamaño
        const estilos = {
            'grande': {
                fontSize: '15px',
                headerSize: '22px',
                padding: '10px',
                paddingPartido: '8px',
                vsSize: '11px',
                vsPadding: '4px 10px'
            },
            'mediano': {
                fontSize: '13px',
                headerSize: '18px',
                padding: '8px',
                paddingPartido: '7px',
                vsSize: '10px',
                vsPadding: '3px 8px'
            },
            'pequeño': {
                fontSize: '11px',
                headerSize: '15px',
                padding: '6px',
                paddingPartido: '5px',
                vsSize: '9px',
                vsPadding: '2px 6px'
            },
            'muy-pequeño': {
                fontSize: '9px',
                headerSize: '13px',
                padding: '5px',
                paddingPartido: '4px',
                vsSize: '8px',
                vsPadding: '2px 5px'
            }
        };
        
        const estilo = estilos[tamañoJornada];
        
        jornadaDiv.style.cssText = `
            background: #f8f9fa;
            border: 3px solid #000;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 3px 3px 0 #000;
            height: fit-content;
        `;
        
        let partidosHTML = '';
        partidosJornada.forEach((partido, pIdx) => {
            if (partido.descanso) {
                partidosHTML += `
                    <div style="
                        background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 100%);
                        padding: ${estilo.paddingPartido};
                        text-align: center;
                        border-bottom: 2px solid #000;
                        font-weight: 700;
                        font-size: ${estilo.fontSize};
                        color: #4a148c;
                    ">
                        💤 ${partido.descanso}
                    </div>
                `;
            } else {
                partidosHTML += `
                    <div style="
                        background: white;
                        padding: ${estilo.paddingPartido};
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        border-bottom: 2px solid #e0e0e0;
                        font-weight: 700;
                        font-size: ${estilo.fontSize};
                        gap: 5px;
                    ">
                        <span style="flex: 1; text-align: right;">${partido.local}</span>
                        <span style="
                            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
                            color: white;
                            padding: ${estilo.vsPadding};
                            border-radius: 5px;
                            font-size: ${estilo.vsSize};
                            font-family: 'Bangers', cursive;
                            border: 2px solid #000;
                            flex-shrink: 0;
                        ">VS</span>
                        <span style="flex: 1; text-align: left;">${partido.visitante}</span>
                    </div>
                `;
            }
        });
        
        jornadaDiv.innerHTML = `
            <div style="
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: ${estilo.padding};
                text-align: center;
                border-bottom: 3px solid #000;
            ">
                <h3 style="
                    font-family: 'Bangers', cursive;
                    font-size: ${estilo.headerSize};
                    margin: 0;
                    text-shadow: 2px 2px 0 #000;
                    letter-spacing: 1px;
                ">JORNADA ${index + 1}</h3>
            </div>
            ${partidosHTML}
        `;
        
        jornadasGrid.appendChild(jornadaDiv);
    });
    
    document.body.appendChild(contenedorPDF);
    
    // Esperar a que se renderice
    await new Promise(res => setTimeout(res, 500));
    
    // Generar PDF
    const canvas = await html2canvas(contenedorPDF, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false
    });
    
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "pt", "letter");
    
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pageWidth - 20; // Márgenes mínimos
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
    
    // Si la imagen es más alta que la página, escalarla
    if (imgHeight > pageHeight - 20) {
        const ratio = (pageHeight - 20) / imgHeight;
        const finalWidth = imgWidth * ratio;
        const finalHeight = imgHeight * ratio;
        const xPos = (pageWidth - finalWidth) / 2;
        pdf.addImage(imgData, "PNG", xPos, 10, finalWidth, finalHeight);
    } else {
        const xPos = (pageWidth - imgWidth) / 2;
        pdf.addImage(imgData, "PNG", xPos, 10, imgWidth, imgHeight);
    }
    
    pdf.save(`FUT7_EL_JAGUAR_${categoria}.pdf`);
    
    // Limpiar
    document.body.removeChild(contenedorPDF);
    
    alert('✅ PDF generado exitosamente');
}
// Inicializar al cargar la página
cargarDatos();