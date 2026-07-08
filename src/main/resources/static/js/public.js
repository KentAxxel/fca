let data = [];
let autoridadesData = [];
let empresasData = [];

document.addEventListener("DOMContentLoaded", async () => {
    configurarModal();

    const module = document.body.dataset.module;
    await cargarRelaciones(module);
    await cargarModulo(module);
});

async function cargarRelaciones(module) {
    if (module === "comisiones") {
        autoridadesData = await obtenerDatosSeguro("/api/autoridades");
    }

    if (module === "bolsa-laboral") {
        empresasData = await obtenerDatosSeguro("/api/empresas");
    }
}

async function cargarModulo(module) {
    const config = obtenerConfig(module);

    if (!config) {
        return;
    }

    document.getElementById("publicTitle").textContent = config.title;
    document.getElementById("publicLabel").textContent = config.label;
    document.getElementById("publicDescription").textContent = config.description;
    document.getElementById("publicSearch").placeholder = config.placeholder;

    try {
        data = await obtenerDatos(config.endpoint);

        renderizarModulo(module, data);
        configurarBuscador(module);

    } catch (error) {
        document.getElementById("publicListContainer").innerHTML = mensajeVacio("No se pudieron cargar los registros.");
    }
}

function obtenerConfig(module) {
    const configs = {
        "autoridades": {
            endpoint: "/api/autoridades",
            title: "Autoridades",
            label: "Gestión institucional",
            description: "Conoce a las autoridades que lideran la Facultad de Ciencias Agrarias.",
            placeholder: "Buscar por nombre, cargo o correo..."
        },
        "noticias": {
            endpoint: "/api/noticias",
            title: "Noticias",
            label: "Actualidad institucional",
            description: "Revisa todas las noticias publicadas por la Facultad de Ciencias Agrarias.",
            placeholder: "Buscar por título, resumen, contenido, autor o fecha..."
        },
        "eventos": {
            endpoint: "/api/eventos",
            title: "Eventos",
            label: "Agenda institucional",
            description: "Consulta todos los eventos, actividades y acontecimientos de la facultad.",
            placeholder: "Buscar por título, lugar, organizador o fecha..."
        },
        "laboratorios": {
            endpoint: "/api/laboratorios",
            title: "Laboratorios",
            label: "Infraestructura académica",
            description: "Conoce los laboratorios disponibles para formación, investigación y práctica.",
            placeholder: "Buscar por nombre, descripción o ubicación..."
        },
        "comisiones": {
            endpoint: "/api/comisiones",
            title: "Comisiones",
            label: "Organización institucional",
            description: "Consulta las comisiones de la facultad y sus autoridades responsables.",
            placeholder: "Buscar por nombre, descripción o jefe de comisión..."
        },
        "bolsa-laboral": {
            endpoint: "/api/ofertas",
            title: "Bolsa laboral",
            label: "Oportunidades profesionales",
            description: "Revisa ofertas laborales, prácticas y convocatorias para estudiantes y egresados.",
            placeholder: "Buscar por título, empresa, modalidad, ubicación o estado..."
        },
        "empresas": {
            endpoint: "/api/empresas",
            title: "Empresas vinculadas",
            label: "Aliados estratégicos",
            description: "Conoce las empresas vinculadas con la Facultad de Ciencias Agrarias.",
            placeholder: "Buscar por empresa, RUC, rubro, correo o dirección..."
        }
    };

    return configs[module];
}

async function obtenerDatos(url) {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Error al cargar datos");
    }

    return await response.json();
}

async function obtenerDatosSeguro(url) {
    try {
        return await obtenerDatos(url);
    } catch {
        return [];
    }
}

function configurarBuscador(module) {
    const input = document.getElementById("publicSearch");

    input.addEventListener("input", () => {
        const filtro = input.value.toLowerCase();

        const filtrados = data.filter(item => obtenerTextoBusqueda(module, item).toLowerCase().includes(filtro));

        renderizarModulo(module, filtrados);
    });
}

function renderizarModulo(module, lista) {
    const container = document.getElementById("publicListContainer");
    const counter = document.getElementById("publicCounter");

    counter.textContent = `${lista.length} registro(s)`;

    if (!lista.length) {
        container.className = "public-grid";
        container.innerHTML = mensajeVacio("No hay registros para mostrar.");
        return;
    }

    if (module === "eventos" || module === "bolsa-laboral") {
        container.className = "public-list";
    } else if (module === "autoridades" || module === "comisiones" || module === "empresas") {
        container.className = "public-grid four";
    } else {
        container.className = "public-grid";
    }

    const renderers = {
        "autoridades": renderAutoridad,
        "noticias": renderNoticia,
        "eventos": renderEvento,
        "laboratorios": renderLaboratorio,
        "comisiones": renderComision,
        "bolsa-laboral": renderOferta,
        "empresas": renderEmpresa
    };

    container.innerHTML = lista.map(item => renderers[module](item)).join("");
}

/* RENDER CARDS */

function renderAutoridad(item) {
    return `
        <article class="public-card authority-card" onclick="modalAutoridad(${item.idautoridad})">
            <img src="${escapeHtml(obtenerImagen(item.foto, "/images/default-user.png"))}"
                 onerror="this.onerror=null; this.src='/images/default-user.png';"
                 alt="Autoridad">

            <div class="card-body">
                <h3>${escapeHtml(item.autoridad ?? "")}</h3>
                <p>${escapeHtml(item.cargo ?? "")}</p>
                <span>${escapeHtml(item.correo ?? "")}</span>
            </div>
        </article>
    `;
}

function renderNoticia(item) {
    return `
        <article class="public-card" onclick="modalNoticia(${item.idnoticia})">
            <img src="${escapeHtml(obtenerImagen(item.imagen, "/images/default-news.png"))}"
                 onerror="this.onerror=null; this.src='/images/default-news.png';"
                 alt="Noticia">

            <div class="card-body">
                <span>${escapeHtml(formatearFecha(item.fecha))}</span>
                <h3>${escapeHtml(item.titulo ?? "")}</h3>
                <p>${escapeHtml(recortarTexto(item.resumen ?? item.contenido ?? "", 130))}</p>
                <small>${escapeHtml(item.autor ?? "")}</small>
            </div>
        </article>
    `;
}

function renderEvento(item) {
    return `
        <article class="event-card" onclick="modalEvento(${item.idevento})">
            <div class="event-card-header">
                <div>
                    <span class="badge">${escapeHtml(formatearFecha(item.fecha))}</span>
                    <h3>${escapeHtml(item.titulo ?? "")}</h3>
                </div>
                <span class="badge dark">${escapeHtml(formatearHora(item.hora))}</span>
            </div>

            <p>${escapeHtml(recortarTexto(item.descripcion ?? "", 180))}</p>

            <div class="meta-list">
                <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.lugar ?? "")}</span>
                <span><i class="fa-solid fa-user"></i> ${escapeHtml(item.organizador ?? "")}</span>
            </div>
        </article>
    `;
}

function renderLaboratorio(item) {
    return `
        <article class="public-card" onclick="modalLaboratorio(${item.idlaboratorio})">
            <img src="${escapeHtml(obtenerImagen(item.imagen, "/images/default-lab.png"))}"
                 onerror="this.onerror=null; this.src='/images/default-lab.png';"
                 alt="Laboratorio">

            <div class="card-body">
                <h3>${escapeHtml(item.nombrelaboratorio ?? "")}</h3>
                <p>${escapeHtml(recortarTexto(item.descripcion ?? "", 130))}</p>
                <span>${escapeHtml(item.ubicacion ?? "")}</span>
            </div>
        </article>
    `;
}

function renderComision(item) {
    const autoridad = obtenerAutoridadRelacionada(item);

    return `
        <article class="public-card icon-card" onclick="modalComision(${item.idcomision})">
            <div class="icon-box">
                <i class="fa-solid fa-users-gear"></i>
            </div>

            <div class="card-body">
                <h3>${escapeHtml(item.nombrecomision ?? "")}</h3>
                <p>${escapeHtml(recortarTexto(item.descripcion ?? "", 130))}</p>

                <button type="button"
                        class="related-chip"
                        onclick="event.stopPropagation(); modalAutoridadRelacionada(${item.idcomision})">
                    <i class="fa-solid fa-user-tie"></i>
                    ${escapeHtml(autoridad ? autoridad.autoridad : "Sin jefe asignado")}
                </button>
            </div>
        </article>
    `;
}

function renderOferta(item) {
    const empresa = obtenerEmpresaRelacionada(item);
    const estado = String(item.estado ?? "").toUpperCase();

    return `
        <article class="job-card" onclick="modalOferta(${item.idoferta})">
            <div>
                <div class="job-card-header">
                    <div>
                        <span class="badge">${escapeHtml(item.modalidad ?? "")}</span>
                        <h3>${escapeHtml(item.titulo ?? "")}</h3>
                    </div>
                    <span class="${estado === "ACTIVO" ? "badge" : "badge red"}">${escapeHtml(estado)}</span>
                </div>

                <p>${escapeHtml(recortarTexto(item.descripcion ?? "", 180))}</p>

                <div class="meta-list">
                    <button type="button"
                            class="related-chip"
                            onclick="event.stopPropagation(); modalEmpresaRelacionada(${item.idoferta})">
                        <i class="fa-solid fa-building"></i>
                        ${escapeHtml(empresa ? empresa.nombreempresa : "Sin empresa")}
                    </button>

                    <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(item.ubicacion ?? "")}</span>
                    <span><i class="fa-solid fa-calendar"></i> Límite: ${escapeHtml(formatearFecha(item.fechalimite))}</span>
                    <span><i class="fa-solid fa-money-bill"></i> ${escapeHtml(formatearSalario(item.salario))}</span>
                </div>
            </div>
        </article>
    `;
}

function renderEmpresa(item) {
    return `
        <article class="public-card company-card" onclick="modalEmpresa(${item.idempresa})">
            <img src="${escapeHtml(obtenerImagen(item.logo, "/images/default-company.png"))}"
                 onerror="this.onerror=null; this.src='/images/default-company.png';"
                 alt="Empresa">

            <div class="card-body">
                <h3>${escapeHtml(item.nombreempresa ?? "")}</h3>
                <p>${escapeHtml(item.rubro ?? "")}</p>
                <span>${escapeHtml(item.correo ?? "")}</span>
            </div>
        </article>
    `;
}

/* MODALES */

function configurarModal() {
    const modal = document.getElementById("publicModal");
    const close = document.getElementById("modalClose");

    close.addEventListener("click", cerrarModal);

    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            cerrarModal();
        }
    });
}

function abrirModal(html) {
    document.getElementById("modalBody").innerHTML = html;
    document.getElementById("publicModal").classList.add("show");
    document.body.style.overflow = "hidden";
}

function cerrarModal() {
    document.getElementById("publicModal").classList.remove("show");
    document.getElementById("modalBody").innerHTML = "";
    document.body.style.overflow = "";
}

function modalAutoridad(id) {
    const item = data.find(a => Number(a.idautoridad) === Number(id)) ||
        autoridadesData.find(a => Number(a.idautoridad) === Number(id));

    if (!item) return;

    abrirModal(`
        <div class="modal-profile">
            <img src="${escapeHtml(obtenerImagen(item.foto, "/images/default-user.png"))}"
                 onerror="this.onerror=null; this.src='/images/default-user.png';">

            <div>
                <span class="modal-label">Autoridad FCA</span>
                <h2>${escapeHtml(item.autoridad ?? "")}</h2>
                <p><strong>${escapeHtml(item.cargo ?? "")}</strong></p>

                <div class="modal-info-list">
                    <p><i class="fa-solid fa-envelope"></i>${escapeHtml(item.correo ?? "Sin correo registrado")}</p>
                </div>
            </div>
        </div>
    `);
}

function modalNoticia(id) {
    const item = data.find(n => Number(n.idnoticia) === Number(id));
    if (!item) return;

    abrirModal(`
        <img class="modal-cover-img"
             src="${escapeHtml(obtenerImagen(item.imagen, "/images/default-news.png"))}"
             onerror="this.onerror=null; this.src='/images/default-news.png';">

        <span class="modal-label">Noticia</span>
        <h2>${escapeHtml(item.titulo ?? "")}</h2>

        <div class="modal-info-list">
            <p><i class="fa-solid fa-calendar"></i>${escapeHtml(formatearFecha(item.fecha))}</p>
            <p><i class="fa-solid fa-user"></i>${escapeHtml(item.autor ?? "Sin autor")}</p>
        </div>

        <h4>Resumen</h4>
        <p>${escapeHtml(item.resumen ?? "Sin resumen registrado.")}</p>

        <h4>Contenido</h4>
        <p>${escapeHtml(item.contenido ?? "Sin contenido registrado.")}</p>
    `);
}

function modalEvento(id) {
    const item = data.find(e => Number(e.idevento) === Number(id));
    if (!item) return;

    abrirModal(`
        <span class="modal-label">Evento FCA</span>
        <h2>${escapeHtml(item.titulo ?? "")}</h2>

        <div class="modal-info-list">
            <p><i class="fa-solid fa-calendar"></i>${escapeHtml(formatearFecha(item.fecha))}</p>
            <p><i class="fa-solid fa-clock"></i>${escapeHtml(formatearHora(item.hora))}</p>
            <p><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.lugar ?? "Sin lugar")}</p>
            <p><i class="fa-solid fa-user"></i>${escapeHtml(item.organizador ?? "Sin organizador")}</p>
        </div>

        <h4>Descripción</h4>
        <p>${escapeHtml(item.descripcion ?? "Sin descripción registrada.")}</p>
    `);
}

function modalLaboratorio(id) {
    const item = data.find(l => Number(l.idlaboratorio) === Number(id));
    if (!item) return;

    abrirModal(`
        <img class="modal-cover-img"
             src="${escapeHtml(obtenerImagen(item.imagen, "/images/default-lab.png"))}"
             onerror="this.onerror=null; this.src='/images/default-lab.png';">

        <span class="modal-label">Laboratorio FCA</span>
        <h2>${escapeHtml(item.nombrelaboratorio ?? "")}</h2>

        <div class="modal-info-list">
            <p><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.ubicacion ?? "Sin ubicación")}</p>
        </div>

        <h4>Descripción</h4>
        <p>${escapeHtml(item.descripcion ?? "Sin descripción registrada.")}</p>
    `);
}

function modalComision(id) {
    const item = data.find(c => Number(c.idcomision) === Number(id));
    if (!item) return;

    const autoridad = obtenerAutoridadRelacionada(item);

    abrirModal(`
        <span class="modal-label">Comisión FCA</span>
        <h2>${escapeHtml(item.nombrecomision ?? "")}</h2>

        <h4>Descripción</h4>
        <p>${escapeHtml(item.descripcion ?? "Sin descripción registrada.")}</p>

        <h4>Jefe de comisión</h4>
        <button type="button"
                class="related-chip"
                onclick="modalAutoridadRelacionada(${item.idcomision})">
            <i class="fa-solid fa-user-tie"></i>
            ${escapeHtml(autoridad ? autoridad.autoridad : "Sin jefe asignado")}
        </button>
    `);
}

function modalOferta(id) {
    const item = data.find(o => Number(o.idoferta) === Number(id));
    if (!item) return;

    const empresa = obtenerEmpresaRelacionada(item);

    abrirModal(`
        <span class="modal-label">Oferta laboral</span>
        <h2>${escapeHtml(item.titulo ?? "")}</h2>

        <div class="modal-info-list">
            <p><i class="fa-solid fa-briefcase"></i>${escapeHtml(item.modalidad ?? "Sin modalidad")}</p>
            <p><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.ubicacion ?? "Sin ubicación")}</p>
            <p><i class="fa-solid fa-users"></i>${escapeHtml(item.vacantes ?? "0")} vacantes</p>
            <p><i class="fa-solid fa-money-bill"></i>${escapeHtml(formatearSalario(item.salario))}</p>
            <p><i class="fa-solid fa-calendar"></i>Fecha límite: ${escapeHtml(formatearFecha(item.fechalimite))}</p>
            <p><i class="fa-solid fa-circle-info"></i>${escapeHtml(item.estado ?? "Sin estado")}</p>
        </div>

        <h4>Empresa</h4>
        <button type="button"
                class="related-chip"
                onclick="modalEmpresaRelacionada(${item.idoferta})">
            <i class="fa-solid fa-building"></i>
            ${escapeHtml(empresa ? empresa.nombreempresa : "Sin empresa")}
        </button>

        <h4>Descripción</h4>
        <p>${escapeHtml(item.descripcion ?? "Sin descripción registrada.")}</p>
    `);
}

function modalEmpresa(id) {
    const item = data.find(e => Number(e.idempresa) === Number(id)) ||
        empresasData.find(e => Number(e.idempresa) === Number(id));

    if (!item) return;

    abrirModal(`
        <div class="modal-profile">
            <img src="${escapeHtml(obtenerImagen(item.logo, "/images/default-company.png"))}"
                 onerror="this.onerror=null; this.src='/images/default-company.png';">

            <div>
                <span class="modal-label">Empresa vinculada</span>
                <h2>${escapeHtml(item.nombreempresa ?? "")}</h2>
                <p><strong>${escapeHtml(item.rubro ?? "Sin rubro")}</strong></p>

                <div class="modal-info-list">
                    <p><i class="fa-solid fa-id-card"></i>RUC: ${escapeHtml(item.ruc ?? "Sin RUC")}</p>
                    <p><i class="fa-solid fa-envelope"></i>${escapeHtml(item.correo ?? "Sin correo")}</p>
                    <p><i class="fa-solid fa-phone"></i>${escapeHtml(item.telefono ?? "Sin teléfono")}</p>
                    <p><i class="fa-solid fa-location-dot"></i>${escapeHtml(item.direccion ?? "Sin dirección")}</p>
                </div>
            </div>
        </div>
    `);
}

function modalAutoridadRelacionada(idcomision) {
    const comision = data.find(c => Number(c.idcomision) === Number(idcomision));
    const autoridad = obtenerAutoridadRelacionada(comision);

    if (!autoridad) return;

    modalAutoridad(autoridad.idautoridad);
}

function modalEmpresaRelacionada(idoferta) {
    const oferta = data.find(o => Number(o.idoferta) === Number(idoferta));
    const empresa = obtenerEmpresaRelacionada(oferta);

    if (!empresa) return;

    modalEmpresa(empresa.idempresa);
}

/* RELACIONES */

function obtenerAutoridadRelacionada(comision) {
    if (!comision || !comision.idautoridad) return null;

    if (typeof comision.idautoridad === "object") {
        return comision.idautoridad;
    }

    return autoridadesData.find(a => Number(a.idautoridad) === Number(comision.idautoridad)) ?? null;
}

function obtenerEmpresaRelacionada(oferta) {
    if (!oferta || !oferta.idempresa) return null;

    if (typeof oferta.idempresa === "object") {
        return oferta.idempresa;
    }

    return empresasData.find(e => Number(e.idempresa) === Number(oferta.idempresa)) ?? null;
}

/* BÚSQUEDA */

function obtenerTextoBusqueda(module, item) {
    if (module === "autoridades") {
        return `${item.autoridad ?? ""} ${item.cargo ?? ""} ${item.correo ?? ""}`;
    }

    if (module === "noticias") {
        return `${item.titulo ?? ""} ${item.resumen ?? ""} ${item.contenido ?? ""} ${item.autor ?? ""} ${item.fecha ?? ""}`;
    }

    if (module === "eventos") {
        return `${item.titulo ?? ""} ${item.descripcion ?? ""} ${item.fecha ?? ""} ${item.hora ?? ""} ${item.lugar ?? ""} ${item.organizador ?? ""}`;
    }

    if (module === "laboratorios") {
        return `${item.nombrelaboratorio ?? ""} ${item.descripcion ?? ""} ${item.ubicacion ?? ""}`;
    }

    if (module === "comisiones") {
        const autoridad = obtenerAutoridadRelacionada(item);
        return `${item.nombrecomision ?? ""} ${item.descripcion ?? ""} ${autoridad ? autoridad.autoridad : ""}`;
    }

    if (module === "bolsa-laboral") {
        const empresa = obtenerEmpresaRelacionada(item);
        return `${item.titulo ?? ""} ${item.descripcion ?? ""} ${item.modalidad ?? ""} ${item.estado ?? ""} ${item.ubicacion ?? ""} ${empresa ? empresa.nombreempresa : ""}`;
    }

    if (module === "empresas") {
        return `${item.nombreempresa ?? ""} ${item.ruc ?? ""} ${item.correo ?? ""} ${item.telefono ?? ""} ${item.direccion ?? ""} ${item.rubro ?? ""}`;
    }

    return "";
}

/* HELPERS */

function obtenerImagen(valor, fallback) {
    if (!valor || String(valor).trim() === "") return fallback;

    const ruta = String(valor).trim();

    if (ruta.startsWith("http://") || ruta.startsWith("https://")) return ruta;
    if (ruta.startsWith("/")) return ruta;

    return "/" + ruta;
}

function formatearFecha(fecha) {
    if (!fecha) return "";
    return String(fecha).substring(0, 10);
}

function formatearHora(hora) {
    if (!hora) return "";
    return String(hora).substring(0, 5);
}

function formatearSalario(salario) {
    if (salario === null || salario === undefined || salario === "") {
        return "No especificado";
    }

    return `S/ ${Number(salario).toFixed(2)}`;
}

function recortarTexto(texto, limite) {
    if (!texto) return "";
    return texto.length > limite ? texto.substring(0, limite) + "..." : texto;
}

function mensajeVacio(mensaje) {
    return `
        <div class="empty-public">
            <i class="fa-solid fa-circle-info"></i>
            <p>${escapeHtml(mensaje)}</p>
        </div>
    `;
}

function escapeHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}