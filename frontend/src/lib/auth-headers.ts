import { decrypt } from './auth';
import { headers } from 'next/headers';

export async function getAuthUser() {
  const authHeader = (await headers()).get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    return await decrypt(token);
  } catch (err) {
    return null;
  }
}
