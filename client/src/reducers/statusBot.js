const nameInitialState = {
	updates: [],
	users: {},
	activeUsers: [],
	fiter: ''
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
		case 'SET_ACTIVE_USER':
			return Object.assign({}, state, {
				activeUsers: [...state.activeUsers, action.user]
			});
		case 'REMOVE_ACTIVE_USER':
			return Object.assign({}, state, {
				activeUsers: [
					...state.activeUsers.slice(0, state.activeUsers.indexOf(action.user)),
					...state.activeUsers.slice(
						state.activeUsers.indexOf(action.user) + 1,
						state.activeUsers.length
					)
				]
			});
		case 'SET_FILTER':
			return Object.assign({}, state, {
				filter: action.value
			});
		default:
			return state;
	}
};

export default statusBot;
