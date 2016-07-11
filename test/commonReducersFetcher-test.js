const test = require("tape");
const fetcher = require("../src/commonReducersFetcher");
const FetcherMock = require("@luispablo/test-helpers").FetcherMock;
const DispatchMock = require("@luispablo/test-helpers").DispatchMock;

const functionName = "dummyFunc";
const testURL = "http://dummy.com/api";
const testOptions = { method: "PUT" };

test("commonReducersFetcher - fetch URL and options", assert => {
	assert.plan(2);
	const mockDispatch = () => null;
	const mockFetch = function (url, options) {
		assert.equal(url, testURL, "Uses the given URL");
		assert.deepEqual(options, testOptions, "Uses the given options");
	};
	fetcher(functionName, testURL, testOptions, mockFetch, mockDispatch);
});

test("commonReducersFetcher - actions dispatched with HTTP 200", assert => {
	assert.plan(2);
	const mockFetch = FetcherMock({status: 200, json: () => "test"});
	const mockDispatch = DispatchMock(assert, ["set fetching function", "remove fetching function"]);
	fetcher(functionName, testURL, testOptions, mockFetch, mockDispatch);
});

test("commonReducersFetcher - actions dispatched with HTTP 500", assert => {
	assert.plan(4);
	const mockFetch = () => new Promise(resolve => resolve({status: 500}));
	const mockDispatch = DispatchMock(assert, ["set fetching function", "remove fetching function", "add error message"]);
	fetcher(functionName, testURL, testOptions, mockFetch, mockDispatch);
});

test("commonReducersFetcher - set fetching function", assert => {
	assert.plan(2);
	const mockFetch = FetcherMock({status: 200, json: () => "test"});
	const mockDispatch = (action) => {
		if (action.type.indexOf("set") >= 0) assert.deepEqual(action.payload, {dummyFunc: 1}, "Sets fetching function");
		if (action.type.indexOf("remove") >= 0) assert.equal(action.payload, "dummyFunc", "Removes fetching function");
	};
	fetcher(functionName, testURL, testOptions, mockFetch, mockDispatch);
});

test("commonReducersFetcher - actions dispatched with crash", assert => {
	assert.plan(3);
	const mockFetch = () => new Promise((resolve, reject) => reject({message: "error message"}));
	const mockDispatch = DispatchMock(assert, ["set fetching function", "remove fetching function", "add error message"]);
	fetcher(functionName, testURL, testOptions, mockFetch, mockDispatch);
});
