const test = require("tape");
const createStore = require("redux").createStore;
const messages = require("../lib/messages");

const messageType = messages.messageType;
const store = createStore(messages);

const MESSAGE_TEXT = "test message";
const INFO_MESSAGE = { type: messageType.INFO, text: MESSAGE_TEXT };
const ERROR_MESSAGE = { type: messageType.ERROR, text: MESSAGE_TEXT };
const WARN_MESSAGE = { type: messageType.WARN, text: MESSAGE_TEXT };

test("messages - initial state", assert => {
	assert.deepEqual(store.getState(), { items: [] }, "Expected initial state");
	assert.end();
});

test("messages - addErrorMessage", assert => {
	store.dispatch(messages.clearMessages());
	store.dispatch(messages.addErrorMessage(MESSAGE_TEXT));
	assert.deepEqual(store.getState().items[0], ERROR_MESSAGE, "Stored as error message");
	assert.end();
});

test("messages - addInfoMessage", assert => {
	store.dispatch(messages.clearMessages());
	store.dispatch(messages.addInfoMessage(MESSAGE_TEXT));
	assert.deepEqual(store.getState().items[0], INFO_MESSAGE, "Stored as info message");
	assert.end();
});

test("messages - addWarnMessage", assert => {
	store.dispatch(messages.clearMessages());
	store.dispatch(messages.addWarnMessage(MESSAGE_TEXT));
	assert.deepEqual(store.getState().items[0], WARN_MESSAGE, "Stored as warn message");
	assert.end();
});

test("messages - addMessage", assert => {
	store.dispatch(messages.clearMessages());
	const previousLength = store.getState().items.length;
	store.dispatch(messages.addMessage(INFO_MESSAGE));
	assert.equal(store.getState().items.length, previousLength + 1, "There a message stored");
	assert.deepEqual(store.getState().items[0], INFO_MESSAGE, "The info message is in the store");
	assert.end();
});

test("messages - clearMessages", assert => {
	store.getState().items.push(INFO_MESSAGE);
	assert.ok(store.getState().items.length > 0, "There are messages");
	store.dispatch(messages.clearMessages());
	assert.equal(store.getState().items.length, 0, "No messages");
	assert.end();
});
