const test = require("tape");
const index = require("../index");

const application = require("../lib/application");
const messages = require("../lib/messages");
const Security = require("../lib/Security");
const commonReducersFetcher = require("../lib/commonReducersFetcher");

test("index - imports", assert => {
	assert.equal(index.application, application, "require application");
	assert.equal(index.messages, messages, "require messages");
	assert.equal(index.Security, Security, "require Security");
	assert.equal(index.commonReducersFetcher, commonReducersFetcher, "require fetcher");
	assert.end();
});

test("index - require application and assign", assert => {
	const { setParam } = application;
	assert.equal(typeof(setParam), "function", "It's a function");
	assert.end();
});
