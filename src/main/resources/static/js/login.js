document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const error = params.has("error");
    const active = params.has("active");
    const blocked = params.has("blocked");
    const expired = params.has("expired");
    const logout = params.has("logout");
    const registrado = params.has("registrado");

    const restantes = params.get("restantes");

    if (blocked) {
        Swal.fire({
            icon: "error",
            title: "Demasiados intentos",
            text: "Has superado el máximo de 4 intentos. Intenta nuevamente más tarde.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    if (active) {
        Swal.fire({
            icon: "warning",
            title: "Sesión activa",
            text: "Esta cuenta ya tiene una sesión activa en otro navegador o dispositivo.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    if (error) {
        let mensaje = "Usuario o contraseña incorrectos.";

        if (restantes !== null && restantes !== "") {
            mensaje = `Usuario o contraseña incorrectos. Te quedan ${restantes} intento(s).`;
        }

        Swal.fire({
            icon: "error",
            title: "Credenciales incorrectas",
            text: mensaje,
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    if (expired) {
        Swal.fire({
            icon: "info",
            title: "Sesión expirada",
            text: "Tu sesión expiró por inactividad o porque se cerró desde otro acceso.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    if (logout) {
        Swal.fire({
            icon: "success",
            title: "Sesión cerrada",
            text: "Has cerrado sesión correctamente.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    if (registrado) {
        Swal.fire({
            icon: "success",
            title: "Registro exitoso",
            text: "Tu cuenta fue registrada correctamente. Espera la aprobación del administrador si corresponde.",
            confirmButtonColor: "#0b7a36"
        });
    }
});