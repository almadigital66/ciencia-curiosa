// =============================================
// VARIABLES GLOBALES
// =============================================
let todosLosCientificos = [];
let filtroActual = 'Todos';
let textoBusqueda = '';
let ordenActual = 'asc';
let likes = {};
let paginaActual = 1;
const POR_PAGINA = 6;

// =============================================
// CARGAR DATOS
// =============================================
fetch('datos.json')
    .then(respuesta => {
        if (!respuesta.ok) throw new Error('Error al cargar datos.json');
        return respuesta.json();
    })
    .then(cientificos => {
        todosLosCientificos = cientificos;
        cargarLikes();
        aplicarFiltros();
        mostrarCientificoDelDia();
        mostrarEstadisticas();
    })
    .catch(error => {
        document.getElementById('contenedor-cientificos').innerHTML = `
            <div style="background:#F5F5F5;padding:30px;border-radius:8px;text-align:center;border:1px solid #E0E0E0;">
                <h2 style="color:#2C3E50;">Error al cargar los datos</h2>
                <p>Verifica que el archivo <strong>datos.json</strong> esté presente.</p>
            </div>
        `;
        mostrarNotificacion('Error al cargar los datos', 'error');
    });

// =============================================
// NOTIFICACIONES
// =============================================
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notif = document.getElementById('notificacion');
    if (!notif) return;
    
    notif.textContent = mensaje;
    notif.className = 'notificacion visible';
    
    if (tipo === 'error') {
        notif.style.background = '#DC3545';
    } else if (tipo === 'success') {
        notif.style.background = '#28A745';
    } else {
        notif.style.background = '#2C3E50';
    }
    
    clearTimeout(notif.timeout);
    notif.timeout = setTimeout(() => {
        notif.classList.remove('visible');
    }, 3000);
}

// =============================================
// LIKES (localStorage)
// =============================================
function cargarLikes() {
    const guardado = localStorage.getItem('likesCienciaCuriosa');
    if (guardado) {
        likes = JSON.parse(guardado);
    }
}

function guardarLikes() {
    localStorage.setItem('likesCienciaCuriosa', JSON.stringify(likes));
}

function toggleLike(nombre) {
    if (likes[nombre]) {
        delete likes[nombre];
        mostrarNotificacion(`❤️ Quitaste tu like a ${nombre}`);
    } else {
        likes[nombre] = true;
        mostrarNotificacion(`❤️ Te gusta ${nombre}`);
    }
    guardarLikes();
    aplicarFiltros();
}

// =============================================
// CONTAR POR CATEGORÍA
// =============================================
function contarPorCategoria(cientificos) {
    const conteo = {};
    cientificos.forEach(c => {
        const cat = c.categoria || 'Sin categoría';
        conteo[cat] = (conteo[cat] || 0) + 1;
    });
    return conteo;
}

function actualizarContadoresCategorias(conteo) {
    const items = document.querySelectorAll('.categoria-item');
    items.forEach(item => {
        const categoria = item.getAttribute('data-categoria');
        const cantidad = conteo[categoria] || 0;
        const h3 = item.querySelector('h3');
        if (h3) {
            if (h3.textContent.includes('(')) {
                h3.textContent = h3.textContent.replace(/\(.*\)/, `(${cantidad})`);
            } else {
                h3.textContent = `${h3.textContent} (${cantidad})`;
            }
        }
    });
}

// =============================================
// MOSTRAR CIENTÍFICOS CON PAGINACIÓN
// =============================================
function mostrarCientificos(cientificos) {
    const contenedor = document.getElementById('contenedor-cientificos');
    const btnCargarMas = document.getElementById('btnCargarMas');
    const infoPaginacion = document.getElementById('info-paginacion');
    contenedor.innerHTML = '';

    const conteo = contarPorCategoria(todosLosCientificos);
    actualizarContadoresCategorias(conteo);

    if (cientificos.length === 0) {
        contenedor.innerHTML = `
            <div style="background:#F5F5F5;padding:30px;border-radius:8px;text-align:center;border:1px solid #E0E0E0;">
                <p style="color:#666666;">No se encontraron científicos con ese nombre.</p>
            </div>
        `;
        btnCargarMas.style.display = 'none';
        infoPaginacion.textContent = '';
        actualizarContador(0);
        return;
    }

    const total = cientificos.length;
    const totalPaginas = Math.ceil(total / POR_PAGINA);
    const inicio = (paginaActual - 1) * POR_PAGINA;
    const fin = Math.min(inicio + POR_PAGINA, total);
    const paginados = cientificos.slice(inicio, fin);

    paginados.forEach(cientifico => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'cientifico';

        const relacionados = todosLosCientificos
            .filter(c => c.categoria === cientifico.categoria && c.nombre !== cientifico.nombre)
            .slice(0, 3);

        const likeActivo = likes[cientifico.nombre] || false;

        tarjeta.innerHTML = `
            <div class="contenido">
                <h2>${cientifico.nombre}</h2>
                <span class="categoria">${cientifico.categoria || 'Científico'}</span>
                <div class="aporte">${cientifico.aporte}</div>
                
                <div class="acciones">
                    <button class="btn-like ${likeActivo ? 'activo' : ''}" data-nombre="${cientifico.nombre}">
                        ${likeActivo ? '❤️' : '🤍'} <span class="like-text">${likeActivo ? 'Me gusta' : 'Me gusta'}</span>
                    </button>
                    <button class="btn-pdf" data-nombre="${cientifico.nombre}">
                        📄 PDF
                    </button>
                </div>

                <div class="detalles">
                    <h3>Curiosidades</h3>
                    ${cientifico.curiosidades.map(c => `<div class="curiosidad">${c}</div>`).join('')}
                    <div class="frase">"${cientifico.frase_famosa || 'La ciencia es conocimiento'}"</div>
                    <div class="inspiracion">
                        <strong>Inspiración:</strong> ${cientifico.dato_inspirador || 'Sin dato disponible'}
                    </div>
                    
                    ${relacionados.length > 0 ? `
                        <div class="relacionados">
                            <strong>Otros científicos de ${cientifico.categoria}:</strong><br>
                            ${relacionados.map(r => `<a onclick="buscarCientifico('${r.nombre}')">${r.nombre}</a>`).join('')}
                        </div>
                    ` : ''}
                    
                    <div class="compartir-botones">
                        <a href="https://wa.me/?text=🔬%20${encodeURIComponent(cientifico.nombre)}%20-%20${encodeURIComponent(cientifico.aporte)}%0A%0A📖%20${encodeURIComponent(cientifico.curiosidades.join(' '))}%0A%0A📌%20${encodeURIComponent(cientifico.frase_famosa || '')}%0A%0A🌐%20${encodeURIComponent(window.location.href)}" target="_blank" class="btn-compartir btn-whatsapp">💬 WhatsApp</a>
                        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent('🔬 ' + cientifico.nombre + ' - ' + cientifico.aporte + '\n\n' + cientifico.frase_famosa + '\n\n')}&url=${encodeURIComponent(window.location.href)}" target="_blank" class="btn-compartir btn-twitter">🐦 X</a>
                        <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent('🔬 ' + cientifico.nombre + ' - ' + cientifico.aporte)}" target="_blank" class="btn-compartir btn-facebook">📘 Facebook</a>
                        <button class="btn-compartir btn-copiar" onclick="copiarEnlace('${cientifico.nombre}')">🔗 Copiar</button>
                    </div>
                </div>
            </div>
        `;

        // Evento para mostrar/ocultar detalles
        tarjeta.addEventListener('click', function(e) {
            if (e.target.closest('.btn-like') || e.target.closest('.btn-compartir') || e.target.closest('.ver-mas') || e.target.closest('.relacionados a') || e.target.closest('.btn-pdf')) {
                return;
            }
            const detalles = this.querySelector('.detalles');
            detalles.classList.toggle('visible');
        });

        // Evento para el botón like
        const btnLike = tarjeta.querySelector('.btn-like');
        if (btnLike) {
            btnLike.addEventListener('click', function(e) {
                e.stopPropagation();
                const nombre = this.getAttribute('data-nombre');
                toggleLike(nombre);
            });
        }

        // Evento para el botón PDF
        const btnPDF = tarjeta.querySelector('.btn-pdf');
        if (btnPDF) {
            btnPDF.addEventListener('click', function(e) {
                e.stopPropagation();
                const nombre = this.getAttribute('data-nombre');
                exportarPDF(nombre);
            });
        }

        contenedor.appendChild(tarjeta);
    });

    // Control de paginación
    if (paginaActual < totalPaginas) {
        btnCargarMas.style.display = 'inline-block';
        btnCargarMas.textContent = `Cargar más (${fin}/${total})`;
        infoPaginacion.textContent = `Mostrando ${fin} de ${total} científicos`;
    } else {
        btnCargarMas.style.display = 'none';
        infoPaginacion.textContent = `Mostrando todos los ${total} científicos`;
    }

    actualizarContador(cientificos.length);
}

// =============================================
// EXPORTAR A PDF
// =============================================
function exportarPDF(nombre) {
    const cientifico = todosLosCientificos.find(c => c.nombre === nombre);
    if (!cientifico) {
        mostrarNotificacion('Científico no encontrado', 'error');
        return;
    }

    mostrarNotificacion(`📄 Generando PDF de ${nombre}...`, 'info');

    // Usamos window.print() para generar PDF desde el navegador
    const contenidoOriginal = document.body.innerHTML;
    
    const contenidoPDF = `
        <div style="font-family: 'Georgia', serif; max-width: 800px; margin: 40px auto; padding: 30px; line-height: 1.8;">
            <h1 style="color: #2C3E50; border-bottom: 3px solid #2C3E50; padding-bottom: 10px;">${cientifico.nombre}</h1>
            <p style="font-size: 1.1em; color: #555;"><strong>Categoría:</strong> ${cientifico.categoria}</p>
            <p style="font-size: 1.1em;"><strong>Aporte:</strong> ${cientifico.aporte}</p>
            
            <h2 style="color: #2C3E50; margin-top: 25px;">Curiosidades</h2>
            <ul style="padding-left: 20px;">
                ${cientifico.curiosidades.map(c => `<li style="margin: 8px 0;">${c}</li>`).join('')}
            </ul>
            
            <div style="background: #F5F5F5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2C3E50;">
                <p style="font-style: italic; font-size: 1.2em;">"${cientifico.frase_famosa || 'La ciencia es conocimiento'}"</p>
            </div>
            
            <p><strong>Inspiración:</strong> ${cientifico.dato_inspirador || 'Sin dato disponible'}</p>
            
            <hr style="border: 1px solid #E0E0E0; margin: 30px 0;">
            <p style="text-align: center; color: #888; font-size: 0.9em;">
                Generado desde Ciencia Curiosa - ${new Date().toLocaleDateString()}
            </p>
        </div>
    `;

    const ventana = window.open('', '_blank', 'width=800,height=600');
    ventana.document.write(`
        <html>
            <head><title>${cientifico.nombre} - Biografía</title></head>
            <body>${contenidoPDF}</body>
        </html>
    `);
    ventana.document.close();
    
    setTimeout(() => {
        ventana.print();
        mostrarNotificacion(`✅ PDF de ${nombre} generado`, 'success');
    }, 500);
}

// =============================================
// COPIAR ENLACE
// =============================================
function copiarEnlace(nombre) {
    const url = window.location.href + '?buscar=' + encodeURIComponent(nombre);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            mostrarNotificacion(`✅ Enlace copiado: ${nombre}`, 'success');
        }).catch(() => {
            prompt('Copia este enlace:', url);
        });
    } else {
        prompt('Copia este enlace:', url);
    }
}

// =============================================
// ACTUALIZAR CONTADOR
// =============================================
function actualizarContador(cantidad) {
    const contador = document.getElementById('contador-resultados');
    if (contador) {
        if (cantidad === 0) {
            contador.textContent = 'No se encontraron resultados';
            contador.style.color = '#FF6B6B';
        } else if (cantidad === todosLosCientificos.length) {
            contador.textContent = `Mostrando los ${cantidad} científicos disponibles`;
            contador.style.color = '#888888';
        } else {
            contador.textContent = `Mostrando ${cantidad} de ${todosLosCientificos.length} científicos`;
            contador.style.color = '#2C3E50';
        }
    }
}

// =============================================
// APLICAR FILTROS
// =============================================
function aplicarFiltros() {
    let resultado = todosLosCientificos;

    if (filtroActual !== 'Todos') {
        resultado = resultado.filter(c => c.categoria === filtroActual);
    }

    if (textoBusqueda.trim() !== '') {
        const busqueda = textoBusqueda.toLowerCase().trim();
        resultado = resultado.filter(c => c.nombre.toLowerCase().includes(busqueda));
    }

    resultado = [...resultado].sort((a, b) => {
        const nombreA = a.nombre.toLowerCase();
        const nombreB = b.nombre.toLowerCase();
        if (ordenActual === 'asc') {
            return nombreA.localeCompare(nombreB);
        } else {
            return nombreB.localeCompare(nombreA);
        }
    });

    paginaActual = 1;
    mostrarCientificos(resultado);
}

function filtrarPorCategoria(categoria) {
    filtroActual = categoria;
    const select = document.getElementById('filtroCategoria');
    if (select) select.value = categoria;
    aplicarFiltros();
}

// =============================================
// CIENTÍFICO DEL DÍA
// =============================================
function mostrarCientificoDelDia() {
    const contenedor = document.getElementById('contenedor-cientifico-dia');
    if (!contenedor) return;

    if (todosLosCientificos.length === 0) {
        contenedor.innerHTML = '<p style="color:#888;">Cargando científico del día...</p>';
        return;
    }

    const hoy = new Date();
    const diaDelAño = Math.floor((hoy - new Date(hoy.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const indice = diaDelAño % todosLosCientificos.length;
    const cientifico = todosLosCientificos[indice];

    contenedor.innerHTML = `
        <h3>${cientifico.nombre}</h3>
        <span class="categoria-destacada">${cientifico.categoria || 'Científico'}</span>
        <div class="frase-destacada">"${cientifico.frase_famosa || 'La ciencia es conocimiento'}"</div>
        <div class="aporte-destacado">📌 ${cientifico.aporte}</div>
        <a class="ver-mas" onclick="buscarCientifico('${cientifico.nombre}')">Ver más sobre ${cientifico.nombre}</a>
    `;
}

function buscarCientifico(nombre) {
    document.getElementById('cientificos').scrollIntoView({ behavior: 'smooth' });
    
    filtroActual = 'Todos';
    textoBusqueda = nombre;
    const buscador = document.getElementById('buscador');
    const select = document.getElementById('filtroCategoria');
    if (buscador) {
        buscador.value = nombre;
        buscador.dispatchEvent(new Event('input'));
    }
    if (select) select.value = 'Todos';
    aplicarFiltros();
}

// =============================================
// ESTADÍSTICAS
// =============================================
function mostrarEstadisticas() {
    const contenedor = document.getElementById('contenedor-estadisticas');
    if (!contenedor) return;

    const conteo = contarPorCategoria(todosLosCientificos);
    const total = todosLosCientificos.length;

    let html = `
        <div class="estadistica-item">
            <div class="numero">${total}</div>
            <div class="etiqueta">Total</div>
        </div>
    `;

    Object.keys(conteo).sort().forEach(categoria => {
        html += `
            <div class="estadistica-item">
                <div class="numero">${conteo[categoria]}</div>
                <div class="etiqueta">${categoria}</div>
            </div>
        `;
    });

    contenedor.innerHTML = html;
}

// =============================================
// MODO OSCURO
// =============================================
function toggleModoOscuro() {
    const body = document.body;
    const btn = document.getElementById('btnModoOscuro');
    body.classList.toggle('modo-oscuro');
    if (body.classList.contains('modo-oscuro')) {
        btn.textContent = '☀️';
        localStorage.setItem('modoCienciaCuriosa', 'oscuro');
        mostrarNotificacion('🌙 Modo oscuro activado');
    } else {
        btn.textContent = '🌙';
        localStorage.setItem('modoCienciaCuriosa', 'claro');
        mostrarNotificacion('☀️ Modo claro activado');
    }
}

// =============================================
// EVENTOS
// =============================================
document.addEventListener('DOMContentLoaded', function() {

    // ====== MODO OSCURO ======
    const btnModo = document.getElementById('btnModoOscuro');
    if (btnModo) {
        btnModo.addEventListener('click', toggleModoOscuro);
        const modoGuardado = localStorage.getItem('modoCienciaCuriosa');
        if (modoGuardado === 'oscuro') {
            document.body.classList.add('modo-oscuro');
            btnModo.textContent = '☀️';
        }
    }

    // ====== BOTÓN VOLVER ARRIBA ======
    const btnVolver = document.getElementById('btnVolverArriba');
    if (btnVolver) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 300) {
                btnVolver.classList.add('visible');
            } else {
                btnVolver.classList.remove('visible');
            }
        });

        btnVolver.addEventListener('click', function() {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ====== BUSCADOR ======
    const buscador = document.getElementById('buscador');
    if (buscador) {
        buscador.addEventListener('input', function() {
            textoBusqueda = this.value;
            paginaActual = 1;
            aplicarFiltros();
        });

        const params = new URLSearchParams(window.location.search);
        const buscarParam = params.get('buscar');
        if (buscarParam) {
            buscador.value = buscarParam;
            textoBusqueda = buscarParam;
            aplicarFiltros();
        }
    }

    // ====== FILTRO POR CATEGORÍA (SELECT) ======
    const selectCategoria = document.getElementById('filtroCategoria');
    if (selectCategoria) {
        selectCategoria.addEventListener('change', function() {
            filtroActual = this.value;
            paginaActual = 1;
            aplicarFiltros();
            
            // Resaltar categoría correspondiente
            document.querySelectorAll('.categoria-item').forEach(i => {
                i.style.borderColor = '#E0E0E0';
                i.style.borderWidth = '2px';
            });
            const item = document.querySelector(`.categoria-item[data-categoria="${this.value}"]`);
            if (item && this.value !== 'Todos') {
                item.style.borderColor = '#2C3E50';
                item.style.borderWidth = '2px';
            }
        });
    }

    // ======
