const nameInitialState = {
	updates: [],
	users: {}
};
const statusBot = (state = nameInitialState, action) => {
	switch (action.type) {
		case 'GET_UPDATES':
			return Object.assign({}, state, {
				updates: action.updates
			});
		case 'GET_USERS':
			return Object.assign({}, state, {
				users: action.users
			});
		default:
			return state;
	}
};

export default statusBot;
