let todosLosCientificos = [];
let filtroActual = 'Todos';
let textoBusqueda = '';
let ordenActual = 'asc';
let likes = {};

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
        mostrarCientificos(cientificos);
        actualizarContador(cientificos.length);
        mostrarCientificoDelDia();
        mostrarEstadisticas();
        cargarLikes();
    })
    .catch(error => {
        document.getElementById('contenedor-cientificos').innerHTML = `
            <div style="background:#F5F5F5;padding:30px;border-radius:8px;text-align:center;border:1px solid #E0E0E0;">
                <h2 style="color:#2C3E50;">Error al cargar los datos</h2>
                <p>Verifica que el archivo <strong>datos.json</strong> esté presente.</p>
            </div>
        `;
    });

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
    } else {
        likes[nombre] = true;
    }
    guardarLikes();
    // Recargar la vista actual
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
// MOSTRAR CIENTÍFICOS
// =============================================
function mostrarCientificos(cientificos) {
    const contenedor = document.getElementById('contenedor-cientificos');
    contenedor.innerHTML = '';

    const conteo = contarPorCategoria(todosLosCientificos);
    actualizarContadoresCategorias(conteo);

    if (cientificos.length === 0) {
        contenedor.innerHTML = `
            <div style="background:#F5F5F5;padding:30px;border-radius:8px;text-align:center;border:1px solid #E0E0E0;">
                <p style="color:#666666;">No se encontraron científicos con ese nombre.</p>
            </div>
        `;
        actualizarContador(0);
        return;
    }

    cientificos.forEach(cientifico => {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'cientifico';

        // Obtener científicos relacionados (misma categoría, excluyéndose a sí mismo)
        const relacionados = todosLosCientificos
            .filter(c => c.categoria === cientifico.categoria && c.nombre !== cientifico.nombre)
            .slice(0, 3);

        const likeActivo = likes[cientifico.nombre] || false;

        tarjeta.innerHTML = `
            <div class="imagen-container">
                <img src="${cientifico.imagen || 'https://via.placeholder.com/80'}" alt="${cientifico.nombre}" loading="lazy" onerror="this.src='https://via.placeholder.com/80'">
            </div>
            <div class="contenido">
                <h2>${cientifico.nombre}</h2>
                <span class="categoria">${cientifico.categoria || 'Científico'}</span>
                <div class="aporte">${cientifico.aporte}</div>
                
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin: 8px 0;">
                    <button class="btn-like ${likeActivo ? 'activo' : ''}" data-nombre="${cientifico.nombre}">
                        ${likeActivo ? '❤️' : '🤍'} <span class="like-text">${likeActivo ? 'Me gusta' : 'Me gusta'}</span>
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
            // Si el clic fue en un botón o enlace, no togglear
            if (e.target.closest('.btn-like') || e.target.closest('.btn-compartir') || e.target.closest('.ver-mas') || e.target.closest('.relacionados a')) {
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
                const likeActivo = likes[nombre] || false;
                this.classList.toggle('activo');
                this.innerHTML = `${likeActivo ? '❤️' : '🤍'} <span class="like-text">${likeActivo ? 'Me gusta' : 'Me gusta'}</span>`;
            });
        }

        contenedor.appendChild(tarjeta);
    });

    actualizarContador(cientificos.length);
}

// =============================================
// COMPARTIR - COPIAR ENLACE
// =============================================
function copiarEnlace(nombre) {
    const url = window.location.href + '?buscar=' + encodeURIComponent(nombre);
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            alert('Enlace copiado al portapapeles: ' + url);
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

    mostrarCientificos(resultado);
}

function filtrarPorCategoria(categoria) {
    filtroActual = categoria;
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
    if (buscador) {
        buscador.value = nombre;
        buscador.dispatchEvent(new Event('input'));
    }
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
    } else {
        btn.textContent = '🌙';
        localStorage.setItem('modoCienciaCuriosa', 'claro');
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
        // Cargar preferencia guardada
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
            aplicarFiltros();
        });

        // Si hay parámetro buscar en la URL
        const params = new URLSearchParams(window.location.search);
        const buscarParam = params.get('buscar');
        if (buscarParam) {
            buscador.value = buscarParam;
            textoBusqueda = buscarParam;
            aplicarFiltros();
        }
    }

    // ====== CATEGORÍAS ======
    const itemsCategoria = document.querySelectorAll('.categoria-item');
    itemsCategoria.forEach(item => {
        item.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            filtrarPorCategoria(categoria);
            
            itemsCategoria.forEach(i => {
                i.style.borderColor = '#E0E0E0';
                i.style.borderWidth = '2px';
            });
            this.style.borderColor = '#2C3E50';
            this.style.borderWidth = '2px';
        });
    });

    // ====== "TODOS" EN EL MENÚ ======
    const menu = document.querySelector('.menu');
    const linkTodos = document.createElement('a');
    linkTodos.href = '#cientificos';
    linkTodos.textContent = 'Todos';
    linkTodos.className = 'activo';
    linkTodos.addEventListener('click', function(e) {
        e.preventDefault();
        filtroActual = 'Todos';
        textoBusqueda = '';
        const buscador = document.getElementById('buscador');
        if (buscador) buscador.value = '';
        aplicarFiltros();
        
        document.querySelectorAll('.categoria-item').forEach(i => {
            i.style.borderColor = '#E0E0E0';
            i.style.borderWidth = '2px';
        });
    });
    menu.appendChild(linkTodos);

    // ====== ORDENAR ======
    const btnOrdenar = document.getElementById('btnOrdenar');
    if (btnOrdenar) {
        btnOrdenar.addEventListener('click', function() {
            if (ordenActual === 'asc') {
                ordenActual = 'desc';
                this.textContent = 'Z-A';
            } else {
                ordenActual = 'asc';
                this.textContent = 'A-Z';
            }
            aplicarFiltros();
        });
    }
});