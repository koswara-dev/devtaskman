import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../db/db';
import { config } from '../config';

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, avatarUrl } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'Parameter name, email, password, dan role wajib diisi.' });
  }

  try {
    const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email sudah terdaftar.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = `u-${Date.now()}`;
    const avatar = avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    await query(
      'INSERT INTO users(id, name, email, password_hash, role, avatar_url) VALUES($1, $2, $3, $4, $5, $6)',
      [id, name, email, passwordHash, role, avatar]
    );

    return res.status(201).json({
      message: 'Registrasi berhasil.',
      user: { id, name, email, role, avatarUrl: avatar }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal melakukan registrasi pengguna.' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email dan password wajib diisi.' });
  }

  try {
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Kredensial tidak valid: User tidak ditemukan.' });
    }

    const user = userResult.rows[0];
    const isPasswordMatch = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordMatch) {
      return res.status(401).json({ error: 'Kredensial tidak valid: Password salah.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      config.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login berhasil.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatar_url
      }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal melakukan proses login.' });
  }
};
