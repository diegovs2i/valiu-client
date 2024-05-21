import { cookies } from 'next/headers';
import { parse as parseCookie } from 'cookie';

export const POST = async (req: Request) => {
  const { seats, targetDate, skip, take } = await req.json();
  const token = parseCookie(cookies().get('access-token')!.value).token;

  const response = await fetch(
    `${process.env.APP_HOST}/table/available?targetDate=${targetDate}&seats=${seats}&skip=${skip}&take=${take}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      }
    }
  );

  const responseJson = await response.json();
  return Response.json(responseJson, {
    status: response.ok ? 200 : response.status
  });
};
