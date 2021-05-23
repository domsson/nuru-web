"use strict";

class NuruUtils
{
	/*
	 * Turn an integer representing an RGB color into a CSS hex color.
	 */
	static to_hex_col(dec)
	{
		let col = dec.toString(16);
		return "#" + col.padStart(6, "0").toUpperCase();
	};

	/*
	 * Turn a 4-bit color index (0...15) to an ANSI4 color number.
	 */
	static to_ansi4_col(idx, bg=false)
	{
		// fg: 0 =>  30, 1 =>  31, ...  7 =>  37
		//     8 =>  90, 8 =>  91, ... 15 =>  97
		// bg: 0 =>  40, 1 =>  41, ...  7 =>  47
		//     8 => 100, 9 => 101, ... 15 => 107

		return (idx < 8 ? idx + 30 : idx + 82) + (bg * 10);
	}

	/*
	 * Turn a Unicode/ASCII value into an actual character.
	 */
	static to_glyph(cp)
	{
		return String.fromCharCode(cp);
	}

	/*
	 * Turn a character into a Unicode/ASCII code point.
	 */
	static to_codepoint(glyph)
	{
		return glyph.charCodeAt(0);
	}

	/*
	 * Turn a Unicode/ASCII code point into a Unicode hex string.
	 */
	static to_unicode_hex(cp)
	{
		let ucp = cp.toString(16);
		return "U+" + ucp.padStart(4, "0").toUpperCase();
	}

	/*
	 * Checks if the given Unicode/ASCII value is printable.
	 */
	static codepoint_is_printable = function(cp)
	{
		if (cp < 0x0020) return false;
		if (cp > 0x007E && cp < 0x00A0) return false;
		return true;
	}

	/*
	 * Checks if the given character is printable.
	 */
	static glyph_is_printable = function(ch)
	{
		return NuruUtils.codepoint_is_printable(ch.charCodeAt(0));
	}

	/*
	 * Set the CSS variable `--name` to the given value.
	 */
	static set_css_var(name, value)
	{
		let root = document.querySelector(":root");
		root.style.setProperty("--" + name, value);
	}

	static set_attr(ele, name, value="")
	{
		ele.setAttribute(name, value);
	}

	static get_attr(ele, name)
	{
		let attr = ele.getAttribute(name);
		if (attr === null || attr === "") return null;
		return isNaN(attr) ? attr : parseInt(attr);
	}

	/*
	 * Extract `size` bits from the right-most part of `src`, or from 
	 * `shift` bits further to the left (higher), if `shift` is given.
	 */
	static get_bits(src, size, shift=0)
	{
		let mask = (Math.pow(2, size) - 1) << shift;
		return (src & mask) >> shift;
	}

	/*
	 * Set `size` bits of `dest` to `src`. The right-most bits will be 
	 * read and set, unless `shift` is given, in which case the bits 
	 * `shift` bits further to the left (higher) will be read and set.
	 */
	static set_bits(dest, src, size, shift=0)
	{
		let mask = (Math.pow(2, size) - 1);
		return dest | ((src & mask) << shift);
	}

	/*
	 * Turn an Uint8Array of Unicode/ASCII values into a string.
	 */
	static array_to_string(array)
	{
		return String.fromCharCode(...array);
	}
	
	/*
	 * Turn a string into an Uint8Array of Unicode/ASCII values.
	 * If `len` is given and exceeds the string's length, then the array 
	 * will be filled with `space` (defaults to 32) up to size `len`.
	 */
	static string_to_array(str, len=0, space=32)
	{
		let strlen = str.length;
		let arrlen = len ? len : strlen;
		let arr = new Uint8Array(arrlen);
		for (let i = 0; i < arrlen; ++i)
		{
			arr[i] = i < strlen ? str.charCodeAt(i) : space;
		}
		return arr;
	}

	static data_to_buffer(data, size, buffer, offset)
	{
		let shift = 0;
		for (let i = 0; i < size; ++i)
		{
			shift = 8 * ((size - 1) - i);
			buffer[offset++] = 0xFF & (data >> shift);
		}
		return offset;
	};

	static data_from_view(size, view, offset)
	{
		let data = 0;
		let shift = 0;
		for (let i = 0; i < size; ++i)
		{
			shift = 8 * ((size - 1) - i);
			data |= view.getUint8(offset++) << shift;
		}
		return data;
	}

	/*
	 * Turn the given binary `data` into a downloadable blob and offer it 
	 * as a download, with the given `filename` as suggested file name.
	 */
	static download_data(data, filename, mime="application/octet-stream")
	{
		let link = document.createElement("a");
		let blob = new Blob([data], {type: mime});
		let ourl = window.URL.createObjectURL(blob);
		link.href = ourl;
		link.download = filename;
		link.click();
		window.URL.revokeObjectURL(ourl);
	}

	/*
	 * Prompt the user to upload a file (or multiple), then calls `handler`
	 * once the user had selected a file. The attributes given in `attrs` 
	 * will be set on the input element and can later be read by `handler`.
	 */
	static prompt_for_file = function(multiple, handler, attrs)
	{
		let input = document.createElement("input");
		input.type = "file";
		if (multiple) { input.setAttribute("multiple", "") };
		for (let name in attrs) { input.setAttribute(name, attrs[name]) };
		input.addEventListener("change", handler);
		input.click();
	}
};

class NuruPalette
{
	// supported file format
	static SIGNATURE   = "NURUPAL";
	static VERSION     = 1;
	static DATA_LENGTH = 256;

	constructor(buffer=null)
	{
		this.name     = null;
		this.type     = null;
		this.ch_key   = null;
		this.fg_key   = null;
		this.bg_key   = null;
		this.data     = [];

		if (buffer)
		{
			this.load_from_buffer(buffer);
		}
	}

	get signature()
	{
		return NuruPalette.SIGNATURE;
	}

	get version()
	{
		return NuruPalette.VERSION;
	}

	get_data(index)
	{
		return this.data[index];
	}

	get data_size()
	{
		return this.type & 0x0F;
	}

	load_from_buffer(buffer)
	{
		let filesize = buffer.byteLength;
	
		if (filesize < 528)
		{
			console.log("File too small");
			return false;
		}
	
		let view = new DataView(buffer);
	
		// header: signature
		let signature = NuruUtils.array_to_string(new Uint8Array(buffer.slice(0, 7)));
		if (signature != this.signature)
		{
			console.log("File is not a nuru palette file");
			return false;
		}

		// header: version
		let version = view.getUint8(7);
		if (version > this.version)
		{
			console.log("File is of newer version than can be parsed");
			return false;
		}

		this.type = view.getUint8(8);
		
		// header: indices of default entries (space/fg color, bg color)
		this.ch_key = view.getUint8(9);
		this.fg_key = view.getUint8(10);
		this.bg_key = view.getUint8(11);

		// header: user data
		this.userdata = view.getUint32(12);

		let offset = 0;

		// payload: unicode code points
		for (let i = 0; i < NuruPalette.DATA_LENGTH; ++i)
		{
			offset = (i * this.data_size) + 16;
			this.data[i] = NuruUtils.data_from_view(this.data_size, view, offset);
		}

		return true;
	}

	save_to_buffer(filename=null)
	{
		// prepare array buffer
		let size = this.data.length;
		let data = new Uint8Array((size * 2) + 16);
		let i = 0;
	
		// header: file format signature (7 bytes)
		data.set(NuruUtils.string_to_array(this.signature, 7, ' '), i, 0);
		i += 7;

		// header: file format verison (1 byte)
		data[i++] = this.version;

		// header: palette type (1 byte)
		data[i++] = this.type;
	
		// header: key glyph and colors (3 bytes) 
		data[i++] = this.ch_key;
		data[i++] = this.fg_key;
		data[i++] = this.bg_key;

		// header: skip 'userdata' (4 bytes)
		i += 4;
	
		// payload: palette data (256*type bytes)
		let entry = 0;
		for (let d = 0; d < size; ++d)
		{
			entry = this.data[d];
			i = NuruUtils.data_to_buffer(entry, this.data_size, data, i);
		}
	
		return data;
	};
};

/*
class NuruCell
{
	constructor(glyph=0x20, color=0x0F00, mdata=0x00)
	{
		this.glyph = glyph;
		this.color = color;
		this.mdata = mdata;
	}
}
*/

class NuruImage
{
	static SIGNATURE = "NURUIMG";
	static VERSION   = 1;

	constructor(buffer=null)
	{
		this.glyph_mode = 0;
		this.color_mode = 0;
		this.mdata_mode = 0;
		this.cols       = 0;
		this.rows       = 0;
		this.ch_key     = 0;
		this.fg_key     = 0;
		this.bg_key     = 0;
		this.glyph_pal  = null;
		this.color_pal  = null;
		this.cells      = [];

		if (buffer)
		{
			this.load_from_buffer(buffer);
		}
	}

	get signature()
	{
		return NuruImage.SIGNATURE;
	}

	get version()
	{
		return NuruImage.VERSION;
	}

	set_cell(c, r, glyph=null, color=null, mdata=null)
	{
		if (c >= this.cols) return false;
		if (r >= this.rows) return false;
		let idx = (this.cols * r) + c;	
		if (!this.cells[idx]) this.cells[idx] = {};
		if (glyph !== null) this.cells[idx].glyph = glyph;
		if (color !== null) this.cells[idx].color = color;
		if (mdata !== null) this.cells[idx].mdata = mdata;
	}

	get_cell(c, r)
	{
		if (c >= this.cols) return null;
		if (r >= this.rows) return null;
		let idx = (this.cols * r) + c;
		return this.cells[(this.cols * r) + c];
	}

	get_cell_ch(c, r)
	{
		return this.get_ch_value(get_cell(c, r).glyph);
	}

	get_cell_fg(c, r)
	{
		return this.get_fg_value(get_cell(c, r).color);
	}

	get_cell_bg(c, r)
	{
		return this.get_bg_value(get_cell(c, r).color);
	}

	get_glyph_value(ch)
	{
		let glyph = 0;
		switch (parseInt(this.glyph_mode))
		{
			case 0:
				glyph = this.ch_key;
				break;
			case 1:
			case 2:
			case 129:
				glyph = ch;
				break;
		}
		return glyph;
	}

	get_color_value(fg, bg)
	{
		let color = 0;
		switch (parseInt(this.color_mode))
		{
			case 0:
				color = 0;
				break;
			case 1:
				color = NuruUtils.set_bits(color, fg, 4, 4);
				color = NuruUtils.set_bits(color, bg, 4, 0);
				break;
			case 2:
			case 130:
				color = NuruUtils.set_bits(color, fg, 8, 8);
				color = NuruUtils.set_bits(color, bg, 8, 0);
				break;
			default:
		}
		return color;
	}

	get_ch_value(glyph)
	{
		switch (parseInt(this.glyph_mode))
		{
			case 0:
				return this.ch_key;
			case 1:
			case 2:
			case 129:
				return glyph;
		}
	}

	get_fg_value(color)
	{
		switch (this.color_mode)
		{
			case 0:
				return null;
			case 1:
				return NuruUtils.get_bits(color, 4, 4);
			case 2:
			case 130:
				return NuruUtils.get_bits(color, 8, 8);
		}
		return null;
	}

	get_bg_value(color)
	{
		switch (this.color_mode)
		{
			case 0:
				return null;
			case 1:
				return NuruUtils.get_bits(color, 4, 0);
			case 2:
			case 130:
				return NuruUtils.get_bits(color, 8, 0);
		}
		return null;
	}

	resize(cols=this.cols, rows=this.rows)
	{
		if (!cols || !rows) return false;

		let cells = [];
		let idx = 0;

		let glyph_none = this.get_glyph_value(this.ch_key);
		let color_none = this.get_color_value(this.fg_key, this.bg_key);
		let mdata_none = 0;

		for (let r = 0; r < rows; ++r)
		{
			for (let c = 0; c < cols; ++c)
			{
				idx = (cols * r) + c;
				cells[idx] = {};
				let old_cell = this.get_cell(c, r);

				if (old_cell)
				{
					cells[idx].glyph = old_cell.glyph;
					cells[idx].color = old_cell.color;
					cells[idx].mdata = old_cell.mdata;
				}
				else
				{
					cells[idx].glyph = glyph_none;
					cells[idx].color = color_none;
					cells[idx].mdata = mdata_none;
				}
			}
		}

		this.rows = rows;
		this.cols = cols;
		this.cells = cells;
	}

	load_from_buffer(buffer)
	{
		let view = new DataView(buffer);
	
		let signature = NuruUtils.array_to_string(new Uint8Array(buffer.slice(0, 7)));
		if (signature != this.signature)
		{
			console.log("File is not a nuru image file");
			return false;
		}
		let version = view.getUint8(7);
		if (version > this.version)
		{
			console.log("File is of newer version than can be parsed");
			return false;
		}
	
		this.glyph_mode = view.getUint8(8);
		this.color_mode = view.getUint8(9);
		this.mdata_mode = view.getUint8(10);

		// Figure out the byte size for each component
		let glyph_size = 0x0F & this.glyph_mode;
		let color_size = 0x0F & this.color_mode;
		let mdata_size = 0x0F & this.mdata_mode;

		this.cols = view.getUint16(11, false);
		this.rows = view.getUint16(13, false);
	
		this.ch_key = view.getUint8(15);
		this.fg_key = view.getUint8(16);
		this.bg_key = view.getUint8(17);
	
		this.glyph_pal = NuruUtils.array_to_string(new Uint8Array(buffer.slice(18, 24)));
		this.color_pal = NuruUtils.array_to_string(new Uint8Array(buffer.slice(25, 31)));
	
		// payload
		let glyph = 0;
		let color = 0;
		let mdata = 0;

		let i = 32;
		for (let r = 0; r < this.rows; ++r)
		{
			for (let c = 0; c < this.cols; ++c)
			{
				glyph = NuruUtils.data_from_view(glyph_size, view, i);
				i += glyph_size;

				color = NuruUtils.data_from_view(color_size, view, i);
				i += color_size;

				mdata = NuruUtils.data_from_view(mdata_size, view, i);
				i += mdata_size;

				this.set_cell(c, r, glyph, color, mdata);
			}
		}
	}

	save_to_buffer(filename=null)
	{
		// Figure out the byte size for each component
		let glyph_size = 0x0F & this.glyph_mode;
		let color_size = 0x0F & this.color_mode;
		let mdata_size = 0x0F & this.mdata_mode;

		// Now we can calculate the total file size (payload + header)
		let size = (this.cols * this.rows * (glyph_size + color_size + mdata_size)) + 32;
		let data = new Uint8Array(size);
		let i = 0;
	
		// file format signature (7 bytes)
		data.set(NuruUtils.string_to_array(this.signature, 7), i);
		i += 7;

		// file format version (1 byte)
		data[i++] = this.version; 
	
		// data format (3 bytes)
		data[i++] = 0xFF & this.glyph_mode;
		data[i++] = 0xFF & this.color_mode;
		data[i++] = 0xFF & this.mdata_mode; 
	
		// image format (4 bytes)
		data[i++] = (0xFF00 & this.cols) >> 8; // image width
		data[i++] = (0x00FF & this.cols);      // image width
		data[i++] = (0xFF00 & this.rows) >> 8; // image height
		data[i++] = (0x00FF & this.rows);      // image height
	
		// default glyph and colors (3 bytes)
		data[i++] = 0xFF & this.ch_key; // glyph
		data[i++] = 0xFF & this.fg_key; // foreground color
		data[i++] = 0xFF & this.bg_key; // background color 
	
		// glyph palette name (7 bytes)
		data.set(NuruUtils.string_to_array(this.glyph_pal, 7), i);
		i += 7;
	
		// color palette name (7 bytes)
		data.set(NuruUtils.string_to_array(this.color_pal, 7), i);
		i += 7;
	
		// image data
		let ch = 0;
		let fg = 0;
		let bg = 0;
	
		let cell = null;
		for (let r = 0; r < this.rows; ++r)
		{
			for (let c = 0; c < this.cols; ++c)
			{
				cell = this.get_cell(c, r);

				i = NuruUtils.data_to_buffer(cell.glyph, glyph_size, data, i);
				i = NuruUtils.data_to_buffer(cell.color, color_size, data, i);
				i = NuruUtils.data_to_buffer(cell.mdata, mdata_size, data, i);
			}
		}
	
		return data;
	}
};

class NuruTerm
{
	static ATTR_PREFIX  = "data-nuru";
	static LINE_ELEMENT = "div";
	static LINE_CLASS   = "line";
	static CELL_ELEMENT = "pre";
	static CELL_CLASS   = "cell";

	static GLYPH_NONE = " ";
	static COLOR_NONE = "inherit";

	constructor(root, cols=1, rows=1, glyph, fgcol, bgcol, attrs={})
	{
		this.root = root;
		this.cols = cols;
		this.rows = rows;

		this.init(glyph, fgcol, bgcol, attrs);
	}

	static set_cell(cell, glyph, fgcol, bgcol, attrs)
	{
		if (glyph !== null) NuruTerm.set_cell_glyph(cell, glyph);
		if (fgcol !== null) NuruTerm.set_cell_fgcol(cell, fgcol);
		if (bgcol !== null) NuruTerm.set_cell_bgcol(cell, bgcol);
		NuruTerm.set_cell_attrs(cell, attrs);
	};

	static set_cell_glyph(cell, glyph)
	{
		cell.innerHTML = glyph ? glyph : NuruTerm.GLYPH_NONE;
	}

	static set_cell_fgcol(cell, fgcol)
	{
		cell.style.color = fgcol ? fgcol : NuruTerm.COLOR_NONE;
	}

	static set_cell_bgcol(cell, bgcol)
	{
		cell.style.backgroundColor = bgcol ? bgcol : NuruTerm.COLOR_NONE;
	}

	static set_cell_attrs(cell, attrs)
	{
		for (let name in attrs)
		{
			cell.setAttribute(NuruTerm.ATTR_PREFIX + "-" + name, attrs[name]);
		}
	}

	static new_line(row)
	{
		let line = document.createElement(NuruTerm.LINE_ELEMENT);
		line.classList.add(NuruTerm.LINE_CLASS, "r" + row);
		return line;
	}

	static new_cell(col, row, glyph=" ", fgcol=15, bgcol=0, attrs={})
	{
		let cell = document.createElement(NuruTerm.CELL_ELEMENT);
		cell.classList.add(NuruTerm.CELL_CLASS);
		cell.classList.add("c" + col);
		cell.classList.add("r" + row);
		attrs.col = col;
		attrs.row = row;

		NuruTerm.set_cell(cell, glyph, fgcol, bgcol, attrs);
		return cell;
	}

	init(glyph, fgcol, bgcol, attrs)
	{
		NuruUtils.set_attr(this.root, "data-nuru-cols", this.cols);
		NuruUtils.set_attr(this.root, "data-nuru-rows", this.rows);

		// remove all children, if any
		this.root.replaceChildren();

		let line = null;
		let cell = null;
		for (let r = 0; r < this.rows; ++r)
		{
			line = NuruTerm.new_line(r);
			for (let c = 0; c < this.cols; ++c)
			{
				cell = NuruTerm.new_cell(c, r, glyph, fgcol, bgcol, attrs);
				line.appendChild(cell);
			}
			this.root.appendChild(line);
		}
	}

	// TODO the if in the loop can be simplified using the old `cols` and `rows` value
	//      instead of checking for the existence of child nodes on the cloned element
	resize(cols, rows, glyph, fgcol, bgcol, attrs)
	{
		this.cols = cols;
		this.rows = rows;

		NuruUtils.set_attr(this.root, "data-nuru-cols", this.cols);
		NuruUtils.set_attr(this.root, "data-nuru-rows", this.rows);

		// make a copy of the current term
		let clone = this.root.cloneNode(true);
	
		// remove all children, if any
		this.root.replaceChildren(); // deletes all children
	
		// create new lines and cells, but copy over existing cells
		let line = null;
		let cell = null;
		for (let r = 0; r < this.rows; ++r)
		{
			line = NuruTerm.new_line(r);
			for (let c = 0; c < this.cols; ++c)
			{
				if (clone.childNodes[r] && clone.childNodes[r].childNodes[c])
				{
					cell = clone.childNodes[r].childNodes[c].cloneNode(true);
				}
				else
				{
					cell = NuruTerm.new_cell(c, r, glyph, fgcol, bgcol, attrs);
				}
				line.appendChild(cell);
			}
			this.root.appendChild(line);
		}
	}

	set_all(glyph, fgcol, bgcol, attrs)
	{
		for (let r = 0; r < this.rows; ++r)
		{
			for (let c = 0; c < this.cols; ++c)
			{
				this.set_cell_at(c, r, glyph, fgcol, bgcol, attrs);
			}
		}
	}

	get_cell_at(col, row)
	{
		let sel = "." + NuruTerm.CELL_CLASS + ".c" + col + ".r" + row;
		return this.root.querySelector(sel);
	}

	get_cell_attr_at(col, row, name)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return undefined; }
		return cell.getAttribute(name);
	}
	
	set_cell_at(col, row, glyph, fgcol, bgcol, attrs)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return false; }
		NuruTerm.set_cell(cell, glyph, fgcol, bgcol, attrs) 
	}

	set_cell_attrs_at(col, row, attrs)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return false; }
		NuruTerm.set_cell_attrs(cell, attrs);
	}
}

class NuruUI
{
	static ATTR_PREFIX = "data-nuru";

	constructor()
	{
		this.term  = null; // NuruTerm instance
		
		// palettes
		this.glyphs = null;
		this.colors = null;
	
		this.glyph_pal = null;
		this.color_pal = null;
		this.ansi4_pal = this.ANSI4;
		this.ansi8_pal = this.ANSI8;
	
		// current brush values
		this.ch = 32;
		this.fg = 15;
		this.bg = 0;
	
		// keyboard / mouse
		this.drag = false;

		// currently selected tool, layer etc
		this.tool   = "pencil";
		this.action = "get";
		this.layer  = "fg";
	
		// some other defaults
		this.filename  = "drawing";
		this.signature = "nuruweb";
	
		// will be filled during init
		this.inputs  = {}; // form input fields
		this.slots   = {}; // saved brushes
		this.tools   = {}; // pen, eraser, etc
		this.panels  = {}; // panels are the one-cell display things
		this.layers  = {}; // bg & fg layer selection buttons
		this.actions = {}; // set & get buttons
		this.hotkeys = {}; // keyboard hotkeys
	}

	on_files(evt)
	{
		let files = evt.target.files;
		let type = this.get_nuru_attr(evt.target, "type");
		let handler = this["load_" + type].bind(this);
		let num_files = files.length;
	
		for (let i = 0; i < num_files; ++i)
		{
			let reader = new FileReader();
			reader.addEventListener("load", handler);
			reader.readAsArrayBuffer(files[i]);
		}
	}
	
	open_img()
	{
		let attrs = { "data-nuru-type": "img" };
		NuruUtils.prompt_for_file(false, this.on_files.bind(this), attrs);
	}
	
	open_pal()
	{
		let attrs = { "data-nuru-type": "pal" };
		NuruUtils.prompt_for_file(false, this.on_files.bind(this), attrs);
	}
	
	save_img(filename)
	{
		let image = new NuruImage();
		image.cols       = this.get_input_val("cols");
		image.rows       = this.get_input_val("rows");
		image.glyph_mode = this.get_input_val("glyph-mode");
		image.color_mode = this.get_input_val("color-mode");
		image.mdata_mode = this.get_input_val("mdata-mode");
		image.ch_key     = this.get_input_val("ch-key");
		image.fg_key     = this.get_input_val("fg-key");
		image.bg_key     = this.get_input_val("bg-key");
		image.glyph_pal  = this.get_input_val("glyph-pal");
		image.color_pal  = this.get_input_val("color-pal");
	
		image.resize();

		let ch = null;
		let fg = null;
		let bg = null;
		let glyph = 0;
		let color = 0;
		let mdata = 0;

		for (let r = 0; r < this.term.rows; ++r)
		{
			for (let c = 0; c < this.term.cols; ++c)
			{
				ch = this.term.get_cell_attr_at(c, r, "data-nuru-ch");
				fg = this.term.get_cell_attr_at(c, r, "data-nuru-fg");
				bg = this.term.get_cell_attr_at(c, r, "data-nuru-bg");

				glyph = image.get_glyph_value(ch);
				color = image.get_color_value(fg, bg);

				image.set_cell(c, r, glyph, color, mdata);
			}
		}

		let buffer = image.save_to_buffer();
		NuruUtils.download_data(buffer, "test_download.nui");
	}
	
	load_img(evt)
	{
		let buffer = evt.target.result;

		let image = new NuruImage();
		image.load_from_buffer(buffer);

		this.set_input_val("cols", image.cols);
		this.set_input_val("rows", image.rows);
		this.set_input_val("ch-key", image.ch_key);
		this.set_input_val("fg-key", image.fg_key);
		this.set_input_val("bg-key", image.bg_key);
		this.set_input_val("glyph-mode", image.glyph_mode);
		this.set_input_val("color-mode", image.color_mode);
		this.set_input_val("mdata-mode", image.mdata_mode);

		this.change_glyph_mode(null, false);
		this.change_color_mode(null, false);
		this.change_term_size(null, null, false);

		this.redraw_term_from_image(image);
	}
	
	save_pal(filename)
	{
		let data = this.glyph_pal.save_to_buffer();
		NuruUtils.download_data(data, filename);
	}
	
	load_pal(evt)
	{
		let buffer = evt.target.result;
		this.glyph_pal.load_from_buffer(buffer);
	}
	
	ele_by_attr(attr, singular=false)
	{
		let eles = document.querySelectorAll(`[${attr}]`);
		return singular ? eles[0] : eles;
	}
	
	init_image()
	{
		/*
		this.image = new NuruImage();
		this.image.cols       = this.get_input_val("cols");
		this.image.rows       = this.get_input_val("rows");
		this.image.glyph_mode = this.get_input_val("glyph-mode");
		this.image.color_mode = this.get_input_val("color-mode");
		this.image.mdata_mode = this.get_input_val("mdata-mode");
		this.image.ch_key     = this.get_input_val("ch-key");
		this.image.fg_key     = this.get_input_val("fg-key");
		this.image.bg_key     = this.get_input_val("bg-key");
		this.image.glyph_pal  = this.get_input_val("glyph-pal");
		this.image.color_pal  = this.get_input_val("color-pal");
	
		this.image.resize();
		*/
	}
	
	// The Terminal Canvas
	init_term(attr, w, h, callback)
	{
		let root = this.ele_by_attr(attr, true);
		if (!root) { return false };

		let glyph = " ";
		let fgcol = "inherit";
		let bgcol = "inherit";
		
		let attrs = {
			"ch": this.get_input_val("ch-key"),
			"fg": this.get_input_val("fg-key"),
			"bg": this.get_input_val("bg-key")
		}

		this.term = new NuruTerm(root, w, h, glyph, fgcol, bgcol, attrs);
		
		let handler = callback.bind(this);
		this.term.root.addEventListener("click",      handler);
		this.term.root.addEventListener("mouseover",  handler);
		this.term.root.addEventListener("mousedown",  handler);
		this.term.root.addEventListener("mouseup",    handler);
		this.term.root.addEventListener("mouseleave", handler);
	}
	
	init_glyphs_panel(attr, w, h, callback)
	{
		let root = this.ele_by_attr(attr, true);
		let glyph_mode = this.get_input_val("glyph-mode");
		root.setAttribute(attr, glyph_mode);

		if (glyph_mode == 0) { w = 0, h = 0; }
		this.glyphs = new NuruTerm(root, w, h);
		root.addEventListener("click", callback.bind(this));

		let page = (w * h) * (this.get_input_val("glyphs-page") - 1);

		for (let r = 0; r < h; ++r)
		{
			for (let c = 0; c < w; ++c)
			{
				let ch = (r * w + c) + page;
				let glyph = this.get_glyph_raw(ch);
				let cp = NuruUtils.to_codepoint(glyph)
				let ucp = NuruUtils.to_unicode_hex(cp);
	
				let cell = this.glyphs.get_cell_at(c, r);
				let attrs = { "idx": ch, "np": 0, "ch": ch };
				cell.setAttribute("title", ch + ": " + ucp);

				if (ch == this.ch)
				{
					cell.classList.add("selected");
				}
	
				if (!NuruUtils.glyph_is_printable(glyph))
				{
					cell.classList.add("non-printable");
					attrs.np = 1;
					glyph = this.get_glyph(this.get_input_val("ch-key"));
				}
	
				NuruTerm.set_cell(cell, glyph, null, null, attrs);
			}
		}
	}
	
	init_colors_panel(attr, w, h, callback)
	{
		let root = this.ele_by_attr(attr, true);
		let color_mode = this.get_input_val("color-mode");
		root.setAttribute(attr, color_mode);
		
		if (color_mode == 0) { w = 0; h = 0; }
		if (color_mode == 1) { w = 16; h = 1; }
		this.colors = new NuruTerm(root, w, h);
		root.addEventListener("click", callback.bind(this));

		for (let r = 0; r < h; ++r)
		{
			for (let c = 0; c < w; ++c)
			{
				let idx = (r * w) + c;
				let col = this.get_color_raw(idx);

				let cell = this.colors.get_cell_at(c, r);
				let attrs = { "idx": idx, "ch": 32, "bg": idx };
				cell.setAttribute("title", idx + ": " + col);

				if (idx == this.fg)
				{
					cell.classList.add("selected-fg");
				}
				if (idx == this.bg)
				{
					cell.classList.add("selected-bg");
				}

				NuruTerm.set_cell(cell, " ", null, col, attrs);
			}
		}
	
	}
	
	init_ui_elements(attr, prop, callback, action="click")
	{
		let elements = this.ele_by_attr(attr, false);
		for (let element of elements)
		{
			if (callback) element.addEventListener(action, callback.bind(this));
			if (prop) this[prop][element.getAttribute(attr)] = element;
		}
	}
	
	init_ui_panels(attr, prop, callback, action="click")
	{
		let panels = this.ele_by_attr(attr, false);
		for (let panel of panels)
		{
			let term = new NuruTerm(panel, 1, 1);
			term.set_cell_at(0, 0, " ", null, null);
			if (callback) term.root.addEventListener(action, callback.bind(this));
			if (prop) this[prop][panel.getAttribute(attr)] = term;
		}
	}

	init()
	{
		// init form input fields
		this.init_ui_elements("data-nuru-opt", "inputs", this.on_input, "change");
	
		// init terminal (canvas, drawing area)
		let cols = this.get_input_val("cols");
		let rows = this.get_input_val("rows");
		this.init_term("data-nuru-term", cols, rows, this.on_mouse_term);
	
		// init glyph palette
		let first = null;
		for (let name in this.glyph_palettes)
		{
			if (first === null) first = name;
			this.add_input_opt("glyph-pal", name.toLowerCase(), name.toUpperCase());
		}

		this.sel_input_opt("glyph-pal", first);
		this.change_glyph_pal();

		// init color palette
		first = null;
		for (let name in this.color_palettes)
		{
			if (first === null) first = name;
			this.add_input_opt("color-pal", name.toLowerCase(), name.toUpperCase());
		}

		this.sel_input_opt("color-pal", first);
		this.change_color_pal();

		// init the glyph and color modes (needs to happen AFTER palettes init)
		this.change_glyph_mode();
		this.change_color_mode();
	
		// init palettes panels
		this.init_glyphs_panel("data-nuru-glyphs", 16, 16, this.on_click_glyphs);
		this.init_colors_panel("data-nuru-colors", 16, 16, this.on_click_colors);

		
		// init brush panels (1x1 cell terminals)
		this.init_ui_panels("data-nuru-panel", "panels", null);
		this.init_ui_panels("data-nuru-slot", "slots", this.on_slot);
		
		// init buttons, hotkeys, etc
		this.init_ui_elements("data-nuru-hotkey", "hotkeys", null);
		this.init_ui_elements("data-nuru-btn", null, this.on_button);
		this.init_ui_elements("data-nuru-layer", "layers", this.on_layer);
		this.init_ui_elements("data-nuru-action", "actions", this.on_action);
		this.init_ui_elements("data-nuru-tool", "tools", this.on_tool);
		this.init_ui_elements("data-nuru-set-trigger", null, this.on_click_fieldset);
	
		// catch keyboard events
		document.addEventListener("keydown", this.on_key.bind(this));
		document.addEventListener("keyup",   this.on_key.bind(this));
		
		NuruUtils.set_css_var("term-fg", this.get_input_val("term-fg"));
		NuruUtils.set_css_var("term-bg", this.get_input_val("term-bg"));
		NuruUtils.set_css_var("term-grid-color", this.get_input_val("term-grid-color"));
		this.toggle_grid(this.get_input_val("term-grid"));
		
		// make sure all cells have ch, fg and bg attributes
		this.redraw_term();
	
		this.set_brush(this.ch, this.fg, this.bg);
		this.select_tool("pencil");
		this.select_layer("fg");
		this.select_action("set");
		
		// make sure key indices are highlighted
		this.change_chkey();
		this.change_fgkey();
		this.change_bgkey();
	}
	
	set_input_val(name, val)
	{
		let input = this.inputs[name];
		if (!input) return null;
		return input.value = val;
	}
	
	add_input_opt(name, val, txt)
	{
		let input = this.inputs[name];
		if (!input) return;
		if (input.type != "select-one") return;
		let opt = document.createElement("option");
		opt.value = val;
		opt.text  = txt;
		input.add(opt);
	}
	
	sel_input_opt(name, val)
	{
		let input = this.inputs[name];
		if (!input) return;
		if (input.type != "select-one") return;
		let options = input.querySelectorAll("option");
		for (let i = 0; i < options.length; ++i)
		{
			if (options[i].value == val) 
			{
				input.selectedIndex = i;
				break;
			}
		}
	}
	
	get_input_val(name)
	{
		let input = this.inputs[name];
		if (!input) return undefined;
	
		switch (input.type)
		{
			case "number":
			case "range":
				return parseInt(input.value);
			case "text":
			case "color":
			case "select-one":
				return isNaN(input.value) ? 
					input.value : parseInt(input.value);
			case "checkbox":
			case "radio":
				return input.checked;
			default:
				console.log("get_input_val(): input type not supported");
				return undefined;
		}
	}

	set_nuru_attr(ele, name, value)
	{
		return NuruUtils.set_attr(ele, NuruUI.ATTR_PREFIX + "-" + name, value);
	}

	get_nuru_attr(ele, name)
	{
		return NuruUtils.get_attr(ele, NuruUI.ATTR_PREFIX + "-" + name);
	}

	redraw_glyphs_panel()
	{
		this.init_glyphs_panel("data-nuru-glyphs", 16, 16, this.on_click_glyphs);
		this.change_chkey();
	}

	redraw_colors_panel()
	{
		this.init_colors_panel("data-nuru-colors", 16, 16, this.on_click_colors);
		this.change_fgkey();
		this.change_bgkey();
	}

	redraw_term()
	{
		for (let r = 0; r < this.term.rows; ++r)
		{
			for (let c = 0; c < this.term.cols; ++c)
			{
				this.redraw_cell(c, r);
			}
		}
	}

	redraw_term_from_image(image)
	{
		let cell = null;
		let ch = null;
		let fg = null;
		let bg = null;

		for (let r = 0; r < this.term.rows; ++r)
		{
			for (let c = 0; c < this.term.cols; ++c)
			{
				cell = image.get_cell(c, r);
				ch = image.get_ch_value(cell.glyph);
				fg = image.get_fg_value(cell.color);
				bg = image.get_bg_value(cell.color);
				this.set_term_cell(c, r, ch, fg, bg);
			}
		}
	}

	wipe_term()
	{
		let ch_key = this.get_input_val("ch-key");
		let fg_key = this.get_input_val("fg-key");
		let bg_key = this.get_input_val("bg-key");

		for (let r = 0; r < this.term.rows; ++r)
		{
			for (let c = 0; c < this.term.cols; ++c)
			{
				this.set_term_cell(c, r, ch_key, fg_key, bg_key);
			}
		}
	}
	
	// TODO doesn't work properly, needs complete rewrite
	crop_term()
	{
		let rows = 1;
		let cols = 1;
	
		let lines = this.term.root.childNodes;
		let cells = null;
	
		let ch_none = this.get_input_val("ch-key");
		let fg_none = this.get_input_val("fg-key");
		let bg_none = this.get_input_val("bg-key");
	
		let ch = null;
		let fg = null;
		let bg = null;
	
		for (let r = 0; r < lines.length; ++r)
		{
			cells = lines[r].childNodes;
			for (let c = 0; c < cells.length; ++c)
			{
				ch = this.get_nuru_attr(cells[c], "ch");
				fg = this.get_nuru_attr(cells[c], "fg");
				bg = this.get_nuru_attr(cells[c], "bg");
	
				if (ch != ch_none || fg != fg_none || bg != bg_none)
				{
					rows = Math.max(rows, r+1);
					cols = Math.max(cols, c+1);
				}
			}
		}
	
		this.change_term_size(cols, rows, true);
	}
	
	on_slot(evt)
	{
		let ele = evt.currentTarget;
	
		let cell = ele.querySelector(".cell");
		if (this.action == "set")
		{
			this.set_cell(cell);
		}
		else
		{
			let ch = this.get_nuru_attr(cell, "ch");
			let fg = this.get_nuru_attr(cell, "fg");
			let bg = this.get_nuru_attr(cell, "bg");
			this.set_brush(ch, fg, bg);
		}
	}
	
	on_tool(evt)
	{
		let btn = evt.currentTarget;
		let opt = this.get_nuru_attr(btn, "tool");
	
		this.select_tool(opt);
	}
	
	on_action(evt)
	{
		let btn = evt.currentTarget;
		let opt = this.get_nuru_attr(btn, "action");
	
		this.select_action(opt);
	}
	
	on_layer(evt)
	{
		let btn = evt.currentTarget;
		let opt = this.get_nuru_attr(btn, "layer");
	
		this.select_layer(opt);
	}
	
	on_button(evt)
	{
		let btn = evt.currentTarget;
		let opt = this.get_nuru_attr(btn, "btn");
		
		switch (opt)
		{
			case "open":
				this.open_img();
				break;
			case "save":
				let filename = this.get_input_val("filename");
				this.save_img((filename ? filename : this.filename) + ".nui");
				break;
			case "crop":
				this.crop_term();
				break;
			case "wipe":
				this.wipe_term();
				break;
			case "pal-save":
				this.save_pal(this.glyph_pal.name + ".nup");
				break;
			case "pal-open":
				this.open_pal();
				break;
			case "glyphs-prev":
				this.change_glyphs_page(this.get_input_val("glyphs-page") - 1, true);
				break;
			case "glyphs-next":
				this.change_glyphs_page(this.get_input_val("glyphs-page") + 1, true);
				break;
			default:
				console.log("Not implemented: " + opt);
		}
	}

	on_input(evt)
	{
		let opt = this.get_nuru_attr(evt.target, "opt");
		let val = evt.target.value;
	
		switch (opt)
		{
			case "term-fg":
			case "term-bg":
			case "term-grid-color":
			case "term-font":
			case "term-font-size":
				this.change_term_opt(opt, val);
				break;
			case "term-grid":
				this.toggle_grid(this.get_input_val("term-grid"));
				break;
			case "cols":
				this.change_term_size(val, null);
				break;
			case "rows":
				this.change_term_size(null, val);
				break;
			case "ch-key":
				this.change_chkey(val, true);
				break;
			case "fg-key":
				this.change_fgkey(val, true);
				break;
			case "bg-key":
				this.change_bgkey(val, true);
				break;
			case "glyph-mode":
				this.change_glyph_mode(val, true);
				break;
			case "color-mode":
				this.change_color_mode(val, true);
				break;
			case "glyph-pal":
				this.change_glyph_pal(val, true);
				break;
			case "color-pal":
				this.change_color_pal(val, true);
				break;
			case "glyphs-page":
				this.redraw_glyphs_panel();
				break;
			default:
				console.log("Not implemented: " + opt);
		}
	}
	
	on_mouse_term(evt)
	{
		if (!evt.target.classList.contains("cell"))
		{
			if (evt.type == "mouseleave")
			{
				this.drag = false;
			}
			return;
		}
	
		if (evt.type == "click" || (evt.type == "mouseover" && this.drag))
		{
			let cell = evt.target;
			let col = this.get_nuru_attr(cell, "col");
			let row = this.get_nuru_attr(cell, "row");
	
			switch (this.tool)
			{
				case "pencil":
					this.set_term_cell(col, row);
					break;
				case "eraser":
					this.del_term_cell(col, row);
					break;
				case "picker":
					this.set_brush(this.get_nuru_attr(cell, "ch"),
					               this.get_nuru_attr(cell, "fg"),
						       this.get_nuru_attr(cell, "bg"));
					this.select_tool("pencil");
					break;
				default:
					console.log("Not implemented");
			}
			return;
		}
	
		if (evt.type == "mousedown")
		{
			this.drag = true;
			return;
		}
	
		if (evt.type == "mouseup")
		{
			this.drag = false;
			return;
		}
	}
	
	on_key(evt)
	{
		//evt.preventDefault();
		//console.log("key = " + evt.key + " | code = " + evt.code);

		// don't process keyboard input if we're in an input field 
		if (document.activeElement.nodeName == "INPUT") return;
	
		let key = evt.key.toLowerCase();
		
		if (evt.type == "keydown")
		{
			if (this.hotkeys.hasOwnProperty(key))
			{
				this.hotkeys[key].focus();
			}
		}
		if (evt.type == "keyup")
		{
			if (this.hotkeys.hasOwnProperty(key))
			{
				this.hotkeys[key].click();
			}
		}
	}
	
	on_click_glyphs(evt)
	{
		if (!evt.target.classList.contains("cell")) return;
	
		let cell = evt.target;
	
		// abort if this is a non-printable char
		let np = this.get_nuru_attr(cell, "np");
		if (np) return;
	
		//let c = this.get_nuru_attr(cell, "col");
		//let r = this.get_nuru_attr(cell, "row");
		let ch = this.get_nuru_attr(cell, "ch");
		//this.set_brush(r*16+c, null, null);
		this.set_brush(ch, null, null);
	}
	
	on_click_colors(evt)
	{
		if (!evt.target.classList.contains("cell")) return;
			
		let cell = evt.target;
		let c = this.get_nuru_attr(cell, "col");
		let r = this.get_nuru_attr(cell, "row");
		let i = (r * 16) + c;
	
		if (this.layer == "fg")
		{
			this.set_brush(null, i, null);
		}
		else
		{
			this.set_brush(null, null, i);
		}
	}
	
	on_click_fieldset(evt)
	{
		let set_name = this.get_nuru_attr(evt.currentTarget, "set-trigger");
		if (!set_name) { return; }
		let set = document.querySelector("[data-nuru-set='" + set_name + "']");
		if (!set) { return; }
		set.classList.toggle("collapsed");
	}

	toggle_grid(show=undefined)
	{
		this.term.root.classList.toggle("grid", show);
	}

	redraw_cell(col, row)
	{
		// TODO get cell, get ch fg bg
		let cell = this.term.get_cell_at(col, row);

		let ch = this.get_nuru_attr(cell, "ch");
		let fg = this.get_nuru_attr(cell, "fg");
		let bg = this.get_nuru_attr(cell, "bg");

		let glyph = this.get_glyph(ch);
		let fgcol = this.get_fgcol(fg);
		let bgcol = this.get_bgcol(bg);

		let attrs = {
			"ch": ch,
			"fg": fg,
			"bg": bg 
		}

		this.term.set_cell_at(col, row, glyph, fgcol, bgcol, attrs);

	}

	set_term_cell(col, row, ch=null, fg=null, bg=null)
	{
		if (ch === null) ch = this.ch;
		if (fg === null) fg = this.fg;
		if (bg === null) bg = this.bg;

		let glyph = this.get_glyph(ch);
		let fgcol = this.get_fgcol(fg);
		let bgcol = this.get_bgcol(bg);

		let attrs = {
			"ch": ch,
			"fg": fg,
			"bg": bg 
		}

		this.term.set_cell_at(col, row, glyph, fgcol, bgcol, attrs);
	}
	
	del_term_cell(col, row)
	{
		let ch_key = this.get_input_val("ch-key");
		let fg_key = this.get_input_val("fg-key");
		let bg_key = this.get_input_val("bg-key");
	
		this.set_term_cell(col, row, ch_key, fg_key, bg_key);
	}
	
	get_glyph_raw(ch, pal=null)
	{
		if (pal === null) pal = this.glyph_pal;
		let glyph_mode = this.get_input_val("glyph-mode");
		switch (parseInt(glyph_mode))
		{
			case 0:   // spaces only
				return " ";
			case 1:   // ASCII
				return ch < 256 ? NuruUtils.to_glyph(ch) : " ";
			case 2:   // unicode
				return NuruUtils.to_glyph(ch);
			case 129: // palette
				return NuruUtils.to_glyph(pal.get_data(ch));
		}
		return " "; // fallback in case of unknown glyph mode
	}

	get_glyph(ch=null)
	{
		let ch_val = ch === null ? this.ch : ch;
		let ch_key = this.get_input_val("ch-key");
		return (ch_val == ch_key) ? " " : this.get_glyph_raw(ch_val, this.glyph_pal);
	}

	get_color_raw(color, pal=null)
	{
		pal = pal === null ? this.color_pal : pal;
		let color_mode = this.get_input_val("color-mode");
		switch (parseInt(color_mode))
		{
			case 0:   // monochrome
				return "inherit";
			case 1:   // 4-bit ANSI colors
				return color < 16 ? NuruUtils.to_hex_col(this.ANSI4[color]) : "inherit";
			case 2:   // 8-bit ANSI colors
				return NuruUtils.to_hex_col(this.ANSI8[color]);
			case 130: // palette
				return NuruUtils.to_hex_col(pal.get_data(color));
		}
		return "inherit"; // fallback in case of unknown color mode

	}

	get_fgcol(fg=null)
	{
		let fg_val = fg === null ? this.fg : fg;
		let fg_key = this.get_input_val("fg-key"); 
		return (fg_val == fg_key) ? "inherit" : this.get_color_raw(fg_val);
	}
	
	get_bgcol(bg=null)
	{
		let bg_val = bg === null ? this.bg : bg;
		let bg_key = this.get_input_val("bg-key");
		return (bg_val == bg_key) ? "inherit" : this.get_color_raw(bg_val);
	}

	set_cell(cell, ch=null, fg=null, bg=null)
	{
		let new_ch = ch===null ? this.ch : ch;
		let new_fg = fg===null ? this.fg : fg;
		let new_bg = bg===null ? this.bg : bg;
	
		let glyph = this.get_glyph(new_ch);
		let fgcol = this.get_fgcol(new_fg);
		let bgcol = this.get_bgcol(new_bg);
	
		let attributes = { "ch": new_ch, "fg": new_fg, "bg": new_bg };
	
		NuruTerm.set_cell(cell, glyph, fgcol, bgcol, attributes);
	}
	
	set_glyph(ch=null)
	{
		this.ch = ch === null ? this.get_input_val("ch-key") : ch;
	
		let brush_cell = this.panels.brush.get_cell_at(0, 0);
		let glyph_cell = this.panels.glyph.get_cell_at(0, 0);
		let glyph = this.get_glyph();
	
		NuruTerm.set_cell_glyph(brush_cell, glyph);
		NuruTerm.set_cell_glyph(glyph_cell, glyph);
	
		this.select_cell_by_attr(this.glyphs, "ch", this.ch);
	}
	
	set_fgcol(fg=null)
	{
		this.fg = fg == null ? this.get_input_val("fg-key") : fg;
	
		let brush_cell = this.panels.brush.get_cell_at(0, 0);
		let fgcol_cell = this.panels.fgcol.get_cell_at(0, 0);
		let fgcol = this.get_fgcol();
	
		NuruTerm.set_cell_fgcol(brush_cell, fgcol);
		NuruTerm.set_cell_bgcol(fgcol_cell, fgcol);
	
		this.select_cell_by_attr(this.colors, "bg", this.fg, "selected-fg");
	}

	set_bgcol(bg=null)
	{
		this.bg = bg == null ? this.get_input_val("bg-key") : bg;
	
		let brush_cell = this.panels.brush.get_cell_at(0, 0);
		let bgcol_cell = this.panels.bgcol.get_cell_at(0, 0);
		let bgcol = this.get_bgcol();
	
		NuruTerm.set_cell_bgcol(brush_cell, bgcol);
		NuruTerm.set_cell_bgcol(bgcol_cell, bgcol);
	
		this.select_cell_by_attr(this.colors, "bg", this.bg, "selected-bg");
	}
	
	set_brush(ch=null, fg=null, bg=null)
	{
		if (ch != null && this.panels.brush)
		{
			this.set_glyph(ch);
		}
		if (fg != null && this.panels.fgcol)
		{
			this.set_fgcol(fg);
		}
		if (bg != null && this.panels.bgcol)
		{
			this.set_bgcol(bg);
		}
	}

	select_cell_by_attr(panel, attr_name, attr_value, classname="selected")
	{
		let cells = panel.root.querySelectorAll(".cell." + classname);
		for (let c = 0; c < cells.length; ++c)
		{
			cells[c].classList.remove(classname);
		}
		let selector = `[${NuruUI.ATTR_PREFIX}-${attr_name}='${attr_value}']`;
		let cell = panel.root.querySelector(selector);
		if (!cell) return;
		cell.classList.add(classname);
	}
	
	select_tool(which="pencil")
	{
		if (this.tool)
		{
			this.tools[this.tool].classList.remove("selected");
			this.term.root.classList.remove(this.tool);
		}
		this.tool = which;
		this.tools[this.tool].classList.add("selected");
		this.term.root.classList.add(this.tool);
	}
	
	select_action(which="set")
	{
		this.actions[this.action].classList.remove("selected");
		this.action = which;
		this.actions[this.action].classList.add("selected")
	}
	
	select_layer(which="fg")
	{
		this.layers[this.layer].classList.remove("selected");
		this.layer = which;
		this.layers[this.layer].classList.add("selected")
	}
	
	change_glyph_mode(mode=null, redraw=false)
	{
		if (mode === null) mode = this.get_input_val("glyph-mode");
		this.set_nuru_attr(document.body, "glyph-mode", mode);

		// recreate the glyphs panel
		this.redraw_glyphs_panel();

		let pal_opt = document.querySelector("[data-nuru-opt='glyph-pal']");
		if (mode & 128) // palette mode
		{
			pal_opt.removeAttribute("disabled");
		}
		else
		{
			pal_opt.setAttribute("disabled", "");
		}
		
		// redraw the terminal - if requested
		if (redraw) this.redraw_term();
	}
	
	change_color_mode(mode=null, redraw=false)
	{
		if (mode === null) mode = this.get_input_val("color-mode");
		this.set_nuru_attr(document.body, "color-mode", mode);

		// recreate the glyphs panel
		this.redraw_colors_panel();

		let pal_opt = document.querySelector("[data-nuru-opt='color-pal']");
		if (mode & 128) // palette mode
		{
			pal_opt.removeAttribute("disabled");
		}
		else
		{
			pal_opt.setAttribute("disabled", "");
		}
	
		// redraw the terminal - if requested
		if (redraw) this.redraw_term();
	}
	
	change_glyph_pal(which=null, redraw=false)
	{
		if (which === null) which = this.get_input_val("glyph-pal").toLowerCase();
		if (!this.glyph_palettes.hasOwnProperty(which)) return false;
	
		let data = new Uint8Array(this.glyph_palettes[which]);
		this.glyph_pal = new NuruPalette(data.buffer);

		// TODO should we or shouldn't we?
		//this.set_input_val("ch-key", this.glyph_pal.ch_key);
		//this.set_chkey(this.glyph_pal.ch_key);
	
		// recreate the glyphs panel
		this.redraw_glyphs_panel();
		if (redraw) this.redraw_term();
	}

	change_color_pal(which=null, redraw=false)
	{
		if (which === null) which = this.get_input_val("color-pal").toLowerCase();
		if (!this.color_palettes.hasOwnProperty(which)) return false;
	
		let data = new Uint8Array(this.color_palettes[which]);
		this.color_pal = new NuruPalette(data.buffer);
		
		// TODO should we or shouldn't we?
		//this.set_input_val("fg-key", this.color_pal.fg_key);
		//this.set_input_val("bg-key", this.color_pal.bg_key);
		//this.change_fgkey(this.color_pal.fg_key);
		//this.change_bgkey(this.color_pal.bg_key);
	
		// recreate the colors panel
		this.redraw_colors_panel();
		if (redraw) this.redraw_term();
	}

	change_term_opt(name, value=null)
	{
		if (value === null) value = this.get_input_val(name);
		NuruUtils.set_css_var(name, value);
	}
	
	change_term_size(cols=null, rows=null, redraw=false)
	{
		if (cols === null) cols = this.get_input_val("cols");
		if (rows === null) rows = this.get_input_val("rows");

		this.term.resize(cols, rows);
		if (redraw) this.redraw_term();
	}

	change_chkey(chkey=null, redraw=false)
	{
		if (chkey === null) chkey = this.get_input_val("ch-key");
		this.select_cell_by_attr(this.glyphs, "idx", chkey, "ch-key");
		if (redraw) this.redraw_term();
	}

	change_fgkey(fgkey=null, redraw=false)
	{
		if (fgkey === null) fgkey = this.get_input_val("fg-key");
		this.select_cell_by_attr(this.colors, "idx", fgkey, "fg-key");
		if (redraw) this.redraw_term();
	}
	
	change_bgkey(bgkey=null, redraw=false)
	{
		if (bgkey === null) bgkey = this.get_input_val("bg-key");
		this.select_cell_by_attr(this.colors, "idx", bgkey, "bg-key");
		if (redraw) this.redraw_term();
	}

	change_glyphs_page(page, redraw=false)
	{
		if (page < 1) return;
		if (page > 256) return;
		this.set_input_val("glyphs-page", page);
		if (redraw) this.redraw_glyphs_panel();
	}
}

// xterm color variants
// https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
NuruUI.prototype.ANSI4 = [
	0x000000, 0xcd0000, 0x00cd00, 0xcdcd00, 0x0000ee, 0xcd00cd, 0x00cdcd, 0xe5e5e5,
	0x7f7f7f, 0xff0000, 0x00ff00, 0xffff00, 0x5c5cff, 0xff00ff, 0x00ffff, 0xffffff
];

// https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
NuruUI.prototype.ANSI8 = [
	0x000000, 0x800000, 0x008000, 0x808000, 0x000080, 0x800080, 0x008080, 0xc0c0c0,
	0x808080, 0xff0000, 0x00ff00, 0xffff00, 0x0000ff, 0xff00ff, 0x00ffff, 0xffffff,
	0x000000, 0x00005F, 0x000087, 0x0000af, 0x0000d7, 0x0000ff, 0x005f00, 0x005f5f,
	0x005f87, 0x005faf, 0x005f7d, 0x005fff, 0x008700, 0x00875f, 0x008787, 0x0087af,
	0x0087d7, 0x0087ff, 0x00af00, 0x00af5f, 0x00af87, 0x00afaf, 0x00afd7, 0x00afff,
	0x00d700, 0x00d75f, 0x00d787, 0x00d7af, 0x00d7d7, 0x00d7ff, 0x00ff00, 0x00ff5f,
	0x00ff87, 0x00ffaf, 0x00ffd7, 0x00ffff, 0x5f0000, 0x5f005f, 0x5f0087, 0x5f00af,
	0x5f00d7, 0x5f00ff, 0x5f5f00, 0x5f5f5f, 0x5f5f87, 0x5f5faf, 0x5f5fd7, 0x5f5fff,
	0x5f8700, 0x5f875f, 0x5f8787, 0x5f87af, 0x5f87d7, 0x5f87ff, 0x5faf00, 0x5faf5f,
	0x5faf87, 0x5fafaf, 0x5fafd7, 0x5fafff, 0x5fd700, 0x5fd75f, 0x5fd787, 0x5fd7af,
	0x5fd7d7, 0x5fd7ff, 0x5fff00, 0x5fff5f, 0x5fff87, 0x5fffaf, 0x5fffd7, 0x5fffff,
	0x870000, 0x87005f, 0x870087, 0x8700af, 0x8700d7, 0x8700ff, 0x875f00, 0x875f5f,
	0x875f87, 0x875faf, 0x875fd7, 0x875fff, 0x878700, 0x87875f, 0x878787, 0x8787af,
	0x8787d7, 0x8787ff, 0x87af00, 0x87af5f, 0x87af87, 0x87afaf, 0x87afd7, 0x87afff,
	0x87d700, 0x87d75f, 0x87d787, 0x87d7af, 0x87d7d7, 0x87d7ff, 0x87ff00, 0x87ff5f,
	0x87ff87, 0x87ffaf, 0x87ffd7, 0x87ffff, 0xaf0000, 0xaf005f, 0xaf0087, 0xaf00af,
	0xaf00d7, 0xaf00ff, 0xaf5f00, 0xaf5f5f, 0xaf5f87, 0xaf5faf, 0xaf5fd7, 0xaf5fff,
	0xaf8700, 0xaf875f, 0xaf8787, 0xaf87af, 0xaf87d7, 0xaf87ff, 0xafaf00, 0xafaf5f,
	0xafaf87, 0xafafaf, 0xafafd7, 0xafafff, 0xafd700, 0xafd75f, 0xafd787, 0xafd7af,
	0xafd7d7, 0xafd7ff, 0xafff00, 0xafff5f, 0xafff87, 0xafffaf, 0xafffd7, 0xafffff,
	0xd70000, 0xd7005f, 0xd70087, 0xd700af, 0xd700d7, 0xd700ff, 0xd75f00, 0xd75f5f,
	0xd75f87, 0xd75faf, 0xd75fd7, 0xd75fff, 0xd78700, 0xd7875f, 0xd78787, 0xd787af,
	0xd787d7, 0xd787ff, 0xd7af00, 0xd7af5f, 0xd7af87, 0xd7afaf, 0xd7afd7, 0xd7afff,
	0xd7d700, 0xd7d75f, 0xd7d787, 0xd7d7af, 0xd7d7d7, 0xd7d7ff, 0xd7ff00, 0xd7ff5f,
	0xd7ff87, 0xd7ffaf, 0xd7ffd7, 0xd7ffff, 0xff0000, 0xff005f, 0xff0087, 0xff00af,
	0xff00d7, 0xff00ff, 0xff5f00, 0xff5f5f, 0xff5f87, 0xff5faf, 0xff5fd7, 0xff5fff,
	0xff8700, 0xff875f, 0xff8787, 0xff87af, 0xff87d7, 0xff87ff, 0xffaf00, 0xffaf5f,
	0xffaf87, 0xffafaf, 0xffafd7, 0xffafff, 0xffd700, 0xffd75f, 0xffd787, 0xffd7af,
	0xffd7d7, 0xffd7ff, 0xffff00, 0xffff5f, 0xffff87, 0xffffaf, 0xffffd7, 0xffffff,
	0x080808, 0x121212, 0x1c1c1c, 0x262626, 0x303030, 0x3a3a3a, 0x444444, 0x4e4e4e,
	0x585858, 0x626262, 0x6c6c6c, 0x767676, 0x808080, 0x8a8a8a, 0x949494, 0x9e9e9e,
	0xa8a8a8, 0xb2b2b2, 0xbcbcbc, 0xc6c6c6, 0xd0d0d0, 0xdadada, 0xe4e4e4, 0xeeeeee
];

NuruUI.prototype.color_palettes = {
	// https://lospec.com/palette-list/aurora
	"aurora": [
		// header (signature, version, type, ch_key, fg_key, bg_key, userdata)
		0x4e, 0x55, 0x52, 0x55, 0x50, 0x41, 0x4C, 0x01,	0x03, 0x00, 0x0F, 0x00, 0x64, 0x61, 0x77, 0x6e,
		// palette data
		0x00, 0x00, 0x00, 0x11, 0x11, 0x11, 0x22, 0x22, 0x22, 0x33, 0x33, 0x33,
		0x44, 0x44, 0x44, 0x55, 0x55, 0x55, 0x66, 0x66, 0x66, 0x77, 0x77, 0x77,
		0x88, 0x88, 0x88, 0x99, 0x99, 0x99, 0xaa, 0xaa, 0xaa, 0xbb, 0xbb, 0xbb, 
		0xcc, 0xcc, 0xcc, 0xdd, 0xdd, 0xdd, 0xee, 0xee, 0xee, 0xff, 0xff, 0xff,
		0x00, 0x7f, 0x7f, 0x3f, 0xbf, 0xbf, 0x00, 0xff, 0xff, 0xbf, 0xff, 0xff, 
		0x81, 0x81, 0xff, 0x00, 0x00, 0xff, 0x3f, 0x3f, 0xbf, 0x00, 0x00, 0x7f,
		0x0f, 0x0f, 0x50, 0x7f, 0x00, 0x7f, 0xbf, 0x3f, 0xbf, 0xf5, 0x00, 0xf5, 
		0xfd, 0x81, 0xff, 0xff, 0xc0, 0xcb, 0xff, 0x81, 0x81, 0xff, 0x00, 0x00,
		0xbf, 0x3f, 0x3f, 0x7f, 0x00, 0x00, 0x55, 0x14, 0x14, 0x7f, 0x3f, 0x00, 
		0xbf, 0x7f, 0x3f, 0xff, 0x7f, 0x00, 0xff, 0xbf, 0x81, 0xff, 0xff, 0xbf,
		0xff, 0xff, 0x00, 0xbf, 0xbf, 0x3f, 0x7f, 0x7f, 0x00, 0x00, 0x7f, 0x00, 
		0x3f, 0xbf, 0x3f, 0x00, 0xff, 0x00, 0xaf, 0xff, 0xaf, 0x00, 0xbf, 0xff,
		0x00, 0x7f, 0xff, 0x4b, 0x7d, 0xc8, 0xbc, 0xaf, 0xc0, 0xcb, 0xaa, 0x89, 
		0xa6, 0xa0, 0x90, 0x7e, 0x94, 0x94, 0x6e, 0x82, 0x87, 0x7e, 0x6e, 0x60,
		0xa0, 0x69, 0x5f, 0xc0, 0x78, 0x72, 0xd0, 0x8a, 0x74, 0xe1, 0x9b, 0x7d, 
		0xeb, 0xaa, 0x8c, 0xf5, 0xb9, 0x9b, 0xf6, 0xc8, 0xaf, 0xf5, 0xe1, 0xd2,
		0x7f, 0x00, 0xff, 0x57, 0x3b, 0x3b, 0x73, 0x41, 0x3c, 0x8e, 0x55, 0x55, 
		0xab, 0x73, 0x73, 0xc7, 0x8f, 0x8f, 0xe3, 0xab, 0xab, 0xf8, 0xd2, 0xda,
		0xe3, 0xc7, 0xab, 0xc4, 0x9e, 0x73, 0x8f, 0x73, 0x57, 0x73, 0x57, 0x3b, 
		0x3b, 0x2d, 0x1f, 0x41, 0x41, 0x23, 0x73, 0x73, 0x3b, 0x8f, 0x8f, 0x57,
		0xa2, 0xa2, 0x55, 0xb5, 0xb5, 0x72, 0xc7, 0xc7, 0x8f, 0xda, 0xda, 0xab, 
		0xed, 0xed, 0xc7, 0xc7, 0xe3, 0xab, 0xab, 0xc7, 0x8f, 0x8e, 0xbe, 0x55,
		0x73, 0x8f, 0x57, 0x58, 0x7d, 0x3e, 0x46, 0x50, 0x32, 0x19, 0x1e, 0x0f, 
		0x23, 0x50, 0x37, 0x3b, 0x57, 0x3b, 0x50, 0x64, 0x50, 0x3b, 0x73, 0x49,
		0x57, 0x8f, 0x57, 0x73, 0xab, 0x73, 0x64, 0xc0, 0x82, 0x8f, 0xc7, 0x8f, 
		0xa2, 0xd8, 0xa2, 0xe1, 0xf8, 0xfa, 0xb4, 0xee, 0xca, 0xab, 0xe3, 0xc5,
		0x87, 0xb4, 0x8e, 0x50, 0x7d, 0x5f, 0x0f, 0x69, 0x46, 0x1e, 0x2d, 0x23, 
		0x23, 0x41, 0x46, 0x3b, 0x73, 0x73, 0x64, 0xab, 0xab, 0x8f, 0xc7, 0xc7,
		0xab, 0xe3, 0xe3, 0xc7, 0xf1, 0xf1, 0xbe, 0xd2, 0xf0, 0xab, 0xc7, 0xe3, 
		0xa8, 0xb9, 0xdc, 0x8f, 0xab, 0xc7, 0x57, 0x8f, 0xc7, 0x57, 0x73, 0x8f,
		0x3b, 0x57, 0x73, 0x0f, 0x19, 0x2d, 0x1f, 0x1f, 0x3b, 0x3b, 0x3b, 0x57, 
		0x49, 0x49, 0x73, 0x57, 0x57, 0x8f, 0x73, 0x6e, 0xaa, 0x76, 0x76, 0xca,
		0x8f, 0x8f, 0xc7, 0xab, 0xab, 0xe3, 0xd0, 0xda, 0xf8, 0xe3, 0xe3, 0xff, 
		0xab, 0x8f, 0xc7, 0x8f, 0x57, 0xc7, 0x73, 0x57, 0x8f, 0x57, 0x3b, 0x73,
		0x3c, 0x23, 0x3c, 0x46, 0x32, 0x46, 0x72, 0x40, 0x72, 0x8f, 0x57, 0x8f, 
		0xab, 0x57, 0xab, 0xab, 0x73, 0xab, 0xeb, 0xac, 0xe1, 0xff, 0xdc, 0xf5,
		0xe3, 0xc7, 0xe3, 0xe1, 0xb9, 0xd2, 0xd7, 0xa0, 0xbe, 0xc7, 0x8f, 0xb9, 
		0xc8, 0x7d, 0xa0, 0xc3, 0x5a, 0x91, 0x4b, 0x28, 0x37, 0x32, 0x16, 0x23,
		0x28, 0x0a, 0x1e, 0x40, 0x18, 0x11, 0x62, 0x18, 0x00, 0xa5, 0x14, 0x0a, 
		0xda, 0x20, 0x10, 0xd5, 0x52, 0x4a, 0xff, 0x3c, 0x0a, 0xf5, 0x5a, 0x32,
		0xff, 0x62, 0x62, 0xf6, 0xbd, 0x31, 0xff, 0xa5, 0x3c, 0xd7, 0x9b, 0x0f, 
		0xda, 0x6e, 0x0a, 0xb4, 0x5a, 0x00, 0xa0, 0x4b, 0x05, 0x5f, 0x32, 0x14,
		0x53, 0x50, 0x0a, 0x62, 0x62, 0x00, 0x8c, 0x80, 0x5a, 0xac, 0x94, 0x00, 
		0xb1, 0xb1, 0x0a, 0xe6, 0xd5, 0x5a, 0xff, 0xd5, 0x10, 0xff, 0xea, 0x4a,
		0xc8, 0xff, 0x41, 0x9b, 0xf0, 0x46, 0x96, 0xdc, 0x19, 0x73, 0xc8, 0x05, 
		0x6a, 0xa8, 0x05, 0x3c, 0x6e, 0x14, 0x28, 0x34, 0x05, 0x20, 0x46, 0x08,
		0x0c, 0x5c, 0x0c, 0x14, 0x96, 0x05, 0x0a, 0xd7, 0x0a, 0x14, 0xe6, 0x0a, 
		0x7d, 0xff, 0x73, 0x4b, 0xf0, 0x5a, 0x00, 0xc5, 0x14, 0x05, 0xb4, 0x50,
		0x1c, 0x8c, 0x4e, 0x12, 0x38, 0x32, 0x12, 0x98, 0x80, 0x06, 0xc4, 0x91, 
		0x00, 0xde, 0x6a, 0x2d, 0xeb, 0xa8, 0x3c, 0xfe, 0xa5, 0x6a, 0xff, 0xcd,
		0x91, 0xeb, 0xff, 0x55, 0xe6, 0xff, 0x7d, 0xd7, 0xf0, 0x08, 0xde, 0xd5, 
		0x10, 0x9c, 0xde, 0x05, 0x5a, 0x5c, 0x16, 0x2c, 0x52, 0x0f, 0x37, 0x7d,
		0x00, 0x4a, 0x9c, 0x32, 0x64, 0x96, 0x00, 0x52, 0xf6, 0x18, 0x6a, 0xbd, 
		0x23, 0x78, 0xdc, 0x69, 0x9d, 0xc3, 0x4a, 0xa4, 0xff, 0x90, 0xb0, 0xff,
		0x5a, 0xc5, 0xff, 0xbe, 0xb9, 0xfa, 0x78, 0x6e, 0xf0, 0x4a, 0x5a, 0xff, 
		0x62, 0x41, 0xf6, 0x3c, 0x3c, 0xf5, 0x10, 0x1c, 0xda, 0x00, 0x10, 0xbd,
		0x23, 0x10, 0x94, 0x0c, 0x21, 0x48, 0x50, 0x10, 0xb0, 0x60, 0x10, 0xd0, 
		0x87, 0x32, 0xd2, 0x9c, 0x41, 0xff, 0xbd, 0x62, 0xff, 0xb9, 0x91, 0xff,
		0xd7, 0xa5, 0xff, 0xd7, 0xc3, 0xfa, 0xf8, 0xc6, 0xfc, 0xe6, 0x73, 0xff, 
		0xff, 0x52, 0xff, 0xda, 0x20, 0xe0, 0xbd, 0x29, 0xff, 0xbd, 0x10, 0xc5,
		0x8c, 0x14, 0xbe, 0x5a, 0x18, 0x7b, 0x64, 0x14, 0x64, 0x41, 0x00, 0x62, 
		0x32, 0x0a, 0x46, 0x55, 0x19, 0x37, 0xa0, 0x19, 0x82, 0xc8, 0x00, 0x78,
		0xff, 0x50, 0xbf, 0xff, 0x6a, 0xc5, 0xfa, 0xa0, 0xb9, 0xfc, 0x3a, 0x8c, 
		0xe6, 0x1e, 0x78, 0xbd, 0x10, 0x39, 0x98, 0x34, 0x4d, 0x91, 0x14, 0x37
	],
	// https://lospec.com/palette-list/duel
	"duel": [
		// header (signature, version, type, ch_key, fg_key, bg_key, userdata)
		0x4e, 0x55, 0x52, 0x55, 0x50, 0x41, 0x4C, 0x01,	0x03, 0x00, 0x0F, 0x07, 0x00, 0x00, 0x00, 0x00,
		// palette data
		0x00, 0x00, 0x00, 0x22, 0x23, 0x23, 0x43, 0x45, 0x49, 0x62, 0x68, 0x71,	0x82, 0x8b, 0x98, 0xa6, 
		0xae, 0xba, 0xcd, 0xd2, 0xda, 0xf5, 0xf7, 0xfa,	0x62, 0x5d, 0x54, 0x85, 0x75, 0x65, 0x9e, 0x8c, 
		0x79, 0xae, 0xa1, 0x89, 0xbb, 0xaf, 0xa4, 0xcc, 0xc3, 0xb1, 0xea, 0xdb, 0xc9, 0xff, 0xf3, 0xd6,
		0x58, 0x31, 0x26, 0x73, 0x3d, 0x3b, 0x88, 0x50, 0x41, 0x9a, 0x62, 0x4c, 0xad, 0x6e, 0x51, 0xd5,
		0x8d, 0x6b, 0xfb, 0xaa, 0x84, 0xff, 0xce, 0x7f, 0x00, 0x27, 0x35, 0x00, 0x38, 0x50, 0x00, 0x4d, 
		0x5e, 0x0b, 0x66, 0x7f, 0x00, 0x6f, 0x89, 0x32, 0x8c, 0xa7, 0x24, 0xae, 0xd6, 0x88, 0xd6, 0xff,
		0x66, 0x2b, 0x29, 0x94, 0x36, 0x3a, 0xb6, 0x4d, 0x46, 0xcd, 0x5e, 0x46, 0xe3, 0x78, 0x40, 0xf9,
		0x9b, 0x4e, 0xff, 0xbc, 0x4e, 0xff, 0xe9, 0x49, 0x28, 0x2b, 0x4a, 0x3a, 0x45, 0x68, 0x61, 0x5f, 
		0x84, 0x7a, 0x77, 0x99, 0x86, 0x90, 0xb2, 0x96, 0xb2, 0xd9, 0xc7, 0xd6, 0xff, 0xc6, 0xec, 0xff,
		0x00, 0x22, 0x19, 0x00, 0x32, 0x21, 0x17, 0x4a, 0x1b, 0x22, 0x59, 0x18,	0x2f, 0x69, 0x0c, 0x51, 
		0x88, 0x22, 0x7d, 0xa4, 0x2d, 0xa6, 0xcc, 0x34, 0x18, 0x1f, 0x2f, 0x23, 0x32, 0x4d, 0x25, 0x46,
		0x6b, 0x36, 0x6b, 0x8a,	0x31, 0x8e, 0xb8, 0x41, 0xb2, 0xe3, 0x52, 0xd2, 0xff, 0x74, 0xf5, 0xfd,
		0x1a, 0x33, 0x2c, 0x2f, 0x3f, 0x38, 0x38, 0x51, 0x40, 0x32, 0x5c, 0x40, 0x41, 0x74, 0x55, 0x49,
		0x89, 0x60, 0x55, 0xb6, 0x7d, 0x91, 0xda, 0xa1,	0x5e, 0x07, 0x11, 0x82, 0x21, 0x1d, 0xb6, 0x3c, 
		0x35, 0xe4, 0x5c, 0x5f,	0xff, 0x76, 0x76, 0xff, 0x9b, 0xa8, 0xff, 0xbb, 0xc7, 0xff, 0xdb, 0xff,
		0x2d, 0x31, 0x36, 0x48, 0x47, 0x4d, 0x5b, 0x5c, 0x69, 0x73, 0x73, 0x7f, 0x84, 0x87, 0x95, 0xab,
		0xae, 0xbe, 0xba, 0xc7, 0xdb, 0xeb, 0xf0, 0xf6, 0x3b, 0x30, 0x3c, 0x5a, 0x3c, 0x45, 0x8a, 0x52,
		0x58, 0xae, 0x6b, 0x60, 0xc7, 0x82, 0x6c, 0xd8, 0x9f, 0x75, 0xec, 0xc5, 0x81, 0xff, 0xfa, 0xab,
		0x31, 0x22, 0x2a, 0x4a, 0x35, 0x3c, 0x5e, 0x46, 0x46, 0x72, 0x5a, 0x51, 0x7e, 0x6c, 0x54, 0x9e, 
		0x8a, 0x6e, 0xc0, 0xa5, 0x88, 0xdd, 0xbf, 0x9a,	0x2e, 0x10, 0x26, 0x49, 0x28, 0x3d, 0x66, 0x36,
		0x59, 0x97, 0x54, 0x75,	0xb9, 0x6d, 0x91, 0xc1, 0x78, 0xaa, 0xdb, 0x99, 0xbf, 0xf8, 0xc6, 0xda,
		0x00, 0x2e, 0x49, 0x00, 0x40, 0x51, 0x00, 0x51, 0x62, 0x00, 0x6b, 0x6d, 0x00, 0x82, 0x79, 0x00, 
		0xa0, 0x87, 0x00, 0xbf, 0xa3, 0x00, 0xde, 0xda, 0x45, 0x31, 0x25, 0x61, 0x4a, 0x3c, 0x7e, 0x61,
		0x44, 0x99, 0x79, 0x51, 0xb2, 0x90, 0x62, 0xcc, 0xa9, 0x6e, 0xe8, 0xcb, 0x82, 0xfb, 0xea, 0xa3,
		0x5f, 0x09, 0x26, 0x6e, 0x24, 0x34, 0x90, 0x46, 0x47, 0xa7, 0x60, 0x57, 0xbd, 0x7d, 0x64, 0xce, 
		0x97, 0x70, 0xed, 0xb6, 0x7c, 0xed, 0xd4, 0x93, 0x32, 0x35, 0x58, 0x4a, 0x52, 0x80, 0x64, 0x65, 
		0x9d, 0x78, 0x77, 0xc1, 0x8e, 0x8c, 0xe2, 0x9c, 0x9b, 0xef, 0xb8, 0xae, 0xff, 0xdc, 0xd4, 0xff,
		0x43, 0x17, 0x29, 0x71, 0x2b, 0x3b, 0x9f, 0x3b, 0x52, 0xd9, 0x4a, 0x69, 0xf8, 0x5d, 0x80, 0xff,
		0x7d, 0xaf, 0xff, 0xa6, 0xc5, 0xff, 0xcd, 0xff, 0x49, 0x25, 0x1c, 0x63, 0x34, 0x32, 0x7c, 0x4b,
		0x47, 0x98, 0x59, 0x5a, 0xac, 0x6f, 0x6e, 0xc1, 0x7e, 0x7a, 0xd2, 0x8d, 0x7a, 0xe5, 0x9a, 0x7c,
		0x20, 0x29, 0x00, 0x2f, 0x4f, 0x08, 0x49, 0x5d, 0x00, 0x61, 0x73, 0x08, 0x7c, 0x83, 0x1e, 0x96,
		0x9a, 0x26, 0xb4, 0xaa, 0x33, 0xd0, 0xcc, 0x32, 0x62, 0x2a, 0x00, 0x75, 0x3b, 0x09, 0x85, 0x4f, 
		0x12, 0x9e, 0x65, 0x20, 0xba, 0x88, 0x2e, 0xd1, 0xaa, 0x39, 0xe8, 0xd2, 0x4b, 0xff, 0xf6, 0x4f,
		0x26, 0x23, 0x3d, 0x3b, 0x38, 0x55, 0x56, 0x50, 0x6f, 0x75, 0x68, 0x6e, 0x91, 0x7a, 0x7b, 0xb3, 
		0x97, 0x83, 0xcf, 0xaf, 0x8e, 0xfe, 0xdf, 0xb1, 0x1d, 0x2c, 0x43, 0x2e, 0x3d, 0x47, 0x39, 0x4d, 
		0x3c, 0x4c, 0x5f, 0x33, 0x58, 0x71, 0x2c, 0x6b, 0x84, 0x2d, 0x78, 0x9e, 0x24, 0x7f, 0xbd, 0x39,
		0x37, 0x24, 0x23, 0x53, 0x39, 0x3a, 0x78, 0x4c, 0x49, 0x94, 0x5d, 0x4f, 0xa9, 0x6d, 0x58, 0xbf, 
		0x7e, 0x63, 0xd7, 0x93, 0x74, 0xf4, 0xa3, 0x80, 0x2d, 0x4b, 0x47, 0x47, 0x65, 0x5a, 0x5b, 0x7b, 
		0x69, 0x71, 0x95, 0x7d, 0x87, 0xae, 0x8e, 0x8a, 0xc1, 0x96, 0xa9, 0xd1, 0xc1, 0xe0, 0xfa, 0xeb,
		0x00, 0x1b, 0x40, 0x03, 0x31, 0x5f, 0x07, 0x48, 0x7c, 0x10, 0x5d, 0xa2, 0x14, 0x76, 0xc0, 0x40,
		0x97, 0xea, 0x55, 0xb1, 0xf1, 0x6d, 0xcc, 0xff, 0x55, 0x47, 0x69, 0x76, 0x5d, 0x73, 0x97, 0x74,
		0x88, 0xb9, 0x8c, 0x93, 0xd5, 0xa3, 0x9a, 0xeb, 0xbd, 0x9d, 0xff, 0xd5, 0x9b, 0xfd, 0xf7, 0x86,
		0x1d, 0x1d, 0x21, 0x3c, 0x31, 0x51, 0x58, 0x4a, 0x7f, 0x79, 0x64, 0xba, 0x95, 0x85, 0xf1, 0xa9, 
		0x96, 0xec, 0xba, 0xab, 0xf7, 0xd1, 0xbd, 0xfe, 0x26, 0x24, 0x50, 0x28, 0x33, 0x5d, 0x2d, 0x3d, 
		0x72, 0x3d, 0x50, 0x83, 0x51, 0x65, 0xae, 0x52, 0x74, 0xc5, 0x6c, 0x82, 0xc4, 0x83, 0x93, 0xc3,
		0x49, 0x21, 0x29, 0x5e, 0x41, 0x4a, 0x77, 0x53, 0x5b, 0x91, 0x60, 0x6a, 0xad, 0x79, 0x84, 0xb5, 
		0x8b, 0x94, 0xd4, 0xae, 0xaa, 0xff, 0xe2, 0xcf, 0x72, 0x1c, 0x03, 0x9c, 0x33, 0x27, 0xbf, 0x5a, 
		0x3e, 0xe9, 0x86, 0x27, 0xff, 0xb1, 0x08, 0xff, 0xcf, 0x05, 0xff, 0xf0, 0x2b, 0xf7, 0xf4, 0xbf
	]
};

NuruUI.prototype.glyph_palettes = {
	"nurustd": [
		// header (signature, version, type, ch_key, fg_key, bg_key, userdata)
		0x4e, 0x55, 0x52, 0x55, 0x50, 0x41, 0x4C, 0x01, 0x02, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		// palette data
		0x25, 0x80, 0x25, 0x81, 0x25, 0x82, 0x25, 0x83, 0x25, 0x84, 0x25, 0x85, 0x25, 0x86, 0x25, 0x87,
		0x25, 0x88, 0x25, 0x89, 0x25, 0x8A, 0x25, 0x8B, 0x25, 0x8C, 0x25, 0x8D, 0x25, 0x8E, 0x25, 0x8F,
		0x25, 0x90, 0x25, 0x91, 0x25, 0x92, 0x25, 0x93, 0x25, 0x94, 0x25, 0x95, 0x25, 0x96, 0x25, 0x97,
		0x25, 0x98, 0x25, 0x99, 0x25, 0x9A, 0x25, 0x9B, 0x25, 0x9C, 0x25, 0x9D, 0x25, 0x9E, 0x25, 0x9F,
		0x00, 0x20, 0x00, 0x21, 0x00, 0x22, 0x00, 0x23, 0x00, 0x24, 0x00, 0x25, 0x00, 0x26, 0x00, 0x27,
		0x00, 0x28, 0x00, 0x29, 0x00, 0x2A, 0x00, 0x2B, 0x00, 0x2C, 0x00, 0x2D, 0x00, 0x2E, 0x00, 0x2F,
		0x00, 0x30, 0x00, 0x31, 0x00, 0x32, 0x00, 0x33, 0x00, 0x34, 0x00, 0x35, 0x00, 0x36, 0x00, 0x37,
		0x00, 0x38, 0x00, 0x39, 0x00, 0x3A, 0x00, 0x3B, 0x00, 0x3C, 0x00, 0x3D, 0x00, 0x3E, 0x00, 0x3F,
		0x00, 0x40, 0x00, 0x41, 0x00, 0x42, 0x00, 0x43, 0x00, 0x44, 0x00, 0x45, 0x00, 0x46, 0x00, 0x47,
		0x00, 0x48, 0x00, 0x49, 0x00, 0x4A, 0x00, 0x4B, 0x00, 0x4C, 0x00, 0x4D, 0x00, 0x4E, 0x00, 0x4F,
		0x00, 0x50, 0x00, 0x51, 0x00, 0x52, 0x00, 0x53, 0x00, 0x54, 0x00, 0x55, 0x00, 0x56, 0x00, 0x57,
		0x00, 0x58, 0x00, 0x59, 0x00, 0x5A, 0x00, 0x5B, 0x00, 0x5C, 0x00, 0x5D, 0x00, 0x5E, 0x00, 0x5F,
		0x00, 0x60, 0x00, 0x61, 0x00, 0x62, 0x00, 0x63, 0x00, 0x64, 0x00, 0x65, 0x00, 0x66, 0x00, 0x67,
		0x00, 0x68, 0x00, 0x69, 0x00, 0x6A, 0x00, 0x6B, 0x00, 0x6C, 0x00, 0x6D, 0x00, 0x6E, 0x00, 0x6F,
		0x00, 0x70, 0x00, 0x71, 0x00, 0x72, 0x00, 0x73, 0x00, 0x74, 0x00, 0x75, 0x00, 0x76, 0x00, 0x77,
		0x00, 0x78, 0x00, 0x79, 0x00, 0x7A, 0x00, 0x7B, 0x00, 0x7C, 0x00, 0x7D, 0x00, 0x7E, 0x23, 0x02,
		0x25, 0x00, 0x25, 0x01, 0x25, 0x02, 0x25, 0x03, 0x25, 0x04, 0x25, 0x05, 0x25, 0x06, 0x25, 0x07,
		0x25, 0x08, 0x25, 0x09, 0x25, 0x0A, 0x25, 0x0B, 0x25, 0x0C, 0x25, 0x0D, 0x25, 0x0E, 0x25, 0x0F,
		0x25, 0x10, 0x25, 0x11, 0x25, 0x12, 0x25, 0x13, 0x25, 0x14, 0x25, 0x15, 0x25, 0x16, 0x25, 0x17,
		0x25, 0x18, 0x25, 0x19, 0x25, 0x1A, 0x25, 0x1B, 0x25, 0x1C, 0x25, 0x1D, 0x25, 0x1E, 0x25, 0x1F,
		0x25, 0x20, 0x25, 0x21, 0x25, 0x22, 0x25, 0x23, 0x25, 0x24, 0x25, 0x25, 0x25, 0x26, 0x25, 0x27,
		0x25, 0x28, 0x25, 0x29, 0x25, 0x2A, 0x25, 0x2B, 0x25, 0x2C, 0x25, 0x2D, 0x25, 0x2E, 0x25, 0x2F,
		0x25, 0x30, 0x25, 0x31, 0x25, 0x32, 0x25, 0x33, 0x25, 0x34, 0x25, 0x35, 0x25, 0x36, 0x25, 0x37,
		0x25, 0x38, 0x25, 0x39, 0x25, 0x3A, 0x25, 0x3B, 0x25, 0x3C, 0x25, 0x3D, 0x25, 0x3E, 0x25, 0x3F,
		0x25, 0x40, 0x25, 0x41, 0x25, 0x42, 0x25, 0x43, 0x25, 0x44, 0x25, 0x45, 0x25, 0x46, 0x25, 0x47,
		0x25, 0x48, 0x25, 0x49, 0x25, 0x4A, 0x25, 0x4B, 0x25, 0x4C, 0x25, 0x4D, 0x25, 0x4E, 0x25, 0x4F,
		0x25, 0x50, 0x25, 0x51, 0x25, 0x52, 0x25, 0x53, 0x25, 0x54, 0x25, 0x55, 0x25, 0x56, 0x25, 0x57,
		0x25, 0x58, 0x25, 0x59, 0x25, 0x5A, 0x25, 0x5B, 0x25, 0x5C, 0x25, 0x5D, 0x25, 0x5E, 0x25, 0x5F,
		0x25, 0x60, 0x25, 0x61, 0x25, 0x62, 0x25, 0x63, 0x25, 0x64, 0x25, 0x65, 0x25, 0x66, 0x25, 0x67,
		0x25, 0x68, 0x25, 0x69, 0x25, 0x6A, 0x25, 0x6B, 0x25, 0x6C, 0x25, 0x6D, 0x25, 0x6E, 0x25, 0x6F,
		0x25, 0x70, 0x25, 0x71, 0x25, 0x72, 0x25, 0x73, 0x25, 0x74, 0x25, 0x75, 0x25, 0x76, 0x25, 0x77,
		0x25, 0x78, 0x25, 0x79, 0x25, 0x7A, 0x25, 0x7B, 0x25, 0x7C, 0x25, 0x7D, 0x25, 0x7E, 0x25, 0x7F
	],
	"cp437": [
		// header
		0x4e, 0x55, 0x52, 0x55, 0x50, 0x41, 0x4c, 0x01, 0x02, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
		// palette data
		0x00, 0x00, 0x26, 0x3A, 0x26, 0x3B, 0x26, 0x65, 0x26, 0x66, 0x26, 0x63, 0x26, 0x60, 0x20, 0x22,
		0x25, 0xD8, 0x25, 0xCB, 0x25, 0xD8, 0x26, 0x42, 0x26, 0x40, 0x26, 0x6A, 0x26, 0x6B, 0x26, 0x3C,
		0x25, 0xBA, 0x25, 0xC4, 0x21, 0x95, 0x20, 0x3C, 0x00, 0xB6, 0x00, 0xA7, 0x25, 0xAC, 0x21, 0xA8,
		0x21, 0x91, 0x21, 0x93, 0x21, 0x92, 0x21, 0x90, 0x22, 0x1F, 0x21, 0x94, 0x25, 0xB2, 0x25, 0xBC,
		0x00, 0x20, 0x00, 0x21, 0x00, 0x22, 0x00, 0x23, 0x00, 0x24, 0x00, 0x25, 0x00, 0x26, 0x00, 0x27,
		0x00, 0x28, 0x00, 0x29, 0x00, 0x2A, 0x00, 0x2B, 0x00, 0x2C, 0x00, 0x2D, 0x00, 0x2E, 0x00, 0x2F, 
		0x00, 0x30, 0x00, 0x31, 0x00, 0x32, 0x00, 0x33, 0x00, 0x34, 0x00, 0x35, 0x00, 0x36, 0x00, 0x37,
		0x00, 0x38, 0x00, 0x39, 0x00, 0x3A, 0x00, 0x3B, 0x00, 0x3C, 0x00, 0x3D, 0x00, 0x3E, 0x00, 0x3F,
		0x00, 0x40, 0x00, 0x41, 0x00, 0x42, 0x00, 0x43, 0x00, 0x44, 0x00, 0x45, 0x00, 0x46, 0x00, 0x47,
		0x00, 0x48, 0x00, 0x49, 0x00, 0x4A, 0x00, 0x4B, 0x00, 0x4C, 0x00, 0x4D, 0x00, 0x4E, 0x00, 0x4F,
		0x00, 0x50, 0x00, 0x51, 0x00, 0x52, 0x00, 0x53, 0x00, 0x54, 0x00, 0x55, 0x00, 0x56, 0x00, 0x57,
		0x00, 0x58, 0x00, 0x59, 0x00, 0x5A, 0x00, 0x5B, 0x00, 0x5C, 0x00, 0x5D, 0x00, 0x5E, 0x00, 0x5F,
		0x00, 0x60, 0x00, 0x61, 0x00, 0x62, 0x00, 0x63, 0x00, 0x64, 0x00, 0x65, 0x00, 0x66, 0x00, 0x67,
		0x00, 0x68, 0x00, 0x69, 0x00, 0x6A, 0x00, 0x6B, 0x00, 0x6C, 0x00, 0x6D, 0x00, 0x6E, 0x00, 0x6F,
		0x00, 0x70, 0x00, 0x71, 0x00, 0x72, 0x00, 0x73, 0x00, 0x74, 0x00, 0x75, 0x00, 0x76, 0x00, 0x77,
		0x00, 0x78, 0x00, 0x79, 0x00, 0x7A, 0x00, 0x7B, 0x00, 0x7C, 0x00, 0x7D, 0x00, 0x7E, 0x23, 0x02,
		0x00, 0xC7, 0x00, 0xFC, 0x00, 0xE9, 0x00, 0xE2, 0x00, 0xE4, 0x00, 0xE0, 0x00, 0xE5, 0x00, 0xE7,
		0x00, 0xEA, 0x00, 0xEB, 0x00, 0xE8, 0x00, 0xEF, 0x00, 0xEE, 0x00, 0xEC, 0x00, 0xC4, 0x00, 0xC5,
		0x00, 0xC9, 0x00, 0xE6, 0x00, 0xC6, 0x00, 0xF4, 0x00, 0xF6, 0x00, 0xF2, 0x00, 0xFB, 0x00, 0xF9,
		0x00, 0xFF, 0x00, 0xD6, 0x00, 0xDC, 0x00, 0xA2, 0x00, 0xA3, 0x00, 0xA5, 0x20, 0xA7, 0x01, 0x92,
		0x00, 0xE1, 0x00, 0xED, 0x00, 0xF3, 0x00, 0xFA, 0x00, 0xF1, 0x00, 0xD1, 0x00, 0xAA, 0x00, 0xBA,
		0x00, 0xBF, 0x23, 0x10, 0x00, 0xAC, 0x00, 0xBD, 0x00, 0xBC, 0x00, 0xA1, 0x00, 0xAB, 0x00, 0xBB,
		0x25, 0x91, 0x25, 0x92, 0x25, 0x93, 0x25, 0x02, 0x25, 0x24, 0x25, 0x61, 0x25, 0x62, 0x25, 0x56,
		0x25, 0x55, 0x25, 0x63, 0x25, 0x51, 0x25, 0x57, 0x25, 0x5D, 0x25, 0x5C, 0x25, 0x5B, 0x25, 0x10,
		0x25, 0x14, 0x25, 0x43, 0x25, 0x2C, 0x25, 0x1C, 0x25, 0x00, 0x25, 0x3C, 0x25, 0x5E, 0x25, 0x5F,
		0x25, 0x5A, 0x25, 0x54, 0x25, 0x69, 0x25, 0x66, 0x25, 0x60, 0x25, 0x50, 0x25, 0x6C, 0x25, 0x67,
		0x25, 0x68, 0x25, 0x64, 0x25, 0x65, 0x25, 0x59, 0x25, 0x58, 0x25, 0x52, 0x25, 0x53, 0x25, 0x6B,
		0x25, 0x6A, 0x25, 0x18, 0x25, 0x0C, 0x25, 0x88, 0x25, 0x84, 0x25, 0x8C, 0x25, 0x90, 0x25, 0x80,
		0x03, 0xB1, 0x00, 0xDF, 0x03, 0x93, 0x03, 0xC0, 0x03, 0xA3, 0x03, 0xC3, 0x00, 0xB5, 0x03, 0xC4,
		0x03, 0xA6, 0x03, 0x98, 0x03, 0xA9, 0x03, 0xB4, 0x22, 0x1E, 0x03, 0xC6, 0x03, 0xB5, 0x22, 0x29,
		0x22, 0x61, 0x00, 0xB1, 0x22, 0x65, 0x22, 0x64, 0x23, 0x20, 0x23, 0x21, 0x00, 0xF7, 0x22, 0x48,
		0x00, 0xB0, 0x22, 0x19, 0x00, 0xB7, 0x22, 0x1A, 0x20, 0x7F, 0x00, 0xB2, 0x25, 0xA0, 0x00, 0xA0
	]
};

