export type UserRole = 'student' | 'warden' | 'admin' | 'finance';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  studentId?: string;
  department?: string;
  year?: string;
  roomNumber?: string;
  hostelId?: string;
  hostelName?: string;
  avatar?: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface Hostel {
  _id: string;
  name: string;
  code: string;
  type: 'boys' | 'girls' | 'co-ed';
  totalBlocks: number;
  totalFloors: number;
  totalRooms: number;
  totalBeds: number;
  wardenName: string;
  contactPhone: string;
  amenities: string[];
  status: 'active' | 'maintenance';
}

export type BedStatus = 'available' | 'occupied' | 'maintenance';

export interface Bed {
  bedNumber: string;
  status: BedStatus;
  studentId?: string;
  studentName?: string;
  allocatedDate?: string;
}

export interface Room {
  _id: string;
  hostelId: string;
  hostelName?: string;
  roomNumber: string;
  floor: number;
  block: string;
  type: 'single' | 'double' | 'triple' | 'quad';
  capacity: number;
  occupiedBeds: number;
  beds: Bed[];
  monthlyFee: number;
  amenities: string[];
  status: 'active' | 'maintenance';
}

export interface RoomAllocation {
  _id: string;
  studentId: string;
  studentName: string;
  studentRegisterNo: string;
  hostelId: string;
  hostelName: string;
  roomId: string;
  roomNumber: string;
  bedNumber: string;
  allocatedDate: string;
  academicYear: string;
  status: 'active' | 'transferred' | 'vacated';
  vacatedDate?: string;
  remarks?: string;
}

export type ApplicationStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'allocated';

export interface AdmissionApplication {
  _id: string;
  applicationNumber: string;
  studentName: string;
  email: string;
  phone: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth: string;
  department: string;
  academicYear: string;
  registrationNumber: string;
  guardianName: string;
  guardianPhone: string;
  guardianRelation: string;
  address: string;
  bloodGroup: string;
  preferredHostelId: string;
  preferredHostelName?: string;
  preferredRoomType: 'single' | 'double' | 'triple' | 'quad';
  foodPreference: 'vegetarian' | 'non-vegetarian';
  documents: {
    idProof?: string;
    admissionLetter?: string;
    photo?: string;
  };
  status: ApplicationStatus;
  remarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

export type FeeStatus = 'paid' | 'partial' | 'pending' | 'overdue';

export interface FeeRecord {
  _id: string;
  invoiceNumber: string;
  studentId: string;
  studentName: string;
  studentRegisterNo: string;
  hostelName: string;
  roomNumber: string;
  feeType: 'hostel_fee' | 'mess_fee' | 'caution_deposit' | 'maintenance_fee';
  period: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  dueDate: string;
  status: FeeStatus;
  transactions?: PaymentTransaction[];
  createdAt: string;
}

export interface PaymentTransaction {
  _id: string;
  transactionReference: string;
  feeRecordId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'online_gateway' | 'upi' | 'card' | 'bank_transfer' | 'cash_office';
  paymentDate: string;
  status: 'completed' | 'pending' | 'failed';
  receiptNumber: string;
  notes?: string;
}

export type MaintenanceCategory = 'electrical' | 'plumbing' | 'carpentry' | 'cleaning' | 'wifi' | 'appliance' | 'other';
export type MaintenancePriority = 'low' | 'medium' | 'high' | 'urgent';
export type MaintenanceStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved' | 'closed';

export interface MaintenanceRequest {
  _id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  roomNumber: string;
  hostelName: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  title: string;
  description: string;
  status: MaintenanceStatus;
  assignedTo?: string;
  remarks?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface VisitorRecord {
  _id: string;
  passNumber: string;
  visitorName: string;
  visitorPhone: string;
  idProofType: string;
  idProofNumber: string;
  studentId: string;
  studentName: string;
  studentRoom: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  status: 'checked_in' | 'checked_out';
  qrPassToken: string;
  escortVerified?: boolean;
}

export interface NotificationItem {
  _id: string;
  userId?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface AuditLog {
  _id: string;
  action: string;
  category: 'auth' | 'admissions' | 'allocation' | 'fee' | 'maintenance' | 'visitor' | 'user';
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  details: string;
  ipAddress: string;
  createdAt: string;
}

export interface OccupancyStats {
  totalHostels: number;
  totalRooms: number;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  maintenanceBeds: number;
  occupancyRate: number;
  hostelBreakdown: {
    hostelId: string;
    hostelName: string;
    code: string;
    type: string;
    totalRooms: number;
    totalBeds: number;
    occupiedBeds: number;
    availableBeds: number;
    occupancyRate: number;
  }[];
  roomTypeBreakdown: {
    type: string;
    count: number;
    totalBeds: number;
    occupied: number;
  }[];
}
