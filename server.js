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
                    'You forgot to send me the channel name you would like to add. (EG `general`)'
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
        case 'add':
            let newChannel = text.split(' ')[1];
            if (!newChannel) {
                response.end(
                    'You forgot to send me the channel name you would like to remove. (EG `general`)'
                );
                break;
            }
            if (newChannel.includes('<')) {
                newChannel = newChannel.split('|')[1].replace('>', '');
            }
            firebase
                .addChannel(user_id, newChannel)
                .catch(err => {
                    response.end(err);
                })
                .then(() => {
                    response.end(
                        'Awesome - I will now share your updates in #' +
                            newChannel +
                            " too. DON'T FORGET TO INVITE ME TO THE CHANNEL! (Yes I'm shouting. Get over it)"
                    );
                });
            break;
        case 'remove':
            let deleteChannel = text.split(' ')[1];
            if (!deleteChannel) {
                response.end(
                    'You forgot to send me the channel name you would like to register for. (EG `general`)'
                );
                break;
            }
            if (deleteChannel.includes('<')) {
                deleteChannel = deleteChannel.split('|')[1].replace('>', '');
            }

            firebase
                .removeChannel(user_id, deleteChannel)
                .catch(err => {
                    response.end(err);
                })
                .then(() => {
                    response.end("Don't let the door hit you on your way out.");
                });
            break;
        case 'list':
            firebase.getUserChannels(user_id).then(channels => {
                response.end(
                    'These are the channels I am posting your "work" updates to:\n - #' +
                        channels.join('\n - #')
                );
            });
            break;
        default:
            response.end(
                `Type "register" if you would like me to do your status updates for you. EG "register general"
                \nType "time" to let me know when I should slack you. EG "time 16:20"
                \nType "cancel" if you want me to stop spamming you.
                \nType "add" if you would like me to post your updates to more channels. EG "add general"
                \nType "remove" if you would like to remove active channels. EG "remove general"
                \nType "list" if you would like to see which channels I'm posting all your updates to.
                `
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
