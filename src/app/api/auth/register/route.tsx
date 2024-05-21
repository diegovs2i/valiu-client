import { cookies } from 'next/headers';
import { serialize } from 'cookie';

export const POST = async (req: Request) => {
  const body = await req.json();
  const response = await fetch(`${process.env.APP_HOST}/auth/user/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const parsedResponse = await response.json();
    return Response.json(parsedResponse, { status: response.status });
  }

  const { accessToken } = await response.json();

  const cookie = serialize('token', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // One week
    path: '/'
  });

  cookies().set('access-token', cookie);

  return Response.json({}, { status: 200 });
};
