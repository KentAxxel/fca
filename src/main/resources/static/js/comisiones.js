let comisiones = [];
let autoridades = [];
let modoComision = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosComisiones();
    await cargarAutoridades();
    await cargarComisiones();
});

function configurarEventosComisiones() {
    const buscador = document.getElementById("buscarComision");
    const form = document.getElementById("formComision");

    if (buscador) {
        buscador.addEventListener("input", filtrarComisiones);
    }

    if (form) {
        form.addEventListener("submit", guardarComision);
    }
}

async function cargarAutoridades() {
    const select = document.getElementById("idautoridad");

    try {
        const response = await fetch("/api/autoridades");

        if (!response.ok) {
            select.innerHTML = `<option value="">No se pudieron cargar autoridades</option>`;
            document.getElementById("totalAutoridades").textContent = "0";
            return;
        }

        autoridades = await response.json();

        llenarSelectAutoridades();
        document.getElementById("totalAutoridades").textContent = autoridades.length;

    } catch (error) {
        select.innerHTML = `<option value="">Error al cargar autoridades</option>`;
        document.getElementById("totalAutoridades").textContent = "0";
    }
}

function llenarSelectAutoridades() {
    const select = document.getElementById("idautoridad");

    select.innerHTML = `<option value="">Seleccione una autoridad</option>`;

    autoridades.forEach(autoridad => {
        select.innerHTML += `
            <option value="${autoridad.idautoridad}">
                ${escapeHtml(autoridad.autoridad ?? "")} - ${escapeHtml(autoridad.cargo ?? "")}
            </option>
        `;
    });
}

async function cargarComisiones() {
    const tabla = document.getElementById("tablaComisiones");

    try {
        const response = await fetch("/api/comisiones");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-row">
                        No se pudieron cargar las comisiones.
                    </td>
                </tr>
            `;
            return;
        }

        comisiones = await response.json();

        renderizarComisiones(comisiones);
        actualizarEstadisticasComisiones();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="empty-row">
                    Error de conexión con el servidor.
                </td>
            </tr>
        `;
    }
}

function renderizarComisiones(lista) {
    const tabla = document.getElementById("tablaComisiones");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="4" class="empty-row">
                    No hay comisiones registradas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(comision => {
        const jefe = obtenerNombreAutoridadComision(comision);

        tabla.innerHTML += `
            <tr>
                <td>
                    <strong class="commission-name">
                        ${escapeHtml(comision.nombrecomision ?? "")}
                    </strong>
                </td>

                <td>
                    ${escapeHtml(recortarTexto(comision.descripcion ?? "", 120))}
                </td>

                <td>
                    <span class="boss-badge">
                        ${escapeHtml(jefe)}
                    </span>
                </td>

                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarComision(${comision.idcomision})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarComision(${comision.idcomision})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasComisiones() {
    const total = comisiones.length;

    const conJefe = comisiones.filter(comision =>
        obtenerIdAutoridadComision(comision) !== ""
    ).length;

    document.getElementById("totalComisiones").textContent = total;
    document.getElementById("totalConJefe").textContent = conJefe;
}

function filtrarComisiones() {
    const filtro = document.getElementById("buscarComision").value.toLowerCase();

    const filtradas = comisiones.filter(comision => {
        const jefe = obtenerNombreAutoridadComision(comision);

        return `
            ${comision.nombrecomision ?? ""}
            ${comision.descripcion ?? ""}
            ${jefe}
        `.toLowerCase().includes(filtro);
    });

    renderizarComisiones(filtradas);
}

async function abrirModalNuevaComision() {
    modoComision = "crear";

    if (!autoridades || autoridades.length === 0) {
        await cargarAutoridades();
    }

    limpiarFormularioComision();

    document.getElementById("modalTituloComision").textContent = "Nueva comisión";
    document.getElementById("modalSubtituloComision").textContent = "Registra una nueva comisión institucional.";
    document.getElementById("btnGuardarComision").textContent = "Crear comisión";

    document.getElementById("modalComision").classList.add("show");
}

async function abrirModalEditarComision(idcomision) {
    if (!autoridades || autoridades.length === 0) {
        await cargarAutoridades();
    }

    const comision = comisiones.find(item => Number(item.idcomision) === Number(idcomision));

    if (!comision) {
        Swal.fire({
            icon: "error",
            title: "Comisión no encontrada",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoComision = "editar";
    limpiarFormularioComision();

    document.getElementById("modalTituloComision").textContent = "Editar comisión";
    document.getElementById("modalSubtituloComision").textContent = "Actualiza la información de la comisión.";
    document.getElementById("btnGuardarComision").textContent = "Guardar cambios";

    document.getElementById("idcomision").value = comision.idcomision;
    document.getElementById("nombrecomision").value = comision.nombrecomision ?? "";
    document.getElementById("descripcion").value = comision.descripcion ?? "";

    const idautoridad = obtenerIdAutoridadComision(comision);
    document.getElementById("idautoridad").value = idautoridad;

    document.getElementById("modalComision").classList.add("show");
}

function cerrarModalComision() {
    document.getElementById("modalComision").classList.remove("show");
}

function limpiarFormularioComision() {
    document.getElementById("formComision").reset();
    document.getElementById("idcomision").value = "";

    llenarSelectAutoridades();
}

async function guardarComision(e) {
    e.preventDefault();

    if (!validarFormularioComision()) {
        return;
    }

    const btn = document.getElementById("btnGuardarComision");
    btn.disabled = true;
    btn.textContent = modoComision === "crear" ? "Creando..." : "Guardando...";

    const comision = construirComisionDesdeFormulario();

    try {
        const response = await fetch("/api/comisiones", {
            method: modoComision === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(comision)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar la comisión.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoComision === "crear" ? "Comisión registrada" : "Comisión actualizada",
            text: modoComision === "crear"
                ? "La comisión fue registrada correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalComision();
        await cargarComisiones();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoComision === "crear" ? "Crear comisión" : "Guardar cambios";
    }
}

function construirComisionDesdeFormulario() {
    const comision = {
        nombrecomision: document.getElementById("nombrecomision").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        idautoridad: Number(document.getElementById("idautoridad").value)
    };

    if (modoComision === "editar") {
        comision.idcomision = Number(document.getElementById("idcomision").value);
    }

    return comision;
}

function validarFormularioComision() {
    const nombrecomision = document.getElementById("nombrecomision").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const idautoridad = document.getElementById("idautoridad").value;

    if (nombrecomision.length < 4) {
        alertaComision("El nombre de la comisión debe tener al menos 4 caracteres.");
        return false;
    }

    if (descripcion.length < 10) {
        alertaComision("La descripción debe tener al menos 10 caracteres.");
        return false;
    }

    if (!idautoridad) {
        alertaComision("Debes seleccionar una autoridad responsable.");
        return false;
    }

    return true;
}

function confirmarEliminarComision(idcomision) {
    const comision = comisiones.find(item => Number(item.idcomision) === Number(idcomision));
    const nombre = comision ? comision.nombrecomision : "esta comisión";

    Swal.fire({
        title: "¿Eliminar comisión?",
        text: `Se eliminará el registro: ${nombre}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarComision(idcomision);
        }
    });
}

async function eliminarComision(idcomision) {
    try {
        const response = await fetch(`/api/comisiones/${idcomision}`, {
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
                text: mensaje || "Ocurrió un error al eliminar la comisión.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Comisión eliminada",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarComisiones();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function obtenerIdAutoridadComision(comision) {
    if (!comision) {
        return "";
    }

    if (comision.idautoridad == null) {
        return "";
    }

    if (typeof comision.idautoridad === "number") {
        return comision.idautoridad;
    }

    return comision.idautoridad.idautoridad
        ?? comision.idautoridad.id
        ?? "";
}

function obtenerNombreAutoridadComision(comision) {
    if (!comision || !comision.idautoridad) {
        return "Sin jefe asignado";
    }

    if (typeof comision.idautoridad === "object") {
        return comision.idautoridad.autoridad
            ?? comision.idautoridad.nombre
            ?? "Sin jefe asignado";
    }

    const autoridad = autoridades.find(a =>
        Number(a.idautoridad) === Number(comision.idautoridad)
    );

    return autoridad ? autoridad.autoridad : "Sin jefe asignado";
}

function alertaComision(mensaje) {
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