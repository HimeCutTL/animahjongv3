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

Below is a rough map of the opcodes in SIL archives:
```
OC|OC<<1
--------
0F|1E <reads until 0x00> - select animation to play (A:...)
1C|38 <2 bytes> ; 8A 07
2C|58 <reads until 0x00> - reads all those 03, 0e, etc. inbetween A:...,B:... and start of text
39|72 <no args> - play loaded animation
07|0E <reads until 0x00> - select B:...
1F|3E <6 bytes> - plays panning animation ****
23|46 <not sure> - jumps to the very end of the file
17|2E <no args> - at the end of the file ; appears to load more instructions at the file end and jump 0x03
05|0A <not sure> - block until enter
09|12 <2 bytes> - display loaded B:...
15|2A <not sure> - reads a lot sometimes... maybe until 0e but not quite?
23|46 <2 bytes> - read byte at ax, +4000, return as si. ret address stored at 257e
```
