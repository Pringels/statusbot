const http = require('http');
const qs = require('querystring');
const port = 8080;

const requestHandler = (request, response) => {
        if (request.method == 'POST') {
        var body = '';

        request.on('data', function (data) {
            body += data;

            // Too much POST data, kill the connection!
            // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
            if (body.length > 1e6)
                request.connection.destroy();
        });

        request.on('end', function () {
            let post = qs.parse(body);
            console.log('POST', post);
	    let user = post.user_name;
	    let token = post.token || '';
		if (token !== process.env.SLACK_COMMAND_TOKEN){
		console.log('BAD AUTH!');
		response.end('Unauthorised');		
}	    else {
	response.end('Gotcha ' + user + '!');
}
console.log(token);			
        });
    } else {
	response.end('Hello Node.js Server!');
	}
};

const server = http.createServer(requestHandler);

server.listen(port, err => {
	if (err) {
		return console.log('something bad happened', err);
	}

	console.log(`server is listening on ${port}`);
});
