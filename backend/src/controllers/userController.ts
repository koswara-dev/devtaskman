import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth';
import { query } from '../db/db';
import bcrypt from 'bcryptjs';
import { createNotification } from '../services/notificationService';

export const getUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const usersResult = await query('SELECT id, name, email, role, avatar_url FROM users ORDER BY id ASC');
    const users = usersResult.rows.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      avatarUrl: u.avatar_url
    }));
    return res.json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memuat data pengguna.' });
  }
};

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
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

    const sysNotifId = `sys-${Date.now()}`;
    const timestamp = new Date().toISOString();
    await createNotification({
      id: sysNotifId,
      taskId: 'USER_REG',
      taskTitle: 'Registrasi Anggota',
      message: `System Log: Anggota baru ${name} dengan peran ${role} ditambahkan oleh Admin.`,
      timestamp,
      type: 'system'
    });

    return res.status(201).json({ id, name, email, role, avatarUrl: avatar });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menambahkan pengguna baru.' });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { name, role, avatarUrl } = req.body;
  const adminName = req.user?.name || 'Admin';

  try {
    const userQuery = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const activeUser = userQuery.rows[0];
    const newName = name !== undefined ? name : activeUser.name;
    const newRole = role !== undefined ? role : activeUser.role;
    const newAvatar = avatarUrl !== undefined ? avatarUrl : activeUser.avatar_url;

    // Admin role updates verification lock (enforcing access check)
    if (role && role !== activeUser.role && req.user?.role !== 'Admin') {
      return res.status(403).json({ error: 'Akses ditolak: Hanya peran Admin yang diizinkan untuk memodifikasi peran pengguna.' });
    }

    await query(
      'UPDATE users SET name=$1, role=$2, avatar_url=$3 WHERE id=$4',
      [newName, newRole, newAvatar, id]
    );

    if (role && role !== activeUser.role) {
      const sysNotifId = `sys-${Date.now()}`;
      const timestamp = new Date().toISOString();
      await createNotification({
        id: sysNotifId,
        taskId: 'USER_ROLE',
        taskTitle: 'Perubahan Peran',
        message: `System Log: Peran pengguna ${activeUser.name} diubah ke ${newRole} oleh ${adminName}.`,
        timestamp,
        type: 'system'
      });
    }

    return res.json({ id, name: newName, email: activeUser.email, role: newRole, avatarUrl: newAvatar });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal memperbarui profil pengguna.' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const adminName = req.user?.name || 'Admin';

  try {
    const userQuery = await query('SELECT * FROM users WHERE id = $1', [id]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: 'User tidak ditemukan.' });
    }

    const user = userQuery.rows[0];

    // Delete user from db
    await query('DELETE FROM users WHERE id = $1', [id]);

    // Relational ON DELETE SET NULL constraint automatically handles task assignments in Postgres.
    // Memory database handles it inside the query mock function.

    const sysNotifId = `sys-${Date.now()}`;
    const timestamp = new Date().toISOString();
    await createNotification({
      id: sysNotifId,
      taskId: 'USER_DEL',
      taskTitle: 'Terminasi Anggota',
      message: `System Log: Anggota ${user.name} dihapus dari sistem oleh ${adminName}.`,
      timestamp,
      type: 'system'
    });

    return res.json({ success: true, message: `Pengguna ${user.name} berhasil dihapus.` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal menghapus pengguna.' });
  }
};

export const importUsers = async (req: AuthenticatedRequest, res: Response) => {
  const { users } = req.body;
  const adminName = req.user?.name || 'Admin';

  if (!users || !Array.isArray(users)) {
    return res.status(400).json({ error: 'Payload users harus berupa array.' });
  }

  try {
    const passwordHash = await bcrypt.hash('password123', 10);
    const timestamp = new Date().toISOString();
    const importedCount = users.length;

    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const checkUser = await query('SELECT * FROM users WHERE email = $1', [u.email]);
      if (checkUser.rows.length > 0) continue;

      const id = `u-import-${Date.now()}-${i}`;
      const avatar = u.avatarUrl || `https://images.unsplash.com/photo-${1500000000000 + i}?w=150`;

      await query(
        'INSERT INTO users(id, name, email, password_hash, role, avatar_url) VALUES($1, $2, $3, $4, $5, $6)',
        [id, u.name, u.email, passwordHash, u.role, avatar]
      );
    }

    const sysNotifId = `sys-${Date.now()}`;
    await createNotification({
      id: sysNotifId,
      taskId: 'ADMIN',
      taskTitle: 'Import Anggota',
      message: `System Log: ${adminName} mengimpor ${importedCount} pengguna baru dari file CSV.`,
      timestamp,
      type: 'system'
    });

    return res.status(201).json({ success: true, count: importedCount });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gagal melakukan import daftar pengguna.' });
  }
};
