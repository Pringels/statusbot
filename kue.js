var kue = require('kue'),
    queue = kue.createQueue();

queue.process('message', function(job, done) {
    setTimeout(() => {
        console.log('DOPING JOB', job.data);
        done();
    }, 1200);
});
