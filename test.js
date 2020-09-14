'use strict';

// ANIMAHJONG V3 & X SCRIPT PARSER
// there's script info sprinkled throughout this file, but the most important facts are:
// - animahjong uses JIS x 0208 string encoding
// - script info is stored in *.SIL files
// - himecuttl script format is defined at the top of script.txt for animahjong v3

// jis x 0208 to utf16 converter courtsey of unicode inc
// col 0 is SJIS, col 1 is JIS x 0208, col 2 is the U+XXXX codepoint representation
// unicode file is available at https://ftp.unicode.org/Public/MAPPINGS/OBSOLETE/EASTASIA/JIS/JIS0208.TXT
const { readFileSync } = require('fs');
const data = readFileSync('JIS0208.TXT').toString();

const lines = data.split(/\r?\n/);

const encode_table = {};
const decode_table = {};


// build JIS x 0208 table
lines.forEach(l => {
	// skip comments
	if (l.startsWith('#')) return;
	const line = l.split('\t').slice(0, 3).map(e => parseInt(e, 16));
	decode_table[line[1]] = line[2];
	encode_table[line[2]] = line[1];
});

// strings are in JIS x 0208 starting with 02 21 73 23 59 and ending with a null byte
function decode(buffer) {
	const result = [];
	if (buffer.length % 2 !== 0) {
		console.log('length is not even. Invalid JISx0208', buffer.length)
		console.log(s)
	}

	for (let i=0; i<buffer.length; i+=2) {
		const mb = (buffer[i] << 8) | buffer[i+1];
		const byte = decode_table[mb];
		result.push(byte)
	}
	return String.fromCodePoint(...result)
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

function parse_out_text(contents, start) {
	let result = [];
	for (let i = start; contents[i] !== 0x00; i++) {
		result.push(contents[i]);
	}
	return Buffer.from(result);
}


// parse relevant sil contents
function parse_sil(contents) {
	const script = [];

	// 02 21 73 23 59 -> 0x00 is a script entry
	for (let i=0; i < contents.length; i++) {
		if (contents[i] == 0x02 && contents[i+1] == 0x21 && contents[i+2] == 0x73 && contents[i+3] == 0x23 && contents[i+4] != 0x00) {
			script.push(`${contents[i+4].toString(16)}|` + decode(parse_out_text(contents, i+5)));
			i = i + 6;
		}
	}
	return script;
}

const operation = process.argv[2]; // x | e (extract | encode)

switch(operation) {
	case 'x':
		const buf = readFileSync(process.argv[3]);
		const script = parse_sil(buf);
		console.log(script);
		break;
	case 'e':
		const string = process.argv[3];
		console.log(encode(get_points(string)));
}

