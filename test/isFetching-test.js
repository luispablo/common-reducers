const test = require("tape");
const isFetching = require("../lib/isFetching");

const store = { fetchingFunctions: { testFunction: 1, undefinedFunc: undefined } };

test("isFetching - one is and other isn't", function (assert) {
	assert.ok(isFetching(store, "testFunction"), "This is fetching");
	assert.notOk(isFetching(store, "noFetch"), "This one is not fetching");
	assert.notOk(isFetching(store, "undefinedFunc", "Undefined is not fetching"));
	assert.end();
});
