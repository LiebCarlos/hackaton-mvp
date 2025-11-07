document.addEventListener('DOMContentLoaded', () => {
    const authInputSection = document.getElementById('auth-input');
    const authResultSection = document.getElementById('auth-result');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const authenticateButton = document.getElementById('authenticateButton');
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const scoreText = document.getElementById('scoreText');
    const resetButton = document.getElementById('resetButton');

    /**
     * =============================================================
     * FUNCIÓN REAL PARA LLAMAR AL ORQUESTADOR
     * =============================================================
     * Esta función reemplaza la simulación.
     */
    async function callOrchestrator(number) {
        
        // Esta es la URL de TU PROPIO BACKEND (EL ORQUESTADOR)
        // Como Vercel sirve tu index.html y tu api/ juntos desde el mismo
        // dominio (ej: project-h-athon.vercel.app), podés usar una URL relativa.
        // ¡Esto evita problemas de CORS!
        const ORCHESTRATOR_URL = 'https://project-h-athon.vercel.app/api/checkpoint'; 

        console.log(`Llamando al orquestador real en: ${ORCHESTRATOR_URL}`);

        try {
            // Hacemos el "fetch" (POST) a nuestro backend
            const response = await fetch(ORCHESTRATOR_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // Le mandamos el número en el body, como un JSON
                body: JSON.stringify({
                    numeroTelefono: number // Tu backend espera 'numeroTelefono'
                })
            });

            // Si el backend (tu API) falla (devuelve un 400, 500, etc.)
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error devuelto por el orquestador:', errorData);
                throw new Error(errorData.message || 'Error en el orquestador');
            }

            // Si todo sale bien (200 OK), devolvemos el JSON
            const result = await response.json();
            console.log('Respuesta del backend:', result); // Log para depurar
            return result;

        } catch (error) {
            // Esto atrapa errores de red (ej: no hay internet) o el 'throw' de arriba
            console.error('Error fatal llamando al orquestador:', error);
            
            // Devolvemos un objeto de error para que la UI lo muestre
            return {
                decision: 'ERROR',
                score: 0,
                type: 'danger',
                message: 'No se pudo conectar al servidor. Revisa los logs de Vercel.'
            };
        }
    }

    // Manejar el clic del botón de autenticación
    authenticateButton.addEventListener('click', async () => {
        const phoneNumber = phoneNumberInput.value.trim();

        if (phoneNumber === '') {
            // ¡NO USAR ALERT! Mostramos el error en la UI.
            authInputSection.classList.add('hidden');
            authResultSection.classList.remove('hidden');
            resultText.textContent = 'Por favor, ingresa un número de teléfono.';
            scoreText.textContent = '';
            resultBox.className = 'result-box danger'; // Aplicamos clase de error
            resetButton.disabled = false; // Permitir resetear
            authenticateButton.disabled = false; // Re-habilitar botón
            phoneNumberInput.disabled = false; // Re-habilitar input
            authenticateButton.textContent = 'Autenticar de forma segura';
            return;
        }

        // Deshabilitar UI durante la llamada
        authenticateButton.disabled = true;
        phoneNumberInput.disabled = true;
        authenticateButton.textContent = 'Autenticando...';
        resultBox.className = 'result-box'; // Limpia clases anteriores
        resultText.textContent = 'Procesando tu solicitud...';
        scoreText.textContent = '';
        authInputSection.classList.add('hidden');
        authResultSection.classList.remove('hidden');


        // ¡Llamar a la función REAL que acabamos de configurar!
        const result = await callOrchestrator(phoneNumber);

        // Mostrar el resultado
        resultText.textContent = `${result.message}`;
        scoreText.textContent = `Score de Confianza: ${result.score}`;
        resultBox.classList.add(result.type); // Aplica clase de estilo (success, warning, danger)

        // Habilitar el botón de reset
        resetButton.disabled = false;
    });

    // Manejar el clic del botón de volver a intentar
    resetButton.addEventListener('click', () => {
        authResultSection.classList.add('hidden');
        authInputSection.classList.remove('hidden');

        phoneNumberInput.value = ''; // Limpiar el campo
        authenticateButton.disabled = false;
        phoneNumberInput.disabled = false;
        authenticateButton.textContent = 'Autenticar de forma segura';
        resultBox.className = 'result-box'; // Limpiar clases
        resultText.textContent = '';
        scoreText.textContent = '';
    });
});