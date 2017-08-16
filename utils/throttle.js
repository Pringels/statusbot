const Queue = require('./queue.js');

const Throttle = {
    init({ delay = 1000, retries = 10 }) {
        this.queue = Object.create(Queue);
        this.asleep = true;
        this.initialRetries = retries;
        this.retries = retries;
        this.delay = delay;
        this.callInterval;
    },
    call(fn) {
        this.queue.push(fn);
        if (this.asleep) {
            this.callInterval = setInterval(this.processItem.bind(this), this.delay);
            this.asleep = false;
            this.retries = this.initialRetries;
        }
    },
    processItem() {
        if (this.queue.hasItems()) {
            this.queue.pop()();
        } else {
            if (this.retries > 0) {
                this.retries -= 1;
            } else {
                this.asleep = true;
                clearInterval(this.callInterval);
            }
        }
    }
};

module.exports = Throttle;
