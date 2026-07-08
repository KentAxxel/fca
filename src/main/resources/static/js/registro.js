
toastr.options = {
    closeButton: true,
    progressBar: true,
    positionClass: "toast-top-right",
    timeOut: "3500"
};

const form = document.getElementById("registroForm");
const telefonoInput = document.getElementById("telefono");
const btnRegistrar = document.getElementById("btnRegistrar");

telefonoInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 9);
});

document.getElementById("nombreusuario").addEventListener("input", function () {
    this.value = this.value.replace(/[^a-zA-Z0-9._]/g, "");
});

function validarFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const nombreusuario = document.getElementById("nombreusuario").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const confirmarContrasena = document.getElementById("confirmarContrasena").value;

    const regexUsuario = /^[a-zA-Z0-9._]{4,30}$/;
    const regexTelefono = /^[0-9]{9}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const regexContrasena = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (nombre.length < 3) {
        toastr.error("El nombre debe tener al menos 3 caracteres.");
        return false;
    }

    if (!regexUsuario.test(nombreusuario)) {
        toastr.error("El usuario debe tener entre 4 y 30 caracteres. Solo letras, números, punto o guion bajo.");
        return false;
    }

    if (!regexTelefono.test(telefono)) {
        toastr.error("El teléfono debe tener exactamente 9 números.");
        return false;
    }

    if (!regexCorreo.test(correo)) {
        toastr.error("Ingresa un correo electrónico válido.");
        return false;
    }

    if (!regexContrasena.test(contrasena)) {
        toastr.error("La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula y un número.");
        return false;
    }

    if (contrasena !== confirmarContrasena) {
        toastr.error("Las contraseñas no coinciden.");
        return false;
    }

    return true;
}

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const csrfToken = document.getElementById("csrfToken").value;
    const csrfHeader = document.getElementById("csrfHeader").value;

    const usuario = {
        nombre: document.getElementById("nombre").value.trim(),
        nombreusuario: document.getElementById("nombreusuario").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        contrasena: document.getElementById("contrasena").value
    };

    btnRegistrar.disabled = true;
    btnRegistrar.textContent = "Registrando...";

    try {
        const response = await fetch("/api/usuarios/registro-publico", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            const mensaje = await response.text();
            toastr.error(mensaje || "No se pudo registrar el usuario.");
            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Usuario registrado",
            text: "Tu cuenta fue creada correctamente. Ahora puedes iniciar sesión.",
            confirmButtonColor: "#0b7a36",
            confirmButtonText: "Ir al login"
        });

        window.location.href = "/fca/login?registrado=true";

    } catch (error) {
        toastr.error("No se pudo conectar con el servidor.");
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.textContent = "Registrar cuenta";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    configurarMostrarPassword("contrasena", "togglePassword");
    configurarMostrarPassword("confirmarContrasena", "toggleConfirmPassword");
});

function configurarMostrarPassword(inputId, buttonId) {
    const input = document.getElementById(inputId);
    const button = document.getElementById(buttonId);

    if (!input || !button) {
        return;
    }

    button.addEventListener("click", () => {
        const icon = button.querySelector("i");

        if (input.type === "password") {
            input.type = "text";
            button.setAttribute("aria-label", "Ocultar contraseña");

            if (icon) {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }

            return;
        }

        input.type = "password";
        button.setAttribute("aria-label", "Mostrar contraseña");

        if (icon) {
            icon.classList.remove("fa-eye-slash");
            icon.classList.add("fa-eye");
        }
    });
}