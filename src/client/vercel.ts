const VERCEL_BACK_URL = 'https://project-h-athon.vercel.app/api/checkpoint';

async function callOrchestrator(number: string) {
    console.log(`Llamando al orquestador real en: ${VERCEL_BACK_URL}`);

    try {
        const body = JSON.stringify({
            numeroTelefono: number,
        });

        const response = await fetch(VERCEL_BACK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error devuelto por el orquestador:', errorData);
            throw new Error(errorData.message || 'Error en el orquestador');
        }

        const result = await response.json();
        console.log('Respuesta del backend:', result);
        return result;
    } catch (error) {
        console.error('Error fatal llamando al orquestador:', error);
        return {
            decision: 'ERROR',
            score: 0,
            type: 'danger',
            message: 'No se pudo conectar al servidor. Revisa los logs de Vercel.'
        };
    }
}

