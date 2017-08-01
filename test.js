const Queue = require('./utils/queue.js');

const queue = Object.create(Queue);

const processMessage = () => {
	if (queue.hasItems()) {
		queue.pop()();
	}
};

const messageProcessor = setInterval(processMessage, 1100);

let timeOut = Math.random() * 2000;

let interval = setInterval(messageEvent, timeOut);

function messageEvent() {
	queue.push(() => {
		console.log('SENDING MESSAGE <- ', queue.print());
	});
	console.log('Adding to queue -> ', queue.print());
	timeOut = Math.random() * 2000;
	clearInterval(interval);
	interval = setInterval(messageEvent, timeOut);
}
