
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("open");
    document.getElementById("mobileOverlay").classList.toggle("show");
}

function toggleSubmenu() {
    document.getElementById("submenuPublicaciones").classList.toggle("open");
}

function openProfileModal() {
    document.getElementById("profileModal").classList.add("show");
}

function closeProfileModal() {
    document.getElementById("profileModal").classList.remove("show");
}

function openMessagesModal() {
    document.getElementById("messagesModal").classList.add("show");
}

function closeMessagesModal() {
    document.getElementById("messagesModal").classList.remove("show");
}

async function cargarResumenUsuarios() {
    try {
        const response = await fetch("/api/usuarios");

        if (!response.ok) {
            return;
        }

        const usuarios = await response.json();

        document.getElementById("totalUsuarios").textContent = usuarios.length;

    } catch (error) {
        console.log("No se pudo cargar el resumen de usuarios.");
    }
}

function cargarResumenDemoPublicaciones() {
    const noticias = 6;
    const eventos = 4;
    const bolsa = 3;

    document.getElementById("totalNoticias").textContent = noticias;
    document.getElementById("totalEventos").textContent = eventos;
    document.getElementById("totalBolsa").textContent = bolsa;
    document.getElementById("totalPublicaciones").textContent = noticias + eventos + bolsa;
}

cargarResumenUsuarios();
cargarResumenDemoPublicaciones();


