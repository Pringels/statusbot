var fireBaseInterface = require('../interfaces/firebase.js');

const user = {
    id: null,
    updateTime: null,
    name: null,
    channel: null,
    get hours() {
        return this.updateTime ? this.updateTime.split(':')[0] : '00';
    },
    get minutes() {
        return this.updateTime ? this.updateTime.split(':')[1] : '00';
    }
};

const userFactory = {
    get(id) {
        return new Promise(resolve =>
            fireBaseInterface
                .getUser(id)
                .once('value')
                .catch(err => console.log('PROMISE ERROR: fireBaseInterface.getUser(id) - ', err))
                .then(snapshot =>
                    resolve(Object.assign({}, user, { id: snapshot.key }, snapshot.val()))
                )
        );
    }
};

module.exports = userFactory;
