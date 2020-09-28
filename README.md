# animahjongv3
Sogna Abandonware game Animahjong V3 Translation patch

# Installing translation patch
Patches are installed using `bspatch(1)` and are in the `patch-files/` directory of this repository.

MAKE SURE TO BACKUP ALL FILES IN YOUR GAME HARD-DISK / FLOPPY DISK IMAGE

Run `bspatch [file] [file] patch-files/[file].patch` and then use `edit disk` to replace the old version of the file inside of the floppy disk image.

# SIL Archives
Animahjong V3 and Animahjong X use an archive format ending in `.SIL`. This is a relatively simple, non-copyprotected format which encodes text with a combination of SHIFT-JIS (for PC-98 system interfacing) and JIS x 0208 for encoding dialogue and game options. Moreover, there are a number of in-text control codes which I have constructed a non-exhaustive list of.

## Working with SIL archives
For contributers, the script JSON can be produced (with no english obviously) using:

`node extract.js /path/to/archive.SIL`.

Once a translation has been written into the JSON file, it can be applied to a SIL using:

`node sil-patcher.js /path/to/archive.SIL /path/to/script.json`


## SIL control codes and directives
### Dialogue
A new piece of dialogue is null-terminated always prepended with the byte sequence. CB is character byte:

`02 21 73 23 <CB> <TEXT> 00`

Clear the dialogue window.

`02 21 30 00`