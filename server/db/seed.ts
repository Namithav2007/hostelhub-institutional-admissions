import bcrypt from 'bcryptjs';
import { db, generateObjectId } from './database.ts';

export function seedDatabase() {
  const existingUsers = db.users.find();
  if (existingUsers.length > 0) {
    return; // Already seeded
  }

  console.log('Seeding initial Hostel Management System data...');

  const passwordHash = bcrypt.hashSync('student123', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);
  const wardenHash = bcrypt.hashSync('warden123', 10);
  const financeHash = bcrypt.hashSync('finance123', 10);

  // 1. Hostels
  const h1Id = generateObjectId();
  const h2Id = generateObjectId();
  const h3Id = generateObjectId();

  const hostels = [
    {
      _id: h1Id,
      name: 'Aryabhatta Residence Hall (Boys Block)',
      code: 'ABR-A',
      type: 'boys',
      totalBlocks: 3,
      totalFloors: 4,
      totalRooms: 36,
      totalBeds: 108,
      wardenName: 'Prof. Anita Roy',
      contactPhone: '+91 98765 43210',
      amenities: ['High-speed Wi-Fi', '24/7 Water & Solar Heater', 'Gymnasium', 'Study Reading Room', 'Laundry Station', 'Power Backup'],
      status: 'active',
    },
    {
      _id: h2Id,
      name: 'Gargi Residence Hall (Girls Block)',
      code: 'GGR-B',
      type: 'girls',
      totalBlocks: 2,
      totalFloors: 4,
      totalRooms: 32,
      totalBeds: 96,
      wardenName: 'Dr. Sunita Kulkarni',
      contactPhone: '+91 98765 43211',
      amenities: ['High-speed Wi-Fi', 'Biometric Access Control', 'Badminton Court', 'Study Library', 'Infirmary Clinic', '24/7 CCTV'],
      status: 'active',
    },
    {
      _id: h3Id,
      name: 'Tagore International Scholar Residence',
      code: 'TIR-C',
      type: 'co-ed',
      totalBlocks: 2,
      totalFloors: 3,
      totalRooms: 24,
      totalBeds: 48,
      wardenName: 'Prof. Anita Roy',
      contactPhone: '+91 98765 43212',
      amenities: ['Air Conditioned', 'Ensuite Restrooms', 'Common Kitchenette', 'Conference Lounge', 'High-speed Fiber', 'Elevator'],
      status: 'active',
    },
  ];
  db.hostels.insertMany(hostels);

  // 2. Users
  const adminId = generateObjectId();
  const wardenId = generateObjectId();
  const financeId = generateObjectId();
  const student1Id = generateObjectId();
  const student2Id = generateObjectId();
  const student3Id = generateObjectId();

  const users = [
    {
      _id: adminId,
      name: 'Dr. Rajesh Sharma',
      email: 'admin@campus.edu',
      password: adminHash,
      role: 'admin',
      phone: '+91 98111 22334',
      status: 'active',
    },
    {
      _id: wardenId,
      name: 'Prof. Anita Roy',
      email: 'warden@campus.edu',
      password: wardenHash,
      role: 'warden',
      phone: '+91 98222 33445',
      hostelId: h1Id,
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      status: 'active',
    },
    {
      _id: financeId,
      name: 'Mr. Vikram Mehta',
      email: 'finance@campus.edu',
      password: financeHash,
      role: 'finance',
      phone: '+91 98333 44556',
      status: 'active',
    },
    {
      _id: student1Id,
      name: 'Rohan Verma',
      email: 'student@campus.edu',
      password: passwordHash,
      role: 'student',
      phone: '+91 98700 11223',
      studentId: '2024CS1042',
      department: 'Computer Science & Engineering',
      year: '2nd Year',
      hostelId: h1Id,
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomNumber: 'A-204',
      status: 'active',
    },
    {
      _id: student2Id,
      name: 'Priya Nair',
      email: 'priya@campus.edu',
      password: passwordHash,
      role: 'student',
      phone: '+91 98700 44556',
      studentId: '2024EC1088',
      department: 'Electronics & Communication',
      year: '2nd Year',
      hostelId: h2Id,
      hostelName: 'Gargi Residence Hall (Girls Block)',
      roomNumber: 'B-102',
      status: 'active',
    },
    {
      _id: student3Id,
      name: 'Arjun Patel',
      email: 'arjun@campus.edu',
      password: passwordHash,
      role: 'student',
      phone: '+91 98700 77889',
      studentId: '2025ME1015',
      department: 'Mechanical Engineering',
      year: '1st Year',
      status: 'active',
    },
  ];
  db.users.insertMany(users);

  // 3. Rooms
  const r1Id = generateObjectId();
  const r2Id = generateObjectId();
  const r3Id = generateObjectId();
  const r4Id = generateObjectId();
  const r5Id = generateObjectId();
  const r6Id = generateObjectId();

  const rooms = [
    {
      _id: r1Id,
      hostelId: h1Id,
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomNumber: 'A-204',
      floor: 2,
      block: 'Block A',
      type: 'triple',
      capacity: 3,
      occupiedBeds: 2,
      beds: [
        { bedNumber: 'Bed-1', status: 'occupied', studentId: student1Id, studentName: 'Rohan Verma', allocatedDate: '2026-08-01' },
        { bedNumber: 'Bed-2', status: 'occupied', studentId: generateObjectId(), studentName: 'Devansh Joshi', allocatedDate: '2026-08-02' },
        { bedNumber: 'Bed-3', status: 'available' },
      ],
      monthlyFee: 6500,
      amenities: ['Ceiling Fan', 'Attached Balcony', 'Study Desks', 'Steel Wardrobes'],
      status: 'active',
    },
    {
      _id: r2Id,
      hostelId: h1Id,
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomNumber: 'A-205',
      floor: 2,
      block: 'Block A',
      type: 'double',
      capacity: 2,
      occupiedBeds: 2,
      beds: [
        { bedNumber: 'Bed-1', status: 'occupied', studentId: generateObjectId(), studentName: 'Karthik Rao', allocatedDate: '2026-08-01' },
        { bedNumber: 'Bed-2', status: 'occupied', studentId: generateObjectId(), studentName: 'Sameer Sheikh', allocatedDate: '2026-08-03' },
      ],
      monthlyFee: 8000,
      amenities: ['Ceiling Fan', 'Corner Window', 'Study Desks', 'Large Closets'],
      status: 'active',
    },
    {
      _id: r3Id,
      hostelId: h1Id,
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomNumber: 'A-301',
      floor: 3,
      block: 'Block A',
      type: 'single',
      capacity: 1,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 'Bed-1', status: 'available' },
      ],
      monthlyFee: 12000,
      amenities: ['Air Conditioning', 'Ensuite Bathroom', 'Ergonomic Desk', 'Mini Fridge'],
      status: 'active',
    },
    {
      _id: r4Id,
      hostelId: h2Id,
      hostelName: 'Gargi Residence Hall (Girls Block)',
      roomNumber: 'B-102',
      floor: 1,
      block: 'Block B',
      type: 'double',
      capacity: 2,
      occupiedBeds: 1,
      beds: [
        { bedNumber: 'Bed-1', status: 'occupied', studentId: student2Id, studentName: 'Priya Nair', allocatedDate: '2026-08-05' },
        { bedNumber: 'Bed-2', status: 'available' },
      ],
      monthlyFee: 8000,
      amenities: ['Ceiling Fan', 'Study Desk', 'Built-in Lockers', 'Garden View'],
      status: 'active',
    },
    {
      _id: r5Id,
      hostelId: h2Id,
      hostelName: 'Gargi Residence Hall (Girls Block)',
      roomNumber: 'B-103',
      floor: 1,
      block: 'Block B',
      type: 'triple',
      capacity: 3,
      occupiedBeds: 0,
      beds: [
        { bedNumber: 'Bed-1', status: 'available' },
        { bedNumber: 'Bed-2', status: 'available' },
        { bedNumber: 'Bed-3', status: 'available' },
      ],
      monthlyFee: 6500,
      amenities: ['Ceiling Fan', 'Study Desks', 'Steel Wardrobes'],
      status: 'active',
    },
    {
      _id: r6Id,
      hostelId: h3Id,
      hostelName: 'Tagore International Scholar Residence',
      roomNumber: 'C-201',
      floor: 2,
      block: 'Block C',
      type: 'single',
      capacity: 1,
      occupiedBeds: 1,
      beds: [
        { bedNumber: 'Bed-1', status: 'occupied', studentId: generateObjectId(), studentName: 'Liam Chen', allocatedDate: '2026-08-10' },
      ],
      monthlyFee: 15000,
      amenities: ['Air Conditioned', 'Ensuite Bath', 'Microwave', 'Fast Fiber Wi-Fi'],
      status: 'active',
    },
  ];
  db.rooms.insertMany(rooms);

  // 4. Room Allocations
  const alloc1Id = generateObjectId();
  const alloc2Id = generateObjectId();
  const allocations = [
    {
      _id: alloc1Id,
      studentId: student1Id,
      studentName: 'Rohan Verma',
      studentRegisterNo: '2024CS1042',
      hostelId: h1Id,
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomId: r1Id,
      roomNumber: 'A-204',
      bedNumber: 'Bed-1',
      allocatedDate: '2026-08-01',
      academicYear: '2026-2027',
      status: 'active',
      remarks: 'Merit quota allocation, 2nd Year CSE',
    },
    {
      _id: alloc2Id,
      studentId: student2Id,
      studentName: 'Priya Nair',
      studentRegisterNo: '2024EC1088',
      hostelId: h2Id,
      hostelName: 'Gargi Residence Hall (Girls Block)',
      roomId: r4Id,
      roomNumber: 'B-102',
      bedNumber: 'Bed-1',
      allocatedDate: '2026-08-05',
      academicYear: '2026-2027',
      status: 'active',
      remarks: 'Regular allocation, 2nd Year ECE',
    },
  ];
  db.allocations.insertMany(allocations);

  // 5. Admission Applications
  const applications = [
    {
      _id: generateObjectId(),
      applicationNumber: 'ADM-2026-001',
      studentName: 'Arjun Patel',
      email: 'arjun@campus.edu',
      phone: '+91 98700 77889',
      gender: 'male',
      dateOfBirth: '2006-04-14',
      department: 'Mechanical Engineering',
      academicYear: '2026-2027',
      registrationNumber: '2025ME1015',
      guardianName: 'Suresh Patel',
      guardianPhone: '+91 94222 11009',
      guardianRelation: 'Father',
      address: '74 Hillview Enclave, Pune, Maharashtra',
      bloodGroup: 'B+',
      preferredHostelId: h1Id,
      preferredHostelName: 'Aryabhatta Residence Hall (Boys Block)',
      preferredRoomType: 'triple',
      foodPreference: 'vegetarian',
      documents: {
        idProof: 'Aadhar_Card_Verified.pdf',
        admissionLetter: 'Offer_Letter_2026.pdf',
        photo: 'student_photo.jpg',
      },
      status: 'pending',
      remarks: 'Application under verification by hostel committee.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: generateObjectId(),
      applicationNumber: 'ADM-2026-002',
      studentName: 'Ananya Deshmukh',
      email: 'ananya.d@campus.edu',
      phone: '+91 98112 33441',
      gender: 'female',
      dateOfBirth: '2005-11-20',
      department: 'Biotechnology',
      academicYear: '2026-2027',
      registrationNumber: '2025BT1009',
      guardianName: 'Vandana Deshmukh',
      guardianPhone: '+91 94222 88771',
      guardianRelation: 'Mother',
      address: 'B-402 Green Meadows, Nagpur, Maharashtra',
      bloodGroup: 'O+',
      preferredHostelId: h2Id,
      preferredHostelName: 'Gargi Residence Hall (Girls Block)',
      preferredRoomType: 'double',
      foodPreference: 'vegetarian',
      documents: {
        idProof: 'National_ID_Verified.pdf',
        admissionLetter: 'Admit_Letter_BT.pdf',
      },
      status: 'approved',
      remarks: 'Documents verified. Approved by Warden. Room allocation pending.',
      reviewedBy: 'Prof. Anita Roy',
      reviewedAt: new Date(Date.now() - 86400000).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    },
    {
      _id: generateObjectId(),
      applicationNumber: 'ADM-2026-003',
      studentName: 'Rohan Verma',
      email: 'student@campus.edu',
      phone: '+91 98700 11223',
      gender: 'male',
      dateOfBirth: '2004-09-12',
      department: 'Computer Science & Engineering',
      academicYear: '2026-2027',
      registrationNumber: '2024CS1042',
      guardianName: 'Manoj Verma',
      guardianPhone: '+91 98210 55443',
      guardianRelation: 'Father',
      address: '12 Blossom Avenue, Bengaluru, Karnataka',
      bloodGroup: 'A+',
      preferredHostelId: h1Id,
      preferredHostelName: 'Aryabhatta Residence Hall (Boys Block)',
      preferredRoomType: 'triple',
      foodPreference: 'non-vegetarian',
      documents: {
        idProof: 'Passport_Copy.pdf',
        admissionLetter: 'Fee_Receipt_Tuition.pdf',
      },
      status: 'allocated',
      remarks: 'Application approved and room A-204 allocated.',
      reviewedBy: 'Prof. Anita Roy',
      reviewedAt: '2026-08-01T10:00:00Z',
      createdAt: '2026-07-28T14:30:00Z',
    },
  ];
  db.applications.insertMany(applications);

  // 6. Fee Records
  const fee1Id = generateObjectId();
  const fee2Id = generateObjectId();
  const fee3Id = generateObjectId();

  const fees = [
    {
      _id: fee1Id,
      invoiceNumber: 'INV-2026-0891',
      studentId: student1Id,
      studentName: 'Rohan Verma',
      studentRegisterNo: '2024CS1042',
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomNumber: 'A-204',
      feeType: 'hostel_fee',
      period: 'Fall Semester 2026',
      totalAmount: 39000,
      paidAmount: 39000,
      balance: 0,
      dueDate: '2026-08-15',
      status: 'paid',
      createdAt: '2026-08-01T09:00:00Z',
    },
    {
      _id: fee2Id,
      invoiceNumber: 'INV-2026-0892',
      studentId: student1Id,
      studentName: 'Rohan Verma',
      studentRegisterNo: '2024CS1042',
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      roomNumber: 'A-204',
      feeType: 'mess_fee',
      period: 'October 2026',
      totalAmount: 5500,
      paidAmount: 2000,
      balance: 3500,
      dueDate: '2026-10-25',
      status: 'partial',
      createdAt: '2026-10-01T09:00:00Z',
    },
    {
      _id: fee3Id,
      invoiceNumber: 'INV-2026-0895',
      studentId: student2Id,
      studentName: 'Priya Nair',
      studentRegisterNo: '2024EC1088',
      hostelName: 'Gargi Residence Hall (Girls Block)',
      roomNumber: 'B-102',
      feeType: 'hostel_fee',
      period: 'Fall Semester 2026',
      totalAmount: 48000,
      paidAmount: 48000,
      balance: 0,
      dueDate: '2026-08-15',
      status: 'paid',
      createdAt: '2026-08-05T09:00:00Z',
    },
  ];
  db.fees.insertMany(fees);

  // 7. Payment Transactions
  const tx1Id = generateObjectId();
  const tx2Id = generateObjectId();
  const transactions = [
    {
      _id: tx1Id,
      transactionReference: 'TXN-98432014-CAMPUS',
      feeRecordId: fee1Id,
      studentId: student1Id,
      studentName: 'Rohan Verma',
      amount: 39000,
      paymentMethod: 'online_gateway',
      paymentDate: '2026-08-08T11:24:00Z',
      status: 'completed',
      receiptNumber: 'RCPT-2026-0412',
      notes: 'Full semester hostel fee paid via RazorPay PG gateway',
    },
    {
      _id: tx2Id,
      transactionReference: 'TXN-98433109-CAMPUS',
      feeRecordId: fee2Id,
      studentId: student1Id,
      studentName: 'Rohan Verma',
      amount: 2000,
      paymentMethod: 'upi',
      paymentDate: '2026-10-05T16:10:00Z',
      status: 'completed',
      receiptNumber: 'RCPT-2026-0599',
      notes: 'Partial mess bill payment via campus UPI QR',
    },
  ];
  db.transactions.insertMany(transactions);

  // 8. Maintenance Requests
  const maintenance = [
    {
      _id: generateObjectId(),
      ticketNumber: 'TKT-2026-104',
      studentId: student1Id,
      studentName: 'Rohan Verma',
      roomNumber: 'A-204',
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      category: 'electrical',
      priority: 'high',
      title: 'Ceiling fan regulator sparking and not regulating speed',
      description: 'The fan knob sparks when switched to position 4. Please replace the switchboard module.',
      status: 'in_progress',
      assignedTo: 'Rajesh Electrician (Estate Dept)',
      remarks: 'Component replacement dispatched for tomorrow morning.',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      _id: generateObjectId(),
      ticketNumber: 'TKT-2026-105',
      studentId: student2Id,
      studentName: 'Priya Nair',
      roomNumber: 'B-102',
      hostelName: 'Gargi Residence Hall (Girls Block)',
      category: 'plumbing',
      priority: 'medium',
      title: 'Bathroom washbasin drain pipe slow drainage',
      description: 'Water drains very slowly in the attached bathroom washbasin. Needs clearing or snake cleaner.',
      status: 'assigned',
      assignedTo: 'Plumbing Unit B',
      remarks: 'Scheduled for inspection.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: generateObjectId(),
      ticketNumber: 'TKT-2026-098',
      studentId: student1Id,
      studentName: 'Rohan Verma',
      roomNumber: 'A-204',
      hostelName: 'Aryabhatta Residence Hall (Boys Block)',
      category: 'wifi',
      priority: 'urgent',
      title: 'Wi-Fi access point AP-A2 losing packet connectivity',
      description: 'Signal connects but DNS resolution fails during study hours.',
      status: 'resolved',
      assignedTo: 'Campus IT Network Team',
      remarks: 'Router firmware updated and channel frequency reconfigured.',
      resolvedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    },
  ];
  db.maintenance.insertMany(maintenance);

  // 9. Visitors
  const visitors = [
    {
      _id: generateObjectId(),
      passNumber: 'VIS-2026-0312',
      visitorName: 'Manoj Verma',
      visitorPhone: '+91 98210 55443',
      idProofType: 'Aadhar Card',
      idProofNumber: 'XXXX-XXXX-4912',
      studentId: student1Id,
      studentName: 'Rohan Verma',
      studentRoom: 'A-204',
      purpose: 'Parental visit and dropping study materials',
      checkInTime: new Date(Date.now() - 3600000 * 2).toISOString(),
      status: 'checked_in',
      qrPassToken: 'QR-PASS-VERMA-2026-312',
      escortVerified: true,
    },
    {
      _id: generateObjectId(),
      passNumber: 'VIS-2026-0309',
      visitorName: 'Kavita Nair',
      visitorPhone: '+91 98110 99887',
      idProofType: 'Driving License',
      idProofNumber: 'DL-042019-9812',
      studentId: student2Id,
      studentName: 'Priya Nair',
      studentRoom: 'B-102',
      purpose: 'Weekend family greeting',
      checkInTime: new Date(Date.now() - 86400000).toISOString(),
      checkOutTime: new Date(Date.now() - 86400000 + 7200000).toISOString(),
      status: 'checked_out',
      qrPassToken: 'QR-PASS-NAIR-2026-309',
      escortVerified: true,
    },
  ];
  db.visitors.insertMany(visitors);

  // 10. Notifications
  const notifications = [
    {
      _id: generateObjectId(),
      title: 'Hostel Maintenance Schedule',
      message: 'Routine water tank cleaning scheduled this Saturday from 09:00 AM to 01:00 PM for Block A & B.',
      type: 'info',
      isRead: false,
      createdAt: new Date().toISOString(),
    },
    {
      _id: generateObjectId(),
      userId: student1Id,
      title: 'Fee Reminder: Mess Bill Balance',
      message: 'Reminder: ₹3,500 balance for October 2026 mess bill is due by October 25th.',
      type: 'warning',
      isRead: false,
      link: '/fees',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: generateObjectId(),
      userId: student1Id,
      title: 'Maintenance Ticket Assigned',
      message: 'Your ticket TKT-2026-104 (Electrical) has been assigned to Rajesh Electrician.',
      type: 'success',
      isRead: true,
      link: '/maintenance',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
  ];
  db.notifications.insertMany(notifications);

  // 11. Audit Logs
  const auditLogs = [
    {
      _id: generateObjectId(),
      action: 'ROOM_ALLOCATION',
      category: 'allocation',
      actorId: adminId,
      actorName: 'Dr. Rajesh Sharma',
      actorRole: 'admin',
      details: 'Allocated student Rohan Verma (2024CS1042) to Room A-204 Bed-1',
      ipAddress: '192.168.1.10',
      createdAt: '2026-08-01T10:05:00Z',
    },
    {
      _id: generateObjectId(),
      action: 'FEE_PAYMENT_VERIFIED',
      category: 'fee',
      actorId: financeId,
      actorName: 'Mr. Vikram Mehta',
      actorRole: 'finance',
      details: 'Recorded payment of ₹39,000 for invoice INV-2026-0891 (Receipt RCPT-2026-0412)',
      ipAddress: '192.168.1.25',
      createdAt: '2026-08-08T11:30:00Z',
    },
    {
      _id: generateObjectId(),
      action: 'VISITOR_CHECK_IN',
      category: 'visitor',
      actorId: wardenId,
      actorName: 'Prof. Anita Roy',
      actorRole: 'warden',
      details: 'Checked-in visitor Manoj Verma for student Rohan Verma (Room A-204)',
      ipAddress: '192.168.1.14',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ];
  db.auditLogs.insertMany(auditLogs);

  console.log('Database successfully seeded with comprehensive institutional records!');
}
