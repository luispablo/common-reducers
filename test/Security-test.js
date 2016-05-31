const test = require("tape");
const LocalStorageMock = require("@luispablo/test-helpers").LocalStorageMock;
const DispatchMock = require("@luispablo/test-helpers").DispatchMock;
const FetcherMock = require("@luispablo/test-helpers").FetcherMock;
const createStore = require("redux").createStore;
const Security = require("../lib/Security");

const clearJWT = Security.clearJWT;
const restoreJWT = Security.restoreJWT;
const validateJWT = Security.validateJWT;
const storeJWT = Security.storeJWT;

const USERNAME = "username";
const PASSWORD = "password";

const storageMock = LocalStorageMock();
const store = createStore(Security(storageMock));
const JWT = { user: USERNAME };

const fetcherUnauthorized = FetcherMock({status: 401});
const fetcherOKWithJWT = FetcherMock({ status: 200, json: () => JWT });

test("Security - initial state", assert => {
	const expectedInitialState = { JWT: null, validatedJWT: false };
	assert.deepEqual(store.getState(), expectedInitialState, "Expected initial state");
	assert.end();
});

test("Security - clearJWT", assert => {
	store.getState().JWT = JWT;
	assert.ok(store.getState().JWT !== null, "Exists before action");
	store.dispatch(clearJWT());
	assert.ok(store.getState().JWT === null, "Not exists");
	assert.end();
});

test("Security - restoreJwt", assert => {
	store.dispatch(restoreJWT());
	assert.equal(store.getState().JWT, null, "Local storage has nothing");
	storageMock.setItem("JWT", JSON.stringify(JWT));
	store.dispatch(restoreJWT());
	assert.deepEqual(store.getState().JWT, JWT, "JWT in local storage");
	assert.end();
});

test("Security - validateJWT", assert => {
	store.dispatch(validateJWT(JWT));
	assert.ok(store.getState().validatedJWT, "JWT's been validated");
	assert.end();
});

test("Security - store JWT", assert => {
	storageMock.removeItem("JWT");
	store.dispatch(storeJWT(JWT));

	assert.equal(store.getState().JWT, JWT, "JWT in store");
	assert.ok(store.getState().validatedJWT, "JWT validated");
	assert.equal(storageMock.getItem("JWT"), JSON.stringify(JWT), "JWT in local storage");
	assert.end();
});

test("Security - requestJWTValidation", assert => {
	assert.plan(7);

	const fetcherOK = FetcherMock({status: 200});
	const dispatch = DispatchMock(assert, ["clear JWT", "validate JWT", "set fetching function", "remove fetching function"]);

	Security.requestJWTValidation(JWT, fetcherOK, dispatch).then(() => {
		assert.pass("Must work as a promise");
	});
	Security.requestJWTValidation(JWT, fetcherUnauthorized, dispatch);
});

test("Security - requestNewJWT", assert => {
	assert.plan(7);

	const dispatch = DispatchMock(assert, ["store JWT", "add error message", "set fetching function", "remove fetching function"]);

	Security.requestNewJWT(USERNAME, PASSWORD, fetcherOKWithJWT, dispatch).then(jwt => {
		assert.ok(jwt !== null, "Devuelve el nuevo JWT");
	});
	Security.requestNewJWT(USERNAME, PASSWORD, fetcherUnauthorized, dispatch);
});

test("Security - requestJWTRevoke", assert => {
	assert.plan(3);

	Security.requestNewJWT(USERNAME, PASSWORD, fetcherOKWithJWT, (action) => null).then(jwt => {
		const dispatch = DispatchMock(assert, ["clear JWT", "set fetching function", "remove fetching function"]);
		Security.requestJWTRevoke(jwt, fetcherOKWithJWT, dispatch);
	});
});