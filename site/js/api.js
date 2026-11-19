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

async function getDisponibilites(id) {
    const response = await fetch(`${API_BASE_URL}/travaux/${encodeURIComponent(id)}/disponibilites`);

    if (!response.ok) {
        throw new Error("Impossible de récupérer les créneaux.");
    }
    return await response.json();
}

async function enregistrerDisponibilites(id, matricule, nom, creneaux) {
    const response = await fetch(
        `${API_BASE_URL}/travaux/${encodeURIComponent(id)}/disponibilites/${encodeURIComponent(matricule)}`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nom: nom,
                creneaux: creneaux
            })
        }
    );

    const resultat = await response.json();

    if (!response.ok) {
        throw new Error(resultat.erreurs?.[0] || "Impossible d'enregistrer les disponibilités.");
    }
    return resultat;
}