const nameInitialState = {
	updates: []
};
const statusBot = (state = nameInitialState, action) => {
	switch (action.type) {
		case 'GET_UPDATES':
			return Object.assign({}, state, {
				updates: action.updates
			});
		default:
			return state;
	}
};

export default statusBot;
