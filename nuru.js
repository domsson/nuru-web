class NuruUtils
{
	static array_to_string(array)
	{
		return String.fromCharCode(...array);
	}
	
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
			shift = 8 * (size - i);
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
			shift = 8 * (size - i);
			data |= view.getUint8(offset++) << shift;
		}
		return data;
	}

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

	static codepoint_is_printable = function(cp)
	{
		if (cp < 0x0020) return false;
		if (cp > 0x007E && cp < 0x00A0) return false;
		return true;
	}

	static glyph_is_printable = function(ch)
	{
		return this.codepoint_is_printable(ch.charCodeAt(0));
	}

	static prompt_for_file = function(type, multiple, handler)
	{
		let input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("data-nuru-type", type);
		if (multiple)
		{
			input.setAttribute("multiple", "");
		}
		input.click();
		input.addEventListener("change", handler);
	}
};

class NuruPalette
{
	// supported file format
	static SIGNATURE = "NURUPAL";
	static VERSION   = 1;

	// default nuru palette
	static NURUSTD   = {
		"name": "nurustd",
		"type": 2,
		"ch_key": 32,
		"fg_key": 0,
		"bg_key": 0,
		"userdata": 0,
		"data": [
			0x2580, 0x2581, 0x2582, 0x2583, 0x2584, 0x2585, 0x2586, 0x2587,
			0x2588, 0x2589, 0x258A, 0x258B, 0x258C, 0x258D, 0x258E, 0x258F,
			0x2590, 0x2591, 0x2592, 0x2593, 0x2594, 0x2595, 0x2596, 0x2597,
			0x2598, 0x2599, 0x259A, 0x259B, 0x259C, 0x259D, 0x259E, 0x259F,
			0x0020, 0x0021, 0x0022, 0x0023, 0x0024, 0x0025, 0x0026, 0x0027,
			0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F,
			0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036, 0x0037,
			0x0038, 0x0039, 0x003A, 0x003B, 0x003C, 0x003D, 0x003E, 0x003F,
			0x0040, 0x0041, 0x0042, 0x0043, 0x0044, 0x0045, 0x0046, 0x0047,
			0x0048, 0x0049, 0x004A, 0x004B, 0x004C, 0x004D, 0x004E, 0x004F,
			0x0050, 0x0051, 0x0052, 0x0053, 0x0054, 0x0055, 0x0056, 0x0057,
			0x0058, 0x0059, 0x005A, 0x005B, 0x005C, 0x005D, 0x005E, 0x005F,
			0x0060, 0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067,
			0x0068, 0x0069, 0x006A, 0x006B, 0x006C, 0x006D, 0x006E, 0x006F,
			0x0070, 0x0071, 0x0072, 0x0073, 0x0074, 0x0075, 0x0076, 0x0077,
			0x0078, 0x0079, 0x007A, 0x007B, 0x007C, 0x007D, 0x007E, 0x2302,
			0x2500, 0x2501, 0x2502, 0x2503, 0x2504, 0x2505, 0x2506, 0x2507,
			0x2508, 0x2509, 0x250A, 0x250B, 0x250C, 0x250D, 0x250E, 0x250F,
			0x2510, 0x2511, 0x2512, 0x2513, 0x2514, 0x2515, 0x2516, 0x2517,
			0x2518, 0x2519, 0x251A, 0x251B, 0x251C, 0x251D, 0x251E, 0x251F,
			0x2520, 0x2521, 0x2522, 0x2523, 0x2524, 0x2525, 0x2526, 0x2527,
			0x2528, 0x2529, 0x252A, 0x252B, 0x252C, 0x252D, 0x252E, 0x252F,
			0x2530, 0x2531, 0x2532, 0x2533, 0x2534, 0x2535, 0x2536, 0x2537,
			0x2538, 0x2539, 0x253A, 0x253B, 0x253C, 0x253D, 0x253E, 0x253F,
			0x2540, 0x2541, 0x2542, 0x2543, 0x2544, 0x2545, 0x2546, 0x2547,
			0x2548, 0x2549, 0x254A, 0x254B, 0x254C, 0x254D, 0x254E, 0x254F,
			0x2550, 0x2551, 0x2552, 0x2553, 0x2554, 0x2555, 0x2556, 0x2557,
			0x2558, 0x2559, 0x255A, 0x255B, 0x255C, 0x255D, 0x255E, 0x255F,
			0x2560, 0x2561, 0x2562, 0x2563, 0x2564, 0x2565, 0x2566, 0x2567,
			0x2568, 0x2569, 0x256A, 0x256B, 0x256C, 0x256D, 0x256E, 0x256F,
			0x2570, 0x2571, 0x2572, 0x2573, 0x2574, 0x2575, 0x2576, 0x2577,
			0x2578, 0x2579, 0x257A, 0x257B, 0x257C, 0x257D, 0x257E, 0x257F
		]
	};

	constructor(buffer=null)
	{
		this.name     = null;
		this.type     = null;
		this.ch_key   = null;
		this.fg_key   = null;
		this.bg_key   = null;
		this.data     = null;

		if (buffer)
		{
			this.load_from_buffer(buffer);
		}
		else
		{
			this.name     = NuruPalette.NURUSTD.name;
			this.type     = NuruPalette.NURUSTD.type;
			this.ch_key   = NuruPalette.NURUSTD.ch_key;
			this.fg_key   = NuruPalette.NURUSTD.fg_key;
			this.bg_key   = NuruPalette.NURUSTD.bg_key;
			this.userdata = NuruPalette.NURUSTD.userdata;
			this.data     = NuruPalette.NURUSTD.data;
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

	get_glyph(index)
	{
		return String.fromCharCode(this.data[index]);
	}
	
	get_codepoint(index)
	{
		return this.data[index];
	}

	get_space_index()
	{
		return this.ch_key;
	}

	get_space_glyph()
	{
		return this.get_glyph(this.ch_key);
	}

	get_space_codepoint()
	{
		return this.get_codepoint(this.ch_key);
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

		// payload: unicode code points
		for (let i = 0; i < 256; i += this.type)
		{
			this.data[i] = NuruUtils.data_from_view(this.type, view, i+16);
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
			i = NuruUtils.data_to_buffer(entry, this.type, data, i);
		}
	
		return data;
	};
};

class NuruCell
{
	constructor(glyph=0x20, color=0x0F00, mdata=0x00)
	{
		this.glyph = glyph;
		this.color = color;
		this.mdata = mdata;
	}
}

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

	set_cell(r, c, glyph, color, mdata)
	{
		let cell = this.cells[(this.cols * r) + c];
		cell.glyph = glyph;
		cell.color = color;
		cell.mdata = mdata;
	}

	get_glyph_value(ch)
	{
		let glyph = 0;
		switch (this.glyph_mode)
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
		switch (this.color_mode)
		{
			case 0:
				color = 0;
				break;
			case 1:
				color |= (0x0F & fg) << 4;
				color |= (0x0F & bg) << 0;
				break;
			case 2:
			case 130:
				color |= (0xFF & fg) << 8;
				color |= (0xFF & bg) << 0;
				break;
		}
		return color;
	}

	clear(ch_key=32, fg_key=15, bg_key=0)
	{
		let glyph = this.get_glyph_value(ch_key);
		let color = this.get_color_value(fg_key, bg_key);
		let mdata = 0;

		for (let r = 0; r < this.rows; ++r)
		{
			for (let c = 0; c < this.cols; ++c)
			{
				this.set_cell(r, c, glyph, color, mdata);
			}
		}
	}

	resize(cols=this.cols, rows=this.rows, ch_key=32, fg_key=15, bg_key=0)
	{
		if (!cols || !rows) { return false; }

		let cells = [];
		let new_idx = 0;
		let old_idx = 0;

		let glyph_none = this.get_glyph_value(this.ch_key);
		let color_none = this.get_color_value(this.fg_key, this.bg_key);
		let mdata_none = 0;

		for (let r = 0; r < rows; ++r)
		{
			for (let c = 0; c < cols; ++c)
			{
				new_idx = (cols * r) + c;
				old_idx = (this.cols * r) + c;
				cells[new_idx] = {};

				if (this.cells[old_idx])
				{
					cells[new_idx].glyph = this.cells[old_idx].glyph;
					cells[new_idx].color = this.cells[old_idx].color;
					cells[new_idx].mdata = this.cells[old_idx].mdata;
				}
				else
				{
					cells[new_idx].glyph = glyph_none;
					cells[new_idx].color = color_none;
					cells[new_idx].mdata = mdata_none;
				}
			}
		}

		this.rows = rows;
		this.cols = cols;
		this.cells = cells;
	}
	
	crop()
	{
		// TODO
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
		for (let r = 0; r < rows; ++r)
		{
			for (let c = 0; c < cols; ++c)
			{
				glyph = NuruUtils.data_from_view(glyph_size, view, i);
				i += glyph_size;

				color = NuruUtils.data_from_view(color_size, view, i);
				i += color_size;

				mdata = NuruUtils.data_from_view(mdata_size, view, i);
				i += mdata_size;

				this.set_cell(r, c, glyph, color, mdata);
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
				cell = this.cells[(this.cols * r) + c];

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

	root = null;
	cols = 0;
	rows = 0;

	constructor(root, cols=64, rows=16)
	{
		this.root  = root;
		this.cols  = cols;
		this.rows  = rows;

		this.resize(this.cols, this.rows);
	}

	new_line(row)
	{
		let line = document.createElement(NuruTerm.LINE_ELEMENT);
		line.classList.add(NuruTerm.LINE_CLASS, "r" + row);
		return line;
	}

	new_cell(col, row, ch, fg, bg, attrs={})
	{
		let cell = document.createElement(NuruTerm.CELL_ELEMENT);
		cell.classList.add(NuruTerm.CELL_CLASS);
		cell.classList.add("c" + col);
		cell.classList.add("r" + row);
		attrs.col = col;
		attrs.row = row;

		this.set_cell(cell, ch, fg, bg, attrs);
		return cell;
	}

	resize(cols, rows, ch, fg, bg, attrs)
	{
		this.cols = cols;
		this.rows = rows;

		// make a copy of the current term
		let clone = this.root.cloneNode(true);
	
		// remove all children, if any
		this.root.textContent = '';
	
		// create new lines and cells, but copy over existing cells
		let line = null;
		let cell = null;
		for (let r = 0; r < this.rows; ++r)
		{
			line = this.new_line(r);
			for (let c = 0; c < this.cols; ++c)
			{
				if (clone.childNodes[r] && clone.childNodes[r].childNodes[c])
				{
					cell = clone.childNodes[r].childNodes[c].cloneNode(true);
				}
				else
				{
					cell = this.new_cell(c, r, ch, fg, bg, attrs);
				}
				line.appendChild(cell);
			}
			this.root.appendChild(line);
		}
	}

	get_cell_at(col, row)
	{
		return this.root.querySelector("." + NuruTerm.CELL_CLASS + ".c" + col + ".r" + row);
	}

	get_cell_attr_at(col, row, name)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return undefined; }
		return cell.getAttribute(name);
	}
	
	set_cell_at(col, row, ch, fg, bg, attrs)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return false; }
		this.set_cell(cell, ch, fg, bg, attrs) 
	}

	set_cell(cell, ch, fg, bg, attrs)
	{
		cell.innerHTML             = ch ? ch : " ";
		cell.style.color           = fg ? fg : "inherit"; 
		cell.style.backgroundColor = bg ? bg : "inherit"; 
		this.set_cell_attrs(cell, attrs);
	};

	set_cell_attrs_at(col, row, attrs)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return false; }
		this.set_cell_attrs(cell, attrs);
	}

	set_cell_attrs(cell, attrs)
	{
		for (let name in attrs)
		{
			cell.setAttribute(NuruTerm.ATTR_PREFIX + "-" + name, attrs[name]);
		}
	}
}

class NuruUI
{
	constructor(root, cols=64, rows=16)
	{
		this.root  = root;
		this.cols  = cols;
		this.rows  = rows;
	}
}

function Nuru()
{
	// term / canvas
	this.term_root = null; // parent element for the nuru term
	this.term = null; // NuruTerm instance
	this.cols = 0;
	this.rows = 0;

	this.image = null;

	// palettes
	this.glyphs = null;
	this.colors = null;

	this.glyph_pal = [];
	this.color_pal = [];

	// current brush values
	this.ch = 32;
	this.fg = 15;
	this.bg = 0;

	// keyboard / mouse
	this.drag = false;

	// currently selected tool
	this.tool = null;
	this.action = "get";
	this.layer = "fg";

	// file signatures etc
	this.nui_sig = "NURUIMG";
	this.nup_sig = "NURUPAL";
	this.nui_ver = 1;
	this.nup_ver = 1;

	// some other defaults
	this.filename  = "drawing";
	this.signature = "nuruweb";

	// will be filled during init
	this.inputs = {};
	this.slots = [];
	this.tools = {};
	this.panels = {}; // panels are the one-cell display things
	this.layers = {};
	this.actions = {};
	this.hotkeys = {};
};

Nuru.prototype.NURUSTD = {
	"name": "nurustd",
	"type": 2,
	"ch_key": 32,
	"fg_key": 0,
	"bg_key": 0,
	"userdata": 0,
	"data": [
		0x2580, 0x2581, 0x2582, 0x2583, 0x2584, 0x2585, 0x2586, 0x2587,
		0x2588, 0x2589, 0x258A, 0x258B, 0x258C, 0x258D, 0x258E, 0x258F,
		0x2590, 0x2591, 0x2592, 0x2593, 0x2594, 0x2595, 0x2596, 0x2597,
		0x2598, 0x2599, 0x259A, 0x259B, 0x259C, 0x259D, 0x259E, 0x259F,
		0x0020, 0x0021, 0x0022, 0x0023, 0x0024, 0x0025, 0x0026, 0x0027,
		0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F,
		0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036, 0x0037,
		0x0038, 0x0039, 0x003A, 0x003B, 0x003C, 0x003D, 0x003E, 0x003F,
		0x0040, 0x0041, 0x0042, 0x0043, 0x0044, 0x0045, 0x0046, 0x0047,
		0x0048, 0x0049, 0x004A, 0x004B, 0x004C, 0x004D, 0x004E, 0x004F,
		0x0050, 0x0051, 0x0052, 0x0053, 0x0054, 0x0055, 0x0056, 0x0057,
		0x0058, 0x0059, 0x005A, 0x005B, 0x005C, 0x005D, 0x005E, 0x005F,
		0x0060, 0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067,
		0x0068, 0x0069, 0x006A, 0x006B, 0x006C, 0x006D, 0x006E, 0x006F,
		0x0070, 0x0071, 0x0072, 0x0073, 0x0074, 0x0075, 0x0076, 0x0077,
		0x0078, 0x0079, 0x007A, 0x007B, 0x007C, 0x007D, 0x007E, 0x2302,
		0x2500, 0x2501, 0x2502, 0x2503, 0x2504, 0x2505, 0x2506, 0x2507,
		0x2508, 0x2509, 0x250A, 0x250B, 0x250C, 0x250D, 0x250E, 0x250F,
		0x2510, 0x2511, 0x2512, 0x2513, 0x2514, 0x2515, 0x2516, 0x2517,
		0x2518, 0x2519, 0x251A, 0x251B, 0x251C, 0x251D, 0x251E, 0x251F,
		0x2520, 0x2521, 0x2522, 0x2523, 0x2524, 0x2525, 0x2526, 0x2527,
		0x2528, 0x2529, 0x252A, 0x252B, 0x252C, 0x252D, 0x252E, 0x252F,
		0x2530, 0x2531, 0x2532, 0x2533, 0x2534, 0x2535, 0x2536, 0x2537,
		0x2538, 0x2539, 0x253A, 0x253B, 0x253C, 0x253D, 0x253E, 0x253F,
		0x2540, 0x2541, 0x2542, 0x2543, 0x2544, 0x2545, 0x2546, 0x2547,
		0x2548, 0x2549, 0x254A, 0x254B, 0x254C, 0x254D, 0x254E, 0x254F,
		0x2550, 0x2551, 0x2552, 0x2553, 0x2554, 0x2555, 0x2556, 0x2557,
		0x2558, 0x2559, 0x255A, 0x255B, 0x255C, 0x255D, 0x255E, 0x255F,
		0x2560, 0x2561, 0x2562, 0x2563, 0x2564, 0x2565, 0x2566, 0x2567,
		0x2568, 0x2569, 0x256A, 0x256B, 0x256C, 0x256D, 0x256E, 0x256F,
		0x2570, 0x2571, 0x2572, 0x2573, 0x2574, 0x2575, 0x2576, 0x2577,
		0x2578, 0x2579, 0x257A, 0x257B, 0x257C, 0x257D, 0x257E, 0x257F
	]
};

Nuru.prototype.CP437 = {
	"name": "cp437",
	"type": 2,
	"ch_key": 32,
	"fg_key": 0,
	"bg_key": 0,
	"userdata": 0,
	"data": [
		0x0000, 0x263A, 0x263B, 0x2665, 0x2666, 0x2663, 0x2660, 0x2022,
		0x25D8, 0x25CB, 0x25D8, 0x2642, 0x2640, 0x266A, 0x266B, 0x263C,
		0x25BA, 0x25C4, 0x2195, 0x203C, 0x00B6, 0x00A7, 0x25AC, 0x21A8,
		0x2191, 0x2193, 0x2192, 0x2190, 0x221F, 0x2194, 0x25B2, 0x25BC,
		0x0020, 0x0021, 0x0022, 0x0023, 0x0024, 0x0025, 0x0026, 0x0027,
		0x0028, 0x0029, 0x002A, 0x002B, 0x002C, 0x002D, 0x002E, 0x002F, 
		0x0030, 0x0031, 0x0032, 0x0033, 0x0034, 0x0035, 0x0036, 0x0037,
		0x0038, 0x0039, 0x003A, 0x003B, 0x003C, 0x003D, 0x003E, 0x003F,
		0x0040, 0x0041, 0x0042, 0x0043, 0x0044, 0x0045, 0x0046, 0x0047,
		0x0048, 0x0049, 0x004A, 0x004B, 0x004C, 0x004D, 0x004E, 0x004F,
		0x0050, 0x0051, 0x0052, 0x0053, 0x0054, 0x0055, 0x0056, 0x0057,
		0x0058, 0x0059, 0x005A, 0x005B, 0x005C, 0x005D, 0x005E, 0x005F,
		0x0060, 0x0061, 0x0062, 0x0063, 0x0064, 0x0065, 0x0066, 0x0067,
		0x0068, 0x0069, 0x006A, 0x006B, 0x006C, 0x006D, 0x006E, 0x006F,
		0x0070, 0x0071, 0x0072, 0x0073, 0x0074, 0x0075, 0x0076, 0x0077,
		0x0078, 0x0079, 0x007A, 0x007B, 0x007C, 0x007D, 0x007E, 0x2302,
		0x00C7, 0x00FC, 0x00E9, 0x00E2, 0x00E4, 0x00E0, 0x00E5, 0x00E7,
		0x00EA, 0x00EB, 0x00E8, 0x00EF, 0x00EE, 0x00EC, 0x00C4, 0x00C5,
		0x00C9, 0x00E6, 0x00C6, 0x00F4, 0x00F6, 0x00F2, 0x00FB, 0x00F9,
		0x00FF, 0x00D6, 0x00DC, 0x00A2, 0x00A3, 0x00A5, 0x20A7, 0x0192,
		0x00E1, 0x00ED, 0x00F3, 0x00FA, 0x00F1, 0x00D1, 0x00AA, 0x00BA,
		0x00BF, 0x2310, 0x00AC, 0x00BD, 0x00BC, 0x00A1, 0x00AB, 0x00BB,
		0x2591, 0x2592, 0x2593, 0x2502, 0x2524, 0x2561, 0x2562, 0x2556,
		0x2555, 0x2563, 0x2551, 0x2557, 0x255D, 0x255C, 0x255B, 0x2510,
		0x2514, 0x2543, 0x252C, 0x251C, 0x2500, 0x253C, 0x255E, 0x255F,
		0x255A, 0x2554, 0x2569, 0x2566, 0x2560, 0x2550, 0x256C, 0x2567,
		0x2568, 0x2564, 0x2565, 0x2559, 0x2558, 0x2552, 0x2553, 0x256B,
		0x256A, 0x2518, 0x250C, 0x2588, 0x2584, 0x258C, 0x2590, 0x2580,
		0x03B1, 0x00DF, 0x0393, 0x03C0, 0x03A3, 0x03C3, 0x00B5, 0x03C4,
		0x03A6, 0x0398, 0x03A9, 0x03B4, 0x221E, 0x03C6, 0x03B5, 0x2229,
		0x2261, 0x00B1, 0x2265, 0x2264, 0x2320, 0x2321, 0x00F7, 0x2248,
		0x00B0, 0x2219, 0x00B7, 0x221A, 0x207F, 0x00B2, 0x25A0, 0x00A0
	]
};

// xterm color variants
// https://en.wikipedia.org/wiki/ANSI_escape_code#3-bit_and_4-bit
Nuru.prototype.ANSI4 = [
	0x000000, 0xcd0000, 0x00cd00, 0xcdcd00, 0x0000ee, 0xcd00cd, 0x00cdcd, 0xe5e5e5,
	0x7f7f7f, 0xff0000, 0x00ff00, 0xffff00, 0x5c5cff, 0xff00ff, 0x00ffff, 0xffffff
];

// https://en.wikipedia.org/wiki/ANSI_escape_code#8-bit
Nuru.prototype.ANSI8 = [
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

Nuru.prototype.on_files = function(evt)
{
	let files = evt.target.files;
	let type = evt.target.getAttribute("data-nuru-type");
	let handler = this["load_" + type].bind(this);
	let num_files = files.length;

	for (let i = 0; i < num_files; ++i)
	{
		let reader = new FileReader();
		reader.addEventListener("load", handler);
		reader.readAsArrayBuffer(files[i]);
	}
};

Nuru.prototype.open_img = function()
{
	NuruUtils.prompt_for_file("img", false, this.on_files.bind(this));
};

Nuru.prototype.open_pal = function()
{
	NuruUtils.prompt_for_file("pal", false, this.on_files.bind(this));
};

Nuru.prototype.save_img = function(filename)
{
	console.log("save_img() not implemented");
}

Nuru.prototype.load_img = function(evt)
{
	console.log("load_img() not implemented");
}

Nuru.prototype.save_pal = function(filename)
{
	let data = this.glyph_pal.save_to_buffer();
	NuruUtils.download_data(data, filename);
};

Nuru.prototype.load_pal = function(evt)
{
	let buffer = evt.target.result;
	this.glyph_pal.load_from_buffer(buffer);
};

Nuru.prototype.to_col = function(hex)
{
	let col = hex.toString(16);
	while (col.length < 6) { col = "0" + col; }
	return "#" + col;
};

/*
Nuru.prototype.element_by_attr = function(attr)
{
	return document.querySelector("[" + attr + "]");
};

Nuru.prototype.elements_by_attr = function(attr)
{
	return document.querySelectorAll("[" + attr + "]");
};
*/

Nuru.prototype.ele_by_attr = function(attr, singular=false)
{
	let eles = document.querySelectorAll("[" + attr + "]");
	return singular ? eles[0] : eles;
};

Nuru.prototype.init_glyphs_panel = function(attr, w, h)
{
	this.glyphs_root = this.ele_by_attr(attr, true);
	this.glyphs = new NuruTerm(this.glyphs_root, w, h);
	for (let r = 0; r < h; ++r)
	{
		for (let c = 0; c < w; ++c)
		{
			let idx = r * w + c;
			let ch = this.glyph_pal.get_codepoint(idx);
			let glyph = this.glyph_pal.get_glyph(idx);

			let cell = this.glyphs.get_cell_at(c, r);
			let cell_attrs = { "np": 0, "ch": ch };
			
			if (idx == this.ch)
			{
				cell.classList.add("selected");
			}

			if (!NuruUtils.glyph_is_printable(glyph))
			{
				cell.classList.add("non-printable");
				cell_attrs.np = 1;
				glyph = this.glyph_pal.get_space_glyph();
			}

			this.glyphs.set_cell(cell, glyph, null, null, cell_attrs);
		}
	}

	this.glyphs_root.addEventListener('click', this.on_click_glyphs.bind(this));
};

Nuru.prototype.init_colors_panel = function(attr, w, h)
{
	this.colors_root = this.ele_by_attr(attr, true);
	this.colors = new NuruTerm(this.colors_root, w, h);
	for (let r = 0; r < h; ++r)
	{
		for (let c = 0; c < w; ++c)
		{
			let idx = r * w +c;
			let col = this.to_col(this.ANSI8[idx]);

			let cell = this.colors.get_cell_at(c, r);
			let cell_attrs = { "ch": 32, "fg": "", "bg": this.ANSI8[idx] };

			if (idx == this.fg)
			{
				cell.classList.add("selected-fg");
			}
			if (idx == this.bg)
			{
				cell.classList.add("selected-bg");
			}

			cell.setAttribute("title", idx + ": " + col);

			this.colors.set_cell(cell, " ", col, col, cell_attrs);
		}
	}

	this.colors_root.addEventListener('click', this.on_click_colors.bind(this));
};

Nuru.prototype.init_image = function()
{
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
};

Nuru.prototype.init_term = function(attr, w, h)
{
	this.term_root = this.ele_by_attr(attr, true);
	if (!this.term_root) { return false };
	this.term = new NuruTerm(this.term_root, w, h);
	
	let handler = this.on_mouse_term.bind(this);
	this.term_root.addEventListener('click',      handler);
	this.term_root.addEventListener('mouseover',  handler);
	this.term_root.addEventListener('mousedown',  handler);
	this.term_root.addEventListener('mouseup',    handler);
	this.term_root.addEventListener('mouseleave', handler);
};

Nuru.prototype.init_hotkeys = function(attr, callback)
{
	let hotkey_elements = this.ele_by_attr(attr, false);
	let key = null;
	for (let hke of hotkey_elements)
	{
		key = hke.getAttribute(attr).toLowerCase();
		this.hotkeys[key] = hke;
	}
	
	// catch keyboard events
	document.addEventListener("keydown", callback.bind(this));
	document.addEventListener("keyup",   callback.bind(this));
}

Nuru.prototype.init_layer_buttons = function(attr, callback)
{
	let layers = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let layer of layers)
	{
		this.layers[layer.getAttribute(attr)] = layer;
		layer.addEventListener("click", handler);
	}
}

Nuru.prototype.init_action_buttons = function(attr, callback)
{
	let actions = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let action of actions)
	{
		this.actions[action.getAttribute(attr)] = action;
		action.addEventListener("click", handler);
	}
}

// Make fieldsets collapsible
Nuru.prototype.init_fieldsets = function(selector, callback)
{
	let fieldset_labels = document.querySelectorAll(selector);
	let handler = callback.bind(this);
	for (let label of fieldset_labels)
	{
		label.addEventListener("click", handler);
	}
}

// Toolbox Buttons
Nuru.prototype.init_tools = function(attr, callback)
{
	let tools = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let tool of tools)
	{
		tool.addEventListener("click", handler);
		this.tools[tool.getAttribute(attr)] = tool;
	}
}

// Other Buttons
Nuru.prototype.init_buttons = function(attr, callback)
{
	let buttons = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let button of buttons)
	{
		button.addEventListener("click", handler);
	}
};

// Input Fields
Nuru.prototype.init_inputs = function(attr, callback)
{
	// find all option input fields, save a reference, add a change handler
	let inputs = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let input of inputs)
	{
		input.addEventListener('change', handler);
		this.inputs[input.getAttribute(attr)] = input;
	}
};

Nuru.prototype.init = function()
{
	// Initialize form input fields
	this.init_inputs("data-nuru-opt", this.on_input);
	
	// Initialize image (fetches value from input fields)
	this.init_image();

	// Initialize the terminal (canvas, drawing area)
	this.init_term("data-nuru-term", this.image.cols, this.image.rows);

	// Get a standard glyph panel (ASCII)
	this.glyph_pal = new NuruPalette();
	
	this.init_glyphs_panel("data-nuru-glyphs", 16, 16);
	this.init_colors_panel("data-nuru-colors", 16, 16);
	
	// brush, glyph, fgcol, bgcol
	let panels = document.querySelectorAll("[data-nuru-panel]");
	for (let i = 0; i < panels.length; ++i)
	{
		cell = document.createElement("pre");
		cell.classList.add("cell");
		cell.innerHTML = " ";
		panels[i].appendChild(cell);
		this.panels[panels[i].getAttribute("data-nuru-panel")] = panels[i];
	}

	this.init_hotkeys("data-nuru-hotkey", this.on_key);
	this.init_buttons("data-nuru-btn", this.on_button);
	this.init_layer_buttons("data-nuru-layer", this.on_layer);
	this.init_action_buttons("data-nuru-action", this.on_action);
	
	this.init_tools("data-nuru-tool", this.on_tool);
	this.init_fieldsets("fieldset > label", this.on_click_fieldset);

	// brush slots
	let slots = document.querySelectorAll("[data-nuru-slot]");
	handler = this.on_slot.bind(this);
	for (let i = 0; i < slots.length; ++i)
	{
		slots[i].addEventListener("click", handler);
		this.slots.push(slots[i]);
		slots[i].appendChild(this.new_cell());
	}
	
	this.set_css_var("term-fg", this.get_input_val("term-fg"));
	this.set_css_var("term-bg", this.get_input_val("term-bg"));
	
	this.set_brush(this.ch, this.fg, this.bg);
	this.select_tool("pencil");
	this.select_layer("fg");
	this.select_action("set");
};

Nuru.prototype.set_input_val = function(name, val)
{
	let input = this.inputs[name];
	if (!input) return;
	input.value = val;
};

Nuru.prototype.get_input_val = function(name)
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
			return Number.isInteger(input.value) ? 
				parseInt(input.value) : input.value;
		case "checkbox":
		case "radio":
			return input.checked;
		default:
			console.log("get_input_val(): input type not supported");
			return undefined;
	}
};

Nuru.prototype.set_css_var = function(name, value)
{
	let root = document.querySelector(":root");
	root.style.setProperty("--" + name, value);
};

Nuru.prototype.redraw_term = function()
{
	let ch = null;
	let fg = null;
	let bg = null;

	let line = null;
	let cell = null;

	let lines = this.term.childNodes;

	for (let r = 0; r < lines.length; ++r)
	{
		line = lines[r];
		for (let c = 0; c < line.childNodes.length; ++c)
		{
			cell = line.childNodes[c];

			ch = cell.getAttribute("data-nuru-ch");
			fg = cell.getAttribute("data-nuru-fg");
			bg = cell.getAttribute("data-nuru-bg");

			//cell.innerHTML             = this.glyph_pal.codepoints[ch];
			cell.innerHTML             = this.glyph_pal.get_glyph(ch);
			cell.style.color           = this.get_fg_css(fg);
			cell.style.backgroundColor = this.get_bg_css(bg); 
		}
	}
};

Nuru.prototype.new_line = function(row)
{
	let line = document.createElement("div");
	line.classList.add("line", "r"+row);
	return line;
};

Nuru.prototype.new_cell = function(row, col)
{
	let cell = document.createElement("pre");
	cell.classList.add("cell");
	if (row) {
		cell.classList.add("r"+row);
		cell.setAttribute("data-nuru-row", row);

	}
	if (col) {
		cell.classList.add("c"+col);
		cell.setAttribute("data-nuru-col", col);
	}
	//cell.setAttribute("data-nuru-ch", this.glyph_pal.get_space_index());
	cell.setAttribute("data-nuru-ch", this.get_input_val("ch-key"));
	cell.setAttribute("data-nuru-fg", this.get_input_val("fg-key"));
	cell.setAttribute("data-nuru-bg", this.get_input_val("bg-key")); 
	cell.innerHTML = this.glyph_pal.get_space_glyph();
	return cell;
}

Nuru.prototype.resize_term = function()
{
	let cols = this.get_input_val("cols");
	let rows = this.get_input_val("rows");
	this.image.resize(cols, rows);
	
	//resize(cols, rows, ch, fg, bg, ch_idx, fg_idx, bg_idx)
	// TODO	
	this.term.resize(cols, rows);
};

Nuru.prototype.reset_term = function()
{
	let cells = this.term_root.querySelectorAll(".cell");
	for (let i = 0; i < cells.length; ++i)
	{
		this.del_cell(cells[i]);
	}
};

Nuru.prototype.crop_term = function()
{
	let rows = 1;
	let cols = 1;

	let lines = this.term.childNodes;
	let cells = null;

	//let ch_none = this.glyph_pal.get_space_index();
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
			ch = parseInt(cells[c].getAttribute("data-nuru-ch"));
			fg = parseInt(cells[c].getAttribute("data-nuru-fg"));
			bg = parseInt(cells[c].getAttribute("data-nuru-bg"));

			if (ch != ch_none || fg != fg_none || bg != bg_none)
			{
				rows = Math.max(rows, r+1);
				cols = Math.max(cols, c+1);
			}
		}
	}

	this.set_input_val("rows", rows);
	this.set_input_val("cols", cols);
	this.resize_term();
};

Nuru.prototype.on_slot = function(evt)
{
	let ele = evt.currentTarget;
	let opt = ele.getAttribute("data-nuru-slot");

	let cell = ele.querySelector(".cell");
	let ch = parseInt(cell.getAttribute("data-nuru-ch"));
	let fg = parseInt(cell.getAttribute("data-nuru-fg"));
	let bg = parseInt(cell.getAttribute("data-nuru-bg"));

	if (this.action == "set")
	{
		this.set_cell(ele.querySelector(".cell"));
	}
	else
	{
		this.set_brush(ch, fg, bg);
	}
};

Nuru.prototype.select_action = function(which="set")
{
	this.actions[this.action].classList.remove("selected");
	this.action = which;
	this.actions[this.action].classList.add("selected")
};

Nuru.prototype.select_layer = function(which="fg")
{
	this.layers[this.layer].classList.remove("selected");
	this.layer = which;
	this.layers[this.layer].classList.add("selected")
};

Nuru.prototype.select_tool = function(which="pencil")
{
	if (this.tool)
	{
		this.tools[this.tool].classList.remove("selected");
		this.term_root.classList.remove(this.tool);
	}
	this.tool = which;
	this.tools[this.tool].classList.add("selected");
	this.term_root.classList.add(this.tool);
};

Nuru.prototype.on_tool = function(evt)
{
	let btn = evt.currentTarget;
	let opt = btn.getAttribute("data-nuru-tool");

	this.select_tool(opt);
};

Nuru.prototype.on_action = function(evt)
{
	let btn = evt.currentTarget;
	let opt = btn.getAttribute("data-nuru-action");

	this.select_action(opt);
}

Nuru.prototype.on_layer = function(evt)
{
	let btn = evt.currentTarget;
	let opt = btn.getAttribute("data-nuru-layer");

	this.select_layer(opt);
}

Nuru.prototype.on_button = function(evt)
{
	let btn = evt.currentTarget;
	let opt = btn.getAttribute("data-nuru-btn");
	
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
			this.reset_term();
			break;
		case "pal-save":
			this.save_pal(this.glyph_pal.name + ".nup");
			break;
		case "pal-open":
			this.open_pal();
			break;
		default:
			console.log("Not implemented: " + opt);
	}
};

Nuru.prototype.on_input = function(evt)
{
	let opt = evt.target.getAttribute("data-nuru-opt");
	let val = evt.target.value;

	// update the options dict with the new value
	console.log(opt + ": " + val);

	// optionally do some more stuff
	switch (opt)
	{
		case "term-fg":
			this.set_css_var("term-fg", evt.target.value);
			break;
		case "term-bg":
			this.set_css_var("term-bg", evt.target.value);
			break;
		case "cols":
		case "rows":
			this.resize_term();
			break;
		case "ch-key":
		case "fg-key":
		case "bg-key":
			this.redraw_term();
			break;
		default:
			console.log("Not implemented: " + opt);
	}
};

Nuru.prototype.on_click_fieldset = function(evt)
{
	evt.currentTarget.parentNode.classList.toggle("collapsed");
};

Nuru.prototype.on_key = function(evt)
{
	//evt.preventDefault();
	//console.log("key = " + evt.key + " | code = " + evt.code);

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
};

Nuru.prototype.get_fg_css = function(color=null)
{
	let fg = color === null ? this.fg : color;
	return (fg == this.get_input_val("fg-key")) ? "inherit" : this.to_col(this.ANSI8[fg]);
};

Nuru.prototype.get_bg_css = function(color=null)
{
	let bg = color === null ? this.bg : color;
	return (bg == this.get_input_val("bg-key")) ? "inherit" : this.to_col(this.ANSI8[bg]);
};

Nuru.prototype.set_cell = function(cell, ch=null, fg=null, bg=null)
{
	let new_ch = ch===null ? this.ch : ch;
	let new_fg = fg===null ? this.fg : fg;
	let new_bg = bg===null ? this.bg : bg;

	cell.innerHTML             = this.glyph_pal.get_glyph(new_ch);
	cell.style.color           = this.get_fg_css(fg); 
	cell.style.backgroundColor = this.get_bg_css(bg); 

	cell.setAttribute("data-nuru-ch", new_ch);
	cell.setAttribute("data-nuru-fg", new_fg);
	cell.setAttribute("data-nuru-bg", new_bg);
};

Nuru.prototype.del_cell = function(cell)
{
	//cell.innerHTML             = this.glyph_pal.get_space_glyph();
	cell.innerHTML             = this.glyph_pal.get_glyph(this.get_input_val("ch-key"));
	cell.style.color           = "inherit";
	cell.style.backgroundColor = "inherit";

	//cell.setAttribute("data-nuru-ch", this.glyph_pal.get_space_index());
	cell.setAttribute("data-nuru-ch", this.get_input_val("ch-key"));
	cell.setAttribute("data-nuru-fg", this.get_input_val("fg-key"));
	cell.setAttribute("data-nuru-bg", this.get_input_val("bg-key"));

};

Nuru.prototype.on_mouse_term = function(evt)
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

		switch (this.tool)
		{
			case "pencil":
				this.set_cell(cell);
				break;
			case "eraser":
				this.del_cell(cell);
				break;
			case "picker":
				this.set_brush(cell.getAttribute("data-nuru-ch"),
				               cell.getAttribute("data-nuru-fg"),
				               cell.getAttribute("data-nuru-bg"));
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
};

Nuru.prototype.set_glyph = function(ch=null)
{
	let brush = this.panels.brush.querySelector(".cell");
	let glyph = this.panels.glyph.querySelector(".cell");
	
	//this.ch = ch === null ? this.glyph_pal.get_space_index() : ch;
	this.ch = ch===null ? this.get_input_val("ch-key") : ch;

	brush.innerHTML = this.glyph_pal.get_glyph(this.ch);
	glyph.innerHTML = this.glyph_pal.get_glyph(this.ch);

	this.select_cell_idx(this.glyphs, this.ch);
};

Nuru.prototype.set_fgcol = function(fg=null)
{
	let brush = this.panels.brush.querySelector(".cell");
	let fgcol = this.panels.fgcol.querySelector(".cell");

	this.fg = fg == null ? this.get_input_val("fg-key") : fg;

	brush.style.color           = this.get_fg_css(); 
	fgcol.style.backgroundColor = this.to_col(this.ANSI8[fg]); //this.get_fg_css();

	this.select_cell_idx(this.colors, this.fg, "selected-fg");
};

Nuru.prototype.set_bgcol = function(bg=null)
{
	let brush = this.panels.brush.querySelector(".cell");
	let bgcol = this.panels.bgcol.querySelector(".cell");

	this.bg = bg == null ? this.get_input_val("bg-key") : bg;

	brush.style.backgroundColor = this.get_bg_css();
	bgcol.style.backgroundColor = this.get_bg_css();

	this.select_cell_idx(this.colors, this.bg, "selected-bg");
};

Nuru.prototype.set_brush = function(ch=null, fg=null, bg=null)
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
};

Nuru.prototype.select_cell_idx = function(panel, idx, classname="selected")
{
	let width = panel.cols;

	let row = Math.floor(idx / width);
	let col = idx % width;

	this.select_cell(panel, row, col, classname);
};

Nuru.prototype.select_cell = function(panel, r, c, classname="selected")
{
	// deselect all cells first (should be only one)
	let cells = panel.root.querySelectorAll("." + classname);
	for (let c = 0; c < cells.length; ++c)
	{
		cells[c].classList.remove(classname);
	}

	// select the desired cell
	let cell = panel.get_cell_at(c, r);
	cell.classList.add(classname);
};

Nuru.prototype.on_click_glyphs = function(evt)
{
	if (!evt.target.classList.contains("cell")) return;

	let cell = evt.target;

	// abort if this is a non-printable char
	let np = parseInt(cell.getAttribute("data-nuru-np"));
	if (np) return;

	let c = parseInt(cell.getAttribute("data-nuru-col"));
	let r = parseInt(cell.getAttribute("data-nuru-row"));
	this.set_brush(r*16+c, null, null);
};

Nuru.prototype.on_click_colors = function(evt)
{
	if (!evt.target.classList.contains("cell")) return;
		
	let cell = evt.target;
	let c = parseInt(cell.getAttribute("data-nuru-col"));
	let r = parseInt(cell.getAttribute("data-nuru-row"));
	let i = (r * 16) + c;

	if (this.layer == "fg")
	{
		this.set_brush(null, i, null);
	}
	else
	{
		this.set_brush(null, null, i);
	}
};
