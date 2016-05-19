'use strict'

function merge(a, b, opts, depth, parentKey) {
	depth = depth || 0;
	var target;

	function getTarget() {
		return target || (target = opts && opts.wrapTarget ? opts.wrapTarget(a) : a);
	}

	function mergeValue(aValue, bValue, key) {
		if (typeof bValue === 'object' && bValue !== null && typeof aValue !== 'undefined') {
			merge(aValue, bValue, opts, depth + 1, key);
			return;
		}

		if (typeof aValue === 'undefined' || typeof bValue !== 'object' || bValue === null) {
			if (aValue !== bValue) {
				getTarget()[key] = bValue;
			}
		}
	}

	if (!(a instanceof Array)) {
		for (var key in b) {
			mergeValue(a[key], b[key], key);
		}
	} else {
		var currentTrackBy = opts && opts.trackBy ? opts.trackBy(depth, parentKey, a, b) : null;

		if (!currentTrackBy) {
			for (var i = 0, len = b.length; i < len; ++i) {
				mergeValue(a[i], b[i], i);
			}

			if (a.length !== b.length) {
				getTarget().splice(b.length);
			}
		} else {
			getTarget();
			var objectMap = new Map();

			for (var i = 0, len = a.length; i < len; ++i) {
				var aValue = a[i];
				objectMap.set(currentTrackBy(aValue, i), aValue);
			}

			target.splice.apply(target, [0, a.length].concat(b.map(function (bValue, i) {
				var aValue = objectMap.get(currentTrackBy(bValue, i));

				if (!aValue || typeof bValue !== 'object' || bValue === null) {
					return bValue;
				}

				merge(aValue, bValue, opts, depth + 1, null);
				return aValue;
			})));
		}
	}
}

function trackBy(key, maxDepth) {
	if (maxDepth === null) {
		return function (value) {
			return value[key];
		};
	}

	maxDepth = maxDepth || 0;

	return function (depth) {
		return depth > maxDepth ? null : function (value) {
			return value[key];
		};
	};
}

if (typeof module !== 'undefined') {
	module.exports = {merge: merge, trackBy: trackBy};
}
