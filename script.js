// =============================================
// VARIABLES GLOBALES
// =============================================
let todosLosCientificos = [];
let filtroActual = 'Todos';
let textoBusqueda = '';

// =============================================
// CARGAR DATOS DESDE JSON
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
    })
    .catch(error => {
        document.getElementById('contenedor-cientificos').innerHTML = `
            <div style="background:#F5F5F5;padding:30px;border-radius:8px;text-align:center;border:1px solid #E0E0E0;">
                <h2 style="color:#2C3E50;">Error al cargar los datos</h2>
                <p>Verifica que el archivo <strong>datos.json</strong> esté presente.</p>
            </div>
        `;
    });

//
// =============================================
// FUNCIÓN: CONTAR CIENTÍFICOS POR CATEGORÍA
// =============================================
function contarPorCategoria(cientificos) {
    const conteo = {};
    cientificos.forEach(c => {
        const cat = c.categoria || 'Sin categoría';
        conteo[cat] = (conteo[cat] || 0) + 1;
    });
    return conteo;
}

// =============================================
// FUNCIÓN: ACTUALIZAR CONTADORES EN CATEGORÍAS
// =============================================
function actualizarContadoresCategorias(conteo) {
    const items = document.querySelectorAll('.categoria-item');
    items.forEach(item => {
        const categoria = item.getAttribute('data-categoria');
        const cantidad = conteo[categoria] || 0;
        const h3 = item.querySelector('h3');
        if (h3) {
            // Si ya tiene número, actualizarlo
            if (h3.textContent.includes('(')) {
                h3.textContent = h3.textContent.replace(/\(.*\)/, `(${cantidad})`);
            } else {
                h3.textContent = `${h3.textContent} (${cantidad})`;
            }
        }
    });
} =============================================
// FUNCIÓN: Mostrar científicos
// =============================================
function mostrarCientificos(cientificos) {
    const contenedor = document.getElementById('contenedor-cientificos');
    contenedor.innerHTML = '';

    // Actualizar contadores de categorías
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

        tarjeta.innerHTML = `
            <h2>${cientifico.nombre}</h2>
            <span class="categoria">${cientifico.categoria || 'Científico'}</span>
            <div class="aporte">${cientifico.aporte}</div>
            <div class="detalles">
                <h3>Curiosidades</h3>
                ${cientifico.curiosidades.map(c => `<div class="curiosidad">${c}</div>`).join('')}
                <div class="frase">"${cientifico.frase_famosa || 'La ciencia es conocimiento'}"</div>
                <div class="inspiracion">
                    <strong>Inspiración:</strong> ${cientifico.dato_inspirador || 'Sin dato disponible'}
                </div>
            </div>
        `;

        tarjeta.addEventListener('click', function() {
            const detalles = this.querySelector('.detalles');
            detalles.classList.toggle('visible');
        });

        contenedor.appendChild(tarjeta);
    });

    actualizarContador(cientificos.length);
}

// =============================================
// FUNCIÓN: Actualizar contador
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
// FUNCIÓN: FILTRAR POR CATEGORÍA + BÚSQUEDA
// =============================================
function aplicarFiltros() {
    let resultado = todosLosCientificos;

    // Filtrar por categoría
    if (filtroActual !== 'Todos') {
        resultado = resultado.filter(c => c.categoria === filtroActual);
    }

    // Filtrar por búsqueda (texto)
    if (textoBusqueda.trim() !== '') {
        const busqueda = textoBusqueda.toLowerCase().trim();
        resultado = resultado.filter(c => 
            c.nombre.toLowerCase().includes(busqueda)
        );
    }

    mostrarCientificos(resultado);
}

// =============================================
// FUNCIÓN: FILTRAR POR CATEGORÍA (desde el menú)
// =============================================
function filtrarPorCategoria(categoria) {
    filtroActual = categoria;
    aplicarFiltros();
}

// =============================================
// CONFIGURAR EVENTOS
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // ====== EVENTO: Buscador en tiempo real ======
    const buscador = document.getElementById('buscador');
    if (buscador) {
        buscador.addEventListener('input', function() {
            textoBusqueda = this.value;
            aplicarFiltros();
        });
    }

    // ====== EVENTO: Categorías ======
    const itemsCategoria = document.querySelectorAll('.categoria-item');
    itemsCategoria.forEach(item => {
        item.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            filtrarPorCategoria(categoria);
            
            // Resaltar categoría seleccionada
            itemsCategoria.forEach(i => {
                i.style.borderColor = '#E0E0E0';
                i.style.borderWidth = '2px';
            });
            this.style.borderColor = '#2C3E50';
            this.style.borderWidth = '2px';
        });
    });

    // ====== EVENTO: "Todos" en el menú ======
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
        
        // Quitar resaltado de categorías
        document.querySelectorAll('.categoria-item').forEach(i => {
            i.style.borderColor = '#E0E0E0';
            i.style.borderWidth = '2px';
        });
    });
    menu.appendChild(linkTodos);
});

// =============================================
// BOTÓN VOLVER ARRIBA
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    const btnVolver = document.getElementById('btnVolverArriba');

    // Mostrar/ocultar botón según el scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > 300) {
            btnVolver.classList.add('visible');
        } else {
            btnVolver.classList.remove('visible');
        }
    });

    // Al hacer clic, volver arriba suavemente
    btnVolver.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
});