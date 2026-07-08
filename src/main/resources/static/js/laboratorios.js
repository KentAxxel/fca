let laboratorios = [];
let modoLaboratorio = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosLaboratorios();
    await cargarLaboratorios();
});

function configurarEventosLaboratorios() {
    const buscador = document.getElementById("buscarLaboratorio");
    const form = document.getElementById("formLaboratorio");
    const imagenArchivo = document.getElementById("imagenArchivo");

    if (buscador) {
        buscador.addEventListener("input", filtrarLaboratorios);
    }

    if (form) {
        form.addEventListener("submit", guardarLaboratorio);
    }

    if (imagenArchivo) {
        imagenArchivo.addEventListener("change", previewImagenSeleccionada);
    }
}

async function cargarLaboratorios() {
    const tabla = document.getElementById("tablaLaboratorios");

    try {
        const response = await fetch("/api/laboratorios");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-row">
                        No se pudieron cargar los laboratorios.
                    </td>
                </tr>
            `;
            return;
        }

        laboratorios = await response.json();

        renderizarLaboratorios(laboratorios);
        actualizarEstadisticasLaboratorios();

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

function renderizarLaboratorios(lista) {
    const tabla = document.getElementById("tablaLaboratorios");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="5" class="empty-row">
                    No hay laboratorios registrados.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(lab => {
        const imagen = obtenerImagen(lab.imagen);

        tabla.innerHTML += `
            <tr>
                <td>
                    <img src="${escapeHtml(imagen)}"
                         class="lab-image"
                         alt="Imagen laboratorio"
                         onerror="this.src='/images/default-lab.png'">
                </td>

                <td>${escapeHtml(lab.nombrelaboratorio ?? "")}</td>

                <td>${escapeHtml(recortarTexto(lab.descripcion ?? "", 90))}</td>

                <td>${escapeHtml(lab.ubicacion ?? "")}</td>

                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarLaboratorio(${lab.idlaboratorio})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarLaboratorio(${lab.idlaboratorio})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasLaboratorios() {
    const total = laboratorios.length;

    const conImagen = laboratorios.filter(lab =>
        lab.imagen && lab.imagen.trim() !== ""
    ).length;

    const ubicaciones = new Set(
        laboratorios
            .filter(lab => lab.ubicacion && lab.ubicacion.trim() !== "")
            .map(lab => lab.ubicacion.trim().toLowerCase())
    ).size;

    document.getElementById("totalLaboratorios").textContent = total;
    document.getElementById("totalConImagen").textContent = conImagen;
    document.getElementById("totalUbicaciones").textContent = ubicaciones;
}

function filtrarLaboratorios() {
    const filtro = document.getElementById("buscarLaboratorio").value.toLowerCase();

    const filtrados = laboratorios.filter(lab => {
        return `
            ${lab.nombrelaboratorio ?? ""}
            ${lab.descripcion ?? ""}
            ${lab.ubicacion ?? ""}
        `.toLowerCase().includes(filtro);
    });

    renderizarLaboratorios(filtrados);
}

function abrirModalNuevoLaboratorio() {
    modoLaboratorio = "crear";
    limpiarFormularioLaboratorio();

    document.getElementById("modalTituloLaboratorio").textContent = "Nuevo laboratorio";
    document.getElementById("modalSubtituloLaboratorio").textContent = "Registra un nuevo laboratorio institucional.";
    document.getElementById("btnGuardarLaboratorio").textContent = "Crear laboratorio";

    document.getElementById("modalLaboratorio").classList.add("show");
}

function abrirModalEditarLaboratorio(idlaboratorio) {
    const lab = laboratorios.find(item => Number(item.idlaboratorio) === Number(idlaboratorio));

    if (!lab) {
        Swal.fire({
            icon: "error",
            title: "Laboratorio no encontrado",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoLaboratorio = "editar";
    limpiarFormularioLaboratorio();

    document.getElementById("modalTituloLaboratorio").textContent = "Editar laboratorio";
    document.getElementById("modalSubtituloLaboratorio").textContent = "Actualiza la información del laboratorio.";
    document.getElementById("btnGuardarLaboratorio").textContent = "Guardar cambios";

    document.getElementById("idlaboratorio").value = lab.idlaboratorio;
    document.getElementById("nombrelaboratorio").value = lab.nombrelaboratorio ?? "";
    document.getElementById("descripcion").value = lab.descripcion ?? "";
    document.getElementById("ubicacion").value = lab.ubicacion ?? "";
    document.getElementById("imagen").value = lab.imagen ?? "";
    document.getElementById("imagenArchivo").value = "";
    document.getElementById("previewImagenLaboratorio").src = obtenerImagen(lab.imagen);

    document.getElementById("modalLaboratorio").classList.add("show");
}

function cerrarModalLaboratorio() {
    document.getElementById("modalLaboratorio").classList.remove("show");
}

function limpiarFormularioLaboratorio() {
    document.getElementById("formLaboratorio").reset();
    document.getElementById("idlaboratorio").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById("imagenArchivo").value = "";
    document.getElementById("previewImagenLaboratorio").src = "/images/default-lab.png";
}

async function guardarLaboratorio(e) {
    e.preventDefault();

    if (!validarFormularioLaboratorio()) {
        return;
    }

    const btn = document.getElementById("btnGuardarLaboratorio");
    btn.disabled = true;
    btn.textContent = modoLaboratorio === "crear" ? "Creando..." : "Guardando...";

    try {
        const rutaImagen = await subirImagenSiExiste();

        const laboratorio = construirLaboratorioDesdeFormulario();
        laboratorio.imagen = rutaImagen;

        const response = await fetch("/api/laboratorios", {
            method: modoLaboratorio === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(laboratorio)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar el laboratorio.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoLaboratorio === "crear" ? "Laboratorio registrado" : "Laboratorio actualizado",
            text: modoLaboratorio === "crear"
                ? "El laboratorio fue registrado correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalLaboratorio();
        await cargarLaboratorios();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo completar la operación.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoLaboratorio === "crear" ? "Crear laboratorio" : "Guardar cambios";
    }
}

function construirLaboratorioDesdeFormulario() {
    const laboratorio = {
        nombrelaboratorio: document.getElementById("nombrelaboratorio").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        ubicacion: document.getElementById("ubicacion").value.trim(),
        imagen: document.getElementById("imagen").value.trim()
    };

    if (modoLaboratorio === "editar") {
        laboratorio.idlaboratorio = Number(document.getElementById("idlaboratorio").value);
    }

    return laboratorio;
}

function validarFormularioLaboratorio() {
    const nombrelaboratorio = document.getElementById("nombrelaboratorio").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const ubicacion = document.getElementById("ubicacion").value.trim();

    if (nombrelaboratorio.length < 4) {
        alertaLaboratorio("El nombre del laboratorio debe tener al menos 4 caracteres.");
        return false;
    }

    if (descripcion.length < 10) {
        alertaLaboratorio("La descripción debe tener al menos 10 caracteres.");
        return false;
    }

    if (ubicacion.length < 3) {
        alertaLaboratorio("La ubicación debe tener al menos 3 caracteres.");
        return false;
    }

    return true;
}

function previewImagenSeleccionada() {
    const archivo = document.getElementById("imagenArchivo").files[0];
    const preview = document.getElementById("previewImagenLaboratorio");

    if (!archivo) {
        preview.src = obtenerImagen(document.getElementById("imagen").value);
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

        document.getElementById("imagenArchivo").value = "";
        return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (archivo.size > maxSize) {
        Swal.fire({
            icon: "error",
            title: "Imagen demasiado grande",
            text: "La imagen no debe superar los 10 MB.",
            confirmButtonColor: "#0b7a36"
        });

        document.getElementById("imagenArchivo").value = "";
        return;
    }

    preview.src = URL.createObjectURL(archivo);
}

async function subirImagenSiExiste() {
    const archivo = document.getElementById("imagenArchivo").files[0];

    if (!archivo) {
        return document.getElementById("imagen").value.trim();
    }

    const formData = new FormData();
    formData.append("imagen", archivo);

    const response = await fetch("/api/laboratorios/subir-imagen", {
        method: "POST",
        headers: {
            [csrfHeader]: csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "No se pudo subir la imagen");
    }

    return await response.text();
}

function confirmarEliminarLaboratorio(idlaboratorio) {
    const lab = laboratorios.find(item => Number(item.idlaboratorio) === Number(idlaboratorio));
    const nombre = lab ? lab.nombrelaboratorio : "este laboratorio";

    Swal.fire({
        title: "¿Eliminar laboratorio?",
        text: `Se eliminará el registro: ${nombre}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarLaboratorio(idlaboratorio);
        }
    });
}

async function eliminarLaboratorio(idlaboratorio) {
    try {
        const response = await fetch(`/api/laboratorios/${idlaboratorio}`, {
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
                text: mensaje || "Ocurrió un error al eliminar el laboratorio.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Laboratorio eliminado",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarLaboratorios();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function obtenerImagen(imagen) {
    if (!imagen || imagen.trim() === "") {
        return "/images/default-lab.png";
    }

    return imagen;
}

function alertaLaboratorio(mensaje) {
    Swal.fire({
        icon: "error",
        title: "Validación incorrecta",
        text: mensaje,
        confirmButtonColor: "#0b7a36"
    });
}

function recortarTexto(texto, limite) {
    if (!texto) {
        return "";
    }

    return texto.length > limite ? texto.substring(0, limite) + "..." : texto;
}

function escapeHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}