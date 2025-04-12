document.addEventListener('DOMContentLoaded', function() {
    // Referencias a elementos DOM
    const body = document.body;
    const hamburguesa = document.querySelector(".hamburguesa");
    const enlacesNav = document.querySelector(".enlaces-nav");
    const iconosCabeceraInferior = document.querySelector(".iconos-cabecera-inferior");
    const desplegables = document.querySelectorAll(".desplegable");
    const selectorTema = document.querySelector(".selector-tema");
    const contadorCarrito = document.getElementById('cartCounter'); // Corregido: ID del contador del carrito
    
    // Variable para llevar el conteo de productos
    let conteoArticulosCarrito = 0;
    
    // Inicializar el contador desde localStorage si existe
    if (localStorage.getItem('articulosCarrito')) {
        conteoArticulosCarrito = parseInt(localStorage.getItem('articulosCarrito'));
        if (conteoArticulosCarrito > 0) {
            contadorCarrito.textContent = conteoArticulosCarrito;
            // Hacer visible el contador si hay items
            contadorCarrito.style.opacity = '1';
            contadorCarrito.style.visibility = 'visible';
        }
    }
    

    
    // Funcionalidad para el menú hamburguesa
    hamburguesa.addEventListener('click', function() {
        enlacesNav.classList.toggle("activo");
        this.classList.toggle("activo");
    });
    
    // Manejar los submenús en modo móvil
    desplegables.forEach((desplegable) => {
        const toggleDesplegable = desplegable.querySelector('.toggle-desplegable');
        
        if (toggleDesplegable) {
            toggleDesplegable.addEventListener("click", function(e) {
                if (window.innerWidth <= 768) {
                    // Prevenir que el clic se propague para evitar cerrar el menú principal
                    e.preventDefault();
                    e.stopPropagation();
                    desplegable.classList.toggle("activo");
                }
            });
        }
    });
    
    // Cerrar el menú al hacer clic fuera de él
    document.addEventListener('click', function(event) {
        const menuAbierto = enlacesNav.classList.contains('activo');
        const clicDentroNav = enlacesNav.contains(event.target);
        const clicEnHamburguesa = hamburguesa.contains(event.target);
        
        // Aquí está la corrección - Solo cerrar si el menú está abierto y el clic no fue dentro del menú ni en la hamburguesa
        if (menuAbierto && !clicDentroNav && !clicEnHamburguesa) {
            enlacesNav.classList.remove('activo');
            hamburguesa.classList.remove('activo');
            
            // Cerrar también submenús abiertos
            desplegables.forEach(desplegable => {
                desplegable.classList.remove('activo');
            });
        }
    });
    
    // Manejar cambios de tamaño de ventana
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            // Resetear estados si cambia a vista de escritorio
            enlacesNav.classList.remove('activo');
            hamburguesa.classList.remove('activo');
            
            desplegables.forEach(desplegable => {
                desplegable.classList.remove('activo');
            });
        }
    });
    

    const mediaQuery = window.matchMedia('(max-width: 768px)');
    function handleMediaQueryChange(e) {
        if (e.matches) {
            // Mobile view
            iconosCabeceraInferior.classList.add('oculto');
        } else {
            // Desktop view
            iconosCabeceraInferior.classList.remove('oculto');
        }
    }
    
    // Initial check
    handleMediaQueryChange(mediaQuery);
    // Add listener for screen size changes
    mediaQuery.addListener(handleMediaQueryChange);

    
// Verificar el estado de la sesión cuando se carga la página
document.addEventListener("DOMContentLoaded", function() {
    if (typeof actualizarBotonSesion === 'function') {
        actualizarBotonSesion();
    }
});




    // Agregar efecto visual de pulsación para el contador
    const estilo = document.createElement('style');
    estilo.textContent = `
        @keyframes pulso {
            0% { transform: scale(1); }
            50% { transform: scale(1.3); }
            100% { transform: scale(1); }
        }
        .pulso {
            animation: pulso 0.3s ease-in-out;
        }
    `;
    document.head.appendChild(estilo);
});





