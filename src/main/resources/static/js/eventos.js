let eventos = [];
let modoEvento = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventos();
    await cargarEventos();
});

function configurarEventos() {
    const buscador = document.getElementById("buscarEvento");
    const form = document.getElementById("formEvento");

    if (buscador) {
        buscador.addEventListener("input", filtrarEventos);
    }

    if (form) {
        form.addEventListener("submit", guardarEvento);
    }
}

async function cargarEventos() {
    const tabla = document.getElementById("tablaEventos");

    try {
        const response = await fetch("/api/eventos");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-row">No se pudieron cargar los eventos.</td>
                </tr>
            `;
            return;
        }

        eventos = await response.json();

        renderizarEventos(eventos);
        actualizarEstadisticasEventos();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">Error de conexión con el servidor.</td>
            </tr>
        `;
    }
}

function renderizarEventos(lista) {
    const tabla = document.getElementById("tablaEventos");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="7" class="empty-row">No hay eventos registrados.</td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(evento => {
        tabla.innerHTML += `
            <tr>
                <td>${escapeHtml(evento.titulo ?? "")}</td>
                <td>${escapeHtml(recortarTexto(evento.descripcion ?? "", 80))}</td>
                <td>${escapeHtml(formatearFecha(evento.fecha))}</td>
                <td>${escapeHtml(formatearHora(evento.hora))}</td>
                <td>${escapeHtml(evento.lugar ?? "")}</td>
                <td>${escapeHtml(evento.organizador ?? "")}</td>
                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarEvento(${evento.idevento})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarEvento(${evento.idevento})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasEventos() {
    const total = eventos.length;

    const organizadores = new Set(
        eventos
            .filter(e => e.organizador && e.organizador.trim() !== "")
            .map(e => e.organizador.trim().toLowerCase())
    ).size;

    const lugares = new Set(
        eventos
            .filter(e => e.lugar && e.lugar.trim() !== "")
            .map(e => e.lugar.trim().toLowerCase())
    ).size;

    document.getElementById("totalEventos").textContent = total;
    document.getElementById("totalOrganizadoresEventos").textContent = organizadores;
    document.getElementById("totalLugaresEventos").textContent = lugares;
}

function filtrarEventos() {
    const filtro = document.getElementById("buscarEvento").value.toLowerCase();

    const filtrados = eventos.filter(evento => {
        return `
            ${evento.titulo ?? ""}
            ${evento.descripcion ?? ""}
            ${evento.fecha ?? ""}
            ${evento.hora ?? ""}
            ${evento.lugar ?? ""}
            ${evento.organizador ?? ""}
        `.toLowerCase().includes(filtro);
    });

    renderizarEventos(filtrados);
}

function abrirModalNuevoEvento() {
    modoEvento = "crear";
    limpiarFormularioEvento();

    document.getElementById("modalTituloEvento").textContent = "Nuevo evento";
    document.getElementById("modalSubtituloEvento").textContent = "Registra un nuevo evento institucional.";
    document.getElementById("btnGuardarEvento").textContent = "Crear evento";

    document.getElementById("modalEvento").classList.add("show");
}

function abrirModalEditarEvento(idevento) {
    const evento = eventos.find(e => Number(e.idevento) === Number(idevento));

    if (!evento) {
        Swal.fire({
            icon: "error",
            title: "Evento no encontrado",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoEvento = "editar";
    limpiarFormularioEvento();

    document.getElementById("modalTituloEvento").textContent = "Editar evento";
    document.getElementById("modalSubtituloEvento").textContent = "Actualiza la información del evento.";
    document.getElementById("btnGuardarEvento").textContent = "Guardar cambios";

    document.getElementById("idevento").value = evento.idevento;
    document.getElementById("titulo").value = evento.titulo ?? "";
    document.getElementById("descripcion").value = evento.descripcion ?? "";
    document.getElementById("fecha").value = normalizarFechaInput(evento.fecha);
    document.getElementById("hora").value = normalizarHoraInput(evento.hora);
    document.getElementById("lugar").value = evento.lugar ?? "";
    document.getElementById("organizador").value = evento.organizador ?? "";

    document.getElementById("modalEvento").classList.add("show");
}

function cerrarModalEvento() {
    document.getElementById("modalEvento").classList.remove("show");
}

function limpiarFormularioEvento() {
    document.getElementById("formEvento").reset();
    document.getElementById("idevento").value = "";
}

async function guardarEvento(e) {
    e.preventDefault();

    if (!validarFormularioEvento()) {
        return;
    }

    const btn = document.getElementById("btnGuardarEvento");
    btn.disabled = true;
    btn.textContent = modoEvento === "crear" ? "Creando..." : "Guardando...";

    const evento = construirEventoDesdeFormulario();

    try {
        const response = await fetch("/api/eventos", {
            method: modoEvento === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(evento)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar el evento.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoEvento === "crear" ? "Evento registrado" : "Evento actualizado",
            text: modoEvento === "crear"
                ? "El evento fue registrado correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalEvento();
        await cargarEventos();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoEvento === "crear" ? "Crear evento" : "Guardar cambios";
    }
}

function construirEventoDesdeFormulario() {
    const evento = {
        titulo: document.getElementById("titulo").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        fecha: document.getElementById("fecha").value,
        hora: document.getElementById("hora").value,
        lugar: document.getElementById("lugar").value.trim(),
        organizador: document.getElementById("organizador").value.trim()
    };

    if (modoEvento === "editar") {
        evento.idevento = Number(document.getElementById("idevento").value);
    }

    return evento;
}

function validarFormularioEvento() {
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const fecha = document.getElementById("fecha").value;
    const hora = document.getElementById("hora").value;
    const lugar = document.getElementById("lugar").value.trim();
    const organizador = document.getElementById("organizador").value.trim();

    if (titulo.length < 5) {
        alertaEvento("El título debe tener al menos 5 caracteres.");
        return false;
    }

    if (descripcion.length < 10) {
        alertaEvento("La descripción debe tener al menos 10 caracteres.");
        return false;
    }

    if (!fecha) {
        alertaEvento("La fecha es obligatoria.");
        return false;
    }

    if (!hora) {
        alertaEvento("La hora es obligatoria.");
        return false;
    }

    if (lugar.length < 3) {
        alertaEvento("El lugar debe tener al menos 3 caracteres.");
        return false;
    }

    if (organizador.length < 3) {
        alertaEvento("El organizador debe tener al menos 3 caracteres.");
        return false;
    }

    return true;
}

function confirmarEliminarEvento(idevento) {
    const evento = eventos.find(e => Number(e.idevento) === Number(idevento));
    const titulo = evento ? evento.titulo : "este evento";

    Swal.fire({
        title: "¿Eliminar evento?",
        text: `Se eliminará el registro: ${titulo}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarEvento(idevento);
        }
    });
}

async function eliminarEvento(idevento) {
    try {
        const response = await fetch(`/api/eventos/${idevento}`, {
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
                text: mensaje || "Ocurrió un error al eliminar el evento.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Evento eliminado",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarEventos();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function alertaEvento(mensaje) {
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

function formatearHora(hora) {
    if (!hora) {
        return "";
    }

    return String(hora).substring(0, 5);
}

function normalizarHoraInput(hora) {
    if (!hora) {
        return "";
    }

    return String(hora).substring(0, 5);
}

function escapeHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}