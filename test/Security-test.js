const test = require("tape");
const LocalStorageMock = require("@luispablo/test-helpers").LocalStorageMock;
const DispatchMock = require("@luispablo/test-helpers").DispatchMock;
const FetcherMock = require("@luispablo/test-helpers").FetcherMock;
const createStore = require("redux").createStore;
const Security = require("../src/Security");
const SecurityException = require("../src/SecurityException");

const clearJWT = Security.clearJWT;
const restoreJWT = Security.restoreJWT;
const setValidatingJWT = Security.setValidatingJWT;
const storeJWT = Security.storeJWT;
const validateJWT = Security.validateJWT;
const restoreValidatedLocalJWT = Security.restoreValidatedLocalJWT;

const USERNAME = "username";
const PASSWORD = "password";

const storageMock = LocalStorageMock();
const store = createStore(Security(storageMock));
const JWT = { user: USERNAME };

const fetcherUnauthorized = FetcherMock({ status: 401 });
const fetcherOKWithJWT = FetcherMock({ json: JWT });

test("Security - initial state", function (assert) {
	const expectedInitialState = { JWT: null, isValidatingJWT: false, validatedJWT: false };
	assert.deepEqual(store.getState(), expectedInitialState, "Expected initial state");
	assert.end();
});

test("Security - clearJWT", function (assert) {
	store.getState().JWT = JWT;
	assert.ok(store.getState().JWT !== null, "Exists before action");
	store.dispatch(clearJWT());
	assert.ok(store.getState().JWT === null, "Not exists");
	assert.end();
});

test("Security - restoreJwt", function (assert) {
	store.dispatch(restoreJWT());
	assert.equal(store.getState().JWT, null, "Local storage has nothing");
	storageMock.setItem("JWT", JSON.stringify(JWT));
	store.dispatch(restoreJWT());
	assert.deepEqual(store.getState().JWT, JWT, "JWT in local storage");
	assert.end();
});

test("Security - setValidatingJWT", function (assert) {
	assert.notOk(store.getState().isValidatingJWT, "Not validating JWT");
	store.dispatch(setValidatingJWT(true));
	assert.ok(store.getState().isValidatingJWT, "Validating JWT");
	store.dispatch(setValidatingJWT(false));
	assert.notOk(store.getState().isValidatingJWT, "Not validating JWT");
	assert.end();
});

test("Security - validateJWT", function (assert) {
	store.dispatch(validateJWT(JWT));
	assert.ok(store.getState().validatedJWT, "JWT's been validated");
	assert.end();
});

test("Security - store JWT", function (assert) {
	storageMock.removeItem("JWT");
	store.dispatch(storeJWT(JWT));

	assert.equal(store.getState().JWT, JWT, "JWT in store");
	assert.ok(store.getState().validatedJWT, "JWT validated");
	assert.equal(storageMock.getItem("JWT"), JSON.stringify(JWT), "JWT in local storage");
	assert.end();
});

test("Security - requestJWTValidation with correct URI", function (assert) {
	assert.plan(1);
	const fetcher = (URL) => assert.equal(URL, "/api/auth/validate_token", "The URI must have a / at the beginning");
	Security.requestJWTValidation(JWT, fetcher, () => null).then(() => null).catch(() => null);
});

test("Security - requestJWTValidation", function (assert) {
	assert.plan(7);

	const fetcherOK = FetcherMock({status: 200});
	const dispatch = DispatchMock(assert, ["clear JWT", "validate JWT", "set fetching function", "remove fetching function"]);

	Security.requestJWTValidation(JWT, fetcherOK, dispatch).then(() => {
		assert.pass("Must work as a promise");
	}).catch(() => null);
	Security.requestJWTValidation(JWT, fetcherUnauthorized, dispatch).then(() => null).catch(() => null);
});

test("Security - restoreValidatedLocalJWT not in local storage", function (assert) {
  storageMock.removeItem("JWT");
  const dispatch = DispatchMock(assert, ["validate JWT"]);
  restoreValidatedLocalJWT(null, dispatch, storageMock).then(function (JWT) {
		assert.ok(JWT === null, "Resolves null");
		assert.end();
	});
});

test("Security - restoreValidatedLocalJWT valid in local storage", function (assert) {
	storageMock.setItem("JWT", JSON.stringify(JWT));
  
  const fetcherOK = FetcherMock({status: 200});
  const dispatch = DispatchMock(assert, ["set validating JWT", "validate JWT", "restore JWT", "fetching"]);

  restoreValidatedLocalJWT(fetcherOK, dispatch, storageMock).then(function (validatedJWT) {
    assert.deepEqual(validatedJWT, JWT, "Resolves local JWT");
		assert.end();
  });
});

test("Security - restoreValidatedLocalJWT invalid in local storage", function (assert) {
	storageMock.setItem("JWT", JSON.stringify(JWT));
  
  const dispatch = DispatchMock(assert, ["set validating JWT", "validate JWT", "clear JWT", "fetching"]);

  restoreValidatedLocalJWT(fetcherUnauthorized, dispatch, storageMock).then(function (validatedJWT) {
    assert.equal(validatedJWT, null, "JWT invalid");
		assert.end();
  });
});

test("Security - requestNewJWT with correct URI", function (assert) {
	assert.plan(1);
	const fetcher = (URL) => assert.equal(URL, "/api/auth/token", "The URI must have a / at the beginning");
	Security.requestNewJWT(USERNAME, PASSWORD, fetcher, () => null).catch(() => null);
});

test("Security - requestNewJWT", function (assert) {
	assert.plan(4);
	const dispatch = DispatchMock(assert, ["store JWT", "fetching function"]);
	Security.requestNewJWT(USERNAME, PASSWORD, fetcherOKWithJWT, dispatch).then(jwt => {
		assert.ok(jwt !== null, "Returns same JWT");
	});
});

test("Security - requestNewJWT 401", function (assert){
	assert.plan(3);
	const dispatch = DispatchMock(assert, ["fetching function"]);
	Security.requestNewJWT(USERNAME, PASSWORD, fetcherUnauthorized, dispatch).catch(err => {
		assert.equal(err.code, 401, "HTTP 401: Unauthorized");
	});
});

test("Security - requestNewJWT 403", function (assert) {
	assert.plan(3);
	const dispatch = DispatchMock(assert, ["fetching function"]);
	const fetcherForbidden = FetcherMock({ status: 403 });
	Security.requestNewJWT(USERNAME, PASSWORD, fetcherForbidden, dispatch).catch(err => {
		assert.equal(err.code, 403, "HTTP 403: Forbidden");
	});
});

test("Security - requestJWTRevoke with correct URI", function (assert) {
	assert.plan(1);
	const fetcher = function (URL) { return assert.equal(URL, "/api/auth/token", "The URI must have a / at the beginning"); };
	Security.requestJWTRevoke(JWT, fetcher, function () { return null; }).catch(() => null);
});

test("Security - requestJWTRevoke", function (assert) {
	assert.plan(3);

	Security.requestNewJWT(USERNAME, PASSWORD, fetcherOKWithJWT, (action) => null).then(jwt => {
		const dispatch = DispatchMock(assert, ["clear JWT", "set fetching function", "remove fetching function"]);
		Security.requestJWTRevoke(jwt, fetcherOKWithJWT, dispatch);
	});
});
