#!/usr/bin/nodejs

'use strict';

//
// Required Modules
//

var fs = require('fs'),
	path = require('path'),
	process = require('process'),
	_ = require('lodash'),
	child_process = require('child_process');

//
// Find all images in current directory
//
var images = [];
console.log('Looking for boring images in ' + process.cwd());
_.forEach(fs.readdirSync(process.cwd()), function (node) {
	var matches = node.match(/.*\.(jpeg|jpg)$/);
	if (matches) {
		images.push(node);
	}
});

if (images.length < 2) {
	console.log('Failure! There need to be at least 2 images in the current directory');
	process.exit(50);
}

//
// Process all images, looking for "boring" images that
// have few pixel changes.
//
for (var i=1; i < images.length; i++) {
	(function () {
		var delta,
			output,
			prev = images[i-1],
			curr = images[i];

		output = child_process.spawnSync('compare', [
			'-metric', 'AE',
			'-fuzz', '50%',
			prev, curr
		]);

		delta = parseInt(output);

//		output = child_process.spawnSync('compare', {
//			'-metric', 'MAE',
//			prev, curr
//		});
//		deltaMAE = parseInt(output);

		if (delta < 1000) {
			// this image is boring, rename it as such
			var oldName = curr.match(/^(.+)\.(jpeg|jpg)$/),
				newName = oldName[1] + '-BORING.' + oldName[2];

			fs.renameSync(
				path.join(process.cwd(), curr),
				path.join(process.cwd(), newName)
			);
		}
	})();
} // for(...)
