const { readFileSync, writeFileSync } = require('fs');
const { decode_table, decode } = require('./encoding');


// not quite a piece table, but it is a table of ordered edits
// so close enough :)
const piece_table = [];

function is_dialogue_end(buffer, index) {
    // this is NOT FULLY AUTOMATED EXTRACTION!
    // there are in-text control codes that look roughly like
    // 00 07 XX (xx+) 00 02 <text continues>
    // these control codes seem to control a lot about text, including 
    // linebreaks (despite the fact that)
    // TODO: control codes
    return buffer[index] == 0x00

// parsers
function parse_dialogue(pattern, buffer, index) {
	console.log(`parsing dialouge ${index}`);
	const encoded_string = [];
	const speaker = buffer[index];
    let i;
	for (i=index+pattern.length+1; !is_dialogue_end(buffer, i); i++) {
        if (buffer[i] == 0) {
            i += 2;
        }
        encoded_string.push(buffer[i]);
	}
	const { result } = decode({ buffer: encoded_string, end_index: i });

    // build edit
    piece_table.push({
        en: '',
        jp: result,
        index: index + pattern.length + 1, // skip over directive and speaker id
        length: encoded_string.length
    });
}

function parse_clear(pattern, buffer, index) {
    //console.log(`parsing clear ${index}`);
    return "CLEAR";
}

const dispatch_table = {
    "\x02\x21\x73\x23": parse_dialogue,
    "\x02\x21\x30": parse_clear
};

function match_pattern(buffer, index) {
    for (let pattern of Object.keys(dispatch_table)) {
        let match_flag = false;
        for (let i=0; i < pattern.length; i++) {
            if (buffer[i+index] != pattern[i].charCodeAt(0)) {
                match_flag = false;
                break;
            } else {
                match_flag = true; 
            }
        }
		
        if (match_flag) {
            return dispatch_table[pattern](pattern, buffer, index)
        }
    }
}

const buf = [0x00, 0x02, 0x21, 0x73, 0x23, 0x4F, 0x23, 0x50, 0x00];

function read_sil(file_path) {
	const sil = readFileSync(file_path);
	for (let i=0; i<sil.length; i++) {
		match_pattern(sil, i);
	}
}

function main(argv) {
	read_sil(process.argv[2]);
    writeFileSync('script.json', JSON.stringify(piece_table, null, 2))
}

main(process.argv);