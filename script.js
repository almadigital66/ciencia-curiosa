fetch('datos.json')
    .then(respuesta => {
        if (!respuesta.ok) throw new Error('Error al cargar datos.json');
        return respuesta.json();
    })
    .then(cientificos => {
        mostrarCientificos(cientificos);
    })
    .catch(error => {
        document.getElementById('contenedor-cientificos').innerHTML = `
            <div style="
                background: #F5F5F5;
                padding: 30px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #E0E0E0;
                color: #333333;
            ">
                <h2 style="color: #2C3E50;">Error al cargar los datos</h2>
                <p>Verifica que el archivo <strong>datos.json</strong> esté presente.</p>
            </div>
        `;
    });

function mostrarCientificos(cientificos) {
    const contenedor = document.getElementById('contenedor-cientificos');
    contenedor.innerHTML = '';

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