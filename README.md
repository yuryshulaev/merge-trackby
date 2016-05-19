# merge-trackby

A small JavaScript library to recursively merge object and array hierarchies without replacing original objects, with support for reordering of objects in arrays tracking their identity according to a callback function. It is useful when you want to import new JSON data into already existing objects, keeping their classes and references to them. It is also useful when you have setters and you don’t want to redefine them and want them to be triggered for the changes.

## Installation

```javascript
npm i merge-trackby
```

or

```javascript
<script src="merge-trackby.js"></script>
```

## Usage

Merge `b` into `a` recursively tracking arrays by index:

```javascript
merge(a, b);
```

And this will track objects on the first level by property, (in this case `id`), and on more deep levels by index:

```javascript
merge(a, b, {trackBy: trackBy('id')});
```

Maximum depth, on which tracking by property should be used, can be specified using the second parameter, `null` means “any depth”:

```javascript
merge(a, b, {trackBy: trackBy('id', 2)});
merge(a, b, {trackBy: trackBy('id', null)});
```

Custom tracking function can also be defined depending on `depth`, `key`, `a`, and `b` values:

```javascript
merge(a, b, {trackBy: function (depth, key, a, b) {
	return function (obj) {
		return obj.id;
	};
}});
```

## Caveats

 * Any excessive target array elements are removed
 * All excessive target object properties are retained
 * Because it is mainly focused on merging JSON data, it doesn’t support circular references

## Browser support

Requires [`Map`](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Map#Browser_compatibility) if you specify `trackBy` function, but it can be [polyfilled](https://github.com/WebReflection/es6-collections).

## License

MIT.
