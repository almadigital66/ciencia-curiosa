// ======================================================
//  CIENCIA CURIOSA - Lógica de la página
//  Carga los científicos desde datos.json y los muestra
// ======================================================

// 1. Cargar los datos del archivo JSON
fetch('datos.json')
    .then(respuesta => {
        // Verificar si la respuesta es correcta
        if (!respuesta.ok) {
            throw new Error('Error al cargar datos.json');
        }
        return respuesta.json();
    })
    .then(cientificos => {
        // Si todo va bien, mostrar los científicos
        mostrarCientificos(cientificos);
    })
    .catch(error => {
        // Si hay error, mostrar mensaje en la página
        console.error('Error:', error);
        document.getElementById('contenedor-cientificos').innerHTML = `
            <div style="
                background: #FF6B6B22;
                padding: 30px;
                border-radius: 16px;
                text-align: center;
                border: 2px solid #FF6B6B;
            ">
                <h2 style="color: #FF6B6B;">⚠️ Error al cargar los datos</h2>
                <p>Asegúrate de que el archivo <strong>datos.json</strong> exista y esté bien escrito.</p>
                <p style="font-size:0.8em; opacity:0.6; margin-top:10px;">${error.message}</p>
            </div>
        `;
    });

// ======================================================
//  FUNCIÓN: Mostrar científicos en la página
// ======================================================
function mostrarCientificos(cientificos) {
    const contenedor = document.getElementById('contenedor-cientificos');
    contenedor.innerHTML = '';  // Limpiar contenedor

    // Recorrer cada científico y crear su tarjeta
    cientificos.forEach(cientifico => {
        // Crear la tarjeta
        const tarjeta = document.createElement('div');
        tarjeta.className = 'cientifico';

        // Construir el contenido HTML de la tarjeta
        tarjeta.innerHTML = `
            <h2>${cientifico.nombre}</h2>
            <span class="categoria">${cientifico.categoria || 'Científico'}</span>
            <div class="aporte">📌 ${cientifico.aporte}</div>
            
            <!-- Detalles (ocultos inicialmente) -->
            <div class="detalles">
                <h3>🔍 Curiosidades</h3>
                ${cientifico.curiosidades.map(curiosidad => 
                    `<div class="curiosidad">✨ ${curiosidad}</div>`
                ).join('')}
                
                <div class="frase">"${cientifico.frase_famosa || 'La ciencia es asombrosa'}"</div>
                
                <div class="inspiracion">
                    <strong>💡 Inspiración:</strong> 
                    ${cientifico.dato_inspirador || 'Sin dato disponible'}
                </div>
            </div>
        `;

        // ==============================================
        //  EVENTO: Tocar la tarjeta para mostrar/ocultar
        // ==============================================
        tarjeta.addEventListener('click', function() {
            // Buscar los detalles dentro de esta tarjeta
            const detalles = this.querySelector('.detalles');
            // Alternar la clase 'visible'
            detalles.classList.toggle('visible');
        });

        // Agregar la tarjeta al contenedor
        contenedor.appendChild(tarjeta);
    });
}