const nameInitialState = {
	updates: [
		{
			blockers: 'test',
			date: '2017-7-27 11:33:43',
			today: 'test',
			user: 'U072FAYBY',
			yesterday: 'test'
		},
		{
			blockers: '- wireframes, RR backend server',
			date: '2017-7-28 07:27:38',
			today: '- kopano: react-router, skeleton components api work',
			user: 'U0KTZ496H',
			yesterday: '- family responsibility leave'
		},
		{
			date: '2017-7-28 18:48:30',
			user: 'U072FAYBY',
			yesterday: 'hello'
		},
		{
			blockers: 'Nope ',
			date: '2017-7-31 08:52:24',
			today: '8 hours - DStv ',
			user: 'U072FAYBY',
			yesterday: '8 hours - leave '
		},
		{
			blockers: '- *RR:* API’s\n- *design:* wireframes',
			date: '2017-7-31 08:53:19',
			today: '- *Kopano:* react-router, basic api, skeleton dash',
			user: 'U0KTZ496H',
			yesterday: '- Kopano 7h\n- statusbot testing'
		},
		{
			date: '2017-7-31 09:02:19',
			user: 'U2WBLCD45',
			yesterday: 'Nothing'
		},
		{
			date: '2017-7-31 10:06:29',
			user: 'U1F482QVB',
			yesterday: 'Power of Play - 8 hours'
		}
	],
	users: {
		U02BQJFFA: {
			name: 'morgs',
			updateTime: '8:30'
		},
		U02EVBWAY: {
			name: 'beard',
			updateTime: '8:30'
		},
		U072FAYBY: {
			name: 'peter',
			updateTime: '8:45'
		},
		U0KTZ496H: {
			name: 'jw',
			updateTime: '8:30'
		},
		U0MBL3U3C: {
			name: 'chrislombaard',
			updateTime: '8:30'
		},
		U1F482QVB: {
			name: 'desousa',
			updateTime: '10:00'
		},
		U2WBLCD45: {
			name: 'rijk',
			updateTime: '9:00'
		}
	},
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
