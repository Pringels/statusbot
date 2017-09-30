const kue = require('kue');

const kueInterface = {
    handlers: {},
    init() {
        this.queue = kue.createQueue();
        this.addTask = this.addTask.bind(this);
    },
    registerTaskHandler(type, fn, delay = 0) {
        this.queue.process(type, ({ data }, done) => setTimeout(() => fn(data, done), delay));
    },
    addTask(type, data, priority = 'normal') {
        this.queue
            .create(type, data)
            .priority(priority)
            .save();
    }
};

module.exports = kueInterface;
