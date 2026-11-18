async function getTravaux() {
    const response = await fetch(`${API_BASE_URL}/travaux`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les travaux.");
    }

    return await response.json();
}

async function getTravail(id) {
    const response = await fetch(`${API_BASE_URL}/travaux/${encodeURIComponent(id)}`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer le travail.");
    }

    return await response.json();
}