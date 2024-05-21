import { cookies } from 'next/headers';
import { parse as parseCookie } from 'cookie';

export const POST = async (req: Request) => {
  const data = await req.json();

  const token = parseCookie(cookies().get('access-token')!.value).token;

  const response = await fetch(`${process.env.APP_HOST}/reservation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  const responseJson = await response.json();
  return Response.json(responseJson, {
    status: response.ok ? 200 : response.status
  });
};
