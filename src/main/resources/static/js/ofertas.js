let ofertas = [];
let empresas = [];
let modoOferta = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosOfertas();
    await cargarEmpresas();
    await cargarOfertas();
});

function configurarEventosOfertas() {
    const buscador = document.getElementById("buscarOferta");
    const form = document.getElementById("formOferta");

    if (buscador) {
        buscador.addEventListener("input", filtrarOfertas);
    }

    if (form) {
        form.addEventListener("submit", guardarOferta);
    }
}

async function cargarEmpresas() {
    const select = document.getElementById("idempresa");

    try {
        const response = await fetch("/api/empresas");

        if (!response.ok) {
            select.innerHTML = `<option value="">No se pudieron cargar empresas</option>`;
            document.getElementById("totalEmpresas").textContent = "0";
            return;
        }

        empresas = await response.json();

        llenarSelectEmpresas();
        document.getElementById("totalEmpresas").textContent = empresas.length;

    } catch (error) {
        select.innerHTML = `<option value="">Error al cargar empresas</option>`;
        document.getElementById("totalEmpresas").textContent = "0";
    }
}

function llenarSelectEmpresas() {
    const select = document.getElementById("idempresa");

    select.innerHTML = `<option value="">Seleccione una empresa</option>`;

    empresas.forEach(empresa => {
        select.innerHTML += `
            <option value="${empresa.idempresa}">
                ${escapeHtml(empresa.nombreempresa ?? "")}
            </option>
        `;
    });
}

async function cargarOfertas() {
    const tabla = document.getElementById("tablaOfertas");

    try {
        const response = await fetch("/api/ofertas");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">
                        No se pudieron cargar las ofertas laborales.
                    </td>
                </tr>
            `;
            return;
        }

        ofertas = await response.json();

        renderizarOfertas(ofertas);
        actualizarEstadisticasOfertas();

    } catch (error) {
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    Error de conexión con el servidor.
                </td>
            </tr>
        `;
    }
}

function renderizarOfertas(lista) {
    const tabla = document.getElementById("tablaOfertas");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    No hay ofertas laborales registradas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(oferta => {
        const empresa = obtenerNombreEmpresaOferta(oferta);
        const estado = oferta.estado ?? "SIN ESTADO";

        tabla.innerHTML += `
            <tr>
                <td>
                    <strong class="offer-title">
                        ${escapeHtml(oferta.titulo ?? "")}
                    </strong>
                    <p class="offer-description">
                        ${escapeHtml(recortarTexto(oferta.descripcion ?? "", 75))}
                    </p>
                </td>

                <td>${escapeHtml(empresa)}</td>

                <td>
                    <span class="mode-badge">
                        ${escapeHtml(oferta.modalidad ?? "")}
                    </span>
                </td>

                <td>${escapeHtml(oferta.vacantes ?? "")}</td>

                <td>${escapeHtml(formatearSalario(oferta.salario))}</td>

                <td>
                    <span class="${claseEstado(estado)}">
                        ${escapeHtml(estado)}
                    </span>
                </td>

                <td>${escapeHtml(formatearFecha(oferta.fechalimite))}</td>

                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarOferta(${oferta.idoferta})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarOferta(${oferta.idoferta})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasOfertas() {
    const total = ofertas.length;

    const activas = ofertas.filter(oferta =>
        String(oferta.estado ?? "").toUpperCase() === "ACTIVO"
    ).length;

    document.getElementById("totalOfertas").textContent = total;
    document.getElementById("totalActivas").textContent = activas;
}

function filtrarOfertas() {
    const filtro = document.getElementById("buscarOferta").value.toLowerCase();

    const filtradas = ofertas.filter(oferta => {
        const empresa = obtenerNombreEmpresaOferta(oferta);

        return `
            ${oferta.titulo ?? ""}
            ${oferta.descripcion ?? ""}
            ${oferta.modalidad ?? ""}
            ${oferta.estado ?? ""}
            ${oferta.ubicacion ?? ""}
            ${empresa}
        `.toLowerCase().includes(filtro);
    });

    renderizarOfertas(filtradas);
}

async function abrirModalNuevaOferta() {
    modoOferta = "crear";

    if (!empresas || empresas.length === 0) {
        await cargarEmpresas();
    }

    limpiarFormularioOferta();

    document.getElementById("modalTituloOferta").textContent = "Nueva oferta laboral";
    document.getElementById("modalSubtituloOferta").textContent = "Registra una nueva oportunidad laboral.";
    document.getElementById("btnGuardarOferta").textContent = "Crear oferta";

    document.getElementById("estado").value = "ACTIVO";
    document.getElementById("fechaPublicacion").value = fechaHoy();

    document.getElementById("modalOferta").classList.add("show");
}

async function abrirModalEditarOferta(idoferta) {
    if (!empresas || empresas.length === 0) {
        await cargarEmpresas();
    }

    const oferta = ofertas.find(item => Number(item.idoferta) === Number(idoferta));

    if (!oferta) {
        Swal.fire({
            icon: "error",
            title: "Oferta no encontrada",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoOferta = "editar";
    limpiarFormularioOferta();

    document.getElementById("modalTituloOferta").textContent = "Editar oferta laboral";
    document.getElementById("modalSubtituloOferta").textContent = "Actualiza la información de la oferta.";
    document.getElementById("btnGuardarOferta").textContent = "Guardar cambios";

    document.getElementById("idoferta").value = oferta.idoferta;
    document.getElementById("titulo").value = oferta.titulo ?? "";
    document.getElementById("descripcion").value = oferta.descripcion ?? "";
    document.getElementById("modalidad").value = oferta.modalidad ?? "";
    document.getElementById("fechaPublicacion").value = normalizarFechaInput(oferta.fechaPublicacion);
    document.getElementById("fechalimite").value = normalizarFechaInput(oferta.fechalimite);
    document.getElementById("vacantes").value = oferta.vacantes ?? "";
    document.getElementById("salario").value = oferta.salario ?? "";
    document.getElementById("estado").value = oferta.estado ?? "";
    document.getElementById("ubicacion").value = oferta.ubicacion ?? "";

    const idempresa = obtenerIdEmpresaOferta(oferta);
    document.getElementById("idempresa").value = idempresa;

    document.getElementById("modalOferta").classList.add("show");
}

function cerrarModalOferta() {
    document.getElementById("modalOferta").classList.remove("show");
}

function limpiarFormularioOferta() {
    document.getElementById("formOferta").reset();
    document.getElementById("idoferta").value = "";

    llenarSelectEmpresas();
}

async function guardarOferta(e) {
    e.preventDefault();

    if (!validarFormularioOferta()) {
        return;
    }

    const btn = document.getElementById("btnGuardarOferta");
    btn.disabled = true;
    btn.textContent = modoOferta === "crear" ? "Creando..." : "Guardando...";

    const oferta = construirOfertaDesdeFormulario();

    try {
        const response = await fetch("/api/ofertas", {
            method: modoOferta === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(oferta)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar la oferta laboral.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoOferta === "crear" ? "Oferta registrada" : "Oferta actualizada",
            text: modoOferta === "crear"
                ? "La oferta laboral fue registrada correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalOferta();
        await cargarOfertas();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoOferta === "crear" ? "Crear oferta" : "Guardar cambios";
    }
}

function construirOfertaDesdeFormulario() {
    const oferta = {
        titulo: document.getElementById("titulo").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        modalidad: document.getElementById("modalidad").value,
        fechaPublicacion: document.getElementById("fechaPublicacion").value,
        fechalimite: document.getElementById("fechalimite").value,
        vacantes: Number(document.getElementById("vacantes").value),
        salario: Number(document.getElementById("salario").value),
        estado: document.getElementById("estado").value,
        ubicacion: document.getElementById("ubicacion").value.trim(),
        idempresa: Number(document.getElementById("idempresa").value)
    };

    if (modoOferta === "editar") {
        oferta.idoferta = Number(document.getElementById("idoferta").value);
    }

    return oferta;
}

function validarFormularioOferta() {
    const titulo = document.getElementById("titulo").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const idempresa = document.getElementById("idempresa").value;
    const modalidad = document.getElementById("modalidad").value;
    const fechaPublicacion = document.getElementById("fechaPublicacion").value;
    const fechalimite = document.getElementById("fechalimite").value;
    const vacantes = Number(document.getElementById("vacantes").value);
    const salario = Number(document.getElementById("salario").value);
    const estado = document.getElementById("estado").value;
    const ubicacion = document.getElementById("ubicacion").value.trim();

    if (titulo.length < 5) {
        alertaOferta("El título debe tener al menos 5 caracteres.");
        return false;
    }

    if (descripcion.length < 10) {
        alertaOferta("La descripción debe tener al menos 10 caracteres.");
        return false;
    }

    if (!idempresa) {
        alertaOferta("Debes seleccionar una empresa.");
        return false;
    }

    if (!modalidad) {
        alertaOferta("Debes seleccionar una modalidad.");
        return false;
    }

    if (!fechaPublicacion) {
        alertaOferta("La fecha de publicación es obligatoria.");
        return false;
    }

    if (!fechalimite) {
        alertaOferta("La fecha límite es obligatoria.");
        return false;
    }

    if (fechalimite < fechaPublicacion) {
        alertaOferta("La fecha límite no puede ser menor que la fecha de publicación.");
        return false;
    }

    if (!vacantes || vacantes < 1) {
        alertaOferta("Las vacantes deben ser mayor o igual a 1.");
        return false;
    }

    if (salario < 0) {
        alertaOferta("El salario no puede ser negativo.");
        return false;
    }

    if (!estado) {
        alertaOferta("Debes seleccionar un estado.");
        return false;
    }

    if (ubicacion.length < 3) {
        alertaOferta("La ubicación debe tener al menos 3 caracteres.");
        return false;
    }

    return true;
}

function confirmarEliminarOferta(idoferta) {
    const oferta = ofertas.find(item => Number(item.idoferta) === Number(idoferta));
    const titulo = oferta ? oferta.titulo : "esta oferta";

    Swal.fire({
        title: "¿Eliminar oferta laboral?",
        text: `Se eliminará el registro: ${titulo}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarOferta(idoferta);
        }
    });
}

async function eliminarOferta(idoferta) {
    try {
        const response = await fetch(`/api/ofertas/${idoferta}`, {
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
                text: mensaje || "Ocurrió un error al eliminar la oferta laboral.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Oferta eliminada",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarOfertas();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function obtenerIdEmpresaOferta(oferta) {
    if (!oferta || oferta.idempresa == null) {
        return "";
    }

    if (typeof oferta.idempresa === "number") {
        return oferta.idempresa;
    }

    return oferta.idempresa.idempresa
        ?? oferta.idempresa.id
        ?? "";
}

function obtenerNombreEmpresaOferta(oferta) {
    if (!oferta || !oferta.idempresa) {
        return "Sin empresa";
    }

    if (typeof oferta.idempresa === "object") {
        return oferta.idempresa.nombreempresa
            ?? oferta.idempresa.nombre
            ?? "Sin empresa";
    }

    const empresa = empresas.find(e =>
        Number(e.idempresa) === Number(oferta.idempresa)
    );

    return empresa ? empresa.nombreempresa : "Sin empresa";
}

function claseEstado(estado) {
    const valor = String(estado ?? "").toUpperCase();

    if (valor === "ACTIVO") {
        return "status-badge active";
    }

    if (valor === "CERRADO") {
        return "status-badge closed";
    }

    return "status-badge inactive";
}

function formatearSalario(salario) {
    if (salario === null || salario === undefined || salario === "") {
        return "No especificado";
    }

    return `S/ ${Number(salario).toFixed(2)}`;
}

function alertaOferta(mensaje) {
    Swal.fire({
        icon: "error",
        title: "Validación incorrecta",
        text: mensaje,
        confirmButtonColor: "#0b7a36"
    });
}

function fechaHoy() {
    return new Date().toISOString().substring(0, 10);
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