const Queue = {
	items: [],
	push(item) {
		this.items.push(item);
	},
	pop() {
		return this.items.pop();
	},
	hasItems() {
		return this.items.length;
	},
	print() {
		return this.items.map(() => 'msg');
	}
};

module.exports = Queue;
