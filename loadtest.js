import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '30s',

  thresholds: {
    http_req_failed: ['rate<0.05'],
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.95'],
  },
};

export default function () {
  const res = http.get('https://garaj-defteri.vercel.app/', {
    headers: {
      'x-vercel-protection-bypass': __ENV.BYPASS_SECRET,
    },
    timeout: '15s',
  });

  check(res, {
    'site cevap verdi': (r) => r.status >= 200 && r.status < 400,
  });

  sleep(2);
}