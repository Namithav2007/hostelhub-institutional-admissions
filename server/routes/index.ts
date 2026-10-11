import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import QRCode from 'qrcode';
import { db, generateObjectId } from '../db/database.ts';
import { AuthRequest, generateToken, verifyToken, requireRole, logAudit } from '../middleware/auth.ts';

const router = Router();

// ==========================================
// 1. AUTHENTICATION & PROFILE ROUTES
// ==========================================
router.post('/auth/login', (req, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials. User not found.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  if (user.status === 'suspended') {
    return res.status(403).json({ error: 'Your account is suspended. Contact administration.' });
  }

  const token = generateToken({
    _id: user._id,
    email: user.email,
    role: user.role,
    name: user.name,
  });

  const { password: _, ...userSafe } = user;
  logAudit(req as AuthRequest, 'USER_LOGIN', 'auth', `User ${user.name} logged in as ${user.role}`);

  return res.json({
    token,
    user: userSafe,
    message: 'Login successful',
  });
});

router.post('/auth/register', (req, res: Response) => {
  const { name, email, password, phone, studentId, department, year } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existingEmail = db.users.findOne((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingEmail) {
    return res.status(400).json({ error: 'Email is already registered. Please login.' });
  }

  if (studentId) {
    const existingStudentId = db.users.findOne((u) => u.studentId === studentId);
    if (existingStudentId) {
      return res.status(400).json({ error: 'Student Register ID already exists.' });
    }
  }

  const passwordHash = bcrypt.hashSync(password, 10);
  const newUser = db.users.create({
    name,
    email: email.toLowerCase(),
    password: passwordHash,
    role: 'student',
    phone: phone || '',
    studentId: studentId || `REG-${Date.now().toString().slice(-6)}`,
    department: department || 'General Engineering',
    year: year || '1st Year',
    status: 'active',
  });

  const token = generateToken({
    _id: newUser._id,
    email: newUser.email,
    role: newUser.role,
    name: newUser.name,
  });

  const { password: _, ...userSafe } = newUser;
  logAudit(req as AuthRequest, 'USER_REGISTER', 'auth', `New student ${name} registered`);

  return res.status(201).json({
    token,
    user: userSafe,
    message: 'Registration successful',
  });
});

router.get('/auth/me', verifyToken, (req: AuthRequest, res: Response) => {
  const user = db.users.findById(req.user!._id);
  if (!user) {
    return res.status(404).json({ error: 'User profile not found' });
  }
  const { password: _, ...userSafe } = user;

  // Enrich with active allocation if student
  let allocation = null;
  if (user.role === 'student') {
    allocation = db.allocations.findOne((a) => a.studentId === user._id && a.status === 'active');
  }

  return res.json({
    user: userSafe,
    allocation,
  });
});

router.put('/auth/profile', verifyToken, (req: AuthRequest, res: Response) => {
  const { phone, department, year, name } = req.body;
  const updated = db.users.findByIdAndUpdate(req.user!._id, {
    ...(phone && { phone }),
    ...(department && { department }),
    ...(year && { year }),
    ...(name && { name }),
  });
  if (!updated) return res.status(404).json({ error: 'User not found' });
  const { password: _, ...userSafe } = updated;
  return res.json({ user: userSafe, message: 'Profile updated successfully' });
});

router.get('/auth/demo-users', (_req, res: Response) => {
  const users = db.users.find().map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    studentId: u.studentId,
    roomNumber: u.roomNumber,
  }));
  return res.json(users);
});

// ==========================================
// 2. HOSTEL MANAGEMENT
// ==========================================
router.get('/hostels', (_req, res: Response) => {
  const hostels = db.hostels.find();
  // enrich with live counts
  const enriched = hostels.map((h) => {
    const rooms = db.rooms.find((r) => r.hostelId === h._id);
    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + (r.occupiedBeds || 0), 0);
    return {
      ...h,
      totalRooms: rooms.length || h.totalRooms,
      totalBeds: totalBeds || h.totalBeds,
      occupiedBeds,
      availableBeds: Math.max(0, (totalBeds || h.totalBeds) - occupiedBeds),
    };
  });
  return res.json(enriched);
});

router.get('/hostels/:id', (req, res: Response) => {
  const hostel = db.hostels.findById(req.params.id);
  if (!hostel) return res.status(404).json({ error: 'Hostel not found' });
  const rooms = db.rooms.find((r) => r.hostelId === hostel._id);
  return res.json({ hostel, rooms });
});

router.post('/hostels', verifyToken, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { name, code, type, totalBlocks, totalFloors, totalRooms, totalBeds, wardenName, contactPhone, amenities } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Name and code are required' });

  const existing = db.hostels.findOne((h) => h.code.toLowerCase() === code.toLowerCase());
  if (existing) return res.status(400).json({ error: 'Hostel code already exists' });

  const newHostel = db.hostels.create({
    name,
    code: code.toUpperCase(),
    type: type || 'co-ed',
    totalBlocks: Number(totalBlocks) || 1,
    totalFloors: Number(totalFloors) || 3,
    totalRooms: Number(totalRooms) || 0,
    totalBeds: Number(totalBeds) || 0,
    wardenName: wardenName || 'Unassigned',
    contactPhone: contactPhone || '',
    amenities: amenities || ['Wi-Fi', 'Study Room'],
    status: 'active',
  });

  logAudit(req, 'CREATE_HOSTEL', 'admissions', `Created hostel ${name} (${code})`);
  return res.status(201).json(newHostel);
});

// ==========================================
// 3. ROOM MANAGEMENT
// ==========================================
router.get('/rooms', (req, res: Response) => {
  const { hostelId, floor, block, type, status, availableOnly } = req.query;
  let rooms = db.rooms.find();

  if (hostelId) rooms = rooms.filter((r) => r.hostelId === hostelId);
  if (floor) rooms = rooms.filter((r) => r.floor === Number(floor));
  if (block) rooms = rooms.filter((r) => r.block === block);
  if (type) rooms = rooms.filter((r) => r.type === type);
  if (status) rooms = rooms.filter((r) => r.status === status);
  if (availableOnly === 'true') rooms = rooms.filter((r) => r.occupiedBeds < r.capacity);

  return res.json(rooms);
});

router.get('/rooms/:id', (req, res: Response) => {
  const room = db.rooms.findById(req.params.id);
  if (!room) return res.status(404).json({ error: 'Room not found' });
  return res.json(room);
});

router.post('/rooms', verifyToken, requireRole(['admin', 'warden']), (req: AuthRequest, res: Response) => {
  const { hostelId, roomNumber, floor, block, type, capacity, monthlyFee, amenities } = req.body;
  if (!hostelId || !roomNumber || !capacity) {
    return res.status(400).json({ error: 'Hostel, room number, and capacity are required.' });
  }

  const hostel = db.hostels.findById(hostelId);
  if (!hostel) return res.status(404).json({ error: 'Specified hostel does not exist.' });

  const cap = Number(capacity);
  const beds = Array.from({ length: cap }, (_, i) => ({
    bedNumber: `Bed-${i + 1}`,
    status: 'available',
  }));

  const newRoom = db.rooms.create({
    hostelId,
    hostelName: hostel.name,
    roomNumber,
    floor: Number(floor) || 1,
    block: block || 'Block A',
    type: type || (cap === 1 ? 'single' : cap === 2 ? 'double' : cap === 3 ? 'triple' : 'quad'),
    capacity: cap,
    occupiedBeds: 0,
    beds,
    monthlyFee: Number(monthlyFee) || 7000,
    amenities: amenities || ['Ceiling Fan', 'Study Desk', 'Closet'],
    status: 'active',
  });

  logAudit(req, 'CREATE_ROOM', 'allocation', `Created room ${roomNumber} in ${hostel.name}`);
  return res.status(201).json(newRoom);
});

// ==========================================
// 4. ADMISSIONS MODULE (MODULE A)
// ==========================================
router.get('/admissions', verifyToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'student') {
    const studentApps = db.applications.find((a) => a.email.toLowerCase() === req.user!.email.toLowerCase());
    return res.json(studentApps);
  }
  // Admin, Warden, Finance view all applications
  const apps = db.applications.find();
  return res.json(apps);
});

router.get('/admissions/my-application', verifyToken, (req: AuthRequest, res: Response) => {
  const app = db.applications.findOne((a) => a.email.toLowerCase() === req.user!.email.toLowerCase());
  return res.json(app || null);
});

router.post('/admissions/apply', (req, res: Response) => {
  const {
    studentName,
    email,
    phone,
    gender,
    dateOfBirth,
    department,
    academicYear,
    registrationNumber,
    guardianName,
    guardianPhone,
    guardianRelation,
    address,
    bloodGroup,
    preferredHostelId,
    preferredRoomType,
    foodPreference,
  } = req.body;

  if (!studentName || !email || !phone || !preferredHostelId) {
    return res.status(400).json({ error: 'Please provide all mandatory personal and hostel details.' });
  }

  // Prevent duplicate pending applications
  const existingApp = db.applications.findOne(
    (a) => a.email.toLowerCase() === email.toLowerCase() && ['pending', 'under_review', 'approved'].includes(a.status)
  );
  if (existingApp) {
    return res.status(400).json({
      error: `An active hostel application (${existingApp.applicationNumber}) already exists with status: ${existingApp.status}.`,
    });
  }

  const hostel = db.hostels.findById(preferredHostelId);
  const count = db.applications.count();
  const applicationNumber = `ADM-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const newApp = db.applications.create({
    applicationNumber,
    studentName,
    email: email.toLowerCase(),
    phone,
    gender: gender || 'male',
    dateOfBirth: dateOfBirth || '2005-01-01',
    department: department || 'Engineering',
    academicYear: academicYear || '2026-2027',
    registrationNumber: registrationNumber || `REG-${Date.now().toString().slice(-6)}`,
    guardianName: guardianName || 'Parent',
    guardianPhone: guardianPhone || '',
    guardianRelation: guardianRelation || 'Guardian',
    address: address || '',
    bloodGroup: bloodGroup || 'O+',
    preferredHostelId,
    preferredHostelName: hostel ? hostel.name : 'Campus Hostel',
    preferredRoomType: preferredRoomType || 'double',
    foodPreference: foodPreference || 'vegetarian',
    documents: {
      idProof: 'Government_ID_Verified.pdf',
      admissionLetter: 'Institutional_Admit_Card.pdf',
      photo: 'passport_size_photo.jpg',
    },
    status: 'pending',
    remarks: 'Application submitted online. Awaiting document verification.',
  });

  // Notify student & warden
  db.notifications.create({
    title: 'Hostel Application Submitted',
    message: `Application ${applicationNumber} submitted successfully. Track status under Admissions.`,
    type: 'success',
    isRead: false,
    link: '/admissions',
  });

  return res.status(201).json({
    application: newApp,
    message: 'Hostel admission application submitted successfully!',
  });
});

router.put('/admissions/:id/status', verifyToken, requireRole(['admin', 'warden']), (req: AuthRequest, res: Response) => {
  const { status, remarks } = req.body;
  if (!['pending', 'under_review', 'approved', 'rejected', 'allocated'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status provided.' });
  }

  const app = db.applications.findById(req.params.id);
  if (!app) return res.status(404).json({ error: 'Application not found' });

  const updated = db.applications.findByIdAndUpdate(req.params.id, {
    status,
    remarks: remarks || app.remarks,
    reviewedBy: req.user!.name,
    reviewedAt: new Date().toISOString(),
  });

  logAudit(req, 'ADMISSION_STATUS_CHANGE', 'admissions', `Updated application ${app.applicationNumber} to ${status}`);

  // Create notification for student
  const studentUser = db.users.findOne((u) => u.email.toLowerCase() === app.email.toLowerCase());
  if (studentUser) {
    db.notifications.create({
      userId: studentUser._id,
      title: `Hostel Application ${status.toUpperCase()}`,
      message: `Your hostel application ${app.applicationNumber} status changed to ${status}. Remarks: ${remarks || 'None'}`,
      type: status === 'approved' ? 'success' : status === 'rejected' ? 'alert' : 'info',
      isRead: false,
      link: '/admissions',
    });
  }

  return res.json({ application: updated, message: `Application status updated to ${status}` });
});

// ==========================================
// 5. ROOM ALLOCATION MODULE (MODULE B)
// ==========================================
router.get('/allocations', verifyToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'student') {
    const allocs = db.allocations.find((a) => a.studentId === req.user!._id);
    return res.json(allocs);
  }
  const allocs = db.allocations.find();
  return res.json(allocs);
});

router.get('/allocations/my-allocation', verifyToken, (req: AuthRequest, res: Response) => {
  const alloc = db.allocations.findOne((a) => a.studentId === req.user!._id && a.status === 'active');
  return res.json(alloc || null);
});

router.post('/allocations/allocate', verifyToken, requireRole(['admin', 'warden']), (req: AuthRequest, res: Response) => {
  const { studentId, roomId, bedNumber, academicYear, remarks } = req.body;

  if (!studentId || !roomId || !bedNumber) {
    return res.status(400).json({ error: 'Student ID, Room ID, and Bed Number are required.' });
  }

  // 1. Verify student exists
  const student = db.users.findById(studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found in registered users.' });
  }

  // 2. Prevent duplicate active allocations for the same student
  const existingActive = db.allocations.findOne((a) => a.studentId === studentId && a.status === 'active');
  if (existingActive) {
    return res.status(400).json({
      error: `Student ${student.name} already has an active allocation in Room ${existingActive.roomNumber} (${existingActive.bedNumber}). Vacate or transfer first.`,
    });
  }

  // 3. Verify room exists and has capacity
  const room = db.rooms.findById(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Target room not found.' });
  }

  if (room.occupiedBeds >= room.capacity) {
    return res.status(400).json({
      error: `Room ${room.roomNumber} has reached maximum capacity (${room.capacity} beds). Allocation rejected.`,
    });
  }

  // 4. Verify bed availability
  const targetBedIndex = room.beds.findIndex((b: any) => b.bedNumber === bedNumber);
  if (targetBedIndex === -1) {
    return res.status(400).json({ error: `Bed ${bedNumber} does not exist in Room ${room.roomNumber}.` });
  }

  if (room.beds[targetBedIndex].status === 'occupied') {
    return res.status(400).json({
      error: `Bed ${bedNumber} in Room ${room.roomNumber} is already occupied by ${room.beds[targetBedIndex].studentName}.`,
    });
  }

  // 5. Update room beds and occupancy count
  const updatedBeds = [...room.beds];
  updatedBeds[targetBedIndex] = {
    ...updatedBeds[targetBedIndex],
    status: 'occupied',
    studentId: student._id,
    studentName: student.name,
    allocatedDate: new Date().toISOString().split('T')[0],
  };

  const newOccupancy = room.occupiedBeds + 1;
  db.rooms.findByIdAndUpdate(room._id, {
    beds: updatedBeds,
    occupiedBeds: newOccupancy,
  });

  // 6. Update student profile
  db.users.findByIdAndUpdate(student._id, {
    hostelId: room.hostelId,
    hostelName: room.hostelName,
    roomNumber: room.roomNumber,
  });

  // 7. Update application if exists
  const app = db.applications.findOne((a) => a.email.toLowerCase() === student.email.toLowerCase());
  if (app) {
    db.applications.findByIdAndUpdate(app._id, {
      status: 'allocated',
      remarks: `Allocated to Room ${room.roomNumber} (${bedNumber})`,
    });
  }

  // 8. Create RoomAllocation record
  const allocation = db.allocations.create({
    studentId: student._id,
    studentName: student.name,
    studentRegisterNo: student.studentId || 'N/A',
    hostelId: room.hostelId,
    hostelName: room.hostelName || 'Residence Hall',
    roomId: room._id,
    roomNumber: room.roomNumber,
    bedNumber,
    allocatedDate: new Date().toISOString().split('T')[0],
    academicYear: academicYear || '2026-2027',
    status: 'active',
    remarks: remarks || 'Allocated by Warden/Admin',
  });

  // 9. Generate Initial Hostel Fee Invoice for the student
  const feeInvoiceNum = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  db.fees.create({
    invoiceNumber: feeInvoiceNum,
    studentId: student._id,
    studentName: student.name,
    studentRegisterNo: student.studentId || 'N/A',
    hostelName: room.hostelName || 'Residence Hall',
    roomNumber: room.roomNumber,
    feeType: 'hostel_fee',
    period: 'Current Semester 2026-2027',
    totalAmount: (room.monthlyFee || 7000) * 5, // 5-month semester
    paidAmount: 0,
    balance: (room.monthlyFee || 7000) * 5,
    dueDate: new Date(Date.now() + 86400000 * 15).toISOString().split('T')[0],
    status: 'pending',
  });

  logAudit(
    req,
    'ROOM_ALLOCATION',
    'allocation',
    `Allocated ${student.name} to ${room.roomNumber} (${bedNumber}) in ${room.hostelName}`
  );

  db.notifications.create({
    userId: student._id,
    title: 'Room Allocated!',
    message: `Congratulations! You have been allocated Bed ${bedNumber} in Room ${room.roomNumber} (${room.hostelName}).`,
    type: 'success',
    isRead: false,
    link: '/allocations',
  });

  return res.status(201).json({
    allocation,
    message: `Student ${student.name} allocated to Room ${room.roomNumber} successfully!`,
  });
});

router.post('/allocations/:id/transfer', verifyToken, requireRole(['admin', 'warden']), (req: AuthRequest, res: Response) => {
  const { newRoomId, newBedNumber, remarks } = req.body;
  const currentAlloc = db.allocations.findById(req.params.id);
  if (!currentAlloc || currentAlloc.status !== 'active') {
    return res.status(404).json({ error: 'Active allocation record not found.' });
  }

  const targetRoom = db.rooms.findById(newRoomId);
  if (!targetRoom) return res.status(404).json({ error: 'Target room not found.' });

  if (targetRoom.occupiedBeds >= targetRoom.capacity) {
    return res.status(400).json({ error: 'Target room has no available capacity.' });
  }

  const targetBed = targetRoom.beds.find((b: any) => b.bedNumber === newBedNumber);
  if (!targetBed || targetBed.status === 'occupied') {
    return res.status(400).json({ error: `Bed ${newBedNumber} in Room ${targetRoom.roomNumber} is unavailable.` });
  }

  // 1. Release old room bed
  const oldRoom = db.rooms.findById(currentAlloc.roomId);
  if (oldRoom) {
    const updatedOldBeds = oldRoom.beds.map((b: any) =>
      b.bedNumber === currentAlloc.bedNumber ? { bedNumber: b.bedNumber, status: 'available' } : b
    );
    db.rooms.findByIdAndUpdate(oldRoom._id, {
      beds: updatedOldBeds,
      occupiedBeds: Math.max(0, oldRoom.occupiedBeds - 1),
    });
  }

  // 2. Mark current allocation as transferred
  db.allocations.findByIdAndUpdate(currentAlloc._id, {
    status: 'transferred',
    vacatedDate: new Date().toISOString().split('T')[0],
    remarks: `Transferred to Room ${targetRoom.roomNumber} (${newBedNumber}). ${remarks || ''}`,
  });

  // 3. Occupy new room bed
  const updatedNewBeds = targetRoom.beds.map((b: any) =>
    b.bedNumber === newBedNumber
      ? {
          bedNumber: b.bedNumber,
          status: 'occupied',
          studentId: currentAlloc.studentId,
          studentName: currentAlloc.studentName,
          allocatedDate: new Date().toISOString().split('T')[0],
        }
      : b
  );
  db.rooms.findByIdAndUpdate(targetRoom._id, {
    beds: updatedNewBeds,
    occupiedBeds: targetRoom.occupiedBeds + 1,
  });

  // 4. Update student profile
  db.users.findByIdAndUpdate(currentAlloc.studentId, {
    hostelId: targetRoom.hostelId,
    hostelName: targetRoom.hostelName,
    roomNumber: targetRoom.roomNumber,
  });

  // 5. Create new active allocation
  const newAlloc = db.allocations.create({
    studentId: currentAlloc.studentId,
    studentName: currentAlloc.studentName,
    studentRegisterNo: currentAlloc.studentRegisterNo,
    hostelId: targetRoom.hostelId,
    hostelName: targetRoom.hostelName || 'Residence Hall',
    roomId: targetRoom._id,
    roomNumber: targetRoom.roomNumber,
    bedNumber: newBedNumber,
    allocatedDate: new Date().toISOString().split('T')[0],
    academicYear: currentAlloc.academicYear,
    status: 'active',
    remarks: `Transfer from ${currentAlloc.roomNumber}. ${remarks || ''}`,
  });

  logAudit(
    req,
    'ROOM_TRANSFER',
    'allocation',
    `Transferred ${currentAlloc.studentName} from Room ${currentAlloc.roomNumber} to Room ${targetRoom.roomNumber}`
  );

  return res.json({
    allocation: newAlloc,
    message: `Transferred to Room ${targetRoom.roomNumber} successfully!`,
  });
});

router.post('/allocations/:id/vacate', verifyToken, requireRole(['admin', 'warden']), (req: AuthRequest, res: Response) => {
  const { remarks } = req.body;
  const alloc = db.allocations.findById(req.params.id);
  if (!alloc || alloc.status !== 'active') {
    return res.status(404).json({ error: 'Active allocation record not found.' });
  }

  // 1. Release room bed
  const room = db.rooms.findById(alloc.roomId);
  if (room) {
    const updatedBeds = room.beds.map((b: any) =>
      b.bedNumber === alloc.bedNumber ? { bedNumber: b.bedNumber, status: 'available' } : b
    );
    db.rooms.findByIdAndUpdate(room._id, {
      beds: updatedBeds,
      occupiedBeds: Math.max(0, room.occupiedBeds - 1),
    });
  }

  // 2. Mark allocation as vacated
  const updatedAlloc = db.allocations.findByIdAndUpdate(alloc._id, {
    status: 'vacated',
    vacatedDate: new Date().toISOString().split('T')[0],
    remarks: remarks || 'Vacated on student departure/graduation',
  });

  // 3. Clear room from student profile
  db.users.findByIdAndUpdate(alloc.studentId, {
    roomNumber: '',
    hostelId: '',
    hostelName: '',
  });

  logAudit(req, 'ROOM_VACATE', 'allocation', `Vacated ${alloc.studentName} from Room ${alloc.roomNumber} (${alloc.bedNumber})`);

  return res.json({
    allocation: updatedAlloc,
    message: `Room ${alloc.roomNumber} vacated successfully. Bed is now available.`,
  });
});

// ==========================================
// 6. FEE TRACKING & RECEIPTS (MODULE C)
// ==========================================
router.get('/fees', verifyToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'student') {
    const myFees = db.fees.find((f) => f.studentId === req.user!._id);
    return res.json(myFees);
  }
  const allFees = db.fees.find();
  return res.json(allFees);
});

router.get('/fees/my-fees', verifyToken, (req: AuthRequest, res: Response) => {
  const myFees = db.fees.find((f) => f.studentId === req.user!._id);
  const myTransactions = db.transactions.find((t) => t.studentId === req.user!._id);
  return res.json({ fees: myFees, transactions: myTransactions });
});

router.post('/fees', verifyToken, requireRole(['finance', 'admin']), (req: AuthRequest, res: Response) => {
  const { studentId, feeType, period, totalAmount, dueDate } = req.body;
  if (!studentId || !totalAmount || !dueDate) {
    return res.status(400).json({ error: 'Student, total amount, and due date are required.' });
  }

  const student = db.users.findById(studentId);
  if (!student) return res.status(404).json({ error: 'Student not found.' });

  const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
  const amt = Number(totalAmount);

  const newFee = db.fees.create({
    invoiceNumber,
    studentId: student._id,
    studentName: student.name,
    studentRegisterNo: student.studentId || 'N/A',
    hostelName: student.hostelName || 'Residence Hall',
    roomNumber: student.roomNumber || 'TBD',
    feeType: feeType || 'hostel_fee',
    period: period || 'Academic Year 2026-2027',
    totalAmount: amt,
    paidAmount: 0,
    balance: amt,
    dueDate,
    status: 'pending',
  });

  logAudit(req, 'CREATE_FEE_INVOICE', 'fee', `Created fee invoice ${invoiceNumber} of ₹${amt} for ${student.name}`);
  return res.status(201).json(newFee);
});

router.post('/fees/:id/pay', verifyToken, (req: AuthRequest, res: Response) => {
  const { amount, paymentMethod, notes } = req.body;
  const fee = db.fees.findById(req.params.id);
  if (!fee) return res.status(404).json({ error: 'Fee invoice record not found.' });

  // Permissions check: Student can pay their own fees, Finance/Admin can record any fee
  if (req.user?.role === 'student' && fee.studentId !== req.user._id) {
    return res.status(403).json({ error: 'You are not authorized to pay this fee record.' });
  }

  const payAmount = Number(amount);
  if (isNaN(payAmount) || payAmount <= 0) {
    return res.status(400).json({ error: 'Payment amount must be greater than 0.' });
  }

  if (payAmount > fee.balance) {
    return res.status(400).json({
      error: `Payment amount (₹${payAmount}) exceeds outstanding balance (₹${fee.balance}).`,
    });
  }

  const receiptNumber = `RCPT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
  const txnRef = `TXN-${Date.now().toString().slice(-8)}-CAMPUS`;

  // 1. Create transaction record
  const transaction = db.transactions.create({
    transactionReference: txnRef,
    feeRecordId: fee._id,
    studentId: fee.studentId,
    studentName: fee.studentName,
    amount: payAmount,
    paymentMethod: paymentMethod || 'online_gateway',
    paymentDate: new Date().toISOString(),
    status: 'completed',
    receiptNumber,
    notes: notes || 'Hostel Fee Payment Settlement',
  });

  // 2. Update FeeRecord balance and status
  const newPaidAmount = (fee.paidAmount || 0) + payAmount;
  const newBalance = fee.totalAmount - newPaidAmount;
  const newStatus = newBalance === 0 ? 'paid' : 'partial';

  const updatedFee = db.fees.findByIdAndUpdate(fee._id, {
    paidAmount: newPaidAmount,
    balance: newBalance,
    status: newStatus,
  });

  logAudit(
    req,
    'FEE_PAYMENT',
    'fee',
    `Recorded payment of ₹${payAmount} for invoice ${fee.invoiceNumber} (${receiptNumber})`
  );

  db.notifications.create({
    userId: fee.studentId,
    title: 'Payment Received',
    message: `Payment of ₹${payAmount} for ${fee.feeType.replace('_', ' ').toUpperCase()} recorded. Receipt: ${receiptNumber}`,
    type: 'success',
    isRead: false,
    link: '/fees',
  });

  return res.json({
    fee: updatedFee,
    transaction,
    message: `Payment of ₹${payAmount.toLocaleString()} recorded successfully!`,
  });
});

router.get('/fees/receipt/:receiptNumber', (req, res: Response) => {
  const transaction = db.transactions.findOne((t) => t.receiptNumber === req.params.receiptNumber);
  if (!transaction) return res.status(404).json({ error: 'Receipt not found.' });

  const fee = db.fees.findById(transaction.feeRecordId);
  const student = db.users.findById(transaction.studentId);

  return res.json({
    transaction,
    fee,
    student: student
      ? {
          name: student.name,
          studentId: student.studentId,
          department: student.department,
          hostelName: student.hostelName,
          roomNumber: student.roomNumber,
        }
      : null,
  });
});

// ==========================================
// 7. MAINTENANCE REQUESTS (MODULE D)
// ==========================================
router.get('/maintenance', verifyToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'student') {
    const requests = db.maintenance.find((m) => m.studentId === req.user!._id);
    return res.json(requests);
  }
  const allRequests = db.maintenance.find();
  return res.json(allRequests);
});

router.post('/maintenance', verifyToken, (req: AuthRequest, res: Response) => {
  const { category, priority, title, description, roomNumber, hostelName } = req.body;
  if (!title || !description) {
    return res.status(400).json({ error: 'Title and description are required.' });
  }

  const user = db.users.findById(req.user!._id);
  const count = db.maintenance.count();
  const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

  const newTicket = db.maintenance.create({
    ticketNumber,
    studentId: req.user!._id,
    studentName: req.user!.name,
    roomNumber: roomNumber || user?.roomNumber || 'Room N/A',
    hostelName: hostelName || user?.hostelName || 'Residence Hall',
    category: category || 'general',
    priority: priority || 'medium',
    title,
    description,
    status: 'submitted',
    assignedTo: 'Unassigned',
    remarks: 'Ticket submitted. Scheduled for warden review.',
  });

  logAudit(req, 'MAINTENANCE_SUBMIT', 'maintenance', `Submitted ticket ${ticketNumber} (${category})`);

  return res.status(201).json({
    ticket: newTicket,
    message: `Maintenance ticket ${ticketNumber} created successfully!`,
  });
});

router.put('/maintenance/:id/status', verifyToken, requireRole(['warden', 'admin']), (req: AuthRequest, res: Response) => {
  const { status, assignedTo, remarks } = req.body;
  const ticket = db.maintenance.findById(req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Maintenance ticket not found.' });

  const resolvedAt = status === 'resolved' || status === 'closed' ? new Date().toISOString() : ticket.resolvedAt;

  const updatedTicket = db.maintenance.findByIdAndUpdate(ticket._id, {
    ...(status && { status }),
    ...(assignedTo && { assignedTo }),
    ...(remarks && { remarks }),
    ...(resolvedAt && { resolvedAt }),
  });

  logAudit(req, 'MAINTENANCE_UPDATE', 'maintenance', `Updated ticket ${ticket.ticketNumber} to ${status}`);

  // Notify student
  db.notifications.create({
    userId: ticket.studentId,
    title: `Maintenance Ticket ${status.toUpperCase()}`,
    message: `Your maintenance ticket ${ticket.ticketNumber} (${ticket.title}) is now ${status}. Assigned to: ${assignedTo || ticket.assignedTo}`,
    type: status === 'resolved' ? 'success' : 'info',
    isRead: false,
    link: '/maintenance',
  });

  return res.json({
    ticket: updatedTicket,
    message: `Maintenance ticket ${ticket.ticketNumber} updated!`,
  });
});

// ==========================================
// 8. VISITOR MANAGEMENT (MODULE E)
// ==========================================
router.get('/visitors', verifyToken, (req: AuthRequest, res: Response) => {
  if (req.user?.role === 'student') {
    const myVisitors = db.visitors.find((v) => v.studentId === req.user!._id);
    return res.json(myVisitors);
  }
  const allVisitors = db.visitors.find();
  return res.json(allVisitors);
});

router.post('/visitors/check-in', verifyToken, async (req: AuthRequest, res: Response) => {
  const { visitorName, visitorPhone, idProofType, idProofNumber, studentId, purpose } = req.body;
  if (!visitorName || !visitorPhone || !studentId || !purpose) {
    return res.status(400).json({ error: 'Visitor name, phone, student, and purpose are required.' });
  }

  const student = db.users.findById(studentId);
  if (!student) return res.status(404).json({ error: 'Hostel student not found.' });

  const count = db.visitors.count();
  const passNumber = `VIS-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
  const qrPassToken = `CAMPUS-PASS-${passNumber}-${generateObjectId().slice(0, 8)}`;

  const newVisitor = db.visitors.create({
    passNumber,
    visitorName,
    visitorPhone,
    idProofType: idProofType || 'Government ID',
    idProofNumber: idProofNumber || 'N/A',
    studentId: student._id,
    studentName: student.name,
    studentRoom: student.roomNumber || 'A-204',
    purpose,
    checkInTime: new Date().toISOString(),
    status: 'checked_in',
    qrPassToken,
    escortVerified: true,
  });

  logAudit(req, 'VISITOR_CHECK_IN', 'visitor', `Checked in visitor ${visitorName} for student ${student.name}`);

  // Notify student
  db.notifications.create({
    userId: student._id,
    title: 'Visitor Checked In',
    message: `${visitorName} has checked into the hostel to meet you. Pass: ${passNumber}`,
    type: 'info',
    isRead: false,
    link: '/visitors',
  });

  return res.status(201).json({
    visitor: newVisitor,
    message: `Visitor ${visitorName} checked-in successfully. Digital Gate Pass issued.`,
  });
});

router.put('/visitors/:id/check-out', verifyToken, requireRole(['warden', 'admin']), (req: AuthRequest, res: Response) => {
  const visitor = db.visitors.findById(req.params.id);
  if (!visitor) return res.status(404).json({ error: 'Visitor record not found.' });

  const updated = db.visitors.findByIdAndUpdate(visitor._id, {
    status: 'checked_out',
    checkOutTime: new Date().toISOString(),
  });

  logAudit(req, 'VISITOR_CHECK_OUT', 'visitor', `Checked out visitor ${visitor.visitorName} (${visitor.passNumber})`);

  return res.json({
    visitor: updated,
    message: `Visitor ${visitor.visitorName} checked out successfully.`,
  });
});

router.get('/visitors/qr-code/:token', async (req, res: Response) => {
  try {
    const visitor = db.visitors.findOne((v) => v.qrPassToken === req.params.token);
    if (!visitor) return res.status(404).json({ error: 'Gate pass token not found or invalid.' });

    const qrData = JSON.stringify({
      passNumber: visitor.passNumber,
      visitorName: visitor.visitorName,
      studentName: visitor.studentName,
      studentRoom: visitor.studentRoom,
      checkInTime: visitor.checkInTime,
      status: visitor.status,
      token: visitor.qrPassToken,
    });

    const qrDataUrl = await QRCode.toDataURL(qrData, {
      width: 280,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' },
    });

    return res.json({ qrDataUrl, visitor });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate QR pass image', details: err.message });
  }
});

// ==========================================
// 9. OCCUPANCY MONITORING (MODULE F)
// ==========================================
router.get('/occupancy/stats', (_req, res: Response) => {
  const hostels = db.hostels.find();
  const rooms = db.rooms.find();

  let totalBeds = 0;
  let occupiedBeds = 0;
  let maintenanceBeds = 0;

  rooms.forEach((r) => {
    totalBeds += r.capacity || 0;
    occupiedBeds += r.occupiedBeds || 0;
    if (r.status === 'maintenance') {
      maintenanceBeds += (r.capacity - (r.occupiedBeds || 0));
    }
  });

  const availableBeds = Math.max(0, totalBeds - occupiedBeds - maintenanceBeds);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  const hostelBreakdown = hostels.map((h) => {
    const hRooms = rooms.filter((r) => r.hostelId === h._id);
    const hBeds = hRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const hOccupied = hRooms.reduce((sum, r) => sum + (r.occupiedBeds || 0), 0);
    const hAvailable = Math.max(0, hBeds - hOccupied);
    const hRate = hBeds > 0 ? Math.round((hOccupied / hBeds) * 100) : 0;

    return {
      hostelId: h._id,
      hostelName: h.name,
      code: h.code,
      type: h.type,
      totalRooms: hRooms.length,
      totalBeds: hBeds,
      occupiedBeds: hOccupied,
      availableBeds: hAvailable,
      occupancyRate: hRate,
    };
  });

  const roomTypes = ['single', 'double', 'triple', 'quad'];
  const roomTypeBreakdown = roomTypes.map((t) => {
    const matching = rooms.filter((r) => r.type === t);
    const count = matching.length;
    const typeBeds = matching.reduce((sum, r) => sum + r.capacity, 0);
    const occupied = matching.reduce((sum, r) => sum + r.occupiedBeds, 0);
    return {
      type: t,
      count,
      totalBeds: typeBeds,
      occupied,
    };
  });

  return res.json({
    totalHostels: hostels.length,
    totalRooms: rooms.length,
    totalBeds,
    occupiedBeds,
    availableBeds,
    maintenanceBeds,
    occupancyRate,
    hostelBreakdown,
    roomTypeBreakdown,
  });
});

// ==========================================
// 10. NOTIFICATIONS
// ==========================================
router.get('/notifications', verifyToken, (req: AuthRequest, res: Response) => {
  const notifs = db.notifications.find(
    (n) => !n.userId || n.userId === req.user!._id
  );
  return res.json(notifs.reverse());
});

router.put('/notifications/:id/read', verifyToken, (req: AuthRequest, res: Response) => {
  const updated = db.notifications.findByIdAndUpdate(req.params.id, { isRead: true });
  return res.json(updated);
});

router.put('/notifications/read-all', verifyToken, (req: AuthRequest, res: Response) => {
  const notifs = db.notifications.find((n) => !n.userId || n.userId === req.user!._id);
  notifs.forEach((n) => db.notifications.findByIdAndUpdate(n._id, { isRead: true }));
  return res.json({ success: true });
});

// ==========================================
// 11. AUDIT LOGS
// ==========================================
router.get('/audit-logs', verifyToken, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { category, limit = 100 } = req.query;
  let logs = db.auditLogs.find();
  if (category) {
    logs = logs.filter((l) => l.category === category);
  }
  return res.json(logs.reverse().slice(0, Number(limit)));
});

// ==========================================
// 12. USERS MANAGEMENT (ADMIN)
// ==========================================
router.get('/users', verifyToken, requireRole(['admin']), (_req, res: Response) => {
  const users = db.users.find().map(({ password, ...u }) => u);
  return res.json(users);
});

router.put('/users/:id/role', verifyToken, requireRole(['admin']), (req: AuthRequest, res: Response) => {
  const { role, status } = req.body;
  const user = db.users.findById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const updated = db.users.findByIdAndUpdate(user._id, {
    ...(role && { role }),
    ...(status && { status }),
  });

  logAudit(req, 'USER_ROLE_CHANGE', 'user', `Updated user ${user.name} role to ${role || user.role}, status: ${status || user.status}`);

  const { password: _, ...userSafe } = updated;
  return res.json(userSafe);
});

export default router;
