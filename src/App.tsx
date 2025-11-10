import { usePhoneVerification } from './hooks/usePhoneVerification'
import { PhoneInputForm, VerificationResult } from './components/phone-verification'

function App() {
  const {
    screen,
    countryCode,
    phoneNumber,
    isLoading,
    result,
    isValid,
    setCountryCode,
    setPhoneNumber,
    authenticate,
    reset,
  } = usePhoneVerification()

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="w-full max-w-md animate-fade-in">
        {screen === 'input' ? (
          <PhoneInputForm
            countryCode={countryCode}
            phoneNumber={phoneNumber}
            isLoading={isLoading}
            isValid={isValid}
            onCountryCodeChange={setCountryCode}
            onPhoneNumberChange={setPhoneNumber}
            onAuthenticate={authenticate}
          />
        ) : (
          <VerificationResult
            result={result}
            phoneNumber={phoneNumber}
            countryCode={countryCode}
            onReset={reset}
          />
        )}

        <footer className="text-center mt-8">
          <p className="text-sm text-gray-500">
            &copy; 2025 CheckPoint Hackathon
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
