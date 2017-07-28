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
