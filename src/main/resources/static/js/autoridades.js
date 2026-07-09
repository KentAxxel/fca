let autoridades = [];
let modoAutoridad = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosAutoridades();
    await cargarAutoridades();
});

function configurarEventosAutoridades() {
    const buscador = document.getElementById("buscarAutoridad");
    const form = document.getElementById("formAutoridad");
    const fotoArchivo = document.getElementById("fotoArchivo");

    if (buscador) {
        buscador.addEventListener("input", filtrarAutoridades);
    }

    if (form) {
        form.addEventListener("submit", guardarAutoridad);
    }

    if (fotoArchivo) {
        fotoArchivo.addEventListener("change", previewFotoSeleccionada);
    }
}

async function cargarAutoridades() {
    const tabla = document.getElementById("tablaAutoridades");

    try {
        const response = await fetch("/api/autoridades");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-row">
                        No se pudieron cargar las autoridades.
                    </td>
                </tr>
            `;
            return;
        }

        autoridades = await response.json();

        renderizarAutoridades(autoridades);
        actualizarEstadisticasAutoridades();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    Error de conexión con el servidor.
                </td>
            </tr>
        `;
    }
}

function renderizarAutoridades(lista) {
    const tabla = document.getElementById("tablaAutoridades");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No hay autoridades registradas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(item => {
        const foto = obtenerFoto(item.foto);

        tabla.innerHTML += `
            <tr>
                <td>
                    <img src="${escapeHtml(foto)}"
                         class="authority-photo"
                         alt="Foto autoridad"
                         onerror="this.src='/images/default-user.png'">
                </td>
                <td>${escapeHtml(item.autoridad ?? "")}</td>
                <td>${escapeHtml(item.cargo ?? "")}</td>
                <td>${escapeHtml(item.correo ?? "")}</td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarAutoridad(${item.idautoridad})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarAutoridad(${item.idautoridad})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasAutoridades() {
    const total = autoridades.length;
    const conCorreo = autoridades.filter(a => a.correo && a.correo.trim() !== "").length;
    const conFoto = autoridades.filter(a => a.foto && a.foto.trim() !== "").length;

    document.getElementById("totalAutoridades").textContent = total;
    document.getElementById("totalConCorreo").textContent = conCorreo;
    document.getElementById("totalConFoto").textContent = conFoto;
}

function filtrarAutoridades() {
    const filtro = document.getElementById("buscarAutoridad").value.toLowerCase();

    const filtradas = autoridades.filter(item => {
        return `
            ${item.autoridad ?? ""}
            ${item.cargo ?? ""}
            ${item.correo ?? ""}
        `.toLowerCase().includes(filtro);
    });

    renderizarAutoridades(filtradas);
}

function abrirModalNuevaAutoridad() {
    modoAutoridad = "crear";
    limpiarFormularioAutoridad();

    document.getElementById("modalTitulo").textContent = "Nueva autoridad";
    document.getElementById("modalSubtitulo").textContent = "Registra una nueva autoridad institucional.";
    document.getElementById("btnGuardarAutoridad").textContent = "Crear autoridad";

    document.getElementById("modalAutoridad").classList.add("show");
}

function abrirModalEditarAutoridad(idautoridad) {
    const autoridad = autoridades.find(a => Number(a.idautoridad) === Number(idautoridad));

    if (!autoridad) {
        Swal.fire({
            icon: "error",
            title: "Autoridad no encontrada",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoAutoridad = "editar";
    limpiarFormularioAutoridad();

    document.getElementById("modalTitulo").textContent = "Editar autoridad";
    document.getElementById("modalSubtitulo").textContent = "Actualiza la información de la autoridad institucional.";
    document.getElementById("btnGuardarAutoridad").textContent = "Guardar cambios";

    document.getElementById("idautoridad").value = autoridad.idautoridad;
    document.getElementById("autoridad").value = autoridad.autoridad ?? "";
    document.getElementById("cargo").value = autoridad.cargo ?? "";
    document.getElementById("correo").value = autoridad.correo ?? "";
    document.getElementById("foto").value = autoridad.foto ?? "";
    document.getElementById("fotoArchivo").value = "";
    document.getElementById("previewFoto").src = obtenerFoto(autoridad.foto);
    document.getElementById("modalAutoridad").classList.add("show");
}

function cerrarModalAutoridad() {
    document.getElementById("modalAutoridad").classList.remove("show");
}

function limpiarFormularioAutoridad() {
    document.getElementById("formAutoridad").reset();
    document.getElementById("idautoridad").value = "";
    document.getElementById("foto").value = "";
    document.getElementById("fotoArchivo").value = "";
    document.getElementById("previewFoto").src = "/images/default-user.png";
}

async function guardarAutoridad(e) {
    e.preventDefault();

    if (!validarFormularioAutoridad()) {
        return;
    }

    const btn = document.getElementById("btnGuardarAutoridad");
    btn.disabled = true;
    btn.textContent = modoAutoridad === "crear" ? "Creando..." : "Guardando...";

    let rutaFoto;

    try {
        rutaFoto = await subirFotoSiExiste();
    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "No se pudo subir la foto",
            text: error.message,
            confirmButtonColor: "#0b7a36"
        });

        btn.disabled = false;
        btn.textContent = modoAutoridad === "crear" ? "Crear autoridad" : "Guardar cambios";
        return;
    }

    const autoridad = construirAutoridadDesdeFormulario();
    autoridad.foto = rutaFoto;
    try {
        const response = await fetch("/api/autoridades", {
            method: modoAutoridad === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(autoridad)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar la autoridad.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoAutoridad === "crear" ? "Autoridad registrada" : "Autoridad actualizada",
            text: modoAutoridad === "crear"
                ? "La autoridad fue registrada correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalAutoridad();
        await cargarAutoridades();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoAutoridad === "crear" ? "Crear autoridad" : "Guardar cambios";
    }
}

function construirAutoridadDesdeFormulario() {
    const autoridad = {
        autoridad: document.getElementById("autoridad").value.trim(),
        cargo: document.getElementById("cargo").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        foto: document.getElementById("foto").value.trim()
    };

    if (modoAutoridad === "editar") {
        autoridad.idautoridad = Number(document.getElementById("idautoridad").value);
    }

    return autoridad;
}

function validarFormularioAutoridad() {
    const autoridad = document.getElementById("autoridad").value.trim();
    const cargo = document.getElementById("cargo").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const foto = document.getElementById("foto").value.trim();

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (autoridad.length < 3) {
        alertaAutoridad("El nombre de la autoridad debe tener al menos 3 caracteres.");
        return false;
    }

    if (cargo.length < 3) {
        alertaAutoridad("El cargo debe tener al menos 3 caracteres.");
        return false;
    }

    if (!regexCorreo.test(correo)) {
        alertaAutoridad("Ingresa un correo electrónico válido.");
        return false;
    }

    return true;
}

function confirmarEliminarAutoridad(idautoridad) {
    const autoridad = autoridades.find(a => Number(a.idautoridad) === Number(idautoridad));
    const nombre = autoridad ? autoridad.autoridad : "esta autoridad";

    Swal.fire({
        title: "¿Eliminar autoridad?",
        text: `Se eliminará el registro de ${nombre}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarAutoridad(idautoridad);
        }
    });
}

async function eliminarAutoridad(idautoridad) {
    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content");

    const headers = {};

    if (csrfToken && csrfHeader) {
        headers[csrfHeader] = csrfToken;
    }

    try {
        const response = await fetch(`/api/autoridades/${idautoridad}`, {
            method: "DELETE",
            headers
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo eliminar",
                text: mensaje || `Error del servidor. Código: ${response.status}`,
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Autoridad eliminada",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarAutoridades();

    } catch (error) {
        console.error("Error eliminando autoridad:", error);

        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function actualizarPreviewFoto() {
    const foto = document.getElementById("foto").value.trim();
    const preview = document.getElementById("previewFoto");

    preview.src = obtenerFoto(foto);
}

function obtenerFoto(foto) {
    if (!foto || foto.trim() === "") {
        return "/images/default-user.png";
    }

    return foto;
}

function alertaAutoridad(mensaje) {
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

function previewFotoSeleccionada() {
    const archivo = document.getElementById("fotoArchivo").files[0];
    const preview = document.getElementById("previewFoto");

    if (!archivo) {
        preview.src = obtenerFoto(document.getElementById("foto").value);
        return;
    }

    const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];

    if (!tiposPermitidos.includes(archivo.type)) {
        Swal.fire({
            icon: "error",
            title: "Formato no permitido",
            text: "Solo se permiten imágenes JPG, PNG o WEBP.",
            confirmButtonColor: "#0b7a36"
        });

        document.getElementById("fotoArchivo").value = "";
        return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (archivo.size > maxSize) {
        Swal.fire({
            icon: "error",
            title: "Imagen demasiado grande",
            text: "La imagen no debe superar los 5 MB.",
            confirmButtonColor: "#0b7a36"
        });

        document.getElementById("fotoArchivo").value = "";
        return;
    }

    preview.src = URL.createObjectURL(archivo);
}

async function subirFotoSiExiste() {
    const archivo = document.getElementById("fotoArchivo").files[0];

    if (!archivo) {
        return document.getElementById("foto").value.trim();
    }

    const formData = new FormData();
    formData.append("foto", archivo);

    const response = await fetch("/api/autoridades/subir-foto", {
        method: "POST",
        headers: {
            [csrfHeader]: csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "No se pudo subir la foto");
    }

    return await response.text();
}
