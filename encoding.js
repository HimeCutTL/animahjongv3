'use strict';

// ANIMAHJONG V3 & X SCRIPT PARSER
// there's script info sprinkled throughout this file, but the most important facts are:
// - animahjong uses JIS x 0208 string encoding
// - script info is stored in *.SIL files
// - himecuttl script format is defined at the top of script.txt for animahjong v3

// jis x 0208 to utf16 converter courtsey of unicode inc
// col 0 is SJIS, col 1 is JIS x 0208, col 2 is the U+XXXX codepoint representation
// unicode file is available at https://ftp.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0208.TXT
const { readFileSync, writeFileSync } = require('fs');
const data = readFileSync('JIS0208.TXT').toString();

const lines = data.split(/\r?\n/);

const encode_table = {};
const decode_table = {};

const bytes = [];


// build JIS x 0208 table
lines.forEach(l => {
	// skip comments
	if (l.startsWith('#')) return;
	const line = l.split('\t').slice(0, 3).map(e => parseInt(e, 16));
	decode_table[line[1]] = line[2];
	encode_table[line[2]] = line[1];
});

// strings are in JIS x 0208 starting with 02 21 73 23 xx and ending with a null byte
function decode({ buffer, end_index }) {
	const result = [];
	if (buffer.length % 2 !== 0) {
		console.log('length is not even. Invalid JISx0208', buffer, buffer.length)
		console.log(s)
	}

	for (let i=0; i<buffer.length; i+=2) {
		const mb = (buffer[i] << 8) | buffer[i+1];
		const byte = decode_table[mb];
		result.push(byte)
	}
	return { result: String.fromCodePoint(...result), end_index };
}

// lmao what a nonsense approach... that said, buffers seem to trim off
// the preceeding byte and this works so... seems like a perfect solution!
function get_points(s) {
	let result = '';
	for (let i = 0; i < s.length; i++) {
		result += s.codePointAt(i).toString(16).padStart(4, '0');
	}

	return result;
}

// pass the result of get_points() for a given string.
function encode(s) {
	// split every 4 chars
	const buffer = s.match(/.{1,4}/g).map(e => parseInt(e, 16));
	let result = ""
	for (let i=0; i<buffer.length; i++) {
		const byte = encode_table[buffer[i]];
		result += byte.toString(16); 
	}

	return result; 
}

module.exports = {
	decode,
	encode,
	get_points
};

module.exports.tables = {
	decode_table,
	encode_table
};