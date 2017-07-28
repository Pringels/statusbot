export const getUpdates = updates => {
	return {
		type: 'GET_UPDATES',
		updates: Object.keys(updates).map(key => updates[key])
	};
};
