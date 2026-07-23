import http from 'k6/http';
import { check, fail } from 'k6';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js'

const PORT = __ENV.API_PORT || '4501';
const BASE_PATH = __ENV.API_BASE_PATH || '/api';
const API_NAME = __ENV.API_NAME || 'cpp';

const BASE_URL = `http://host.docker.internal:${PORT}${BASE_PATH}`;

// Only POST requests carry a JSON body -> only they need Content-Type.
// GET/DELETE have no body, sending Content-Type on them can make some
// backends (e.g. nestjs) try to parse an empty body as JSON and fail.
const jsonHeaders = { headers: { 'Content-Type': 'application/json' } };

export const options = {
  scenarios: {
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        // Level 1 - 1 user
        { duration: '10s', target: 1 },
        { duration: '30s', target: 1 },
        // Level 2 - 6 users
        { duration: '10s', target: 6 },
        { duration: '30s', target: 6 },
        // Level 3 - 11 users
        { duration: '11s', target: 11 },
        { duration: '30s', target: 11 },
        // Level 4 - 16 users
        { duration: '16s', target: 16 },
        { duration: '30s', target: 16 },
        // Level 5 - 21 users
        { duration: '21s', target: 21 },
        { duration: '30s', target: 21 },
        // Ramp down
        { duration: '5s', target: 0 },
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

  // Create a new todo (has JSON body -> Content-Type needed)
  const createRes = http.post(
    `${BASE_URL}/to-dos`,
    JSON.stringify({ name }),
    jsonHeaders
  );
  check(createRes, {
    'create: status is 201': (r) => r.status === 201,
  }) || fail(`create failed: ${createRes.status} ${createRes.body}`);

  const todoId = createRes.json('todoId');

  // Verify that todo is in the list with the id and generated name (no body -> no Content-Type)
  const listRes1 = http.get(`${BASE_URL}/to-dos`);
  check(listRes1, {
    'verify created: status is 200': (r) => r.status === 200,
    'verify created: todo present with id+name': (r) => {
      const toDos = r.json('toDos') || [];
      return toDos.some((t) => t.id === todoId && t.name === name);
    },
  });

  // Complete the todo (soft delete) - has JSON body -> Content-Type needed
  const completeRes = http.post(
    `${BASE_URL}/to-dos/complete`,
    JSON.stringify({ toDoIds: [todoId] }),
    jsonHeaders
  );
  check(completeRes, {
    'complete: status is 200': (r) => r.status === 200,
  });

  // Delete the todo (hard delete) - no body, param only -> no Content-Type
  const deleteRes = http.del(`${BASE_URL}/to-dos?toDoId=${todoId}`);
  check(deleteRes, {
    'delete: status is 200': (r) => r.status === 200,
  });

  // Verify that todo has been deleted (no body -> no Content-Type)
  const listRes2 = http.get(`${BASE_URL}/to-dos`);
  check(listRes2, {
    'verify removed: status is 200': (r) => r.status === 200,
    'verify removed: todo no longer present': (r) => {
      const toDos = r.json('toDos') || [];
      return !toDos.some((t) => t.name === name);
    },
  });
}
