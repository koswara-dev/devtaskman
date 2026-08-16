import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    name: string;
  };
}

export const verifyJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Akses ditolak: Token otentikasi tidak disediakan.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Akses ditolak: Format token salah (wajib Bearer <token>).' });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Akses ditolak: Token tidak valid atau kedaluwarsa.' });
  }
};

export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Akses ditolak: Pengguna belum diotentikasi.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Akses ditolak: peran "${req.user.role}" tidak diizinkan untuk melakukan aksi ini.` });
    }

    next();
  };
};
