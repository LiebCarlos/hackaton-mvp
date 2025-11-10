document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELECCIÓN DE ELEMENTOS ---
    const authInputSection = document.getElementById('auth-input');
    const authResultSection = document.getElementById('auth-result');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const authenticateButton = document.getElementById('authenticateButton');
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const scoreText = document.getElementById('scoreText');
    const resetButton = document.getElementById('resetButton');
    const consentCheckbox = document.getElementById('consentCheck');

    // --- 2. INICIALIZACIÓN DE LA LIBRERÍA DE TELÉFONO (intl-tel-input) ---
    const iti = window.intlTelInput(phoneNumberInput, {
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@19.2.16/build/js/utils.js",
        initialCountry: "ar",
        separateDialCode: true,
        preferredCountries: ["ar", "br", "cl", "uy", "us", "es"]
    });

    // --- 3. LÓGICA DEL CHECKBOX DE CONSENTIMIENTO ---
    if (consentCheckbox && authenticateButton) {
        consentCheckbox.addEventListener('change', () => {
            // Habilita el botón solo si el checkbox está marcado
            authenticateButton.disabled = !consentCheckbox.checked;
        });
    }

    // --- 4. FUNCIÓN PARA LLAMAR AL BACKEND (ORQUESTADOR) ---
    async function callOrchestrator(number) {
        const ORCHESTRATOR_URL = 'https://project-h-athon.vercel.app/api/checkpoint';
        console.log(`Llamando al orquestador real en: ${ORCHESTRATOR_URL}`);

        try {
            const response = await fetch(ORCHESTRATOR_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    numeroTelefono: number // Tu backend espera 'numeroTelefono'
                })
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

    // --- 5. LÓGICA DEL BOTÓN "AUTENTICAR" ---
    authenticateButton.addEventListener('click', async () => {
        
        // Obtenemos el número ya formateado (ej: +54911...)
        const phoneNumber = iti.getNumber(); 

        // --- VALIDACIONES ---
        // Validación 1: El número está vacío
        if (phoneNumber.trim() === '') {
            authInputSection.classList.add('hidden');
            authResultSection.classList.remove('hidden');
            resultText.textContent = 'Por favor, ingresa un número de teléfono.';
            scoreText.textContent = '';
            resultBox.className = 'result-box danger';
            resetButton.disabled = false;
            authenticateButton.disabled = true; // Queda deshabilitado porque el check se resetea
            phoneNumberInput.disabled = false;
            authenticateButton.textContent = 'Autenticar de forma segura';
            return;
        }

        // Validación 2: El número es inválido (ej: "123")
        if (!iti.isValidNumber()) {
            authInputSection.classList.add('hidden');
            authResultSection.classList.remove('hidden');
            resultText.textContent = 'El número de teléfono ingresado no es válido.';
            scoreText.textContent = '';
            resultBox.className = 'result-box danger';
            resetButton.disabled = false;
            authenticateButton.disabled = !consentCheckbox.checked;
            phoneNumberInput.disabled = false;
            authenticateButton.textContent = 'Autenticar de forma segura';
            return;
        }

        // --- SI PASA, DESHABILITAMOS LA UI ---
        // (Este es el código que se había salido de lugar)
        authenticateButton.disabled = true;
        phoneNumberInput.disabled = true;
        authenticateButton.textContent = 'Autenticando...';
        resultBox.className = 'result-box';
        resultText.textContent = 'Procesando tu solicitud...';
        scoreText.textContent = '';
        authInputSection.classList.add('hidden');
        authResultSection.classList.remove('hidden');

        // --- LLAMAMOS AL BACKEND ---
        const numeroParaAPI = phoneNumber.substring(1);
        const result = await callOrchestrator(phoneNumber);

        // --- MOSTRAMOS EL RESULTADO ---
        resultText.textContent = `${result.message}`;
        scoreText.textContent = `Score de Confianza: ${result.score}`;
        resultBox.classList.add(result.type); 

        // Habilitar el botón de reset
        resetButton.disabled = false;
    });

    // --- 6. LÓGICA DEL BOTÓN "VOLVER A INTENTAR" ---
    resetButton.addEventListener('click', () => {
        authResultSection.classList.add('hidden');
        authInputSection.classList.remove('hidden');

        phoneNumberInput.value = ''; // Limpiar el campo
        consentCheckbox.checked = false; // Desmarcar el tilde
        authenticateButton.disabled = true; // Deshabilitar el botón de autenticar
        phoneNumberInput.disabled = false;
        iti.setCountry("ar"); // Resetear la bandera a Argentina

        authenticateButton.textContent = 'Autenticar de forma segura';
        resultBox.className = 'result-box'; 
        resultText.textContent = '';
        scoreText.textContent = '';
    });
});