let navegacionInterna = false;

document.addEventListener("DOMContentLoaded", () => {
    marcarNavegacionInterna();
});

function marcarNavegacionInterna() {
    document.querySelectorAll("a[href]").forEach(link => {
        link.addEventListener("click", () => {
            const href = link.getAttribute("href");

            if (!href) {
                return;
            }

            if (
                href.startsWith("/") ||
                href.startsWith("#") ||
                href.startsWith(window.location.origin)
            ) {
                navegacionInterna = true;
            }
        });
    });

    document.querySelectorAll("form").forEach(form => {
        form.addEventListener("submit", () => {
            navegacionInterna = true;
        });
    });
}

window.addEventListener("pagehide", () => {
    if (navegacionInterna) {
        return;
    }

    const csrfToken = document.querySelector('meta[name="_csrf"]')?.getAttribute("content");
    const csrfHeader = document.querySelector('meta[name="_csrf_header"]')?.getAttribute("content");

    const headers = {
        type: "application/json"
    };

    const data = JSON.stringify({
        csrfHeader,
        csrfToken,
        closedAt: new Date().toISOString()
    });

    const blob = new Blob([data], headers);

    navigator.sendBeacon("/api/session/close-tab", blob);
});