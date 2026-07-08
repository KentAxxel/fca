let usuarios = [];
let roles = [];
let modoFormulario = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarInputs();
    await cargarRoles();
    await cargarUsuarios();

    document.getElementById("buscarUsuario").addEventListener("input", filtrarUsuarios);
    document.getElementById("formUsuario").addEventListener("submit", guardarUsuario);
});

function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("overlay").classList.toggle("show");
}

function toggleSubmenu() {
    const submenu = document.getElementById("submenuPublicaciones");

    if (submenu) {
        submenu.classList.toggle("open");
    }
}

function configurarInputs() {
    const telefono = document.getElementById("telefono");
    const nombreusuario = document.getElementById("nombreusuario");

    telefono.addEventListener("input", function () {
        this.value = this.value.replace(/\D/g, "").slice(0, 9);
    });

    nombreusuario.addEventListener("input", function () {
        this.value = this.value.replace(/[^a-zA-Z0-9._]/g, "");
    });
}

async function cargarUsuarios() {
    const tabla = document.getElementById("tablaUsuarios");

    try {
        const response = await fetch("/api/usuarios");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-row">No se pudieron cargar los usuarios.</td>
                </tr>
            `;
            return;
        }

        usuarios = await response.json();

        renderizarUsuarios(usuarios);
        actualizarEstadisticas();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">Error de conexión con el servidor.</td>
            </tr>
        `;
    }
}

async function cargarRoles() {
    const rolesGrid = document.getElementById("rolesGrid");
    const selectRol = document.getElementById("idrol");

    try {
        const response = await fetch("/api/roles");

        if (!response.ok) {
            const mensaje = await response.text();

            console.error("Error al cargar roles:", response.status, mensaje);

            rolesGrid.innerHTML = `
                <div class="role-card">
                    <strong>Error</strong>
                    <span>No se pudieron cargar los roles.</span>
                </div>
            `;

            selectRol.innerHTML = `<option value="">No se pudieron cargar roles</option>`;
            return;
        }

        roles = await response.json();

        console.log("Roles cargados:", roles);

        renderizarRoles();
        llenarSelectRoles();

    } catch (error) {
        console.error("Error de conexión al cargar roles:", error);

        rolesGrid.innerHTML = `
            <div class="role-card">
                <strong>Error</strong>
                <span>Error de conexión con el servidor.</span>
            </div>
        `;

        selectRol.innerHTML = `<option value="">Error al cargar roles</option>`;
    }
}

function renderizarRoles() {
    const rolesGrid = document.getElementById("rolesGrid");

    if (!roles.length) {
        rolesGrid.innerHTML = `
            <div class="role-card">
                <strong>Sin roles</strong>
                <span>No hay roles registrados.</span>
            </div>
        `;
        return;
    }

    rolesGrid.innerHTML = "";

    roles.forEach(rol => {
        const nombreRol = obtenerNombreRolDesdeRol(rol);

        rolesGrid.innerHTML += `
            <div class="role-card">
                <strong>${escapeHtml(nombreRol)}</strong>
                <span>${descripcionRol(nombreRol)}</span>
            </div>
        `;
    });
}

function llenarSelectRoles() {
    const selectRol = document.getElementById("idrol");

    selectRol.innerHTML = `<option value="">Seleccione un rol</option>`;

    roles.forEach(rol => {
        const id = rol.idrol ?? rol.idRol ?? rol.id;
        const nombre = rol.rol ?? rol.nombre ?? rol.descripcion ?? "SIN ROL";

        if (id) {
            selectRol.innerHTML += `
                <option value="${id}">${escapeHtml(nombre)}</option>
            `;
        }
    });
}

function renderizarUsuarios(lista) {
    const tabla = document.getElementById("tablaUsuarios");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">No hay usuarios registrados.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(usuario => {
        const rol = obtenerRol(usuario);
        const claseRol = claseRolBadge(rol);

        tabla.innerHTML += `
            <tr>
                <td>${escapeHtml(usuario.nombre ?? "")}</td>
                <td>${escapeHtml(usuario.nombreusuario ?? "")}</td>
                <td>${escapeHtml(usuario.correo ?? "")}</td>
                <td>${escapeHtml(usuario.telefono ?? "")}</td>
                <td><span class="role-badge ${claseRol}">${escapeHtml(rol)}</span></td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit" onclick="abrirModalEditar(${usuario.idusuario})">
                            Editar
                        </button>
                        <button class="btn-icon btn-delete" onclick="confirmarEliminar(${usuario.idusuario})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticas() {
    const total = usuarios.length;
    const admins = usuarios.filter(u => obtenerRol(u).toUpperCase() === "ADMIN").length;
    const autores = usuarios.filter(u => obtenerRol(u).toUpperCase() === "AUTOR").length;
    const invitados = usuarios.filter(u => obtenerRol(u).toUpperCase() === "INVITADO").length;

    document.getElementById("totalUsuarios").textContent = total;
    document.getElementById("totalAdmin").textContent = admins;
    document.getElementById("totalAutores").textContent = autores;
    document.getElementById("totalInvitados").textContent = invitados;
}

function filtrarUsuarios() {
    const filtro = document.getElementById("buscarUsuario").value.toLowerCase();

    const filtrados = usuarios.filter(usuario => {
        const rol = obtenerRol(usuario);

        return `
            ${usuario.nombre ?? ""}
            ${usuario.nombreusuario ?? ""}
            ${usuario.correo ?? ""}
            ${usuario.telefono ?? ""}
            ${rol}
        `.toLowerCase().includes(filtro);
    });

    renderizarUsuarios(filtrados);
}

function abrirModalCrear() {
    modoFormulario = "crear";
    limpiarFormulario();

    document.getElementById("modalTitulo").textContent = "Nuevo usuario";
    document.getElementById("modalSubtitulo").textContent = "Registra un nuevo usuario y asígnale un rol.";
    document.getElementById("passwordHelp").textContent = "La contraseña es obligatoria al crear un usuario.";
    document.getElementById("btnGuardarUsuario").textContent = "Crear usuario";

    document.getElementById("contrasena").required = true;
    document.getElementById("modalUsuario").classList.add("show");
}

async function abrirModalEditar(idusuario) {

    if (!roles || roles.length === 0) {
        await cargarRoles();
    }

    const usuario = usuarios.find(u => Number(u.idusuario) === Number(idusuario));

    if (!usuario) {
        Swal.fire({
            icon: "error",
            title: "Usuario no encontrado",
            text: "No se pudo encontrar el usuario seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoFormulario = "editar";
    limpiarFormulario();

    document.getElementById("modalTitulo").textContent = "Editar usuario";
    document.getElementById("modalSubtitulo").textContent = "Actualiza los datos y permisos del usuario.";
    document.getElementById("passwordHelp").textContent =
        "Contraseña actual protegida. Escribe una nueva solo si deseas cambiarla.";
    document.getElementById("btnGuardarUsuario").textContent = "Guardar cambios";

    document.getElementById("idusuario").value = usuario.idusuario;
    document.getElementById("nombre").value = usuario.nombre ?? "";
    document.getElementById("nombreusuario").value = usuario.nombreusuario ?? "";
    document.getElementById("correo").value = usuario.correo ?? "";
    document.getElementById("telefono").value = usuario.telefono ?? "";

    document.getElementById("contrasena").value = "";
    document.getElementById("contrasena").required = false;

    const idRol = obtenerIdRolUsuario(usuario);
    document.getElementById("idrol").value = idRol;

    document.getElementById("modalUsuario").classList.add("show");
}
function obtenerIdRolUsuario(usuario) {
    if (!usuario.idrol) {
        return "";
    }

    return usuario.idrol.idrol
        ?? usuario.idrol.idRol
        ?? usuario.idrol.id
        ?? "";
}

function cerrarModalUsuario() {
    document.getElementById("modalUsuario").classList.remove("show");
}

function limpiarFormulario() {
    document.getElementById("formUsuario").reset();
    document.getElementById("idusuario").value = "";
}

async function guardarUsuario(e) {
    e.preventDefault();

    if (!validarFormulario()) {
        return;
    }

    const btn = document.getElementById("btnGuardarUsuario");
    btn.disabled = true;
    btn.textContent = modoFormulario === "crear" ? "Creando..." : "Guardando...";

    const usuario = construirUsuarioDesdeFormulario();

    try {
        const url = "/api/usuarios";
        const method = modoFormulario === "crear" ? "POST" : "PUT";

        const response = await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar el usuario.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoFormulario === "crear" ? "Usuario creado" : "Usuario actualizado",
            text: modoFormulario === "crear"
                ? "El usuario fue registrado correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalUsuario();
        await cargarUsuarios();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoFormulario === "crear" ? "Crear usuario" : "Guardar cambios";
    }
}

function construirUsuarioDesdeFormulario() {
    const usuario = {
        nombre: document.getElementById("nombre").value.trim(),
        nombreusuario: document.getElementById("nombreusuario").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        idrol: Number(document.getElementById("idrol").value)
    };

    const contrasena = document.getElementById("contrasena").value;

    if (modoFormulario === "crear") {
        usuario.contrasena = contrasena;
    }

    if (modoFormulario === "editar") {
        usuario.idusuario = Number(document.getElementById("idusuario").value);

        if (contrasena.trim() !== "") {
            usuario.contrasena = contrasena;
        }
    }

    return usuario;
}

function validarFormulario() {
    const nombre = document.getElementById("nombre").value.trim();
    const nombreusuario = document.getElementById("nombreusuario").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const contrasena = document.getElementById("contrasena").value;
    const idrol = document.getElementById("idrol").value;

    const regexUsuario = /^[a-zA-Z0-9._]{4,30}$/;
    const regexTelefono = /^[0-9]{9}$/;
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nombre.length < 3) {
        alertaError("El nombre debe tener al menos 3 caracteres.");
        return false;
    }

    if (!regexUsuario.test(nombreusuario)) {
        alertaError("El usuario debe tener entre 4 y 30 caracteres. Solo letras, números, punto o guion bajo.");
        return false;
    }

    if (!regexTelefono.test(telefono)) {
        alertaError("El teléfono debe tener exactamente 9 números.");
        return false;
    }

    if (!regexCorreo.test(correo)) {
        alertaError("Ingresa un correo electrónico válido.");
        return false;
    }

    if (modoFormulario === "crear" && contrasena.length < 8) {
        alertaError("La contraseña debe tener al menos 8 caracteres.");
        return false;
    }

    if (modoFormulario === "editar" && contrasena.length > 0 && contrasena.length < 8) {
        alertaError("La nueva contraseña debe tener al menos 8 caracteres.");
        return false;
    }

    if (!idrol) {
        alertaError("Debe seleccionar un rol.");
        return false;
    }

    return true;
}

function confirmarEliminar(idusuario) {
    const usuario = usuarios.find(u => Number(u.idusuario) === Number(idusuario));
    const nombre = usuario ? usuario.nombre : "este usuario";

    Swal.fire({
        title: "¿Eliminar usuario?",
        text: `Se realizará un borrado lógico de ${nombre}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarUsuario(idusuario);
        }
    });
}

async function eliminarUsuario(idusuario) {
    try {
        const response = await fetch(`/api/usuarios/${idusuario}`, {
            method: "DELETE",
            headers: {
                [csrfHeader]: csrfToken
            }
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo eliminar",
                text: mensaje || "Ocurrió un error al eliminar el usuario.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Usuario eliminado",
            text: "El usuario fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarUsuarios();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function obtenerRol(usuario) {
    if (!usuario.idrol) {
        return "SIN ROL";
    }

    return usuario.idrol.rol || usuario.idrol.nombre || "SIN ROL";
}

function obtenerNombreRolDesdeRol(rol) {
    return rol.rol || rol.nombre || "SIN ROL";
}

function claseRolBadge(rol) {
    const normalizado = rol.toLowerCase();

    if (normalizado === "admin") {
        return "admin";
    }

    if (normalizado === "autor") {
        return "autor";
    }

    if (normalizado === "invitado") {
        return "invitado";
    }

    return "";
}

function descripcionRol(rol) {
    const normalizado = rol.toUpperCase();

    if (normalizado === "ADMIN") {
        return "Acceso completo al panel administrativo.";
    }

    if (normalizado === "AUTOR") {
        return "Gestión de contenido, excepto usuarios y roles.";
    }

    if (normalizado === "INVITADO") {
        return "Cuenta en espera de confirmación de permisos.";
    }

    return "Rol registrado en el sistema.";
}

function alertaError(mensaje) {
    Swal.fire({
        icon: "error",
        title: "Validación incorrecta",
        text: mensaje,
        confirmButtonColor: "#0b7a36"
    });
}

function escapeHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}