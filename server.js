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
            let channel = text.split(' ')[1];
            if (!channel) {
                response.end(
                    'You forgot to send me the channel name you would like to register for. (EG `general`)'
                );
                break;
            }
            if (channel.includes('<')) {
                channel = channel.split('|')[1].replace('>', '');
            }
            firebase.createUser(user_id, user_name, channel);
            response.end('Gotcha ' + user_name + '. See you at 8:30 sharp!');
            break;
        case 'time':
            let time = text.split(' ')[1];
            if (!time) {
                response.end(
                    'You forgot to send me the time. Try "time 8:30".'
                );
                break;
            }
            firebase.setUpdateTime(user_id, time);
            response.end(
                'Done - I will contact you at ' + time + ' from now on.'
            );
            break;
        case 'cancel':
            firebase.deleteUser(user_id);
            response.end(":'( Goodbye " + user_name + ". It's been real.");
            break;
        default:
            response.end(
                'Type "register" if you would like me to do your status updates for you. EG "register general"\nType "time" to let me know when I should slack you. EG "time 16:20"\nType "cancel" if you want me to stop spamming you.'
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
