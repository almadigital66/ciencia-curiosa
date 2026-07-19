// =============================================
// VARIABLE GLOBAL: Guardar todos los científicos
// =============================================
let todosLosCientificos = [];

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
// FUNCIÓN: Mostrar científicos en la página
// =============================================
function mostrarCientificos(cientificos) {
    const contenedor = document.getElementById('contenedor-cientificos');
    contenedor.innerHTML = '';

    if (cientificos.length === 0) {
        contenedor.innerHTML = `
            <div style="background:#F5F5F5;padding:30px;border-radius:8px;text-align:center;border:1px solid #E0E0E0;">
                <p style="color:#666666;">No hay científicos en esta categoría.</p>
            </div>
        `;
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
}

// =============================================
// FUNCIÓN: FILTRAR POR CATEGORÍA
// =============================================
function filtrarPorCategoria(categoria) {
    if (categoria === 'Todos') {
        mostrarCientificos(todosLosCientificos);
    } else {
        const filtrados = todosLosCientificos.filter(
            c => c.categoria === categoria
        );
        mostrarCientificos(filtrados);
    }
}

// =============================================
// CONFIGURAR EVENTOS DE CATEGORÍAS
// =============================================
document.addEventListener('DOMContentLoaded', function() {
    // Seleccionar todos los elementos de categoría
    const itemsCategoria = document.querySelectorAll('.categoria-item');
    
    itemsCategoria.forEach(item => {
        item.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            filtrarPorCategoria(categoria);
            
            // Resaltar la categoría seleccionada
            itemsCategoria.forEach(i => i.style.borderColor = '#E0E0E0');
            this.style.borderColor = '#2C3E50';
            this.style.borderWidth = '2px';
        });
    });

    // Agregar opción "Todos" al menú
    const menu = document.querySelector('.menu');
    const linkTodos = document.createElement('a');
    linkTodos.href = '#cientificos';
    linkTodos.textContent = 'Todos';
    linkTodos.className = 'activo';
    linkTodos.addEventListener('click', function(e) {
        e.preventDefault();
        filtrarPorCategoria('Todos');
        // Quitar resaltado de categorías
        document.querySelectorAll('.categoria-item').forEach(i => {
            i.style.borderColor = '#E0E0E0';
            i.style.borderWidth = '1px';
        });
    });
    menu.appendChild(linkTodos);
});