export const getUpdates = updates => {
	return {
		type: 'GET_UPDATES',
		updates: Object.keys(updates).map(key => updates[key])
	};
};

export const getUsers = users => {
	return {
		type: 'GET_USERS',
		users
	};
};

export const setActiveUser = user => {
	return {
		type: 'SET_ACTIVE_USER',
		user
	};
};

export const removeActiveUser = user => {
	return {
		type: 'REMOVE_ACTIVE_USER',
		user
	};
};

export const filterResults = value => {
	return {
		type: 'SET_FILTER',
		value
	};
};

export const setAuth = user => {
	return {
		type: 'SET_AUTH',
		user
	};
};
