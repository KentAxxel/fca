document.addEventListener("DOMContentLoaded", async () => {
    await cargarDashboard();
});

async function cargarDashboard() {
    const [
        usuarios,
        autoridades,
        laboratorios,
        noticias,
        eventos,
        ofertas,
        empresas,
        comisiones
    ] = await Promise.all([
        obtenerDatosSeguro("/api/usuarios"),
        obtenerDatosSeguro("/api/autoridades"),
        obtenerDatosSeguro("/api/laboratorios"),
        obtenerDatosSeguro("/api/noticias"),
        obtenerDatosSeguro("/api/eventos"),
        obtenerDatosSeguro("/api/ofertas"),
        obtenerDatosSeguro("/api/empresas"),
        obtenerDatosSeguro("/api/comisiones")
    ]);

    const totalPublicaciones = noticias.length + eventos.length + ofertas.length;

    setText("totalUsuarios", usuarios.length);
    setText("totalAutoridades", autoridades.length);
    setText("totalLaboratorios", laboratorios.length);
    setText("totalPublicaciones", totalPublicaciones);

    setText("totalNoticias", noticias.length);
    setText("totalEventos", eventos.length);
    setText("totalBolsa", ofertas.length);

    actualizarActividadReciente({
        usuarios,
        autoridades,
        laboratorios,
        noticias,
        eventos,
        ofertas,
        empresas,
        comisiones
    });
}

async function obtenerDatosSeguro(url) {
    try {
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            console.warn(`No se pudo cargar ${url}. Estado: ${response.status}`);
            return [];
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
            return [];
        }

        return data;

    } catch (error) {
        console.error(`Error cargando ${url}:`, error);
        return [];
    }
}

function actualizarActividadReciente(data) {
    const contenedor = document.getElementById("actividadReciente");

    if (!contenedor) {
        return;
    }

    const ofertasActivas = data.ofertas.filter(oferta =>
        String(oferta.estado ?? "").toUpperCase() === "ACTIVO"
    ).length;

    const noticiasRecientes = data.noticias
        .filter(noticia => noticia.fecha)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    const eventosProximos = data.eventos
        .filter(evento => evento.fecha)
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    const ultimaNoticia = noticiasRecientes[0];
    const proximoEvento = eventosProximos[0];

    contenedor.innerHTML = `
        <div class="activity-item">
            <div class="activity-icon">✅</div>
            <div>
                <strong>Dashboard actualizado</strong>
                <p>Los indicadores se cargaron desde las APIs reales del sistema FCA.</p>
            </div>
        </div>

        <div class="activity-item">
            <div class="activity-icon">📰</div>
            <div>
                <strong>Última noticia</strong>
                <p>
                    ${ultimaNoticia
                        ? escapeHtml(ultimaNoticia.titulo ?? "Noticia registrada")
                        : "Aún no hay noticias registradas."}
                </p>
            </div>
        </div>

        <div class="activity-item">
            <div class="activity-icon">📅</div>
            <div>
                <strong>Próximo evento</strong>
                <p>
                    ${proximoEvento
                        ? `${escapeHtml(proximoEvento.titulo ?? "Evento registrado")} - ${formatearFecha(proximoEvento.fecha)}`
                        : "Aún no hay eventos registrados."}
                </p>
            </div>
        </div>

        <div class="activity-item">
            <div class="activity-icon">💼</div>
            <div>
                <strong>Ofertas activas</strong>
                <p>${ofertasActivas} oferta(s) laborales activas actualmente.</p>
            </div>
        </div>

        <div class="activity-item">
            <div class="activity-icon">🏢</div>
            <div>
                <strong>Empresas y comisiones</strong>
                <p>
                    ${data.empresas.length} empresa(s) vinculada(s) y
                    ${data.comisiones.length} comisión(es) registrada(s).
                </p>
            </div>
        </div>
    `;
}

function setText(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
        elemento.textContent = valor;
    }
}

function formatearFecha(fecha) {
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
    modalBody.innerHTML = "";
    document.body.classList.remove("modal-open");
}