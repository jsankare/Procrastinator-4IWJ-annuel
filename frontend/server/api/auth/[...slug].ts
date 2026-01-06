/**
 * Proxy pour l'auth-service en développement local
 * Redirige toutes les requêtes /api/auth/* vers http://localhost:3001/*
 * Cela simule le comportement de Caddy qui fait strip_prefix
 */

export default defineEventHandler(async (event) => {
    const path = event.path;

    // Extraire le chemin après /api/auth
    const targetPath = path.replace(/^\/api\/auth/, '');

    // URL de l'auth-service en local
    const authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const targetUrl = `${authServiceUrl}${targetPath}`;

    console.log(`[Proxy] ${event.method} ${path} -> ${targetUrl}`);

    // Récupérer les headers de la requête originale
    const headers = getHeaders(event);

    // Récupérer le body si c'est une requête POST/PUT/PATCH
    let body;
    if (['POST', 'PUT', 'PATCH'].includes(event.method)) {
        body = await readBody(event);
    }

    // Faire la requête vers l'auth-service
    try {
        const response = await $fetch(targetUrl, {
            method: event.method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': headers.authorization || '',
            },
            body: body,
            // Ne pas lancer d'erreur sur les statuts 4xx/5xx
            ignoreResponseError: true,
        });

        return response;
    } catch (error: any) {
        console.error(`[Proxy] Error proxying to ${targetUrl}:`, error);

        // Retourner l'erreur au client
        return {
            success: false,
            error: error.message || 'Erreur de connexion au service d\'authentification',
        };
    }
});
