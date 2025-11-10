import { useState } from 'react'
import { PhoneVerificationService, VerificationResult } from '../services/PhoneVerificationService'

export type Screen = 'input' | 'result'

export interface UsePhoneVerificationReturn {
  // State
  screen: Screen
  countryCode: string
  phoneNumber: string
  isLoading: boolean
  result: VerificationResult

  // Computed values
  isValid: boolean

  // Actions
  setCountryCode: (code: string) => void
  setPhoneNumber: (number: string) => void
  authenticate: () => Promise<void>
  reset: () => void
}

export function usePhoneVerification(): UsePhoneVerificationReturn {
  const [screen, setScreen] = useState<Screen>('input')
  const [countryCode, setCountryCode] = useState('+54')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<VerificationResult>(
    PhoneVerificationService.createDefaultResult()
  )

  const isValid = PhoneVerificationService.validatePhoneNumber(phoneNumber)

  const authenticate = async (): Promise<void> => {
    if (!isValid) return

    setIsLoading(true)
    const fullNumber = `${countryCode}${phoneNumber}`

    try {
      const response = await PhoneVerificationService.callOrchestrator(fullNumber)
      setResult(response)
      setScreen('result')
    } catch (error) {
      console.error('Error en autenticación:', error)
      setResult({
        decision: 'BLOQUEADO',
        score: 0,
        message: 'Error al procesar la solicitud. Por favor, intente nuevamente.',
        type: 'danger'
      })
      setScreen('result')
    } finally {
      setIsLoading(false)
    }
  }

  const reset = (): void => {
    setScreen('input')
    setPhoneNumber('')
    setResult(PhoneVerificationService.createDefaultResult())
  }

  return {
    // State
    screen,
    countryCode,
    phoneNumber,
    isLoading,
    result,

    // Computed values
    isValid,

    // Actions
    setCountryCode,
    setPhoneNumber,
    authenticate,
    reset,
  }
}
