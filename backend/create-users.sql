-- Create Admin and User Accounts
-- Run this after creating your first accounts via registration

-- Create Admin User
-- Password: Admin@123
INSERT INTO "User" (name, phone, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'Admin UpLife',
  '212600000001',
  '$2a$10$8K1p/a0dL2LkTDQmQePefe/uVXdJjby.dcku7vY8nGd9HJaP3Pnb2',
  'ADMIN',
  NOW(),
  NOW()
) ON CONFLICT (phone) DO UPDATE 
SET role = 'ADMIN';

-- Create Regular User
-- Password: User@123
INSERT INTO "User" (name, phone, "passwordHash", role, "createdAt", "updatedAt")
VALUES (
  'User UpLife',
  '212600000002',
  '$2a$10$8K1p/a0dL2LkTDQmQePefe/uVXdJjby.dcku7vY8nGd9HJaP3Pnb2',
  'USER',
  NOW(),
  NOW()
) ON CONFLICT (phone) DO UPDATE 
SET role = 'USER';

-- Show created users
SELECT id, name, phone, role FROM "User" WHERE phone IN ('212600000001', '212600000002');
