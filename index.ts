export interface Vehicle {
  plate: string;
  name: string;
  phone: string;
  unit: string;
  email?: string;
  rut?: string;
}

export interface CheckIn {
  uid: string;
  plate: string;
  unitToday: string;
  date: string;
  ts: any;
}

export interface Block {
  id?: string;
  blockerUid: string;
  blockerPlate: string;
  blockedPlate: string;
  date: string;
  ts: any;
}

export interface Visitor {
  id?: string;
  name: string;
  plate: string;
  destination: string;
  date: string;
  ts: any;
}

export interface UserRegistration {
  email: string;
  password: string;
  name: string;
  rut: string;
  phone: string;
  plate: string;
  unit: string;
}

export type UserType = 'employee' | 'visitor' | null;

export interface AppUser {
  uid: string;
  email: string;
  displayName?: string;
  userType: UserType;
}
