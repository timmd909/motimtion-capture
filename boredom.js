#!/usr/bin/nodejs

'use strict';

var fs = require('fs'),
	path = require('path'),
	process = require('process'),
	_ = require('lodash'),
	child_process = require('child_process');

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

for (var i=1; i < images.length; i++) {
	var args = [
		'-metric', 'AE',
		'-fuzz', '50%',
		images[i-1], images[i]
	];
	// var output = child_process.spawnSync('compare', args);
	// console.log(args, output);

	if (0) {
		// this image is boring, rename it as such
		var oldName = images[i].match(/^(.+)\.(jpeg|jpg)$/),
			newName = oldName[1] + '-BORING.' + oldName[2];

		fs.renameSync(
			path.join(process.cwd(), images[i]),
			path.join(process.cwd(), newName)
		);
	}
} // for
