const test = require("tape");
const createStore = require("redux").createStore;
const application = require("../src/application");

const setParam = application.setParam;
const setFetchingFunction = application.setFetchingFunction;
const removeFetchingFunction = application.removeFetchingFunction;
const isFetching = application.isFetching;

const store = createStore(application);

test("application - initial state", assert => {
	const expectedInitialState = { params: {}, fetchingFunctions: {} };
	assert.deepEqual(store.getState(), expectedInitialState, "The expected initial state");
	assert.end();
});

test("application - setParam", assert => {
	const version = "1.0.0";
	assert.ok(store.getState().params.version === undefined, "Param still not set");
	store.dispatch(setParam({ version: version }));
	assert.equal(store.getState().params.version, version, "The param 'version' is set");
	assert.end();
});

test("application - setFetchingValue", assert => {
	assert.ok(store.getState().fetchingFunctions.dummyFunc === undefined, "Fetching function not defined yet");
	store.dispatch(setFetchingFunction({dummyFunc: 0.5}));
	assert.equal(store.getState().fetchingFunctions.dummyFunc, 0.5, "Firt set to 0.5");
	store.dispatch(setFetchingFunction({dummyFunc: 1}));
	assert.equal(store.getState().fetchingFunctions.dummyFunc, 1, "Then set it to 1");
	assert.end();
});

test("application - removeFetchingFunction", assert => {
	store.dispatch(setFetchingFunction({dummyFunc: 1}));
	assert.equal(store.getState().fetchingFunctions.dummyFunc, 1, "The fetching function is set");
	store.dispatch(removeFetchingFunction("dummyFunc"));
	assert.ok(store.getState().fetchingFunctions.dummyFunc === undefined, "Now it's undefined");
	assert.end();
});
