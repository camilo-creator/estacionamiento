import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Loader2, Shield, CheckCircle, Plus, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SecureRegistrationProps {
  onRegister: (data: {
    email: string;
    password: string;
    name: string;
    rut: string;
    phone: string;
    plates: string[];
    unit: string;
  }) => Promise<void>;
  loading?: boolean;
}

const UNITS = [
  "Dirección",
  "Dental",
  "Farmacia",
  "Ambulancia",
  "UAC",
  "Sector Rojo",
  "Sector Amarillo",
  "Transversal",
  "Box Psicosocial",
  "Sala ERA",
  "Vacunatorio",
  "Telesalud",
  "Oirs/Sau",
  "Esterilización",
  "Bodega de Alimentos",
  "Bodega de Farmacia",
  "Dependencia Severa",
  "Sala de Psicomotricidad",
  "Sala de Estimulación DSM",
  "Apoyo Clínico",
  "Ex SIGGES"
];

// Validar RUT chileno
const validateRUT = (rut: string): boolean => {
  const cleanRUT = rut.replace(/[.-]/g, '').toUpperCase();
  if (cleanRUT.length < 8) return false;
  
  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);
  
  let sum = 0;
  let multiplier = 2;
  
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1;
  }
  
  const expectedDV = 11 - (sum % 11);
  const calculatedDV = expectedDV === 11 ? '0' : expectedDV === 10 ? 'K' : expectedDV.toString();
  
  return dv === calculatedDV;
};

// Formatear RUT
const formatRUT = (rut: string): string => {
  const cleanRUT = rut.replace(/[.-]/g, '');
  if (cleanRUT.length < 2) return rut;
  
  const body = cleanRUT.slice(0, -1);
  const dv = cleanRUT.slice(-1);
  
  let formattedBody = '';
  let count = 0;
  
  for (let i = body.length - 1; i >= 0; i--) {
    if (count === 3) {
      formattedBody = '.' + formattedBody;
      count = 0;
    }
    formattedBody = body[i] + formattedBody;
    count++;
  }
  
  return `${formattedBody}-${dv}`;
};

export function SecureRegistration({ onRegister, loading = false }: SecureRegistrationProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    rut: '',
    phone: '',
    unit: ''
  });
  const [plates, setPlates] = useState<string[]>(['']);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState('');
  const [showTerms, setShowTerms] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRUTChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9kK]/g, '');
    setFormData({ ...formData, rut: value });
  };

  const addPlate = () => {
    setPlates([...plates, '']);
  };

  const removePlate = (index: number) => {
    if (plates.length > 1) {
      setPlates(plates.filter((_, i) => i !== index));
    }
  };

  const updatePlate = (index: number, value: string) => {
    const newPlates = [...plates];
    newPlates[index] = value.toUpperCase().replace(/\s/g, '');
    setPlates(newPlates);
  };

  const validateStep1 = () => {
    if (!formData.email.includes('@')) {
      setError('Ingresa un correo válido');
      return false;
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (formData.name.trim().length < 3) {
      setError('Ingresa tu nombre completo');
      return false;
    }
    if (!validateRUT(formData.rut)) {
      setError('El RUT ingresado no es válido');
      return false;
    }
    if (formData.phone.replace(/\D/g, '').length < 9) {
      setError('Ingresa un teléfono válido');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    const validPlates = plates.filter(p => p.trim().length >= 5);
    if (validPlates.length === 0) {
      setError('Ingresa al menos una patente válida');
      return false;
    }
    if (!formData.unit) {
      setError('Selecciona tu unidad de trabajo');
      return false;
    }
    if (!acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setError('');
    if (!validateStep3()) return;

    const validPlates = plates.filter(p => p.trim().length >= 5).map(p => p.toUpperCase().replace(/\s/g, ''));

    try {
      await onRegister({
        email: formData.email,
        password: formData.password,
        name: formData.name.trim(),
        rut: formatRUT(formData.rut),
        phone: formData.phone,
        plates: validPlates,
        unit: formData.unit
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al registrar usuario');
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-800">¡Registro Exitoso!</h3>
            <p className="text-gray-600">
              Tu cuenta ha sido creada exitosamente. Ahora puedes iniciar sesión.
            </p>
            <Button onClick={() => window.location.reload()} className="w-full">
              Ir al inicio de sesión
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-sky-600" />
          <span className="text-sm text-sky-600 font-medium">Registro Seguro</span>
        </div>
        <CardTitle className="text-xl">Inscripción de Funcionario</CardTitle>
        <CardDescription>
          Paso {step} de 3: {step === 1 ? 'Cuenta de acceso' : step === 2 ? 'Datos personales' : 'Información de vehículos'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-sky-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-email">Correo electrónico</Label>
              <Input
                id="reg-email"
                type="email"
                placeholder="tu@gmail.com, tu@hotmail.com, etc."
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-password">Contraseña</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Nombre completo</Label>
              <Input
                id="reg-name"
                placeholder="Ej: María González Pérez"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-rut">RUT</Label>
              <Input
                id="reg-rut"
                placeholder="Ej: 12345678-9"
                value={formData.rut}
                onChange={handleRUTChange}
                maxLength={9}
              />
              <p className="text-xs text-gray-500">Ingresa RUT sin puntos ni guión</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Teléfono</Label>
              <Input
                id="reg-phone"
                type="tel"
                placeholder="Ej: 912345678"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                maxLength={9}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Patente(s) de tu(s) vehículo(s)</Label>
              <p className="text-xs text-gray-500">Puedes agregar más de una patente si tienes varios vehículos</p>
              <div className="space-y-2">
                {plates.map((plate, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder={`Ej: ABCD12`}
                      value={plate}
                      onChange={(e) => updatePlate(index, e.target.value)}
                      maxLength={6}
                    />
                    {plates.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removePlate(index)}
                        className="shrink-0 text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPlate}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Agregar otra patente
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-unit">Unidad/Sector donde trabaja</Label>
              <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu unidad" />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((unit) => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-start space-x-2 pt-2">
              <Checkbox 
                id="terms" 
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Acepto los{' '}
                  <button 
                    type="button"
                    onClick={() => setShowTerms(true)}
                    className="text-sky-600 underline hover:text-sky-700"
                  >
                    Términos y Condiciones
                  </button>
                </label>
                <p className="text-xs text-gray-500">
                  Conforme a la Ley 19.628 sobre protección de la vida privada
                </p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 mt-6">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              Anterior
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={handleNext} className="flex-1">
              Siguiente
            </Button>
          ) : (
            <Button onClick={handleSubmit} className="flex-1" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Completar Registro
            </Button>
          )}
        </div>
      </CardContent>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Términos y Condiciones</DialogTitle>
            <DialogDescription>
              Uso de datos para la gestión del estacionamiento CESFAM Karol Wojtyla
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <p>
              Al registrarse y/o utilizar esta aplicación, el usuario declara haber leído y 
              aceptado íntegramente los presentes Términos y Condiciones.
            </p>
            <h4 className="font-semibold">1. Objeto</h4>
            <p>
              La aplicación tiene como finalidad facilitar la gestión del estacionamiento 
              del CESFAM Karol Wojtyla, permitiendo el registro de vehículos, check-in diario 
              y notificación entre funcionarios.
            </p>
            <h4 className="font-semibold">2. Datos Personales</h4>
            <p>
              Los datos personales solicitados (nombre, RUT, teléfono, patente, sector) serán 
              utilizados exclusivamente para los fines de la aplicación, conforme a la Ley 
              19.628 sobre protección de la vida privada.
            </p>
            <h4 className="font-semibold">3. Responsabilidad</h4>
            <p>
              El usuario es responsable de mantener la confidencialidad de sus credenciales 
              de acceso y de la veracidad de los datos proporcionados.
            </p>
            <h4 className="font-semibold">4. Uso Aceptable</h4>
            <p>
              El usuario se compromete a utilizar la aplicación de manera responsable y 
              exclusivamente para los fines establecidos.
            </p>
          </div>
          <Button onClick={() => setShowTerms(false)} className="w-full mt-4">
            Cerrar
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
