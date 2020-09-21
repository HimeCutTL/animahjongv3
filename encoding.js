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
		//if (buffer[i] == 0x00) {
		//	{ code, skip } = parse_control(buffer, i);
		//	i += skip;
		//}
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
		result += s.codePointAt(i).toString(16).padStart(4, 'F');
	}

	return result;
}

// pass the result of get_points() for a given string.
function encode(s) {
	// split every 4 chars
	const buffer = s.match(/.{1,4}/g).map(e => parseInt(e, 16));
	let result = []
	for (let i=0; i<buffer.length; i++) {
		// massage ASCII data
		if ((buffer[i] & 0xFF00) == 0xFF00) {
			let b = (buffer[i] & 0xFF);
			
			// generally, need to just shift by 0x20 for this table, but
			// some are completely unaligned with /actual/ unicode.
			// these were just found by reading the text file
			if (b == 0x20) { // ASCII space needs to be massaged 
				buffer[i] = 0x3000;
			} else if (b == 0x27) { buffer[i] = 0x2018; }
			  else if (b == 0x2D) { buffer[i] = 0x2010; }
			  else { // ascii is actually shifted by 0x20 in this table for no reason
				buffer[i] = (buffer[i] & 0xFF00) | (b - 0x20);
			}
			
		}
		
		const byte = encode_table[buffer[i]];
		result.push((byte & 0xFF00) >> 8);
		result.push(byte & 0xFF); 
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