#!/usr/bin/nodejs

'use strict';

//
// Required Modules
//

var fs = require('fs'),
	path = require('path'),
	process = require('process'),
	_ = require('lodash'),
	child_process = require('child_process'),
	colors = require('colors');

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

var TOTAL_IMAGES = images.length;

//
// Process all images, looking for "boring" images that
// have few pixel changes.
//
var boringImages = [],
		prevImage = images[0];
for (var i=1; i < TOTAL_IMAGES; i++) {
	(function () {
		console.log('Analyzing '.blue.bold + String(i+1).white.bold +
			'/'.blue.bold + String(TOTAL_IMAGES).white.bold + '...'.blue.bold + ' ' +
			('(' + parseInt(100.0*(i*1.0/TOTAL_IMAGES)) + '% done)').blue);


		var delta,
			result,
			output,
			curr = images[i];

		result = child_process.spawnSync('compare', [
			'-metric', 'AE',
			'-fuzz', '35%',
			prevImage, curr, '/dev/null'
		], {
			'encoding': 'utf8'
		});

		output = result.output;
		delta = parseInt(output[2]);

		if (delta < 50) {
			console.log(curr.red.bold + ' is boring '.red +
				('(' + delta + ')').red.bold);
			boringImages.push(curr);
		} else {
			// save this image as the previously updated image
			prevImage = curr;
		}

	})();
} // for(...)

//
// Rename all boring images
//
console.log('Found ' + boringImages.length + ' boring images');
_.forEach(boringImages, function (boringImage) {
	var oldName = boringImage.match(/^(.+)\.(jpeg|jpg)$/),
		newName = oldName[1] + '-BORING.' + oldName[2];

	fs.renameSync(
		path.join(process.cwd(), boringImage),
		path.join(process.cwd(), newName)
	);
});
