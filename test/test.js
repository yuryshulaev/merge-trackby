'use strict'

var assert = chai.assert;

describe('merge-trackby', function () {
	it('should merge simple objects', function () {
		var a = {a: 1, b: 2};
		var b = {a: 3, c: 4};
		merge(a, b);
		assert.deepEqual(a, {a: 3, b: 2, c: 4});
	});

	it('should merge simple arrays, track by index', function () {
		var a = [1, 2, 3];
		var b = [4, 5];
		merge(a, b);
		assert.deepEqual(a, [4, 5]);
	});

	it('should merge simple arrays, track by index using callback', function () {
		var a = [1, 2, 3];
		var b = [4, 5];

		merge(a, b, {trackBy: function () {
			return function (value, i) {
				return i;
			};
		}});

		assert.deepEqual(a, [4, 5]);
	});

	it('should merge arrays of objects, track by index', function () {
		var a = [{a: 1}, {b: 2}];
		var b = [{a: 3}, {c: 4}, {d: 5}];
		var aCopy = a.slice();
		var bCopy = b.slice();
		merge(a, b);
		assert.deepEqual(a, [{a: 3}, {b: 2, c: 4}, {d: 5}]);
		assert.equal(a[0], aCopy[0]);
		assert.equal(a[1], aCopy[1]);
		assert.equal(a[2], bCopy[2]);
		assert.deepEqual(b, bCopy);
	});

	it('should keep object classes', function () {
		class A {
			constructor(data) { Object.assign(this, data); }
		}

		var a = [new A({a: 1})];
		var b = [{a: 3}];
		var aCopy = a.slice();
		merge(a, b);
		assert.isTrue(a[0] instanceof A);
		assert.deepEqual(a, [{a: 3}]);
		assert.equal(a[0], aCopy[0]);
	});

	it('should trigger and retain setter', function () {
		var a = [{}];
		var setterCalled = false;

		Object.defineProperty(a[0], 'a', {set: function () {
			setterCalled = true;
		}});

		var b = [{a: 3}];
		merge(a, b);
		assert.isTrue(setterCalled);
		setterCalled = false;
		a[0].a = 5;
		assert.isTrue(setterCalled);
	});

	it('should merge arrays of objects, track by index using callback', function () {
		var a = [{a: 1}, {b: 2}];
		var b = [{a: 3}, {c: 4}, {d: 5}];
		var aCopy = a.slice();
		var bCopy = b.slice();

		merge(a, b, {trackBy: function () {
			return function (value, i) {
				return i;
			};
		}});

		assert.deepEqual(a, [{a: 3}, {b: 2, c: 4}, {d: 5}]);
		assert.equal(a[0], aCopy[0]);
		assert.equal(a[1], aCopy[1]);
		assert.equal(a[2], bCopy[2]);
		assert.deepEqual(b, bCopy);
	});

	it('should merge arrays of objects, track by property', function () {
		var a = [{id: 0, a: 1}, {id: 1, b: 2}];
		var b = [{id: 1, c: 4}, {id: 2, d: 5}, {id: 0, a: 3}];
		var aCopy = a.slice();
		var bCopy = b.slice();

		merge(a, b, {trackBy: function () {
			return function (value) {
				return value.id;
			};
		}});

		assert.deepEqual(a, [{id: 1, b: 2, c: 4}, {id: 2, d: 5}, {id: 0, a: 3}]);
		assert.equal(a[0], aCopy[1]);
		assert.equal(a[1], bCopy[1]);
		assert.equal(a[2], aCopy[0]);
		assert.deepEqual(b, bCopy);
	});

	it('should merge trees, track by property', function () {
		var a = [{id: 0, a: 1, children: [{id: 1, b: 2}]}];
		var b = [{id: 2, d: 5}, {id: 0, a: 3, children: [{id: 2, a: 6}, {id: 1, c: 4}]}];
		var aCopy = a.slice();
		var bCopy = b.slice();

		merge(a, b, {trackBy: function () {
			return function (value) {
				return value.id;
			};
		}});

		assert.deepEqual(a, [{id: 2, d: 5}, {id: 0, a: 3, children: [{id: 2, a: 6}, {id: 1, b: 2, c: 4}]}]);
		assert.equal(a[0], bCopy[0]);
		assert.equal(a[1], aCopy[0]);
		assert.equal(a[1].children, aCopy[0].children);
		assert.equal(a[1].children[0], aCopy[0].children[0]);
		assert.deepEqual(b, bCopy);
	});

	it('should merge arrays of objects, track by property, track inner by index, differentiate by depth', function () {
		var a = [{id: 0, a: 1, ar: [{a: 1}, {a: 2}]}, {id: 1, b: 2, ar: [{b: 3}]}];
		var b = [{id: 1, ar: [{a: 4}, {b: 5}]}, {id: 2, ar: [{a: 6}]}, {id: 0, a: 3}];
		var aCopy = a.slice();
		var bCopy = b.slice();
		merge(a, b, {trackBy: trackBy('id')});

		assert.deepEqual(a, [
			{id: 1, b: 2, ar: [{a: 4, b: 3}, {b: 5}]},
			{id: 2, ar: [{a: 6}]},
			{id: 0, a: 3, ar: [{a: 1}, {a: 2}]},
		]);

		assert.equal(a[0], aCopy[1]);
		assert.equal(a[1], bCopy[1]);
		assert.equal(a[2], aCopy[0]);
		assert.equal(a[0].ar, aCopy[1].ar);
		assert.equal(a[0].ar[0], aCopy[1].ar[0]);
		assert.equal(a[0].ar[1], aCopy[1].ar[1]);
		assert.equal(a[1].ar, bCopy[1].ar);
		assert.equal(a[1].ar[0], bCopy[1].ar[0]);
		assert.equal(a[2].ar, aCopy[0].ar);
		assert.deepEqual(b, bCopy);
	});

	it('should merge arrays of objects, track by property, track inner by index, differentiate by key', function () {
		var a = [{id: 0, a: 1, ar: [{a: 1}, {a: 2}]}, {id: 1, b: 2, ar: [{b: 3}]}];
		var b = [{id: 1, ar: [{a: 4}, {b: 5}]}, {id: 2, ar: [{a: 6}]}, {id: 0, a: 3}];
		var aCopy = a.slice();
		var bCopy = b.slice();
		var trackBy = new Map([[undefined, function (value) { return value.id }], ['ar', null]]);
		merge(a, b, {trackBy: function (depth, key, a, b) { return trackBy.get(key); }});

		assert.deepEqual(a, [
			{id: 1, b: 2, ar: [{a: 4, b: 3}, {b: 5}]},
			{id: 2, ar: [{a: 6}]},
			{id: 0, a: 3, ar: [{a: 1}, {a: 2}]},
		]);

		assert.equal(a[0], aCopy[1]);
		assert.equal(a[1], bCopy[1]);
		assert.equal(a[2], aCopy[0]);
		assert.equal(a[0].ar, aCopy[1].ar);
		assert.equal(a[0].ar[0], aCopy[1].ar[0]);
		assert.equal(a[0].ar[1], aCopy[1].ar[1]);
		assert.equal(a[1].ar, bCopy[1].ar);
		assert.equal(a[1].ar[0], bCopy[1].ar[0]);
		assert.equal(a[2].ar, aCopy[0].ar);
		assert.deepEqual(b, bCopy);
	});

	it('should merge arrays of objects, track by property, track inner by index, differentiate by value', function () {
		var a = [{id: 0, a: 1, ar: [{a: 1}, {a: 2}]}, {id: 1, b: 2, ar: [{b: 3}]}];
		var b = [{id: 1, ar: [{a: 4}, {b: 5}]}, {id: 2, ar: [{a: 6}]}, {id: 0, a: 3}];
		var aCopy = a.slice();
		var bCopy = b.slice();
		var trackBy = new Map([[a, function (value) { return value.id; }]]);
		merge(a, b, {trackBy: function (depth, key, a, b) { return trackBy.get(a); }});

		assert.deepEqual(a, [
			{id: 1, b: 2, ar: [{a: 4, b: 3}, {b: 5}]},
			{id: 2, ar: [{a: 6}]},
			{id: 0, a: 3, ar: [{a: 1}, {a: 2}]},
		]);

		assert.equal(a[0], aCopy[1]);
		assert.equal(a[1], bCopy[1]);
		assert.equal(a[2], aCopy[0]);
		assert.equal(a[0].ar, aCopy[1].ar);
		assert.equal(a[0].ar[0], aCopy[1].ar[0]);
		assert.equal(a[0].ar[1], aCopy[1].ar[1]);
		assert.equal(a[1].ar, bCopy[1].ar);
		assert.equal(a[1].ar[0], bCopy[1].ar[0]);
		assert.equal(a[2].ar, aCopy[0].ar);
		assert.deepEqual(b, bCopy);
	});
});
