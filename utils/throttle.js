const Queue = require('./queue.js');

const Throttle = {
	init({ delay = 1000, retries = 10 }) {
		this.queue = Object.create(Queue);
		this.asleep = true;
		this.initialRetries = retries;
		this.retries = retries;
		this.delay = delay;
		this.callInterva;
	},
	call(fn) {
		console.log('Calling...');
		this.queue.push(fn);
		if (this.asleep) {
			console.log('WAKING Up!');
			this.callInterval = setInterval(this.processItem.bind(this), this.delay);
			this.asleep = false;
			this.retries = this.initialRetries;
		}
	},
	processItem() {
		console.log('procssing queue');
		if (this.queue.hasItems()) {
			console.log('Item found! calling fn');
			this.queue.pop()();
		} else {
			if (this.retries > 0) {
				console.log('decrement retry', this.retries);
				this.retries -= 1;
			} else {
				console.log('Going back to sleep');
				this.asleep = true;
				clearInterval(this.callInterval);
			}
		}
	}
};

module.exports = Throttle;
