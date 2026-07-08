function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

    if (overlay) {
        overlay.classList.toggle("show");
    }
}

function toggleSubmenu() {
    const submenu = document.getElementById("submenuPublicaciones");

    if (submenu) {
        submenu.classList.toggle("open");
    }
}
function openProfileModal() {
    const modal = document.getElementById("profileModal");

    if (modal) {
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");

    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }
}

function openMessagesModal() {
    const modal = document.getElementById("messagesModal");

    if (modal) {
        modal.classList.add("active");
        document.body.classList.add("modal-open");
    }
}

function closeMessagesModal() {
    const modal = document.getElementById("messagesModal");

    if (modal) {
        modal.classList.remove("active");
        document.body.classList.remove("modal-open");
    }
}

async function solicitarCambioContrasena() {
    const csrfTokenElement = document.querySelector('meta[name="_csrf"]');
    const csrfHeaderElement = document.querySelector('meta[name="_csrf_header"]');

    if (!csrfTokenElement || !csrfHeaderElement) {
        Swal.fire({
            icon: "error",
            title: "Error de seguridad",
            text: "No se encontró el token CSRF.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    const csrfToken = csrfTokenElement.getAttribute("content");
    const csrfHeader = csrfHeaderElement.getAttribute("content");

    const confirmar = await Swal.fire({
        icon: "question",
        title: "¿Cambiar contraseña?",
        text: "Te enviaremos un enlace a tu correo para cambiar tu contraseña.",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, enviar correo",
        cancelButtonText: "Cancelar"
    });

    if (!confirmar.isConfirmed) {
        return;
    }

    try {
        const response = await fetch("/api/perfil/solicitar-cambio-contrasena", {
            method: "POST",
            headers: {
                [csrfHeader]: csrfToken
            }
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo enviar",
                text: mensaje || "Ocurrió un error al solicitar el cambio de contraseña.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        Swal.fire({
            icon: "success",
            title: "Correo enviado",
            text: "Revisa tu correo para continuar con el cambio de contraseña.",
            confirmButtonColor: "#0b7a36"
        });

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}