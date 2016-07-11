const ReduxAct = require("redux-act");

const messageType = { INFO: "INFO", WARN: "WARN", ERROR: "ERROR" };

const initialState = { items: [] };

const addMessage = ReduxAct.createAction("add message");
const clearMessages = ReduxAct.createAction("clear messages");
const addErrorMessage = ReduxAct.createAction("add error message");
const addInfoMessage = ReduxAct.createAction("add info message");
const addWarnMessage = ReduxAct.createAction("add warn message");

const messages = ReduxAct.createReducer({
	[addMessage]: (state, payload) => Object.assign({}, state, { items: state.items.concat(payload) }),
	[clearMessages]: (state) => Object.assign({}, state, { items: [] }),
	[addErrorMessage]: (state, payload) => Object.assign({}, state, { items: state.items.concat({type: messageType.ERROR, text: payload}) }),
	[addInfoMessage]: (state, payload) => Object.assign({}, state, { items: state.items.concat({type: messageType.INFO, text: payload}) }),
	[addWarnMessage]: (state, payload) => Object.assign({}, state, { items: state.items.concat({type: messageType.WARN, text: payload}) })
}, initialState);

messages.messageType = messageType;
messages.addMessage = addMessage;
messages.clearMessages = clearMessages;
messages.addErrorMessage = addErrorMessage;
messages.addInfoMessage = addInfoMessage;
messages.addWarnMessage = addWarnMessage;

module.exports = messages;
