let noticias = [];
let modoNoticia = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosNoticias();
    await cargarNoticias();
});

function configurarEventosNoticias() {
    const buscador = document.getElementById("buscarNoticia");
    const form = document.getElementById("formNoticia");
    const imagenArchivo = document.getElementById("imagenArchivo");

    if (buscador) {
        buscador.addEventListener("input", filtrarNoticias);
    }

    if (form) {
        form.addEventListener("submit", guardarNoticia);
    }

    if (imagenArchivo) {
        imagenArchivo.addEventListener("change", previewImagenSeleccionada);
    }
}

async function cargarNoticias() {
    const tabla = document.getElementById("tablaNoticias");

    try {
        const response = await fetch("/api/noticias");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="6" class="empty-row">No se pudieron cargar las noticias.</td>
                </tr>
            `;
            return;
        }

        noticias = await response.json();

        renderizarNoticias(noticias);
        actualizarEstadisticasNoticias();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">Error de conexión con el servidor.</td>
            </tr>
        `;
    }
}

function renderizarNoticias(lista) {
    const tabla = document.getElementById("tablaNoticias");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="6" class="empty-row">No hay noticias registradas.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(noticia => {
        const imagen = obtenerImagen(noticia.imagen);

        tabla.innerHTML += `
            <tr>
                <td>
                    <img src="${escapeHtml(imagen)}"
                         class="publication-image"
                         alt="Imagen noticia"
                         onerror="this.src='/images/default-news.png'">
                </td>
                <td>${escapeHtml(noticia.titulo ?? "")}</td>
                <td>${escapeHtml(recortarTexto(noticia.resumen ?? "", 80))}</td>
                <td>${escapeHtml(formatearFecha(noticia.fecha))}</td>
                <td>${escapeHtml(noticia.autor ?? "")}</td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarNoticia(${noticia.idnoticia})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarNoticia(${noticia.idnoticia})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasNoticias() {
    const total = noticias.length;
    const conImagen = noticias.filter(n => n.imagen && n.imagen.trim() !== "").length;
    const autores = new Set(
        noticias
            .filter(n => n.autor && n.autor.trim() !== "")
            .map(n => n.autor.trim().toLowerCase())
    ).size;

    document.getElementById("totalNoticias").textContent = total;
    document.getElementById("totalNoticiasImagen").textContent = conImagen;
    document.getElementById("totalAutoresNoticias").textContent = autores;
}

function filtrarNoticias() {
    const filtro = document.getElementById("buscarNoticia").value.toLowerCase();

    const filtradas = noticias.filter(noticia => {
        return `
            ${noticia.titulo ?? ""}
            ${noticia.resumen ?? ""}
            ${noticia.contenido ?? ""}
            ${noticia.fecha ?? ""}
            ${noticia.autor ?? ""}
        `.toLowerCase().includes(filtro);
    });

    renderizarNoticias(filtradas);
}

function abrirModalNuevaNoticia() {
    modoNoticia = "crear";
    limpiarFormularioNoticia();

    document.getElementById("modalTituloNoticia").textContent = "Nueva noticia";
    document.getElementById("modalSubtituloNoticia").textContent = "Registra una nueva noticia institucional.";
    document.getElementById("btnGuardarNoticia").textContent = "Crear noticia";

    document.getElementById("modalNoticia").classList.add("show");
}

function abrirModalEditarNoticia(idnoticia) {
    const noticia = noticias.find(n => Number(n.idnoticia) === Number(idnoticia));

    if (!noticia) {
        Swal.fire({
            icon: "error",
            title: "Noticia no encontrada",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoNoticia = "editar";
    limpiarFormularioNoticia();

    document.getElementById("modalTituloNoticia").textContent = "Editar noticia";
    document.getElementById("modalSubtituloNoticia").textContent = "Actualiza la información de la noticia.";
    document.getElementById("btnGuardarNoticia").textContent = "Guardar cambios";

    document.getElementById("idnoticia").value = noticia.idnoticia;
    document.getElementById("titulo").value = noticia.titulo ?? "";
    document.getElementById("resumen").value = noticia.resumen ?? "";
    document.getElementById("contenido").value = noticia.contenido ?? "";
    document.getElementById("fecha").value = normalizarFechaInput(noticia.fecha);
    document.getElementById("imagen").value = noticia.imagen ?? "";
    document.getElementById("autor").value = noticia.autor ?? "";
    document.getElementById("imagenArchivo").value = "";
    document.getElementById("previewImagenNoticia").src = obtenerImagen(noticia.imagen);

    document.getElementById("modalNoticia").classList.add("show");
}

function cerrarModalNoticia() {
    document.getElementById("modalNoticia").classList.remove("show");
}

function limpiarFormularioNoticia() {
    document.getElementById("formNoticia").reset();
    document.getElementById("idnoticia").value = "";
    document.getElementById("imagen").value = "";
    document.getElementById("imagenArchivo").value = "";
    document.getElementById("previewImagenNoticia").src = "/images/default-news.png";
}

async function guardarNoticia(e) {
    e.preventDefault();

    if (!validarFormularioNoticia()) {
        return;
    }

    const btn = document.getElementById("btnGuardarNoticia");
    btn.disabled = true;
    btn.textContent = modoNoticia === "crear" ? "Creando..." : "Guardando...";

    try {
        const rutaImagen = await subirImagenSiExiste();

        const noticia = construirNoticiaDesdeFormulario();
        noticia.imagen = rutaImagen;

        const response = await fetch("/api/noticias", {
            method: modoNoticia === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(noticia)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar la noticia.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoNoticia === "crear" ? "Noticia registrada" : "Noticia actualizada",
            text: modoNoticia === "crear"
                ? "La noticia fue registrada correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalNoticia();
        await cargarNoticias();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo completar la operación.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoNoticia === "crear" ? "Crear noticia" : "Guardar cambios";
    }
}

function construirNoticiaDesdeFormulario() {
    const noticia = {
        titulo: document.getElementById("titulo").value.trim(),
        resumen: document.getElementById("resumen").value.trim(),
        contenido: document.getElementById("contenido").value.trim(),
        fecha: document.getElementById("fecha").value,
        imagen: document.getElementById("imagen").value.trim(),
        autor: document.getElementById("autor").value.trim()
    };

    if (modoNoticia === "editar") {
        noticia.idnoticia = Number(document.getElementById("idnoticia").value);
    }

    return noticia;
}

function validarFormularioNoticia() {
    const titulo = document.getElementById("titulo").value.trim();
    const resumen = document.getElementById("resumen").value.trim();
    const contenido = document.getElementById("contenido").value.trim();
    const fecha = document.getElementById("fecha").value;
    const autor = document.getElementById("autor").value.trim();

    if (titulo.length < 5) {
        alertaNoticia("El título debe tener al menos 5 caracteres.");
        return false;
    }

    if (resumen.length < 10) {
        alertaNoticia("El resumen debe tener al menos 10 caracteres.");
        return false;
    }

    if (contenido.length < 20) {
        alertaNoticia("El contenido debe tener al menos 20 caracteres.");
        return false;
    }

    if (!fecha) {
        alertaNoticia("La fecha es obligatoria.");
        return false;
    }

    if (autor.length < 3) {
        alertaNoticia("El autor debe tener al menos 3 caracteres.");
        return false;
    }

    return true;
}

function previewImagenSeleccionada() {
    const archivo = document.getElementById("imagenArchivo").files[0];
    const preview = document.getElementById("previewImagenNoticia");

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

    const response = await fetch("/api/noticias/subir-imagen", {
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

function confirmarEliminarNoticia(idnoticia) {
    const noticia = noticias.find(n => Number(n.idnoticia) === Number(idnoticia));
    const titulo = noticia ? noticia.titulo : "esta noticia";

    Swal.fire({
        title: "¿Eliminar noticia?",
        text: `Se eliminará el registro: ${titulo}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarNoticia(idnoticia);
        }
    });
}

async function eliminarNoticia(idnoticia) {
    try {
        const response = await fetch(`/api/noticias/${idnoticia}`, {
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
                text: mensaje || "Ocurrió un error al eliminar la noticia.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Noticia eliminada",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarNoticias();

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
        return "/images/default-news.png";
    }

    return imagen;
}

function alertaNoticia(mensaje) {
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

function formatearFecha(fecha) {
    if (!fecha) {
        return "";
    }

    return String(fecha).substring(0, 10);
}

function normalizarFechaInput(fecha) {
    if (!fecha) {
        return "";
    }

    return String(fecha).substring(0, 10);
}

function escapeHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function obtenerImagen(valor, fallback) {
    if (!valor || String(valor).trim() === "") {
        return fallback;
    }

    const ruta = String(valor).trim();

    if (ruta.startsWith("http://") || ruta.startsWith("https://")) {
        return ruta;
    }

    if (ruta.startsWith("/")) {
        return ruta;
    }

    return "/" + ruta;
}