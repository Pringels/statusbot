const http = require('http');
const qs = require('querystring');
const port = 8080;
let firebase = null;

const requestHandler = (request, response) => {
	if (request.method == 'POST') {
		var body = '';

		request.on('data', function(data) {
			body += data;
			if (body.length > 1e6) request.connection.destroy();
		});

		request.on('end', function() {
			let post = qs.parse(body);
			let token = post.token || '';
			if (token !== process.env.SLACK_COMMAND_TOKEN) {
				response.end('Unauthorised');
			} else {
				commandRouter(post, response);
			}
		});
	} else {
		response.end('Welcome to status bot');
	}
};

function commandRouter({ user_id, user_name, text }, response) {
	switch (text.split(' ')[0]) {
		case 'register':
			firebase.createUser(user_id, user_name);
			response.end('Gotcha ' + user_name + '. See you at 8:30 sharp!');
			break;
		case 'time':
			let time = text.split(' ')[1];
			firebase.setUpdateTime(user_id, time);
			response.end('Done - I will contact you at ' + time + ' from now on.');
			break;
		case 'cancel':
			firebase.deleteUser(user_id);
			response.end(":'( Goodbye " + user_name + ". It's been real.");
			break;
		default:
			response.end(
				'Type "register" to register yourself with me.\nType "time" to let me know when I should slack you. EG "16:20"\nType "cancel" if you want me to stop spamming you.'
			);
			break;
	}
}

const server = http.createServer(requestHandler);

const serverInterface = {
	init(firebaseInterface) {
		firebase = firebaseInterface;
		server.listen(port, err => {
			if (err) {
				return console.log('something bad happened', err);
			}

			console.log(`server is listening on ${port}`);
		});
	}
};

module.exports = serverInterface;
