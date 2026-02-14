import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VisitorFormProps {
  onSubmit: (name: string, plate: string, destination: string) => Promise<void>;
  onBack: () => void;
  loading?: boolean;
}

const DESTINATIONS = [
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
  "Ex SIGGES",
  "Otro"
];

export function VisitorForm({ onSubmit, onBack, loading = false }: VisitorFormProps) {
  const [name, setName] = useState('');
  const [plate, setPlate] = useState('');
  const [destination, setDestination] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name.trim() || !plate.trim() || !destination) {
      setError('Por favor completa todos los campos');
      return;
    }

    try {
      await onSubmit(name.trim(), plate.trim(), destination);
      setSuccess(true);
      setName('');
      setPlate('');
      setDestination('');
    } catch (err: any) {
      setError(err.message || 'Error al registrar visita');
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
              Tu visita ha sido registrada. Puedes estacionar en el área de visitas.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => setSuccess(false)} variant="outline" className="flex-1">
                Registrar otra visita
              </Button>
              <Button onClick={onBack} className="flex-1">
                Volver al inicio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Button variant="ghost" size="sm" onClick={onBack} className="p-0 h-auto">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className="text-xl">Registro de Visitante</CardTitle>
        <CardDescription>
          Ingresa tus datos para registrar tu visita al CESFAM
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="visitor-name">Nombre completo</Label>
            <Input
              id="visitor-name"
              placeholder="Ej: Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="visitor-plate">Patente del vehículo</Label>
            <Input
              id="visitor-plate"
              placeholder="Ej: ABCD12"
              value={plate}
              onChange={(e) => setPlate(e.target.value.toUpperCase())}
              maxLength={6}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="visitor-destination">¿A qué sector se dirige?</Label>
            <Select value={destination} onValueChange={setDestination} required>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un sector" />
              </SelectTrigger>
              <SelectContent>
                {DESTINATIONS.map((dest) => (
                  <SelectItem key={dest} value={dest}>
                    {dest}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Registrar Visita
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
