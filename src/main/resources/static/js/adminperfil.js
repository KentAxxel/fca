function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");

    if (sidebar) {
        sidebar.classList.toggle("open");
    }

    if (overlay) {
        overlay.classList.toggle("show");
    }
}

function toggleSubmenu() {
    const submenu = document.getElementById("submenuPublicaciones");

    if (submenu) {
        submenu.classList.toggle("open");
    }
}


function openProfileModal() {
    const modal = document.getElementById("profileModal");

    if (!modal) {
        console.error("No se encontró el modal con id profileModal");
        return;
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeProfileModal() {
    const modal = document.getElementById("profileModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
}

function openMessagesModal() {
    const modal = document.getElementById("messagesModal");

    if (!modal) {
        console.error("No se encontró el modal con id messagesModal");
        return;
    }

    modal.classList.add("active");
    document.body.classList.add("modal-open");
}

function closeMessagesModal() {
    const modal = document.getElementById("messagesModal");

    if (!modal) {
        return;
    }

    modal.classList.remove("active");
    document.body.classList.remove("modal-open");
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

