/*
    This patcher applies a JSON piece-table patch to an animahjong SIL. 
        NOTE: this does NOT work using a binary patch, so this is only for
              initiali translation.
              If you are patching your own SIL, use the provided binary patch
              and the patching bspatch program / command
*/

const { readFileSync, writeFileSync } = require('fs')

// for JIS x 0208 encoding
const { encode, get_points } = require('./encoding');

const patch_file_name = process.argv[3];
const patch = require(patch_file_name);

const sil = readFileSync(`${process.argv[2]}`);
const file = [];


for (let i=0, patch_i=0; i < sil.length; i++) {
    if (patch[patch_i] && !patch[patch_i]._skip && patch[patch_i].en) {
        if (i == patch[patch_i].index) {
            console.log(`rewriting ${patch[patch_i].jp} -> ${patch[patch_i].en}`)
            const encoded = encode(get_points(patch[patch_i].en));
            for (const e of encoded) file.push(e) 
            i += patch[patch_i].length; // skip past original jp
            patch_i++;
        }
    } else {
        patch_i++;
        // doing this again here to short-circuit in the event of two skips consecutively
        file.push(sil[i]);
        continue;
    }

    file.push(sil[i]);
}

writeFileSync('./AMV3.SIL', Buffer.from(file));