const VERCEL_BACK_URL = 'https://project-h-athon.vercel.app/api/checkpoint';

export const COUNTRIES = [
  { code: '+54', flag: '🇦🇷', label: 'Argentina' },
  { code: '+1',  flag: '🇺🇸', label: 'Estados Unidos' },
  { code: '+34', flag: '🇪🇸', label: 'España' },
  { code: '+52', flag: '🇲🇽', label: 'México' },
  { code: '+55', flag: '🇧🇷', label: 'Brasil' },
]

export type VerificationResult = {
  decision: 'APROBADO' | 'REVISIÓN' | 'BLOQUEADO' | 'ERROR' | null
  score: number
  message: string
  type: 'success' | 'warning' | 'danger'
}

export class PhoneVerificationService {
  /**
   * Validates a phone number (removes spaces and hyphens, checks for 8-15 digits)
   */
  static validatePhoneNumber(number: string): boolean {
    const cleaned = number.replace(/[\s-]/g, '')
    return /^\d{8,15}$/.test(cleaned)
  }

  /**
   * Masks a phone number for secure display
   */
  static maskPhoneNumber(number: string, code: string): string {
    const cleaned = number.replace(/[\s-]/g, '')
    if (cleaned.length < 4) return `${code} ${number}`
    const visible = cleaned.slice(-2)
    const masked = '*'.repeat(Math.min(cleaned.length - 2, 6))
    return `${code} ${masked}${visible}`
  }

  static async callOrchestrator(fullNumber: string): Promise<VerificationResult> {
    console.log(`Llamando al orquestador real en: ${VERCEL_BACK_URL}`);

    try {
      const body = JSON.stringify({
        numeroTelefono: fullNumber,
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


  /**
   * Simulates calling the orchestrator API
   */
  static async mockedCallOrchestrator(fullNumber: string): Promise<VerificationResult> {
    console.log(`Llamando al orquestador con número: ${fullNumber}`)

    // Simulación de delay de red
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Lógica de simulación de respuesta
    const mockResponses: VerificationResult[] = [
      { decision: 'APROBADO', score: 95, type: 'success', message: 'Acceso seguro concedido.' },
      { decision: 'REVISIÓN', score: 40, type: 'warning', message: 'Se requiere verificación adicional. Posible cambio de SIM.' },
      { decision: 'BLOQUEADO', score: 5, type: 'danger', message: 'Acceso denegado por alto riesgo de fraude.' }
    ]

    let mockResult: VerificationResult
    if (fullNumber.includes('111')) {
      mockResult = mockResponses[2]
      console.log("tiene 111")
    } else if (fullNumber.includes('222')) {
      mockResult = mockResponses[1]
    } else if (fullNumber.includes('333')) {
      mockResult = mockResponses[0]
      console.log("tiene 333")
    } else {
      mockResult = mockResponses[Math.floor(Math.random() * mockResponses.length)]
    }

    return mockResult
  }

  /**
   * Creates a default verification result
   */
  static createDefaultResult(): VerificationResult {
    return {
      decision: null,
      score: 0,
      message: '',
      type: 'success'
    }
  }
}
