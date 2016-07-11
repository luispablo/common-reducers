const test = require("tape");
const index = require("../src/index");

const application = require("../src/application");
const messages = require("../src/messages");
const Security = require("../src/Security");
const commonReducersFetcher = require("../src/commonReducersFetcher");
const isFetching = require("../src/isFetching");

test("index - imports", assert => {
	assert.equal(index.application, application, "require application");
	assert.equal(index.messages, messages, "require messages");
	assert.equal(index.Security, Security, "require Security");
	assert.equal(index.commonReducersFetcher, commonReducersFetcher, "require fetcher");
	assert.equal(index.isFetching, isFetching, "require isFetching helper");
	assert.end();
});

test("index - require application and assign", assert => {
	const setParam = application.setParam;
	assert.equal(typeof(setParam), "function", "It's a function");
	assert.end();
});
