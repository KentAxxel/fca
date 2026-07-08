let empresas = [];
let modoEmpresa = "crear";

const csrfToken = document.querySelector('meta[name="_csrf"]').getAttribute("content");
const csrfHeader = document.querySelector('meta[name="_csrf_header"]').getAttribute("content");

document.addEventListener("DOMContentLoaded", async () => {
    configurarEventosEmpresas();
    await cargarEmpresas();
});

function configurarEventosEmpresas() {
    const buscador = document.getElementById("buscarEmpresa");
    const form = document.getElementById("formEmpresa");
    const logoArchivo = document.getElementById("logoArchivo");

    if (buscador) {
        buscador.addEventListener("input", filtrarEmpresas);
    }

    if (form) {
        form.addEventListener("submit", guardarEmpresa);
    }

    if (logoArchivo) {
        logoArchivo.addEventListener("change", previewLogoSeleccionado);
    }
}

async function cargarEmpresas() {
    const tabla = document.getElementById("tablaEmpresas");

    try {
        const response = await fetch("/api/empresas");

        if (!response.ok) {
            tabla.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-row">
                        No se pudieron cargar las empresas.
                    </td>
                </tr>
            `;
            return;
        }

        empresas = await response.json();

        renderizarEmpresas(empresas);
        actualizarEstadisticasEmpresas();

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

function renderizarEmpresas(lista) {
    const tabla = document.getElementById("tablaEmpresas");

    if (!lista.length) {
        tabla.innerHTML = `
            <tr>
                <td colspan="8" class="empty-row">
                    No hay empresas registradas.
                </td>
            </tr>
        `;
        return;
    }

    tabla.innerHTML = "";

    lista.forEach(empresa => {
        const logo = obtenerLogo(empresa.logo);

        tabla.innerHTML += `
            <tr>
                <td>
                    <img src="${escapeHtml(logo)}"
                         class="company-logo"
                         alt="Logo empresa"
                         onerror="this.src='/images/default-company.png'">
                </td>

                <td>
                    <strong class="company-name">
                        ${escapeHtml(empresa.nombreempresa ?? "")}
                    </strong>
                </td>

                <td>${escapeHtml(empresa.ruc ?? "")}</td>
                <td>${escapeHtml(empresa.correo ?? "")}</td>
                <td>${escapeHtml(empresa.telefono ?? "")}</td>
                <td>
                    <span class="rubro-badge">
                        ${escapeHtml(empresa.rubro ?? "Sin rubro")}
                    </span>
                </td>
                <td>${escapeHtml(recortarTexto(empresa.direccion ?? "", 70))}</td>

                <td>
                    <div class="actions">
                        <button class="btn-icon btn-edit"
                                onclick="abrirModalEditarEmpresa(${empresa.idempresa})">
                            Editar
                        </button>

                        <button class="btn-icon btn-delete"
                                onclick="confirmarEliminarEmpresa(${empresa.idempresa})">
                            Eliminar
                        </button>
                    </div>
                </td>
            </tr>
        `;
    });
}

function actualizarEstadisticasEmpresas() {
    const total = empresas.length;

    const conLogo = empresas.filter(empresa =>
        empresa.logo && empresa.logo.trim() !== ""
    ).length;

    const rubros = new Set(
        empresas
            .filter(empresa => empresa.rubro && empresa.rubro.trim() !== "")
            .map(empresa => empresa.rubro.trim().toLowerCase())
    ).size;

    document.getElementById("totalEmpresas").textContent = total;
    document.getElementById("totalConLogo").textContent = conLogo;
    document.getElementById("totalRubros").textContent = rubros;
}

function filtrarEmpresas() {
    const filtro = document.getElementById("buscarEmpresa").value.toLowerCase();

    const filtradas = empresas.filter(empresa => {
        return `
            ${empresa.nombreempresa ?? ""}
            ${empresa.ruc ?? ""}
            ${empresa.correo ?? ""}
            ${empresa.direccion ?? ""}
            ${empresa.telefono ?? ""}
            ${empresa.rubro ?? ""}
        `.toLowerCase().includes(filtro);
    });

    renderizarEmpresas(filtradas);
}

function abrirModalNuevaEmpresa() {
    modoEmpresa = "crear";
    limpiarFormularioEmpresa();

    document.getElementById("modalTituloEmpresa").textContent = "Nueva empresa";
    document.getElementById("modalSubtituloEmpresa").textContent = "Registra una nueva empresa vinculada.";
    document.getElementById("btnGuardarEmpresa").textContent = "Crear empresa";

    document.getElementById("modalEmpresa").classList.add("show");
}

function abrirModalEditarEmpresa(idempresa) {
    const empresa = empresas.find(item => Number(item.idempresa) === Number(idempresa));

    if (!empresa) {
        Swal.fire({
            icon: "error",
            title: "Empresa no encontrada",
            text: "No se pudo encontrar el registro seleccionado.",
            confirmButtonColor: "#0b7a36"
        });
        return;
    }

    modoEmpresa = "editar";
    limpiarFormularioEmpresa();

    document.getElementById("modalTituloEmpresa").textContent = "Editar empresa";
    document.getElementById("modalSubtituloEmpresa").textContent = "Actualiza la información de la empresa.";
    document.getElementById("btnGuardarEmpresa").textContent = "Guardar cambios";

    document.getElementById("idempresa").value = empresa.idempresa;
    document.getElementById("nombreempresa").value = empresa.nombreempresa ?? "";
    document.getElementById("ruc").value = empresa.ruc ?? "";
    document.getElementById("correo").value = empresa.correo ?? "";
    document.getElementById("direccion").value = empresa.direccion ?? "";
    document.getElementById("telefono").value = empresa.telefono ?? "";
    document.getElementById("rubro").value = empresa.rubro ?? "";
    document.getElementById("logo").value = empresa.logo ?? "";
    document.getElementById("logoArchivo").value = "";
    document.getElementById("previewLogoEmpresa").src = obtenerLogo(empresa.logo);

    document.getElementById("modalEmpresa").classList.add("show");
}

function cerrarModalEmpresa() {
    document.getElementById("modalEmpresa").classList.remove("show");
}

function limpiarFormularioEmpresa() {
    document.getElementById("formEmpresa").reset();
    document.getElementById("idempresa").value = "";
    document.getElementById("logo").value = "";
    document.getElementById("logoArchivo").value = "";
    document.getElementById("previewLogoEmpresa").src = "/images/default-company.png";
}

async function guardarEmpresa(e) {
    e.preventDefault();

    if (!validarFormularioEmpresa()) {
        return;
    }

    const btn = document.getElementById("btnGuardarEmpresa");
    btn.disabled = true;
    btn.textContent = modoEmpresa === "crear" ? "Creando..." : "Guardando...";

    try {
        const rutaLogo = await subirLogoSiExiste();

        const empresa = construirEmpresaDesdeFormulario();
        empresa.logo = rutaLogo;

        const response = await fetch("/api/empresas", {
            method: modoEmpresa === "crear" ? "POST" : "PUT",
            headers: {
                "Content-Type": "application/json",
                [csrfHeader]: csrfToken
            },
            body: JSON.stringify(empresa)
        });

        if (!response.ok) {
            const mensaje = await response.text();

            Swal.fire({
                icon: "error",
                title: "No se pudo guardar",
                text: mensaje || "Ocurrió un error al guardar la empresa.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: modoEmpresa === "crear" ? "Empresa registrada" : "Empresa actualizada",
            text: modoEmpresa === "crear"
                ? "La empresa fue registrada correctamente."
                : "Los cambios fueron guardados correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        cerrarModalEmpresa();
        await cargarEmpresas();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo completar la operación.",
            confirmButtonColor: "#0b7a36"
        });
    } finally {
        btn.disabled = false;
        btn.textContent = modoEmpresa === "crear" ? "Crear empresa" : "Guardar cambios";
    }
}

function construirEmpresaDesdeFormulario() {
    const empresa = {
        nombreempresa: document.getElementById("nombreempresa").value.trim(),
        ruc: document.getElementById("ruc").value.trim(),
        correo: document.getElementById("correo").value.trim(),
        direccion: document.getElementById("direccion").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        rubro: document.getElementById("rubro").value.trim(),
        logo: document.getElementById("logo").value.trim()
    };

    if (modoEmpresa === "editar") {
        empresa.idempresa = Number(document.getElementById("idempresa").value);
    }

    return empresa;
}

function validarFormularioEmpresa() {
    const nombreempresa = document.getElementById("nombreempresa").value.trim();
    const ruc = document.getElementById("ruc").value.trim();
    const correo = document.getElementById("correo").value.trim();
    const direccion = document.getElementById("direccion").value.trim();
    const telefono = document.getElementById("telefono").value.trim();
    const rubro = document.getElementById("rubro").value.trim();

    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (nombreempresa.length < 3) {
        alertaEmpresa("El nombre de la empresa debe tener al menos 3 caracteres.");
        return false;
    }

    if (!/^\d{11}$/.test(ruc)) {
        alertaEmpresa("El RUC debe tener exactamente 11 números.");
        return false;
    }

    if (!regexCorreo.test(correo)) {
        alertaEmpresa("Ingresa un correo electrónico válido.");
        return false;
    }

    if (direccion.length < 5) {
        alertaEmpresa("La dirección debe tener al menos 5 caracteres.");
        return false;
    }

    if (!/^\d{9}$/.test(telefono)) {
        alertaEmpresa("El teléfono debe tener exactamente 9 números.");
        return false;
    }

    if (rubro.length < 3) {
        alertaEmpresa("El rubro debe tener al menos 3 caracteres.");
        return false;
    }

    return true;
}

function previewLogoSeleccionado() {
    const archivo = document.getElementById("logoArchivo").files[0];
    const preview = document.getElementById("previewLogoEmpresa");

    if (!archivo) {
        preview.src = obtenerLogo(document.getElementById("logo").value);
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

        document.getElementById("logoArchivo").value = "";
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

        document.getElementById("logoArchivo").value = "";
        return;
    }

    preview.src = URL.createObjectURL(archivo);
}

async function subirLogoSiExiste() {
    const archivo = document.getElementById("logoArchivo").files[0];

    if (!archivo) {
        return document.getElementById("logo").value.trim();
    }

    const formData = new FormData();
    formData.append("logo", archivo);

    const response = await fetch("/api/empresas/subir-logo", {
        method: "POST",
        headers: {
            [csrfHeader]: csrfToken
        },
        body: formData
    });

    if (!response.ok) {
        const mensaje = await response.text();
        throw new Error(mensaje || "No se pudo subir el logo");
    }

    return await response.text();
}

function confirmarEliminarEmpresa(idempresa) {
    const empresa = empresas.find(item => Number(item.idempresa) === Number(idempresa));
    const nombre = empresa ? empresa.nombreempresa : "esta empresa";

    Swal.fire({
        title: "¿Eliminar empresa?",
        text: `Se eliminará el registro: ${nombre}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#0b7a36",
        cancelButtonColor: "#151515",
        confirmButtonText: "Sí, eliminar",
        cancelButtonText: "Cancelar"
    }).then(result => {
        if (result.isConfirmed) {
            eliminarEmpresa(idempresa);
        }
    });
}

async function eliminarEmpresa(idempresa) {
    try {
        const response = await fetch(`/api/empresas/${idempresa}`, {
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
                text: mensaje || "Ocurrió un error al eliminar la empresa.",
                confirmButtonColor: "#0b7a36"
            });

            return;
        }

        await Swal.fire({
            icon: "success",
            title: "Empresa eliminada",
            text: "El registro fue eliminado correctamente.",
            confirmButtonColor: "#0b7a36"
        });

        await cargarEmpresas();

    } catch (error) {
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo conectar con el servidor.",
            confirmButtonColor: "#0b7a36"
        });
    }
}

function obtenerLogo(logo) {
    if (!logo || logo.trim() === "") {
        return "/images/default-company.png";
    }

    return logo;
}

function alertaEmpresa(mensaje) {
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

const foto = obtenerImagen(empresa.foto, "/images/default-user.png");