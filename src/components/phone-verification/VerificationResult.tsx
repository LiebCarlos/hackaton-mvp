import { Button } from '../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CheckCircle2, AlertCircle } from 'lucide-react'
import { VerificationResult as VerificationResultType } from '../../services/PhoneVerificationService'
import { PhoneVerificationService } from '../../services/PhoneVerificationService'

interface VerificationResultProps {
  result: VerificationResultType
  phoneNumber: string
  countryCode: string
  onReset: () => void
}

export function VerificationResult({
  result,
  phoneNumber,
  countryCode,
  onReset,
}: VerificationResultProps) {
  const getCardBorderClass = () => {
    switch (result.type) {
      case 'success':
        return 'border-green-500/30'
      case 'warning':
        return 'border-yellow-500/30'
      case 'danger':
        return 'border-red-500/30'
      default:
        return 'border-white/10'
    }
  }

  const getIconBackgroundClass = () => {
    switch (result.type) {
      case 'success':
        return 'bg-green-500/10'
      case 'warning':
        return 'bg-yellow-500/10'
      case 'danger':
        return 'bg-red-500/10'
      default:
        return 'bg-primary/10'
    }
  }

  const getIconColorClass = () => {
    switch (result.type) {
      case 'success':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'danger':
        return 'text-red-500'
      default:
        return 'text-primary'
    }
  }

  const getScoreColorClass = () => {
    switch (result.type) {
      case 'success':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      case 'danger':
        return 'text-red-500'
      default:
        return 'text-white'
    }
  }

  const getProgressBarColorClass = () => {
    switch (result.type) {
      case 'success':
        return 'bg-green-500'
      case 'warning':
        return 'bg-yellow-500'
      case 'danger':
        return 'bg-red-500'
      default:
        return 'bg-primary'
    }
  }

  const getTitle = () => {
    switch (result.decision) {
      case 'APROBADO':
        return 'Verificación Exitosa'
      case 'REVISIÓN':
        return 'Verificación Pendiente'
      case 'BLOQUEADO':
        return 'Verificación Fallida'
      default:
        return 'Resultado de Verificación'
    }
  }

  const getButtonVariant = () => {
    return result.type === 'success' ? 'default' : 'outline'
  }

  const getButtonText = () => {
    return result.type === 'success' ? 'Continuar' : 'Intentar nuevamente'
  }

  return (
    <Card className={`glass-effect border-white/10 ${getCardBorderClass()} animate-scale-in`}>
      <CardHeader className="text-center space-y-4 pb-6">
        <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center animate-scale-in ${getIconBackgroundClass()}`}>
          {result.type === 'success' ? (
            <CheckCircle2 className={`w-10 h-10 ${getIconColorClass()}`} />
          ) : (
            <AlertCircle className={`w-10 h-10 ${getIconColorClass()}`} />
          )}
        </div>
        <div>
          <CardTitle className="text-2xl font-bold text-white mb-2">
            {getTitle()}
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            {result.message}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Número verificado</span>
            <span className="text-sm font-mono text-white">
              {PhoneVerificationService.maskPhoneNumber(phoneNumber, countryCode)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-400">Score de confianza</span>
            <span className={`text-lg font-bold ${getScoreColorClass()}`}>
              {result.score}/100
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${getProgressBarColorClass()}`}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onReset}
            className="w-full text-base font-semibold h-12"
            variant={getButtonVariant()}
          >
            {getButtonText()}
          </Button>

          <button
            onClick={onReset}
            className="w-full text-sm text-gray-400 hover:text-primary transition-colors duration-300"
          >
            Cambiar número
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
