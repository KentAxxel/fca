let autoridadesData = [];
let noticiasData = [];
let eventosData = [];
let laboratoriosData = [];
let comisionesData = [];
let ofertasData = [];
let empresasData = [];

document.addEventListener("DOMContentLoaded", async () => {
  configurarMenuMovil();
  configurarModalPublico();

  await Promise.all([
    cargarAutoridades(),
    cargarEmpresas()
  ]);

  await Promise.all([
    cargarNoticias(),
    cargarEventos(),
    cargarLaboratorios(),
    cargarComisiones(),
    cargarOfertas()
  ]);
});

function configurarMenuMovil() {
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    const overlay = document.getElementById("mobileMenuOverlay");

    if (!menuBtn || !navLinks || !overlay) {
        return;
    }

    let scrollGuardado = 0;

    function abrirMenu() {
        scrollGuardado = window.scrollY || document.documentElement.scrollTop;

        navLinks.classList.add("active");
        overlay.classList.add("active");
        menuBtn.classList.add("active");

        document.body.classList.add("mobile-menu-open");
        document.body.style.position = "fixed";
        document.body.style.top = `-${scrollGuardado}px`;
        document.body.style.left = "0";
        document.body.style.right = "0";
        document.body.style.width = "100%";

        const icon = menuBtn.querySelector("i");
        if (icon) {
            icon.className = "fa-solid fa-xmark";
        }
    }

    function cerrarMenu() {
        navLinks.classList.remove("active");
        overlay.classList.remove("active");
        menuBtn.classList.remove("active");

        document.body.classList.remove("mobile-menu-open");
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.width = "";

        window.scrollTo(0, scrollGuardado);

        const icon = menuBtn.querySelector("i");
        if (icon) {
            icon.className = "fa-solid fa-bars";
        }
    }

    cerrarMenu();

    menuBtn.addEventListener("click", () => {
        if (navLinks.classList.contains("active")) {
            cerrarMenu();
        } else {
            abrirMenu();
        }
    });

    overlay.addEventListener("click", cerrarMenu);

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", cerrarMenu);
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) {
            cerrarMenu();
        }
    });
}


async function obtenerDatos(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`No se pudo cargar ${url}`);
  }

  return await response.json();
}

async function cargarAutoridades() {
  const container = document.getElementById("autoridadesContainer");

  try {
    autoridadesData = await obtenerDatos("/api/autoridades");
    const visibles = autoridadesData.slice(0, 4);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay autoridades registradas.");
      return;
    }

    container.innerHTML = visibles.map(autoridad => `
            <article class="public-card person-card clickable-card"
                     onclick="abrirModalAutoridad(${autoridad.idautoridad})">
                <img src="${escapeHtml(obtenerImagen(autoridad.foto, "/images/default-user.png"))}"
                     alt="Foto autoridad"
                     class="authority-public-photo"
                     onerror="this.onerror=null; this.src='/images/default-user.png';">

                <div class="public-card-body">
                    <h3>${escapeHtml(autoridad.autoridad ?? "")}</h3>
                    <p>${escapeHtml(autoridad.cargo ?? "")}</p>
                    <span>${escapeHtml(autoridad.correo ?? "")}</span>
                </div>
            </article>
        `).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar las autoridades.");
  }
}

/* =========================
   NOTICIAS
========================= */

async function cargarNoticias() {
  const container = document.getElementById("noticiasContainer");

  try {
    noticiasData = await obtenerDatos("/api/noticias");
    const visibles = noticiasData
      .sort((a, b) => compararFechasDesc(a.fecha, b.fecha))
      .slice(0, 3);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay noticias registradas.");
      return;
    }

    container.innerHTML = visibles.map(noticia => `
            <article class="public-card news-card clickable-card"
                     onclick="abrirModalNoticia(${noticia.idnoticia})">
                <img src="${escapeHtml(obtenerImagen(noticia.imagen, "/images/default-news.png"))}"
                     alt="Imagen noticia"
                     onerror="this.onerror=null; this.src='/images/default-news.png';">

                <div class="public-card-body">
                    <span class="card-date">${escapeHtml(formatearFecha(noticia.fecha))}</span>
                    <h3>${escapeHtml(noticia.titulo ?? "")}</h3>
                    <p>${escapeHtml(recortarTexto(noticia.resumen ?? noticia.contenido ?? "", 120))}</p>
                    <small>${escapeHtml(noticia.autor ?? "")}</small>
                </div>
            </article>
        `).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar las noticias.");
  }
}


function abrirModalNoticia(idnoticia) {
  const noticia = noticiasData.find(n => Number(n.idnoticia) === Number(idnoticia));

  if (!noticia) {
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-article">
            <img src="${escapeHtml(obtenerImagen(noticia.imagen, "/images/default-news.png"))}"
                 alt="Imagen noticia"
                 class="modal-cover-img"
                 onerror="this.onerror=null; this.src='/images/default-news.png';">

            <span class="modal-label">Noticia</span>
            <h2>${escapeHtml(noticia.titulo ?? "")}</h2>

            <div class="modal-meta">
                <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(formatearFecha(noticia.fecha))}</span>
                <span><i class="fa-solid fa-user"></i> ${escapeHtml("Autor:" + noticia.autor ?? "Sin autor")}</span>
            </div>

            <h4>Resumen</h4>
            <p>${escapeHtml(noticia.resumen ?? "Sin resumen registrado.")}</p>

            <h4>Contenido</h4>
            <p>${escapeHtml(noticia.contenido ?? "Sin contenido registrado.")}</p>
        </div>
    `);
}


/* =========================
   EVENTOS
========================= */

async function cargarEventos() {
  const container = document.getElementById("eventosContainer");

  try {
    eventosData = await obtenerDatos("/api/eventos");
    const visibles = eventosData
      .sort((a, b) => compararFechasAsc(a.fecha, b.fecha))
      .slice(0, 4);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay eventos registrados.");
      return;
    }

    container.innerHTML = visibles.map(evento => `
            <article class="timeline-item clickable-card"
                     onclick="abrirModalEvento(${evento.idevento})">
                <div class="timeline-date">
                    <strong>${escapeHtml(obtenerDia(evento.fecha))}</strong>
                    <span>${escapeHtml(obtenerMes(evento.fecha))}</span>
                </div>

                <div class="timeline-content">
                    <h3>${escapeHtml(evento.titulo ?? "")}</h3>
                    <p>${escapeHtml(recortarTexto(evento.descripcion ?? "", 140))}</p>

                    <div class="timeline-meta">
                        <span><i class="fa-solid fa-clock"></i> ${escapeHtml(formatearHora(evento.hora))}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(evento.lugar ?? "")}</span>
                    </div>
                </div>
            </article>
        `).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar los eventos.");
  }
}

function abrirModalEvento(idevento) {
  const evento = eventosData.find(e => Number(e.idevento) === Number(idevento));

  if (!evento) {
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-article">
            <span class="modal-label">Evento FCA</span>
            <h2>${escapeHtml(evento.titulo ?? "")}</h2>

            <div class="modal-meta">
                <span><i class="fa-solid fa-calendar"></i> ${escapeHtml(formatearFecha(evento.fecha))}</span>
                <span><i class="fa-solid fa-clock"></i> ${escapeHtml(formatearHora(evento.hora))}</span>
                <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(evento.lugar ?? "Sin lugar")}</span>
            </div>

            <h4>Descripción</h4>
            <p>${escapeHtml(evento.descripcion ?? "Sin descripción registrada.")}</p>

            <h4>Organizador</h4>
            <p>${escapeHtml(evento.organizador ?? "Sin organizador registrado.")}</p>
        </div>
    `);
}


/* =========================
   LABORATORIOS
========================= */

async function cargarLaboratorios() {
  const container = document.getElementById("laboratoriosContainer");

  try {
    laboratoriosData = await obtenerDatos("/api/laboratorios");
    const visibles = laboratoriosData.slice(0, 3);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay laboratorios registrados.");
      return;
    }

    container.innerHTML = visibles.map(lab => `
            <article class="public-card lab-card clickable-card"
                     onclick="abrirModalLaboratorio(${lab.idlaboratorio})">
                <img src="${escapeHtml(obtenerImagen(lab.imagen, "/images/default-lab.png"))}"
                     alt="Imagen laboratorio"
                     onerror="this.onerror=null; this.src='/images/default-lab.png';">

                <div class="public-card-body">
                    <h3>${escapeHtml(lab.nombrelaboratorio ?? "")}</h3>
                    <p>${escapeHtml(recortarTexto(lab.descripcion ?? "", 120))}</p>
                    <span>${escapeHtml(lab.ubicacion ?? "")}</span>
                </div>
            </article>
        `).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar los laboratorios.");
  }
}

function abrirModalLaboratorio(idlaboratorio) {
  const lab = laboratoriosData.find(l => Number(l.idlaboratorio) === Number(idlaboratorio));

  if (!lab) {
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-article">
            <img src="${escapeHtml(obtenerImagen(lab.imagen, "/images/default-lab.png"))}"
                 alt="Imagen laboratorio"
                 class="modal-cover-img"
                 onerror="this.onerror=null; this.src='/images/default-lab.png';">

            <span class="modal-label">Laboratorio FCA</span>
            <h2>${escapeHtml(lab.nombrelaboratorio ?? "")}</h2>

            <div class="modal-meta">
                <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(lab.ubicacion ?? "Sin ubicación")}</span>
            </div>

            <h4>Descripción</h4>
            <p>${escapeHtml(lab.descripcion ?? "Sin descripción registrada.")}</p>
        </div>
    `);
}



/* =========================
   COMISIONES
========================= */

async function cargarComisiones() {
  const container = document.getElementById("comisionesContainer");

  try {
    comisionesData = await obtenerDatos("/api/comisiones");
    const visibles = comisionesData.slice(0, 4);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay comisiones registradas.");
      return;
    }

    container.innerHTML = visibles.map(comision => {
      const autoridad = obtenerAutoridadRelacionada(comision);

      return `
                <article class="public-card commission-card clickable-card"
                         onclick="abrirModalComision(${comision.idcomision})">
                    <div class="icon-box">
                        <i class="fa-solid fa-users-gear"></i>
                    </div>

                    <div class="public-card-body">
                        <h3>${escapeHtml(comision.nombrecomision ?? "")}</h3>
                        <p>${escapeHtml(recortarTexto(comision.descripcion ?? "", 120))}</p>

                        <button type="button"
                                class="related-chip"
                                onclick="event.stopPropagation(); abrirModalAutoridadRelacionadaComision(${comision.idcomision});">
                            <i class="fa-solid fa-user-tie"></i>
                            ${escapeHtml(autoridad ? autoridad.autoridad : "Sin jefe asignado")}
                        </button>
                    </div>
                </article>
            `;
    }).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar las comisiones.");
  }
}

function abrirModalComision(idcomision) {
  const comision = comisionesData.find(c => Number(c.idcomision) === Number(idcomision));

  if (!comision) {
    return;
  }

  const autoridad = obtenerAutoridadRelacionada(comision);

  abrirModalPublico(`
        <div class="modal-public-article">
            <span class="modal-label">Comisión FCA</span>
            <h2>${escapeHtml(comision.nombrecomision ?? "")}</h2>

            <h4>Descripción</h4>
            <p>${escapeHtml(comision.descripcion ?? "Sin descripción registrada.")}</p>

            <h4>Jefe de comisión</h4>
            <button type="button"
                    class="related-chip modal-related-chip"
                    onclick="abrirModalAutoridadRelacionadaComision(${comision.idcomision})">
                <i class="fa-solid fa-user-tie"></i>
                ${escapeHtml(autoridad ? autoridad.autoridad : "Sin jefe asignado")}
            </button>
        </div>
    `);
}

function abrirModalAutoridadRelacionadaComision(idcomision) {
  const comision = comisionesData.find(c => Number(c.idcomision) === Number(idcomision));
  const autoridad = obtenerAutoridadRelacionada(comision);

  if (!autoridad) {
    abrirModalPublico(`
            <div class="modal-public-article">
                <span class="modal-label">Jefe de comisión</span>
                <h2>Sin jefe asignado</h2>
                <p>Esta comisión aún no tiene una autoridad relacionada.</p>
            </div>
        `);
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-profile">
            <img src="${escapeHtml(obtenerImagen(autoridad.foto, "/images/default-user.png"))}"
                 alt="Foto autoridad"
                 class="modal-profile-img"
                 onerror="this.onerror=null; this.src='/images/default-user.png';">

            <div>
                <span class="modal-label">Jefe de comisión</span>
                <h2>${escapeHtml(autoridad.autoridad ?? "")}</h2>
                <p class="modal-role">${escapeHtml(autoridad.cargo ?? "")}</p>

                <div class="modal-info-list">
                    <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(autoridad.correo ?? "Sin correo registrado")}</p>
                </div>
            </div>
        </div>
    `);
}

/* =========================
   OFERTAS LABORALES
========================= */

async function cargarOfertas() {
  const container = document.getElementById("ofertasContainer");

  try {
    ofertasData = await obtenerDatos("/api/ofertas");
    const visibles = ofertasData
      .filter(oferta => String(oferta.estado ?? "").toUpperCase() === "ACTIVO")
      .slice(0, 4);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay ofertas laborales activas.");
      return;
    }

    container.innerHTML = visibles.map(oferta => {
      const empresa = obtenerEmpresaRelacionada(oferta);

      return `
                <article class="job-card clickable-card"
                         onclick="abrirModalOferta(${oferta.idoferta})">
                    <div>
                        <span class="job-badge">${escapeHtml(oferta.modalidad ?? "")}</span>
                        <h3>${escapeHtml(oferta.titulo ?? "")}</h3>
                        <p>${escapeHtml(recortarTexto(oferta.descripcion ?? "", 130))}</p>

                        <div class="job-meta">
                            <button type="button"
                                    class="related-chip"
                                    onclick="event.stopPropagation(); abrirModalEmpresaRelacionadaOferta(${oferta.idoferta});">
                                <i class="fa-solid fa-building"></i>
                                ${escapeHtml(empresa ? empresa.nombreempresa : "Sin empresa")}
                            </button>

                            <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(oferta.ubicacion ?? "")}</span>
                            <span><i class="fa-solid fa-calendar"></i> Límite: ${escapeHtml(formatearFecha(oferta.fechalimite))}</span>
                        </div>
                    </div>

                    <strong>${escapeHtml(formatearSalario(oferta.salario))}</strong>
                </article>
            `;
    }).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar las ofertas laborales.");
  }
}

function abrirModalOferta(idoferta) {
  const oferta = ofertasData.find(o => Number(o.idoferta) === Number(idoferta));
  const empresa = obtenerEmpresaRelacionada(oferta);

  if (!oferta) {
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-article">
            <span class="modal-label">Oferta laboral</span>
            <h2>${escapeHtml(oferta.titulo ?? "")}</h2>

            <div class="modal-meta">
                <span><i class="fa-solid fa-location-dot"></i> ${escapeHtml(oferta.ubicacion ?? "Sin ubicación")}</span>
                <span><i class="fa-solid fa-briefcase"></i> ${escapeHtml(oferta.modalidad ?? "Sin modalidad")}</span>
                <span><i class="fa-solid fa-users"></i> ${escapeHtml(oferta.vacantes ?? "0")} vacantes</span>
                <span><i class="fa-solid fa-money-bill"></i> ${escapeHtml(formatearSalario(oferta.salario))}</span>
                <span><i class="fa-solid fa-calendar"></i> Límite: ${escapeHtml(formatearFecha(oferta.fechalimite))}</span>
            </div>

            <h4>Empresa</h4>
            <button type="button"
                    class="related-chip modal-related-chip"
                    onclick="abrirModalEmpresaRelacionadaOferta(${oferta.idoferta})">
                <i class="fa-solid fa-building"></i>
                ${escapeHtml(empresa ? empresa.nombreempresa : "Sin empresa")}
            </button>

            <h4>Descripción</h4>
            <p>${escapeHtml(oferta.descripcion ?? "Sin descripción registrada.")}</p>
        </div>
    `);
}

function abrirModalEmpresaRelacionadaOferta(idoferta) {
  const oferta = ofertasData.find(o => Number(o.idoferta) === Number(idoferta));
  const empresa = obtenerEmpresaRelacionada(oferta);

  if (!empresa) {
    abrirModalPublico(`
            <div class="modal-public-article">
                <span class="modal-label">Empresa</span>
                <h2>Sin empresa relacionada</h2>
                <p>Esta oferta laboral aún no tiene una empresa relacionada.</p>
            </div>
        `);
    return;
  }

  abrirModalEmpresa(empresa.idempresa);
}



/* =========================
   EMPRESAS
========================= */

async function cargarEmpresas() {
  const container = document.getElementById("empresasContainer");

  try {
    empresasData = await obtenerDatos("/api/empresas");
    const visibles = empresasData.slice(0, 4);

    if (!visibles.length) {
      container.innerHTML = mensajeVacio("No hay empresas registradas.");
      return;
    }

    container.innerHTML = visibles.map(empresa => `
            <article class="public-card company-card clickable-card"
                     onclick="abrirModalEmpresa(${empresa.idempresa})">
                <img src="${escapeHtml(obtenerImagen(empresa.logo, "/images/default-company.png"))}"
                     alt="Logo empresa"
                     onerror="this.onerror=null; this.src='/images/default-company.png';">

                <div class="public-card-body">
                    <h3>${escapeHtml(empresa.nombreempresa ?? "")}</h3>
                    <p>${escapeHtml(empresa.rubro ?? "")}</p>
                    <span>${escapeHtml(empresa.correo ?? "")}</span>
                </div>
            </article>
        `).join("");

  } catch (error) {
    container.innerHTML = mensajeError("No se pudieron cargar las empresas.");
  }
}

function abrirModalEmpresa(idempresa) {
  const empresa = empresasData.find(e => Number(e.idempresa) === Number(idempresa));

  if (!empresa) {
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-profile">
            <img src="${escapeHtml(obtenerImagen(empresa.logo, "/images/default-company.png"))}"
                 alt="Logo empresa"
                 class="modal-company-img"
                 onerror="this.onerror=null; this.src='/images/default-company.png';">

            <div>
                <span class="modal-label">Empresa vinculada</span>
                <h2>${escapeHtml(empresa.nombreempresa ?? "")}</h2>
                <p class="modal-role">${escapeHtml(empresa.rubro ?? "Sin rubro registrado")}</p>

                <div class="modal-info-list">
                    <p><i class="fa-solid fa-id-card"></i> RUC: ${escapeHtml(empresa.ruc ?? "Sin RUC")}</p>
                    <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(empresa.correo ?? "Sin correo")}</p>
                    <p><i class="fa-solid fa-phone"></i> ${escapeHtml(empresa.telefono ?? "Sin teléfono")}</p>
                    <p><i class="fa-solid fa-location-dot"></i> ${escapeHtml(empresa.direccion ?? "Sin dirección")}</p>
                </div>
            </div>
        </div>
    `);
}



/* =========================
   HELPERS RELACIONES
========================= */

function obtenerAutoridadRelacionada(comision) {
  if (!comision || !comision.idautoridad) {
    return null;
  }

  if (typeof comision.idautoridad === "object") {
    return comision.idautoridad;
  }

  return autoridadesData.find(a =>
    Number(a.idautoridad) === Number(comision.idautoridad)
  ) ?? null;
}

function obtenerEmpresaRelacionada(oferta) {
  if (!oferta || !oferta.idempresa) {
    return null;
  }

  if (typeof oferta.idempresa === "object") {
    return oferta.idempresa;
  }

  return empresasData.find(e =>
    Number(e.idempresa) === Number(oferta.idempresa)
  ) ?? null;
}

/* =========================
   HELPERS GENERALES
========================= */

function obtenerImagen(valor, fallback) {
  if (!valor || String(valor).trim() === "") {
    return fallback;
  }

  return valor;
}

function formatearFecha(fecha) {
  if (!fecha) {
    return "";
  }

  return String(fecha).substring(0, 10);
}

function obtenerDia(fecha) {
  if (!fecha) {
    return "--";
  }

  const partes = String(fecha).substring(0, 10).split("-");
  return partes.length === 3 ? partes[2] : "--";
}

function obtenerMes(fecha) {
  if (!fecha) {
    return "---";
  }

  const meses = ["ENE", "FEB", "MAR", "ABR", "MAY", "JUN", "JUL", "AGO", "SET", "OCT", "NOV", "DIC"];
  const partes = String(fecha).substring(0, 10).split("-");

  if (partes.length !== 3) {
    return "---";
  }

  const mes = Number(partes[1]) - 1;
  return meses[mes] ?? "---";
}

function formatearHora(hora) {
  if (!hora) {
    return "";
  }

  return String(hora).substring(0, 5);
}

function formatearSalario(salario) {
  if (salario === null || salario === undefined || salario === "") {
    return "No especificado";
  }

  return `S/ ${Number(salario).toFixed(2)}`;
}

function compararFechasDesc(a, b) {
  return new Date(b || "1900-01-01") - new Date(a || "1900-01-01");
}

function compararFechasAsc(a, b) {
  return new Date(a || "2999-12-31") - new Date(b || "2999-12-31");
}

function recortarTexto(texto, limite) {
  if (!texto) {
    return "";
  }

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

function mensajeError(mensaje) {
  return `
        <div class="empty-public error">
            <i class="fa-solid fa-triangle-exclamation"></i>
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

function configurarModalPublico() {
  const modal = document.getElementById("publicModal");
  const closeBtn = document.getElementById("modalClose");

  if (closeBtn) {
    closeBtn.addEventListener("click", cerrarModalPublico);
  }

  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        cerrarModalPublico();
      }
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarModalPublico();
    }
  });
}

function abrirModalPublico(html) {
  const modal = document.getElementById("publicModal");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalBody) {
    return;
  }

  modalBody.innerHTML = html;
  modal.classList.add("show");
  document.body.classList.add("modal-open");
}

function cerrarModalPublico() {
  const modal = document.getElementById("publicModal");
  const modalBody = document.getElementById("modalBody");

  if (!modal || !modalBody) {
    return;
  }

  modal.classList.remove("show");
  document.body.classList.remove("modal-open");
  modalBody.innerHTML = "";
}

function abrirModalAutoridad(idautoridad) {
  const autoridad = autoridadesData.find(a => Number(a.idautoridad) === Number(idautoridad));

  if (!autoridad) {
    return;
  }

  abrirModalPublico(`
        <div class="modal-public-profile">
            <img src="${escapeHtml(obtenerImagen(autoridad.foto, "/images/default-user.png"))}"
                 alt="Foto autoridad"
                 class="modal-profile-img"
                 onerror="this.onerror=null; this.src='/images/default-user.png';">

            <div>
                <span class="modal-label">Autoridad FCA</span>
                <h2>${escapeHtml(autoridad.autoridad ?? "")}</h2>
                <p class="modal-role">${escapeHtml(autoridad.cargo ?? "")}</p>

                <div class="modal-info-list">
                    <p><i class="fa-solid fa-envelope"></i> ${escapeHtml(autoridad.correo ?? "Sin correo registrado")}</p>
                    <p><i class="fa-solid fa-image"></i> ${autoridad.foto ? "Foto registrada" : "Sin foto registrada"}</p>
                </div>
            </div>
        </div>
    `);
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