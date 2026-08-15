import Admin from '../models/Admin.js';

/**
 * Ensure the default admin account exists.
 *
 * Idempotent: if an admin with ADMIN_USER already exists, this does nothing —
 * so a password changed via the admin panel is never overwritten on restart.
 *
 * The password is hashed by the Admin model's pre('save') hook, so the raw
 * ADMIN_PASS value is never persisted.
 *
 * @returns {Promise<{created: boolean, username: string}>}
 */
export const seedDefaultAdmin = async () => {
  const name = process.env.ADMIN_NAME || 'Admin';
  const username = process.env.ADMIN_USER || 'admin';
  const password = process.env.ADMIN_PASS || 'admin123';

  const existingAdmin = await Admin.findOne({ username });

  if (existingAdmin) {
    return { created: false, username };
  }

  // create() runs the pre('save') hook, which bcrypt-hashes the password
  await Admin.create({
    name,
    username,
    password,
    role: 'super_admin',
  });

  return { created: true, username };
};

export default seedDefaultAdmin;
