import { SignJWT, jwtVerify, decodeJwt } from 'jose';

interface Payload {
  [key: string]: string | number | boolean;
}

// Create a token with 1-day expiration and a payload
export const createToken = async (payload: Payload): Promise<string> => {
  if (!process.env.JWT_PASSWORD) {
    throw new Error('JWT_PASSWORD is not defined');
  }

  const secret = new TextEncoder().encode(process.env.JWT_PASSWORD);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1d')
    .sign(secret);

  return token;
};

// Validate and verify the token
export const validateToken = async (token: string): Promise<Payload> => {
  if (!process.env.JWT_PASSWORD) {
    throw new Error('JWT_PASSWORD is not defined');
  }

  const secret = new TextEncoder().encode(process.env.JWT_PASSWORD);

  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as Payload;
  } catch (err) {
    console.error('Invalid token:', err);
    throw new Error('Invalid token');
  }
};

// Decode the token without verifying its signature
export const decodeToken = (token: string): Payload => {
  if (!token) {
    throw new Error('Token is undefined');
  }

  try {
    const decoded = decodeJwt(token);
    return decoded as Payload;
  } catch (err) {
    console.error('Error decoding token:', err);
    throw new Error('Invalid token');
  }
};
