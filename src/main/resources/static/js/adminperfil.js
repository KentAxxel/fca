function toggleSidebar() {
    const sidebar = document.getElementById("sidebar") || document.querySelector(".sidebar");
    const overlay = document.getElementById("overlay") || document.getElementById("mobileOverlay");

    if (sidebar) {
        sidebar.classList.toggle("open");
        sidebar.classList.toggle("active");
    }

    if (overlay) {
        overlay.classList.toggle("show");
        overlay.classList.toggle("active");
    }
}

function toggleSubmenu() {
    const submenu = document.getElementById("submenuPublicaciones");

    if (submenu) {
        submenu.classList.toggle("open");
    }
}

function hayModalActivo() {
    return Boolean(document.querySelector(".modal-overlay.active, .modal.show"));
}

function bloquearFondo() {
    document.body.classList.add("modal-open");
}

function desbloquearFondoSiCorresponde() {
    if (!hayModalActivo()) {
        document.body.classList.remove("modal-open");
    }
}

function openProfileModal() {
    const modal = document.getElementById("profileModal");

    if (!modal) {
        console.error("No se encontró el modal con id profileModal");
        return;
    }

    modal.classList.add("active");
    bloquearFondo();
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    desbloquearFondoSiCorresponde();
}

function openMessagesModal() {
    const modal = document.getElementById("messagesModal");

    if (!modal) {
        console.error("No se encontró el modal con id messagesModal");
        return;
    }

    modal.classList.add("active");
    bloquearFondo();
}

function closeMessagesModal() {
    const modal = document.getElementById("messagesModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    desbloquearFondoSiCorresponde();
}

document.addEventListener("DOMContentLoaded", () => {
    const profileModal = document.getElementById("profileModal");
    const messagesModal = document.getElementById("messagesModal");

    if (profileModal) {
        profileModal.addEventListener("click", (e) => {
            if (e.target === profileModal) {
                closeProfileModal();
            }
        });
    }

    if (messagesModal) {
        messagesModal.addEventListener("click", (e) => {
            if (e.target === messagesModal) {
                closeMessagesModal();
            }
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeProfileModal();
            closeMessagesModal();
        }
    });
});
