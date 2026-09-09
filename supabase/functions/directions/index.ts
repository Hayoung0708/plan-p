/**
 * 카카오모빌리티 다중 경유지 길찾기 프록시.
 *
 * REST 키를 클라이언트에 두면 도메인 제한이 없어 유출 시 남이 쿼터를 태운다.
 * 브라우저에서 직접 부르면 CORS로도 막힌다. 그래서 키는 여기 시크릿으로만 둔다.
 *
 * 배포: supabase functions deploy directions --no-verify-jwt
 * 시크릿: supabase secrets set KAKAO_REST_KEY=...
 */
const KAKAO_URL = 'https://apis-navi.kakaomobility.com/v1/waypoints/directions';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

type Point = { x: number; y: number };
type RouteRequest = { origin: Point; destination: Point; waypoints: Point[] };

Deno.serve(async (request: Request): Promise<Response> => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  const restKey = Deno.env.get('KAKAO_REST_KEY') ?? '';
  if (restKey === '') {
    return new Response(JSON.stringify({ error: 'KAKAO_REST_KEY 미설정' }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }

  const body = (await request.json()) as RouteRequest;
  const kakaoResponse = await fetch(KAKAO_URL, {
    method: 'POST',
    headers: { Authorization: `KakaoAK ${restKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...body, priority: 'RECOMMEND' }),
  });

  return new Response(await kakaoResponse.text(), {
    status: kakaoResponse.status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
