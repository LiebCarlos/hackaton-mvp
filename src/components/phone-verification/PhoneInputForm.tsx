import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { CountrySelect } from '../ui/country-select'
import { Phone, Shield, Loader2 } from 'lucide-react'
import { COUNTRIES } from '../../services/PhoneVerificationService'

interface PhoneInputFormProps {
  countryCode: string
  phoneNumber: string
  isLoading: boolean
  isValid: boolean
  onCountryCodeChange: (code: string) => void
  onPhoneNumberChange: (number: string) => void
  onAuthenticate: () => void
}

export function PhoneInputForm({
  countryCode,
  phoneNumber,
  isLoading,
  isValid,
  onCountryCodeChange,
  onPhoneNumberChange,
  onAuthenticate,
}: PhoneInputFormProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && isValid && !isLoading) {
      onAuthenticate()
    }
  }

  return (
    <Card className="glass-effect border-white/10">
      <CardHeader className="text-center space-y-4 pb-6">
        <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            CheckPoint
          </CardTitle>
          <CardDescription className="text-base text-gray-400">
            Acceso seguro asegurado
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-gray-300 text-base">
            Ingresá tu número para acceder
          </Label>
          <div className="flex gap-2">
            <div className="relative group">
              <CountrySelect
                value={countryCode}
                onChange={onCountryCodeChange}
                countries={COUNTRIES}
                className="w-28"
                aria-label="Código de país"
                showFlagInTrigger={false}
                dropdownWidthClass="w-28"
              />
            </div>
            <div className="flex-1 relative">
              <Input
                id="phone"
                type="tel"
                placeholder="11 2345 6789"
                value={phoneNumber}
                onChange={(e) => onPhoneNumberChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`pr-10 ${isValid && phoneNumber ? 'border-green-500 ring-green-500/20' : ''}`}
                aria-label="Número de teléfono"
                disabled={isLoading}
              />
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            </div>
          </div>
          {phoneNumber && !isValid && (
            <p className="text-xs text-red-400 mt-1">
              Por favor, ingresá un número válido (8-15 dígitos)
            </p>
          )}
        </div>

        <div className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
          <input
            type="checkbox"
            id="consent"
            checked
            disabled
            className="mt-0.5 accent-primary"
            aria-label="Consentimiento de validación"
          />
          <label htmlFor="consent" className="text-xs text-gray-400 leading-relaxed">
            Al continuar, aceptás la validación de tu dispositivo y línea para garantizar tu seguridad.
          </label>
        </div>

        <Button
          onClick={onAuthenticate}
          disabled={!isValid || isLoading}
          className="w-full text-base font-semibold h-12"
          aria-label="Autenticar número"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Autenticando...
            </>
          ) : (
            'Autenticar de forma segura'
          )}
        </Button>

        <p className="text-center text-xs text-gray-500">
          Protegido por tecnología de verificación invisible
        </p>
      </CardContent>
    </Card>
  )
}
