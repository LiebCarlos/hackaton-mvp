/*
 * ========================================
 * ORQUESTADOR CHECKPOINT (api/checkpoint.js)
 * ========================================
 * Compatible con Vercel Serverless (sin npm)
 */

// --- URLs Constantes (del Kit de Recursos PDF) ---

// URL para obtener el token de acceso
const TOKEN_URL = 'https://access-checkpoint.free.beeceptor.com';

// URL base para llamar a las APIs
const API_BASE_URL = 'https://access-checkpoint.free.beeceptor.com';

// Scopes combinados para las 3 APIs que usaremos
const API_SCOPES = 'openid dpv:FraudPreventionAndDetection2LA#number-verification dpv:FraudPreventionAndDetection#sim-swap dpv:FraudPreventionAndDetection#device-status';

/**
 * =============================================================
 * PASO 1: Obtener el Access Token
 * =============================================================
 * Intercambia las credenciales (Base64) por un token temporal.
 */
async function getAccessToken(base64Credentials) {
    
    // El body debe estar en formato x-www-form-urlencoded
    const bodyParams = new URLSearchParams();
    bodyParams.append('grant_type', 'client_credentials');
    bodyParams.append('scope', API_SCOPES);

    try {
        const response = await fetch(TOKEN_URL, {
            method: 'POST',
            headers: {
                // El 'Basic ' es clave. Vercel nos da el string en Base64.
                'Authorization': `Basic ${base64Credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: bodyParams
        });

        if (!response.ok) {
            console.error('Error al obtener token:', await response.text());
            throw new Error('Fallo de autenticación con el proveedor de API');
        }

        const data = await response.json();
        return data.access_token; // Retorna el token temporal

    } catch (error) {
        console.error('Error fatal en getAccessToken:', error);
        throw error;
    }
}

/**
 * =============================================================
 * PASO 2: Función Helper para llamar a las APIs
 * =============================================================
 * Función genérica para hacer POST a las APIs usando el token.
 */
async function callApi(route, body, accessToken) {
    const fullUrl = `${API_BASE_URL}${route}`;
    
    try {
        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { // <-- El error estaba acá: 'Header:' en vez de 'headers:'
                'Authorization': `Bearer ${accessToken}`, // Token temporal
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            // Manejo de errores de API, ej: número desconocido
            const errorData = await response.json();
            console.warn(`API ${route} falló:`, errorData);
            
            // Si el número no existe, lo tratamos como "indefinido"
            if (response.status === 404) {
                return { error: 'UNKNOWN_NUMBER', status: 404 };
            }
            throw new Error(`API ${route} devolvió ${response.status}`);
        }
        
        return await response.json();

    } catch (error) {
        console.error(`Error fatal en callApi (${route}):`, error);
        throw error;
    }
}

/**
 * =============================================================
 * PASO 3: El Handler Principal (El Orquestador)
 * =============================================================
 * Punto de entrada de la Vercel Serverless Function.
 */
export default async function handler(request, response) {

    // 1. Validar que sea un POST
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Solo se permite POST' });
    }

    try {
        // 2. Obtener datos del frontend y la credencial de Vercel
        const { numeroTelefono } = request.body;
        const base64Credentials = process.env.CLIENT_CREDENTIALS_BASE64;

        if (!numeroTelefono) {
            return response.status(400).json({ message: 'Falta "numeroTelefono".' });
        }
        if (!base64Credentials) {
            return response.status(500).json({ message: 'Variable de entorno CLIENT_CREDENTIALS_BASE64 no configurada en Vercel.' });
        }
        
        console.log(`[Orquestador] Iniciando chequeo para: ${numeroTelefono}`);

        // 3. Obtener el Access Token (Paso 1)
        const accessToken = await getAccessToken(base64Credentials);
        if (!accessToken) {
            return response.status(500).json({ message: 'No se pudo obtener el Access Token.' });
        }
        
        // 4. Llamar a las 3 APIs en paralelo (Paso 2)
        const [simSwapResult, numVerifyResult, deviceStatusResult] = await Promise.all([
            
            // API 1: SIM Swap Check (¿Cambió la SIM en las últimas 24hs?)
            callApi('sim-swap/v0/check', { 
                phoneNumber: numeroTelefono, 
                maxAge: 2400 // 100 dias horas es un buen default para fraude
            }, accessToken),
            
            // API 2: Number Verification
            callApi('number-verification/v0/verify', { 
                phoneNumber: numeroTelefono 
            }, accessToken),
            
            // API 3: Device Status (Roaming)
            // ¡Ojo! El body de esta API es anidado
            callApi('device-status/v0/roaming', { 
                device: { phoneNumber: numeroTelefono } 
            }, accessToken)
        ]);
        
        // AGREGADO: Logs para ver las respuestas de las APIs
        console.log('Respuesta SIM Swap:', JSON.stringify(simSwapResult));
        console.log('Respuesta Num Verify:', JSON.stringify(numVerifyResult));
        console.log('Respuesta Device Status:', JSON.stringify(deviceStatusResult));


        // 5. Lógica de Scoring (Paso 3)
        let score = 100;
        let reasons = [];

        // Regla 1: SIM Swap
        if (simSwapResult.swapped === true) {
            score = 0; // ¡Fraude casi seguro!
            reasons.push('Fraude detectado: SIM Swap reciente.');
        } else {
            // Si el número no existe, no podemos confiar
            if (simSwapResult.error === 'UNKNOWN_NUMBER') { score -= 10; reasons.push('Riesgo: SIM desconocida.'); }
        }

        // Regla 2: Number Verification
        if (numVerifyResult['devicePhone NumberVerified'] === false) {
            score -= 60; // Penalidad alta
            reasons.push('Riesgo: El número no coincide con el dispositivo.');
        }

        // Regla 3: Roaming
        if (deviceStatusResult.roaming === true) {
            score -= 20; // Penalidad media
            reasons.push('Riesgo: Dispositivo en roaming.');
        }

        // 6. Decisión Final (Paso 4)
        let decision, message, type;
        if (score <= 10) {
            decision = 'BLOQUEADO'; message = reasons.join(' '); type = 'danger';
        } else if (score < 80) {
            decision = 'REVISIÓN'; message = 'Verificación adicional. ' + reasons.join(' '); type = 'warning';
        } else {
            decision = 'APROBADO'; message = 'Acceso seguro concedido.'; type = 'success';
        }

        console.log(`[Orquestador] Decisión: ${decision} (Score: ${score})`);

        // 7. Devolver respuesta al frontend
        response.status(200).json({ decision, score, message, type });

    } catch (error) {
        console.error('Error fatal en el handler:', error.message);
        response.status(500).json({ 
            decision: 'ERROR', 
            type: 'danger', 
            message: 'Error interno del servidor. Revisa los logs de Vercel.' 
        });
    }
}