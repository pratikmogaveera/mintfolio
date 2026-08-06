const handler = async (request: Request): Promise<Response> => {
  const { method, headers } = request;
  const endpoint = request.url.split('/api/')[1];
  const cookie = headers.get('cookie') || '';
  const contentType = headers.get('content-type') || 'application/json';
  const body = method === 'GET' || method === 'HEAD' ? undefined : await request.arrayBuffer();
  const requestInit: RequestInit = {
    method,
    headers: { cookie, 'content-type': contentType },
    body,
  };

  try {
    const railwayResponse = await fetch(`${process.env.RAILWAY_URL}/${endpoint}`, requestInit);
    const responseHeaders = new Headers();
    const setCookie = railwayResponse.headers.get('set-cookie');
    if (setCookie) responseHeaders.set('set-cookie', setCookie);
    responseHeaders.set('content-type', railwayResponse.headers.get('content-type') || 'application/json');

    return new Response(railwayResponse.body, {
      headers: responseHeaders,
      status: railwayResponse.status,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Could not reach server.' }), {
      status: 502,
      headers: { 'content-type': 'application/json' },
    });
  }
};

export const GET = handler;
export const POST = handler;
export const PATCH = handler;
export const DELETE = handler;
