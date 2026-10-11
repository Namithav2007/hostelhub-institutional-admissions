import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/database.ts';

const JWT_SECRET = process.env.JWT_SECRET || 'hostel-hub-secret-2026';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'warden' | 'admin' | 'finance';
    studentId?: string;
  };
}

export function generateToken(payload: { _id: string; email: string; role: string; name: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication token required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired authentication token' });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'User context not found' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Requires one of roles: ${allowedRoles.join(', ')}. Current role: ${req.user.role}`,
      });
    }
    next();
  };
}

export function logAudit(
  req: AuthRequest,
  action: string,
  category: 'auth' | 'admissions' | 'allocation' | 'fee' | 'maintenance' | 'visitor' | 'user',
  details: string
) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    db.auditLogs.create({
      action,
      category,
      actorId: req.user?._id || 'system',
      actorName: req.user?.name || 'Anonymous',
      actorRole: req.user?.role || 'student',
      details,
      ipAddress: String(ip),
    });
  } catch (e) {
    console.error('Failed to log audit event:', e);
  }
}
