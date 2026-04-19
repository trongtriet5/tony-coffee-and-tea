import { decrypt } from './auth';
import { headers } from 'next/headers';

export async function getAuthUser() {
  try {
    const authHeader = (await headers()).get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    return await decrypt(token);
  } catch {
    return null;
  }
}
