<img width="100%" src="img/nuru_header.svg" alt="nuru web"> 
 
nuru image editor for the browser. Currently very early work-in-progress. 
Check back later or [try the current state](https://domsson.github.io/nuru-web/).

---

[nuru](https://github.com/domsson/nuru) is a file format for [ASCII art](https://en.wikipedia.org/wiki/ASCII_art)
 and [ANSI art](https://en.wikipedia.org/wiki/ANSI_art). That is, images made 
up of characters. nuru-web allows to easily create and edit nuru files right in 
your browser. It is made with vanilla JavaScript, so there are no dependencies.

--- 

# Manual

## Overview

nuru "images" are really just characters (with optional color information). 
They can therefore - and are designed to - be displayed on a terminal, also 
known as a command line interface. There is a wide variety of such "text mode" 
images out there. The main differences are in the supported character set and 
the supported colors. This basically comes down to the underlying technology; 
whatever the terminal of a given time/ machine was capable of displaying would 
define the limitations of the possible ASCII/ ANSI art. nuru files support an 
array of different character and color modes.

## Glyph modes (character modes)

The following glyph modes are available:

 - **None**: only the space character is used (this requires a color mode)
 - **ASCII**: the first 256 [ASCII characters](https://en.wikipedia.org/wiki/ASCII#Printable_characters) (as per Unicode) can be used 
 - **Unicode**: any character from [Unicode](https://en.wikipedia.org/wiki/List_of_Unicode_characters) Plane 0 can be used (U+0000 - U+FFFF, 65535 characters)
 - **Palette**: a separate palette file is used to provide 256 available glyphs

## Color modes

The following color modes are available:

 - **None**: no colors available (this requires a glyph mode other than 'None')
 - **4 bit**: 16 colors as per [4-bit ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit) can be used
 - **8 bit**: 256 colors as per [8-bit ANSI escape codes](https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit) can be used 
 - **Palette**: a separate palette file is used to provide 256 available colors

If no colors are being used, the default background and foreground colors of 
the terminal will be used when displaying the image. What those are depends on 
the terminal and its settings and is not known at the time of image creation.

Also, in 4-bit mode, the _actual_ colors used will depend on the terminal and 
its settings. You basically just define "red" or "bright green"; it is up to 
the terminal to decide which color value to use to display that color.

## Key elements (Glyph key, FG key, BG key)

Images usually have a way of encoding the absence of pixel data; also known 
as transparency. In case of text mode images, the same can be achieved by 
printing a space character without a background color. This would mean that 
the terminal will simply display its native background color and nothing else. 

In a nuru file, this is not necessarily encoded as the actual space character, 
although that's the most obvious choice. Instead, you can freely designate any 
available character as the one to mean "no character". This is done with the 
"glyph key". By default, this is set to 32 (which corresponds to the index of 
the space character both in ASCII as well as Unicode). Changing it to another 
number will make the character at that index of the current character palette 
the one that will be _displayed as_ space.

Similarly, as terminals have their native background and foreground colors, the
need to encode "no specific color" and "no specific background color" arises. 
This can be achieved via the "fg key" and "bg key" values. These are also just 
indices into the currently used colors/ color palette. Whenever you use the 
foreground color at position "fg key" to draw, then the terminal's default 
foreground color will be used _to render_ that cell. The same goes for the 
background color. This means that at least one of the available colors has to 
be sacrificed to become the one to signify the absence of any particular color.

