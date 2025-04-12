// Espera a que todo el contenido de la página esté completamente cargado antes de ejecutar el script.
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const campos = document.querySelectorAll(".campo input");
    const confirmarContrasena = document.getElementById("confirmar-contrasena");
    
    // Mostrar mensajes de error personalizados para cada campo
    campos.forEach(input => {
        input.addEventListener("input", function() {
            const errorSpan = this.nextElementSibling.nextElementSibling;
            
            if (!this.validity.valid) {
                // Mostrar mensaje de error específico
                errorSpan.textContent = this.title || "Por favor la contraseña debe tener almenos 8 caracteres";
                errorSpan.style.display = "block";
            } else {
                errorSpan.textContent = "";
                errorSpan.style.display = "none";
            }
        });
    });
    
    // Verificar que las contraseñas coincidan
    confirmarContrasena.addEventListener("input", function() {
        const contrasena = document.getElementById("contrasena");
        const errorSpan = this.nextElementSibling.nextElementSibling;
        
        if (this.value !== contrasena.value) {
            errorSpan.textContent = "Las contraseñas no coinciden";
            errorSpan.style.display = "block";
            this.setCustomValidity("Las contraseñas no coinciden");
        } else {
            errorSpan.textContent = "";
            errorSpan.style.display = "none";
            this.setCustomValidity("");
        }
    });

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        
        // Validación del formulario
        const isValid = form.checkValidity();
        
        if (!isValid) {
            // Mostrar mensajes de error para todos los campos inválidos
            campos.forEach(input => {
                if (!input.validity.valid) {
                    const errorSpan = input.nextElementSibling.nextElementSibling;
                    errorSpan.textContent = input.title || "Por favor complete este campo correctamente";
                    errorSpan.style.display = "block";
                }
            });
            return;
        }
        
        // Verificar que las contraseñas coincidan
        const contrasena = document.getElementById("contrasena").value;
        const confirmarContrasena = document.getElementById("confirmar-contrasena").value;
        
        if (contrasena !== confirmarContrasena) {
            const errorSpan = document.getElementById("confirmar-contrasena").nextElementSibling.nextElementSibling;
            errorSpan.textContent = "Las contraseñas no coinciden";
            errorSpan.style.display = "block";
            return;
        }

        // Si todo está validado, enviar el formulario
        const nombre = document.getElementById("nombre").value;
        const apellido = document.getElementById("apellido").value;
        const email = document.getElementById("email").value;
        
        try {
            const respuesta = await fetch("http://localhost:3000/api/usuarios", {
                method: "POST", 
                headers: {
                    "Content-Type": "application/json", 
                },
                body: JSON.stringify({ 
                    nombre, 
                    apellido,
                    email, 
                    contrasena, 
                    rol: "Cliente" // Por defecto, todos los usuarios registrados son clientes
                }), 
            });

            const data = await respuesta.json();

            alert(data.message);

            if (respuesta.ok) {
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Error en el registro:", error); 
            alert("Ocurrió un error en el servidor"); 
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input[required]');
    const password = document.getElementById('contrasena');
    const confirmPassword = document.getElementById('confirmar-contrasena');
    const email = document.getElementById('email');
    
    // Función para mostrar mensajes de error
    function showError(input, message) {
        const errorElement = input.nextElementSibling.nextElementSibling;
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
    
    // Función para ocultar mensajes de error
    function hideError(input) {
        const errorElement = input.nextElementSibling.nextElementSibling;
        errorElement.textContent = '';
        errorElement.style.display = 'none';
    }
    
    // Validación de correo electrónico
    email.addEventListener('input', function() {
        if (this.validity.patternMismatch) {
            showError(this, 'El dominio del correo no debe contener números');
        } else if (this.validity.typeMismatch) {
            showError(this, 'Por favor, introduce un correo electrónico válido');
        } else if (this.validity.valueMissing) {
            showError(this, 'Este campo es obligatorio');
        } else {
            hideError(this);
        }
    });
    
    // Validación de nombre y apellido
    document.getElementById('nombre').addEventListener('input', function() {
        if (this.validity.patternMismatch) {
            showError(this, 'El nombre no debe contener números');
        } else if (this.validity.valueMissing) {
            showError(this, 'Este campo es obligatorio');
        } else {
            hideError(this);
        }
    });
    
    document.getElementById('apellido').addEventListener('input', function() {
        if (this.validity.patternMismatch) {
            showError(this, 'El apellido no debe contener números');
        } else if (this.validity.valueMissing) {
            showError(this, 'Este campo es obligatorio');
        } else {
            hideError(this);
        }
    });
    
    // Validación de contraseña
    password.addEventListener('input', function() {
        if (this.validity.tooShort) {
            showError(this, 'La contraseña debe tener al menos 8 caracteres');
        } else if (this.validity.valueMissing) {
            showError(this, 'Este campo es obligatorio');
        } else {
            hideError(this);
        }
        
        // Verificar confirmación de contraseña cuando se cambia la contraseña
        if (confirmPassword.value) {
            if (password.value !== confirmPassword.value) {
                showError(confirmPassword, 'Las contraseñas no coinciden');
            } else {
                hideError(confirmPassword);
            }
        }
    });
    
    // Validación de confirmación de contraseña
    confirmPassword.addEventListener('input', function() {
        if (this.validity.valueMissing) {
            showError(this, 'Este campo es obligatorio');
        } else if (password.value !== this.value) {
            showError(this, 'Las contraseñas no coinciden');
        } else {
            hideError(this);
        }
    });
    
    // Validación del formulario completo antes de enviar
    form.addEventListener('submit', function(event) {
        let isValid = true;
        
        // Verificar todos los campos
        inputs.forEach(function(input) {
            if (!input.validity.valid) {
                isValid = false;
                input.focus();
                
                if (input.id === 'nombre' || input.id === 'apellido') {
                    if (input.validity.patternMismatch) {
                        showError(input, `El ${input.id} no debe contener números`);
                    } else {
                        showError(input, 'Este campo es obligatorio');
                    }
                } else if (input.id === 'email') {
                    if (input.validity.patternMismatch) {
                        showError(input, 'El dominio del correo no debe contener números');
                    } else {
                        showError(input, 'Por favor, introduce un correo electrónico válido');
                    }
                } else if (input.id === 'contrasena') {
                    showError(input, 'La contraseña debe tener al menos 8 caracteres');
                } else if (input.id === 'confirmar-contrasena') {
                    showError(input, 'Las contraseñas no coinciden');
                }
            }
        });
        
        // Verificar que las contraseñas coincidan
        if (password.value !== confirmPassword.value) {
            isValid = false;
            showError(confirmPassword, 'Las contraseñas no coinciden');
        }
        
        // Verificar el checkbox de términos y condiciones
        const checkbox = document.getElementById('aceptar');
        if (!checkbox.checked) {
            isValid = false;
            alert('Debes aceptar los términos y condiciones');
        }
        
        if (!isValid) {
            event.preventDefault();
        }
    });
});