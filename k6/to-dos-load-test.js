import http from 'k6/http';
import { check, fail } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js'

const PORT = __ENV.API_PORT || '4501';
const BASE_PATH = __ENV.API_BASE_PATH || '/api';
const API_NAME = __ENV.API_NAME || 'cpp';

const BASE_URL = `http://host.docker.internal:${PORT}${BASE_PATH}`;

const headers = { 'Content-Type': 'application/json' };

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: `5s`, target: Number(10) },
        { duration: `5s`, target: Number(10) },
        { duration: '2s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<2000'],
  },
};

function randomName() {
  return `[API-E2E]-test-todo-${Math.random()}-${__VU}-${Date.now()}`;
}

export function handleSummary(data) {
  return {
    [`${API_NAME}-summary.html`]: htmlReport(data),
  };
}

export default function () {
  const name = randomName();

  const createRes = http.post(
    `${BASE_URL}/to-dos`,
    JSON.stringify({ name }),
    { headers }
  );
  check(createRes, {
    'create: status is 201': (r) => r.status === 201,
  }) || fail(`create failed: ${createRes.status} ${createRes.body}`);

  const todoId = createRes.json('todoId');

  const listRes1 = http.get(`${BASE_URL}/to-dos`, { headers });
  check(listRes1, {
    'verify created: status is 200': (r) => r.status === 200,
    'verify created: todo present with id+name': (r) => {
      const toDos = r.json('toDos') || [];
      return toDos.some((t) => t.id === todoId && t.name === name);
    },
  });

  const completeRes = http.post(
    `${BASE_URL}/to-dos/complete`,
    JSON.stringify({ toDoIds: [todoId] }),
    { headers }
  );
  check(completeRes, {
    'complete: status is 200': (r) => r.status === 200,
  });

  const deleteRes = http.del(
    `${BASE_URL}/to-dos?toDoId=${todoId}`,
    null,
    { headers }
  );
  check(deleteRes, {
    'delete: status is 200': (r) => r.status === 200,
  });

  const listRes2 = http.get(`${BASE_URL}/to-dos`, { headers });
  check(listRes2, {
    'verify removed: status is 200': (r) => r.status === 200,
    'verify removed: todo no longer present': (r) => {
      const toDos = r.json('toDos') || [];
      return !toDos.some((t) => t.name === name);
    },
  });
}
