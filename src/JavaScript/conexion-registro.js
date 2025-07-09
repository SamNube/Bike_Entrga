// Espera a que todo el contenido de la página esté completamente cargado antes de ejecutar el script.
document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const nombre = document.getElementById("nombre");
    const apellido = document.getElementById("apellido");
    const email = document.getElementById("email");
    const contrasena = document.getElementById("contrasena");
    const confirmar = document.getElementById("confirmar-contrasena");
    const checkbox = document.getElementById("aceptar");

    // Utilidad para mostrar/ocultar mensajes
    function showError(input, message) {
        const error = input.parentElement.querySelector('.error-message');
        error.textContent = message;
        error.style.display = "block";
    }
    function hideError(input) {
        const error = input.parentElement.querySelector('.error-message');
        error.textContent = "";
        error.style.display = "none";
    }

    // Validaciones en tiempo real
    nombre.addEventListener("input", function () {
        if (!this.value) {
            showError(this, "El nombre es obligatorio");
        } else if (/\d/.test(this.value)) {
            showError(this, "El nombre no debe contener números");
        } else if (/[^a-zA-Z0-9 ]/.test(this.value)) {
            showError(this, "El nombre no debe contener caracteres especiales");
        } else if (this.value.replace(/[^a-zA-Z]/g, '').length < 3) {
            showError(this, "El nombre debe tener al menos 3 letras");
        } else {
            hideError(this);
        }
    });

    apellido.addEventListener("input", function () {
        if (!this.value) {
            showError(this, "El apellido es obligatorio");
        } else if (/\d/.test(this.value)) {
            showError(this, "El apellido no debe contener números");
        } else if (/[^a-zA-Z0-9 ]/.test(this.value)) {
            showError(this, "El apellido no debe contener caracteres especiales");
        } else if (this.value.replace(/[^a-zA-Z]/g, '').length < 3) {
            showError(this, "El apellido debe tener al menos 3 letras");
        } else {
            hideError(this);
        }
    });

    email.addEventListener("input", function () {
        if (!this.value) {
            showError(this, "El correo es obligatorio");
        } else if (/[^a-zA-Z0-9.\-_+@]/.test(this.value)) {
            showError(this, "El correo no debe contener caracteres especiales ni emojis");
        } else {
            const partes = this.value.split("@");
            if (partes.length !== 2) {
                showError(this, "El correo debe tener un solo @");
            } else {
                const dominio = partes[1];
                const dominioNombre = dominio.split(".")[0];
                if (/\d/.test(dominioNombre)) {
                    showError(this, "El dominio del correo no debe contener números");
                } else if (!/^[a-zA-Z]+\.[a-zA-Z]{2,}$/.test(dominio)) {
                    showError(this, "El dominio debe ser válido (ej: gmail.com)");
                } else {
                    hideError(this);
                }
            }
        }
    });

    contrasena.addEventListener("input", function () {
        if (!this.value) showError(this, "La contraseña es obligatoria");
        else if (this.value.length < 8) showError(this, "La contraseña debe tener al menos 8 caracteres");
        else if (/[.:*'|°¬]/.test(this.value)) showError(this, "La contraseña no debe contener los caracteres: . : * ' | ° ¬");
        else hideError(this);

        // Validar confirmación en tiempo real
        if (confirmar.value && this.value !== confirmar.value) {
            showError(confirmar, "Las contraseñas no coinciden");
        } else if (confirmar.value) {
            hideError(confirmar);
        }
    });

    confirmar.addEventListener("input", function () {
        if (!this.value) showError(this, "Confirma tu contraseña");
        else if (contrasena.value !== this.value) showError(this, "Las contraseñas no coinciden");
        else hideError(this);
    });

    // Validación al enviar
    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        let valido = true;

        // Nombre
        if (!nombre.value) {
            showError(nombre, "El nombre es obligatorio"); valido = false;
        } else if (/\d/.test(nombre.value)) {
            showError(nombre, "El nombre no debe contener números"); valido = false;
        } else if (/[^a-zA-Z0-9 ]/.test(nombre.value)) {
            showError(nombre, "El nombre no debe contener caracteres especiales"); valido = false;
        } else if (nombre.value.replace(/[^a-zA-Z]/g, '').length < 3) {
            showError(nombre, "El nombre debe tener al menos 3 letras"); valido = false;
        } else {
            hideError(nombre);
        }

        // Apellido
        if (!apellido.value) {
            showError(apellido, "El apellido es obligatorio"); valido = false;
        } else if (/\d/.test(apellido.value)) {
            showError(apellido, "El apellido no debe contener números"); valido = false;
        } else if (/[^a-zA-Z0-9 ]/.test(apellido.value)) {
            showError(apellido, "El apellido no debe contener caracteres especiales"); valido = false;
        } else if (apellido.value.replace(/[^a-zA-Z]/g, '').length < 3) {
            showError(apellido, "El apellido debe tener al menos 3 letras"); valido = false;
        } else {
            hideError(apellido);
        }

        // Email
        if (!email.value) {
            showError(email, "El correo es obligatorio"); valido = false;
        } else if (/[^a-zA-Z0-9.\-_+@]/.test(email.value)) {
            showError(email, "El correo no debe contener caracteres especiales ni emojis"); valido = false;
        } else {
            const partes = email.value.split("@");
            if (partes.length !== 2) {
                showError(email, "El correo debe tener un solo @"); valido = false;
            } else {
                const dominio = partes[1];
                const dominioNombre = dominio.split(".")[0];
                if (/\d/.test(dominioNombre)) {
                    showError(email, "El dominio del correo no debe contener números"); valido = false;
                } else if (!/^[a-zA-Z]+\.[a-zA-Z]{2,}$/.test(dominio)) {
                    showError(email, "El dominio debe ser válido (ej: gmail.com)"); valido = false;
                } else {
                    hideError(email);
                }
            }
        }

        // Contraseña
        if (!contrasena.value) {
            showError(contrasena, "La contraseña es obligatoria"); valido = false;
        } else if (contrasena.value.length < 8) {
            showError(contrasena, "La contraseña debe tener al menos 8 caracteres"); valido = false;
        } else if (/[.:*'|°¬]/.test(contrasena.value)) {
            showError(contrasena, "La contraseña no debe contener los caracteres: . : * ' | ° ¬"); valido = false;
        } else {
            hideError(contrasena);
        }

        // Confirmar contraseña
        if (!confirmar.value) {
            showError(confirmar, "Confirma tu contraseña"); valido = false;
        } else if (contrasena.value !== confirmar.value) {
            showError(confirmar, "Las contraseñas no coinciden"); valido = false;
        } else {
            hideError(confirmar);
        }

        // Términos
        if (!checkbox.checked) {
            alert("Debes aceptar los términos y condiciones");
            valido = false;
        }

        // Si hay algún error, no enviar
        if (!valido) return;

        // Enviar datos
        try {
            const respuesta = await fetch("http://localhost:3000/api/usuarios", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nombre: nombre.value,
                    apellido: apellido.value,
                    email: email.value,
                    contrasena: contrasena.value,
                    rol: "Cliente"
                }),
            });
            const data = await respuesta.json();
            alert(data.message);
            if (respuesta.ok) window.location.href = "login.html";
        } catch (error) {
            alert("Ocurrió un error en el servidor");
        }
    });
});