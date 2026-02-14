import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  MapPin, 
  Car, 
  LogOut, 
  Loader2, 
  Phone, 
  MessageCircle,
  Trash2,
  RefreshCw,
  Copy,
  Building2
} from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import { useCheckins } from '@/hooks/useCheckins';
import { useBlocks } from '@/hooks/useBlocks';
import { todayStr, waLink } from '@/lib/firebase';
import type { Vehicle, Block } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DashboardProps {
  user: { uid: string; email: string };
  onLogout: () => void;
}

const UNITS = [
  "Dirección", "Dental", "Farmacia", "Ambulancia", "UAC", 
  "Sector Rojo", "Sector Amarillo", "Transversal", "Box Psicosocial",
  "Sala ERA", "Vacunatorio", "Telesalud", "Oirs/Sau", "Esterilización",
  "Bodega de Alimentos", "Bodega de Farmacia", "Dependencia Severa",
  "Sala de Psicomotricidad", "Sala de Estimulación DSM", "Apoyo Clínico", "Ex SIGGES"
];

export function Dashboard({ user, onLogout }: DashboardProps) {
  const { searchVehicle, loading: loadingVehicle } = useVehicles();
  const { doCheckin, clearTodayCheckin, getTodayCheckin, loading: loadingCheckin } = useCheckins();
  const { addBlock, getMyBlocks, deleteBlock, clearTodayBlocks, loading: loadingBlocks } = useBlocks();

  // Search state
  const [searchPlate, setSearchPlate] = useState('');
  const [foundVehicle, setFoundVehicle] = useState<Vehicle | null>(null);
  const [searchError, setSearchError] = useState('');

  // Check-in state
  const [myPlate, setMyPlate] = useState('');
  const [myUnit, setMyUnit] = useState('');
  const [checkinMessage, setCheckinMessage] = useState('');
  const [hasCheckin, setHasCheckin] = useState(false);

  // Blocks state
  const [blockerPlate, setBlockerPlate] = useState('');
  const [blockedPlate, setBlockedPlate] = useState('');
  const [myBlocks, setMyBlocks] = useState<Block[]>([]);

  // Load initial data
  useEffect(() => {
    loadCheckin();
    loadBlocks();
  }, []);

  const loadCheckin = async () => {
    const checkin = await getTodayCheckin(user.uid);
    if (checkin) {
      setMyPlate(checkin.plate);
      setMyUnit(checkin.unitToday);
      setHasCheckin(true);
    }
  };

  const loadBlocks = async () => {
    const blocks = await getMyBlocks(user.uid);
    setMyBlocks(blocks);
  };

  const handleSearch = async () => {
    setSearchError('');
    setFoundVehicle(null);
    
    if (!searchPlate.trim()) {
      setSearchError('Ingresa una patente');
      return;
    }

    const vehicle = await searchVehicle(searchPlate);
    if (vehicle) {
      setFoundVehicle(vehicle);
    } else {
      setSearchError('Vehículo no encontrado en el directorio');
    }
  };

  const handleCheckin = async () => {
    setCheckinMessage('');
    
    if (!myPlate.trim() || !myUnit) {
      setCheckinMessage('Completa tu patente y unidad');
      return;
    }

    const success = await doCheckin(user.uid, myPlate, myUnit);
    if (success) {
      setCheckinMessage(`Check-in OK (${myPlate} · ${myUnit})`);
      setHasCheckin(true);
    } else {
      setCheckinMessage('Error al hacer check-in');
    }
  };

  const handleClearCheckin = async () => {
    const success = await clearTodayCheckin(user.uid);
    if (success) {
      setMyPlate('');
      setMyUnit('');
      setHasCheckin(false);
      setCheckinMessage('Check-in de hoy borrado');
    }
  };

  const handleAddBlock = async () => {
    if (!blockerPlate.trim() || !blockedPlate.trim()) return;
    
    const success = await addBlock(user.uid, blockerPlate, blockedPlate);
    if (success) {
      setBlockedPlate('');
      loadBlocks();
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    const success = await deleteBlock(blockId);
    if (success) {
      loadBlocks();
    }
  };

  const handleClearBlocks = async () => {
    const success = await clearTodayBlocks(user.uid);
    if (success) {
      setMyBlocks([]);
    }
  };

  const handleCopyAll = async () => {
    const lines = [];
    for (const block of myBlocks) {
      const vehicle = await searchVehicle(block.blockedPlate);
      lines.push(
        `${block.blockedPlate} — ${vehicle?.name || 'no encontrado'} ${vehicle?.phone ? '(' + vehicle.phone + ')' : ''} ${vehicle?.unit ? '[' + vehicle.unit + ']' : ''}`
      );
    }
    const text = lines.length ? lines.join('\n') : 'Sin patentes bloqueadas hoy.';
    
    try {
      await navigator.clipboard.writeText(text);
      alert('Copiado al portapapeles');
    } catch {
      alert('No se pudo copiar');
    }
  };

  const getWhatsAppMessage = (vehicle: Vehicle) => {
    return `Hola ${vehicle.name}. ¿Me ayudas con un tema de estacionamiento?`;
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-cesfam.png" alt="CESFAM" className="h-10 w-auto" />
            <div>
              <h1 className="font-semibold text-gray-900">Estacionamiento</h1>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-1" />
            Salir
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-4">
        <div className="text-xs text-gray-500 mb-4">
          Hoy: {todayStr()}
        </div>

        <Tabs defaultValue="search" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="search">
              <Search className="w-4 h-4 mr-1" />
              Buscar
            </TabsTrigger>
            <TabsTrigger value="checkin">
              <MapPin className="w-4 h-4 mr-1" />
              Check-in
            </TabsTrigger>
            <TabsTrigger value="blocks">
              <Car className="w-4 h-4 mr-1" />
              Bloqueos
            </TabsTrigger>
          </TabsList>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Buscar por Patente
                </CardTitle>
                <CardDescription>
                  Encuentra información de contacto de otros funcionarios
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ej: KHDC46"
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                    maxLength={6}
                  />
                  <Button onClick={handleSearch} disabled={loadingVehicle}>
                    {loadingVehicle ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Buscar'}
                  </Button>
                </div>

                {searchError && (
                  <Alert variant="destructive">
                    <AlertDescription>{searchError}</AlertDescription>
                  </Alert>
                )}

                {foundVehicle && (
                  <Card className="bg-sky-50 border-sky-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-sky-900">{foundVehicle.name}</h3>
                          <div className="space-y-1 mt-2 text-sm">
                            <p className="flex items-center gap-2">
                              <Car className="w-4 h-4 text-sky-600" />
                              <span className="font-medium">{foundVehicle.plate}</span>
                            </p>
                            {foundVehicle.phone && (
                              <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-sky-600" />
                                {foundVehicle.phone}
                              </p>
                            )}
                            {foundVehicle.unit && (
                              <p className="flex items-center gap-2">
                                <Building2 className="w-4 h-4 text-sky-600" />
                                {foundVehicle.unit}
                              </p>
                            )}
                          </div>
                        </div>
                        {foundVehicle.phone && (
                          <a
                            href={waLink(foundVehicle.phone, getWhatsAppMessage(foundVehicle))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                          >
                            <MessageCircle className="w-4 h-4" />
                            WhatsApp
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Check-in Tab */}
          <TabsContent value="checkin" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Check-in Diario
                </CardTitle>
                <CardDescription>
                  Registra tu ubicación para que otros funcionarios te encuentren
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mi patente</Label>
                    <Input
                      placeholder="Ej: KHDC46"
                      value={myPlate}
                      onChange={(e) => setMyPlate(e.target.value.toUpperCase())}
                      maxLength={6}
                      disabled={hasCheckin}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mi unidad hoy</Label>
                    <Select 
                      value={myUnit} 
                      onValueChange={setMyUnit}
                      disabled={hasCheckin}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona" />
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
                </div>

                {checkinMessage && (
                  <Alert className={checkinMessage.includes('OK') ? 'bg-green-50 border-green-200' : ''}>
                    <AlertDescription className={checkinMessage.includes('OK') ? 'text-green-800' : ''}>
                      {checkinMessage}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCheckin} 
                    disabled={loadingCheckin || hasCheckin}
                    className="flex-1"
                  >
                    {loadingCheckin ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    {hasCheckin ? 'Check-in realizado' : 'Hacer check-in'}
                  </Button>
                  {hasCheckin && (
                    <Button variant="outline" onClick={handleClearCheckin}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blocks Tab */}
          <TabsContent value="blocks" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Car className="w-5 h-5" />
                  Estoy Bloqueando
                </CardTitle>
                <CardDescription>
                  Registra las patentes que estás bloqueando para notificar a sus dueños
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Mi patente</Label>
                    <Input
                      placeholder="Ej: KHDC46"
                      value={blockerPlate}
                      onChange={(e) => setBlockerPlate(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Patente bloqueada</Label>
                    <Input
                      placeholder="Ej: ABCD12"
                      value={blockedPlate}
                      onChange={(e) => setBlockedPlate(e.target.value.toUpperCase())}
                      maxLength={6}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleAddBlock} disabled={loadingBlocks} className="flex-1">
                    Agregar
                  </Button>
                  <Button variant="outline" onClick={handleClearBlocks}>
                    <Trash2 className="w-4 h-4 mr-1" />
                    Limpiar
                  </Button>
                  <Button variant="outline" onClick={handleCopyAll}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Mis bloqueos de hoy</h4>
                    <Button variant="ghost" size="sm" onClick={loadBlocks}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>

                  {myBlocks.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Sin patentes bloqueadas hoy
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {myBlocks.map((block) => (
                        <BlockItem 
                          key={block.id} 
                          block={block} 
                          onDelete={() => handleDeleteBlock(block.id!)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

// Block Item Component
function BlockItem({ block, onDelete }: { block: Block; onDelete: () => void }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const { searchVehicle } = useVehicles();

  useEffect(() => {
    searchVehicle(block.blockedPlate).then(setVehicle);
  }, [block.blockedPlate]);

  const message = vehicle 
    ? `Hola ${vehicle.name}. Te escribo porque estoy bloqueando tu vehículo (${block.blockedPlate}). ¿Podrías moverlo cuando puedas? Gracias.`
    : '';

  return (
    <Card className="bg-gray-50">
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{block.blockedPlate}</Badge>
              {vehicle && <span className="text-sm">{vehicle.name}</span>}
            </div>
            {vehicle && (
              <div className="text-xs text-gray-500 mt-1">
                {vehicle.phone && <span>Tel: {vehicle.phone} · </span>}
                {vehicle.unit && <span>{vehicle.unit}</span>}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {vehicle?.phone && (
              <a
                href={waLink(vehicle.phone, message)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            )}
            <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-500">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
