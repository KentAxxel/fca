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

.messages-modal {
    width: min(620px, 100%);
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    overscroll-behavior: contain;

    background: #ffffff;
    border-radius: 28px;
    padding: 28px;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.25);

    animation: modalIn 0.25s ease;
}

.messages-modal::-webkit-scrollbar {
    width: 8px;
}

.messages-modal::-webkit-scrollbar-thumb {
    background: #cfd8d3;
    border-radius: 999px;
}