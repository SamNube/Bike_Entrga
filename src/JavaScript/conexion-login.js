document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.querySelector(".email input").value;
    const contrasena = document.querySelector(".contrasena input").value;

    try {
      const respuesta = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, contrasena }),
      });

      const data = await respuesta.json();

      if (respuesta.ok) {
        // Guardar el token en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuarioActual", JSON.stringify(data.usuario));

        alert(data.message);

        // Verificar si hay un carrito pendiente
        const carritoPendiente = localStorage.getItem("carritoPendiente");
        if (carritoPendiente) {
          localStorage.setItem("carrito", carritoPendiente); // Restaurar el carrito
          localStorage.removeItem("carritoPendiente"); // Limpiar el carrito pendiente
          alert("Carrito restaurado. Puedes continuar con tu compra.");
          window.location.href = "carrito.html"; // Redirigir al carrito
        } else {
          // Redirigir según el rol del usuario
          if (data.usuario.rol === "SuperUsuario") {
            window.location.href = "superUsuario-panel.html";
          } else if (data.usuario.rol === "Administrador") {
            window.location.href = "admin-panel(1).html";
          } else {
            window.location.href = "index.html";
          }
        }
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error en el inicio de sesión:", error);
      alert("Ocurrió un error en el servidor");
    }
  });
});

// Función para realizar peticiones autenticadas
async function fetchAutenticado(url, opciones = {}) {
  // Obtener el token del localStorage
  const token = localStorage.getItem("token");

  // Si no hay token, redireccionar al login
  if (!token) {
    window.location.href = "login.html";
    return;
  }

  // Configurar los headers incluyendo el token
  const headers = {
    ...opciones.headers,
    Authorization: `Bearer ${token}`,
  };

  try {
    const respuesta = await fetch(url, { ...opciones, headers });

    // Si la respuesta es 401 o 403, el token es inválido o expiró
    if (respuesta.status === 401 || respuesta.status === 403) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuarioActual");
      window.location.href = "login.html";
      return;
    }

    return respuesta;
  } catch (error) {
    console.error("Error en la petición:", error);
    throw error;
  }
}

// Función para manejar el inicio de sesión
document.addEventListener("DOMContentLoaded", function () {
  const formulario = document.querySelector("form");

  formulario.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.querySelector('input[type="email"]').value;
    const contrasena = document.querySelector('input[type="password"]').value;

    // Validación básica
    if (!email || !contrasena) {
      mostrarError("Por favor complete todos los campos");
      return;
    }

    // Datos para enviar al servidor
    const datos = {
      email: email,
      contrasena: contrasena,
    };

    // Enviar solicitud al servidor
    fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(datos),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error en la autenticación");
        }
        return response.json();
      })
      .then((data) => {
        // Guardar el token en localStorage
        localStorage.setItem("token", data.token);
        localStorage.setItem("usuario", JSON.stringify(data.usuario));

        // Verificar el rol del usuario
        if (data.usuario.rol === "SuperUsuario") {
          window.location.href = "superUsuario-panel.html";
        } else if (data.usuario.rol === "Administrador") {
          window.location.href = "admin-panel(1).html";
        } else {
          window.location.href = "index.html";
        }
      })
      .catch((error) => {
        mostrarError("Correo o contraseña incorrectos");
        console.error("Error:", error);
      });
  });

  // Función para mostrar mensajes de error
  function mostrarError(mensaje) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-mensaje";
    errorDiv.textContent = mensaje;

    // Verificar si ya hay un mensaje de error
    const errorExistente = document.querySelector(".error-mensaje");
    if (errorExistente) {
      errorExistente.remove();
    }

    // Agregar el mensaje al formulario
    formulario.insertBefore(errorDiv, formulario.firstChild);

    // Eliminar el mensaje después de 3 segundos
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
});
