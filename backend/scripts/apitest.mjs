const BASE = 'http://localhost:5000/api';
let pass = 0, fail = 0;

async function call(method, path, { token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, json: await res.json().catch(() => ({})) };
}

function check(name, cond, extra = '') {
  if (cond) { pass++; console.log(`PASS ${name}`); }
  else { fail++; console.log(`FAIL ${name} ${extra}`); }
}

const noHash = (obj) => !JSON.stringify(obj).includes('passwordHash');
const rand = Math.random().toString(36).slice(2, 8);
const randNum = Math.floor(100000 + Math.random() * 900000);
const DEV_PW = 'DevPass123!';

// ---------- TENANT FLOW ----------
const tEmail = `tenant.test.${rand}@example.com`;
let r = await call('POST', '/auth/register/tenant', { body: { name: 'Test Tenant', email: tEmail, password: DEV_PW, phone: `+9198${randNum}` } });
check('tenant register 201', r.status === 201 && r.json.data.token && noHash(r.json), JSON.stringify(r.json).slice(0, 150));
const tToken = r.json.data?.token;

r = await call('POST', '/auth/register/tenant', { body: { name: 'Dup', email: tEmail, password: DEV_PW } });
check('duplicate register 409', r.status === 409);

r = await call('POST', '/auth/register/tenant', { body: { name: 'X', email: 'bad', password: 'short' } });
check('invalid register 400', r.status === 400);

r = await call('POST', '/auth/login', { body: { email: tEmail, password: DEV_PW } });
check('tenant login 200', r.status === 200 && r.json.data.token);

r = await call('POST', '/auth/login', { body: { email: tEmail, password: 'WrongPass1!' } });
check('wrong password 401', r.status === 401);

r = await call('GET', '/auth/me', { token: tToken });
check('GET /auth/me', r.status === 200 && r.json.data.user.email === tEmail && noHash(r.json));

r = await call('PUT', '/tenant/profile', { token: tToken, body: { name: 'Test Tenant Updated', occupation: 'DESIGNER', bio: 'Hello' } });
check('PUT /tenant/profile', r.status === 200 && r.json.data.user.name === 'Test Tenant Updated');

r = await call('PUT', '/tenant/preferences', { token: tToken, body: { budgetMin: 5000, budgetMax: 12000, preferredLocations: ['Koramangala'], roomType: 'SINGLE', foodPreference: 'VEG' } });
check('PUT /tenant/preferences', r.status === 200 && r.json.data.preferences.budgetMax === 12000);

r = await call('PUT', '/tenant/preferences', { token: tToken, body: { budgetMin: 20000, budgetMax: 10000 } });
check('budgetMin>budgetMax 400', r.status === 400);

r = await call('GET', '/tenant/preferences', { token: tToken });
check('GET /tenant/preferences', r.status === 200 && r.json.data.preferences.budgetMin === 5000);

// ---------- DISCOVERY ----------
r = await call('GET', '/discover/properties');
check('discover all published', r.status === 200 && r.json.data.properties.length >= 3 && r.json.data.pagination.total >= 3 && r.json.data.properties.every(p => p.status === 'PUBLISHED'));
check('discover hides owner private info', r.json.data.properties.every(p => !p.owner?.email && p.ownerName !== undefined));

r = await call('GET', '/discover/properties?city=Bengaluru&rentMax=10000');
check('discover filter city+rentMax', r.status === 200 && r.json.data.properties.every(p => p.rent <= 10000));

r = await call('GET', '/discover/properties?propertyType=PG&amenities=WiFi');
check('discover filter type+amenities (no match ok)', r.status === 200);

r = await call('GET', '/discover/properties?propertyType=INVALID');
check('discover invalid type 400', r.status === 400);

r = await call('GET', '/discover/properties?page=1&limit=2');
check('discover pagination', r.status === 200 && r.json.data.properties.length <= 2 && r.json.data.pagination.limit === 2);

// ---------- SAVE + ENQUIRY ----------
const propId = (await call('GET', '/discover/properties')).json.data.properties[0].id;

r = await call('POST', `/tenant/saved/${propId}`, { token: tToken });
check('save property 201', r.status === 201);

r = await call('POST', `/tenant/saved/${propId}`, { token: tToken });
check('duplicate save 409', r.status === 409);

r = await call('GET', '/tenant/saved', { token: tToken });
check('GET saved list', r.status === 200 && r.json.data.saved.length === 1);

r = await call('DELETE', `/tenant/saved/${propId}`, { token: tToken });
check('unsave 200', r.status === 200);

r = await call('DELETE', `/tenant/saved/${propId}`, { token: tToken });
check('unsave missing 404', r.status === 404);

r = await call('POST', '/tenant/enquiries', { token: tToken, body: { propertyId: propId, message: 'Is this still available?' } });
check('create enquiry 201', r.status === 201 && r.json.data.enquiry.status === 'PENDING');
const enquiryId = r.json.data?.enquiry?.id;

r = await call('POST', '/tenant/enquiries', { token: tToken, body: { propertyId: propId } });
check('enquiry without message 400', r.status === 400);

r = await call('GET', '/tenant/enquiries', { token: tToken });
check('GET tenant enquiries', r.status === 200 && r.json.data.enquiries.length >= 1);

// ---------- OWNER FLOW ----------
const oEmail = `owner.test.${rand}@example.com`;
r = await call('POST', '/auth/register/owner', { body: { name: 'Test Owner', email: oEmail, password: DEV_PW } });
check('owner register 201', r.status === 201 && noHash(r.json));
const oToken = r.json.data?.token;

r = await call('POST', '/owner/properties', { token: oToken, body: { title: 'Test Room', propertyType: 'ROOM', roomType: 'SINGLE', address: '1 Test Street', city: 'Nagpur', rent: 8000, deposit: 16000, pincode: '440001' } });
check('create property 201', r.status === 201 && r.json.data.property.status === 'DRAFT');
const myPropId = r.json.data?.property?.id;

r = await call('POST', '/owner/properties', { token: oToken, body: { title: 'No Rent', propertyType: 'ROOM', address: 'x', city: 'y' } });
check('create property missing rent 400', r.status === 400);

r = await call('POST', '/owner/properties', { token: oToken, body: { title: 'Bad Pin', propertyType: 'ROOM', address: 'x', city: 'y', rent: 5000, pincode: 'abc' } });
check('create property bad pincode 400', r.status === 400);

r = await call('PUT', `/owner/properties/${myPropId}`, { token: oToken, body: { title: 'Test Room Updated', rent: 8500 } });
check('update own property', r.status === 200 && r.json.data.property.rent === 8500);

r = await call('POST', `/owner/properties/${myPropId}/publish`, { token: oToken });
check('publish property', r.status === 200 && r.json.data.property.status === 'PUBLISHED');

r = await call('POST', `/owner/properties/${myPropId}/pause`, { token: oToken });
check('pause property', r.status === 200 && r.json.data.property.status === 'PAUSED');

// owner cannot touch another owner's property
r = await call('PUT', `/owner/properties/${propId}`, { token: oToken, body: { title: 'Hijack' } });
check('update foreign property 403', r.status === 403);

// seeded owner1 answers the enquiry made above (propId belongs to seeded owner1)
r = await call('POST', '/auth/login', { body: { email: 'owner1@soulnestt.dev', password: DEV_PW } });
check('seeded owner1 login', r.status === 200);
const o1Token = r.json.data?.token;

r = await call('GET', '/owner/enquiries', { token: o1Token });
check('owner1 sees enquiries', r.status === 200 && r.json.data.enquiries.length >= 1);

r = await call('PUT', `/owner/enquiries/${enquiryId}`, { token: o1Token, body: { status: 'ACCEPTED' } });
check('owner update enquiry', r.status === 200 && r.json.data.enquiry.status === 'ACCEPTED');

r = await call('PUT', `/owner/enquiries/${enquiryId}`, { token: oToken, body: { status: 'CLOSED' } });
check('foreign owner update enquiry 403', r.status === 403);

// ---------- ADMIN FLOW ----------
r = await call('POST', '/auth/login', { body: { email: 'admin@soulnestt.dev', password: DEV_PW } });
check('admin blocked on normal login 403', r.status === 403);

r = await call('POST', '/auth/login/admin', { body: { email: 'admin@soulnestt.dev', password: DEV_PW } });
check('admin login 200', r.status === 200 && noHash(r.json));
const aToken = r.json.data?.token;

r = await call('GET', '/admin/dashboard', { token: aToken });
check('admin dashboard', r.status === 200 && r.json.data.users.total >= 7 && r.json.data.properties.total >= 5);

r = await call('GET', '/admin/users?limit=5', { token: aToken });
check('admin users paginated, no hashes', r.status === 200 && r.json.data.users.length <= 5 && noHash(r.json));

r = await call('GET', '/admin/properties', { token: aToken });
check('admin properties', r.status === 200 && r.json.data.properties.length >= 5);

r = await call('GET', '/admin/enquiries', { token: aToken });
check('admin enquiries', r.status === 200 && r.json.data.enquiries.length >= 3);

r = await call('GET', '/admin/reports', { token: aToken });
check('admin reports list', r.status === 200);

r = await call('GET', '/admin/verifications', { token: aToken });
check('admin verifications list', r.status === 200);

// ---------- AUTHORIZATION ----------
r = await call('GET', '/tenant/profile');
check('no token 401', r.status === 401);

r = await call('GET', '/tenant/profile', { token: 'garbage.token.here' });
check('bad token 401', r.status === 401);

r = await call('GET', '/admin/dashboard', { token: tToken });
check('tenant on admin 403', r.status === 403);

r = await call('GET', '/owner/properties', { token: tToken });
check('tenant on owner 403', r.status === 403);

r = await call('GET', '/tenant/saved', { token: oToken });
check('owner on tenant 403', r.status === 403);

r = await call('GET', '/api-does-not-exist');
check('unknown route 404', r.status === 404 && r.json.success === false);

r = await call('POST', '/auth/logout', { token: tToken });
check('logout 200', r.status === 200);

console.log(`\nRESULT: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
