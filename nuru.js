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
		"default1": 32,
		"default2": 0,
		"userdata": 0,
		"reserved": 0,
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
		this.default1 = null;
		this.default2 = null;
		this.userdata = null;
		this.reserved = null;
		this.data     = null;

		if (buffer)
		{
			this.load_from_buffer(buffer);
		}
		else
		{
			this.name     = NuruPalette.NURUSTD.name;
			this.type     = NuruPalette.NURUSTD.type;
			this.default1 = NuruPalette.NURUSTD.default1;
			this.default2 = NuruPalette.NURUSTD.default2;
			this.userdata = NuruPalette.NURUSTD.userdata;
			this.reserved = NuruPalette.NURUSTD.reserved;
			this.data  = NuruPalette.NURUSTD.data;
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
		return this.default1;
	}

	get_space_glyph()
	{
		return this.get_glyph(this.default1);
	}

	get_space_codepoint()
	{
		return this.get_codepoint(this.default1);
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
		this.default1 = view.getUint8(9);
		this.default2 = view.getUint8(10);

		// header: user data
		this.userdata = view.getUint32(11);

		// header: reserved byte
		this.reserved = view.getUint8(15);

		// payload: unicode code points
		for (let i = 0; i < 256; i += this.type)
		{
			switch (this.type)
			{
				case 1:
					this.data[i] = view.getUint8(i+16);
					break;
				case 2:
					this.data[i] = view.getUint16(i+16);
					break;
				case 3:
					this.data[i]  = (view.getUint8(i+16) << 16);
					this.data[i] |= (view.getUint8(i+17) << 8);
					this.data[i] |= (view.getUint8(i+18) << 0);
					break;
			}
		}

		return true;
	}

	save_to_file(filename=null)
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
	
		// header: index of default fill character (1 byte)
		data[i++] = this.default1;
		data[i++] = this.default2;

		// header: skip 'userdata' (4 bytes) and 'reserved' (1 byte)
		i += 5;
	
		// payload: palette data (256*type bytes)
		let entry = 0;
		for (let d = 0; d < size; ++d)
		{
			entry = this.data[d];

			switch (this.type)
			{
				case 3:
					data[i++] = (0xFF0000 & entry) >> 16;
				case 2:
					data[i++] = (0xFF00 & entry) >> 8;
				case 1:
					data[i++] = (0x00FF & entry);
					break;
			}
		}
	
		NuruUtils.download_data(data, filename ? filename : this.name + ".nup");
	};
};

class NuruPanel
{
	constructor(rows=1, cols=1)
	{
		this.rows = rows;
		this.cols = cols;
	}
};

class NuruImage
{
	// TODO
	static SIGNATURE = "NURUIMG";
	static VERSION   = 1;

	constructor(buffer=null)
	{
		this.glyph_mode = null;
		this.color_mode = null;
		this.mdata_mode = null;
		this.cols       = null;
		this.rows       = null;
		this.fg         = null;
		this.bg         = null;
		this.glyph_pal  = null;
		this.color_pal  = null;
		this.cells      = [];

		if (buffer)
		{
			this.load_from_buffer(buffer);
		}
		else
		{
			// TODO
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

	/*
	save_to_file(filename=null, term)
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
	
		// default colors (2 bytes)
		data[i++] = 0xFF & this.fg_key; // 0x0F; // foreground color
		data[i++] = 0xFF & this.bg_key; // 0x01; // background color 
	
		// default palette name (7 bytes)
		data.set(NuruUtils.string_to_array(this.glyph_pal, 7), i);
		i += 7;
	
		// meta / signature / padding (8 bytes, leave empty)
		data.set(NuruUtils.string_to_array(this.color_pal, 7), i);
		i += 7;
	
		// reserved byte
		i += 8;
	
		// image data
		let ch = 0;
		let fg = 0;
		let bg = 0;
	
		let lines = term.childNodes;
		let cells = null;
	
		if (lines.length != this.rows)
		{
			console.log("Discrepancy between actual and assumed image size!");
			return false;
		}
	
		for (let r = 0; r < this.rows; ++r)
		{
			let cells = lines[r].childNodes;
			if (cells.length != this.cols)
			{
				console.log("Discrepancy between actual and assumed image size!");
				return false;
			}
			for (let c = 0; c < this.cols; ++c)
			{
				ch = parseInt(cells[c].getAttribute("data-nuru-ch"));
				fg = parseInt(cells[c].getAttribute("data-nuru-fg"));
				bg = parseInt(cells[c].getAttribute("data-nuru-bg"));
	
				ch_val = this.glyph_pal.get_codepoint(ch);
	
				switch (this.options["glyph-mode"])
				{
					case 1: // ASCII char = 8 bits = 1 byte
						data[i++] = 0xFF & ch_val;
						break;
					case 2: // Unicode code points = 16 bits = 2 bytes
						data[i++] = (0xFF00 & ch_val) >> 8;
						data[i++] = (0x00FF & ch_val);
						break;
					case 129: // Index into glyph palette
						data[i++] = ch;
						break;
				}
	
				// TODO need to take palette in mind (if any)
				switch (this.options["color-mode"])
				{
					case 1:
						data[i]  = fg << 4;
						data[i] |= bg;
						i++;
						break;
					case 2:
						data[i++] = fg;
						data[i++] = bg;
						break;
					case 130:
						data[i++] = fg;
						data[i++] = bg;
						break;
				}
			}
		}
	
		this.download_data(data, filename);
	};
	*/
};

function Nuru()
{
	// term / canvas
	this.term = null;
	this.cols = 0;
	this.rows = 0;

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
	this.options = {};
	this.inputs = {};
	this.slots = [];
	this.tools = {};
	this.panels = {}; // panels are the one-cell display things
	this.layers = {};
	this.actions = {};
	this.hotkeys = {};
};

Nuru.prototype.CP437 = {
	"name": "cp437",
	"type": 2,
	"default1": 32,
	"default2": 0,
	"userdata": 0,
	"reserved": 0,
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

Nuru.prototype.save_img = function(filename)
{
	let cols = parseInt(this.options["cols"]);
	let rows = parseInt(this.options["rows"]);

	let glyph_mode = parseInt(this.options["glyph-mode"]);
	let color_mode = parseInt(this.options["color-mode"]);
	let mdata_mode = parseInt(this.options["mdata-mode"]);

	let glyph_size = 0x0F & glyph_mode; 
	let color_size = 0x0F & color_mode; 
	let mdata_size = 0x0F & mdata_mode; 

	// Now we can calculate the total file size (payload + header)
	let size = (cols * rows * (glyph_size + color_size + mdata_size)) + 32;

	let data = new Uint8Array(size);
	let i = 0;

	// file format signature (7 bytes)
	data.set(NuruUtils.string_to_array(this.nui_sig, 7), i);
	i += 7;
	data[i++] = this.nui_ver; // 1 - file format version

	// data format (3 bytes)
	data[i++] = 0xFF & glyph_mode;
	data[i++] = 0xFF & color_mode;
	data[i++] = 0xFF & mdata_mode;

	// image format (4 bytes)
	data[i++] = (0xFF00 & cols) >> 8; // image width
	data[i++] = (0x00FF & cols);      // image width
	data[i++] = (0xFF00 & rows) >> 8; // image height
	data[i++] = (0x00FF & rows);      // image height

	// default colors (2 bytes)
	data[i++] = 0xFF & parseInt(this.options["fg-key"]); // 0x0F; // foreground color
	data[i++] = 0xFF & parseInt(this.options["bg-key"]); // 0x01; // background color 

	// default palette name (7 bytes)
	data.set(NuruUtils.string_to_array(this.options["glyph_pal"], 7), i, 0);
	i += 7;

	// meta / signature / padding (8 bytes, leave empty)
	data.set(NuruUtils.string_to_array(this.options["color_pal"], 7), i, 0);
	i += 7;

	// reserved byte
	i += 1;

	// image data
	let ch = 0;
	let fg = 0;
	let bg = 0;

	let lines = this.term.childNodes;
	let cells = null;

	if (lines.length != rows)
	{
		console.log("Discrepancy between actual and assumed image size!");
		return false;
	}

	for (let r = 0; r < rows; ++r)
	{
		let cells = lines[r].childNodes;
		if (cells.length != cols)
		{
			console.log("Discrepancy between actual and assumed image size!");
			return false;
		}
		for (let c = 0; c < cols; ++c)
		{
			ch = parseInt(cells[c].getAttribute("data-nuru-ch"));
			fg = parseInt(cells[c].getAttribute("data-nuru-fg"));
			bg = parseInt(cells[c].getAttribute("data-nuru-bg"));

			ch_val = this.glyph_pal.get_codepoint(ch);
			console.log(ch_val);

			switch (glyph_mode)
			{
				case 1: // ASCII char = 8 bits = 1 byte
					data[i++] = 0xFF & ch_val;
					break;
				case 2: // Unicode code points = 16 bits = 2 bytes
					data[i++] = (0xFF00 & ch_val) >> 8;
					data[i++] = (0x00FF & ch_val);
					break;
				case 129: // Index into glyph palette
					data[i++] = ch;
					break;
			}

			// TODO need to take palette in mind (if any)
			switch (color_mode)
			{
				case 1:
					data[i]  = fg << 4;
					data[i] |= bg;
					i++;
					break;
				case 2:
					data[i++] = fg;
					data[i++] = bg;
					break;
				case 130:
					data[i++] = fg;
					data[i++] = bg;
					break;
			}
		}
	}

	NuruUtils.download_data(data, filename);
};

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

Nuru.prototype.load_img = function(evt)
{
	let buffer = evt.target.result;
	let filesize = buffer.byteLength;

	if (filesize < 32)
	{
		console.log("File too small");
		return false;
	}

	let view = new DataView(buffer);

	let signature = NuruUtils.array_to_string(new Uint8Array(buffer.slice(0, 7)));
	if (signature != this.nui_sig)
	{
		console.log("File is not a nuru image file");
		return false;
	}
	let version = view.getUint8(7);
	if (version > this.nui_ver)
	{
		console.log("File is of newer version than can be parsed");
		return false;
	}

	let glyph_mode = view.getUint8(8);
	let color_mode = view.getUint8(9);
	let mdata_mode = view.getUint8(10);
	
	let cols = view.getUint16(11, false);
	let rows = view.getUint16(13, false);
	let size = cols * rows;

	if (filesize < (size + 32))
	{
		console.log("File smaller than advertised");
		return false;
	}

	let fg_key = view.getUint8(15);
	let bg_key = view.getUint8(16);

	let glyph_pal = NuruUtils.array_to_string(new Uint8Array(buffer.slice(17, 24)));
	let color_pal = NuruUtils.array_to_string(new Uint8Array(buffer.slice(24, 31)));

	if (glyph_pal.toLowerCase() != this.options["glyph_pal"].toLowerCase())
	{
		console.log("Palette mismatch");
	}

	this.options["cols"] = cols;
	this.options["rows"] = rows;
	this.inputs["cols"].value = cols;
	this.inputs["rows"].value = rows;
	this.resize_term();

	this.options["fg-key"] = fg_key;
	this.options["bg-key"] = bg_key;
	this.inputs["fg-key"].value = fg_key;
	this.inputs["bg-key"].value = bg_key; 

	// payload
	let ch = null;
	let fg = null;
	let bg = null;

	let lines = this.term.childNodes;
	let cells = null;
	let i = 32;
	for (let r = 0; r < rows; ++r)
	{
		cells = lines[r].childNodes;
		for (let c = 0; c < cols; ++c)
		{
			switch (glyph_mode)
			{
				case 1:
					ch = view.getUint8(i++);
					break;
				case 2:
					ch = view.getUint16(i+=2);
					break;
				case 129:
					ch = view.getUint8(i++);
					break;
			}

			switch (color_mode)
			{
				case 1:
					let col = view.getUint8(i++);
					fg = 0xF0 & col;
					bg = 0x0F & col;
					break;
				case 2:
				case 130:
					fg = view.getUint8(i++);
					bg = view.getUint8(i++);
					break;
			}

			this.set_cell(cells[c], ch, fg, bg);
		}
	}
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

Nuru.prototype.init = function()
{
	// find the term, can't do jack without
	this.term = document.querySelector("[data-nuru-term]");

	// input fields; they (might) hold initial values
	let opt_inputs = document.querySelectorAll("[data-nuru-opt]");
	let input_handler = this.on_input.bind(this);
	for (let i = 0; i < opt_inputs.length; ++i)
	{
		opt_inputs[i].addEventListener('change', input_handler);
		this.inputs[opt_inputs[i].getAttribute("data-nuru-opt")] = opt_inputs[i];
		this.options[opt_inputs[i].getAttribute("data-nuru-opt")] = opt_inputs[i].value;
	}

	// palette
	//this.glyph_pal = this.glyph_palettes[this.options["palette"]];
	this.glyph_pal = new NuruPalette();

	// resize_term takes care of creating lines and cells as required
	this.resize_term();
	
	// we're interersted in all kinds of mouse events on the terminal
	let handler = this.on_mouse_term.bind(this);
	this.term.addEventListener('click',      handler);
	this.term.addEventListener('mouseover',  handler);
	this.term.addEventListener('mousedown',  handler);
	this.term.addEventListener('mouseup',    handler);
	this.term.addEventListener('mouseleave', handler);

	// GLYPHS PALETTE
	this.glyphs = document.querySelector("[data-nuru-glyphs]");
	for (let r = 0; r < 16; ++r)
	{
		line = document.createElement("div");
		line.classList.add("line", "r"+r);

		for (let c = 0; c < 16; ++c)
		{
			let idx = r*16+c;
			let ch = this.glyph_pal.get_codepoint(idx);
			let glyph = this.glyph_pal.get_glyph(idx);
			cell = document.createElement("pre");
			cell.classList.add("cell", "r"+r, "c"+c);
			cell.setAttribute("data-nuru-np", "0");
			cell.setAttribute("data-nuru-row", r);
			cell.setAttribute("data-nuru-col", c);
			cell.setAttribute("data-nuru-ch", ch);
			cell.setAttribute("title", idx + ": U+" + ch.toString(16));
			cell.innerHTML = glyph;

			if (idx == this.ch)
			{
				cell.classList.add("selected");
			}

			if (!NuruUtils.glyph_is_printable(glyph))
			{
				cell.classList.add("non-printable");
				cell.setAttribute("data-nuru-np", "1");
				cell.innerHTML = this.glyph_pal.get_space_glyph();
			}
			line.appendChild(cell);
		}
		this.glyphs.appendChild(line);
	}

	this.glyphs.addEventListener('click', this.on_click_glyphs.bind(this));

	// COLORS PALETTE

	this.colors = document.querySelector("[data-nuru-colors]");
	this.idx = null;
	for (let r = 0; r < 16; ++r)
	{
		line = document.createElement("div");
		line.classList.add("line", "r"+r);

		for (let c = 0; c < 16; ++c)
		{
			idx = r * 16 +c;
			let col = this.to_col(this.ANSI8[idx]);
			cell = document.createElement("pre");
			cell.classList.add("cell", "r"+r, "c"+c);

			if (idx == this.fg)
			{
				cell.classList.add("selected-fg");
			}
			if (idx == this.bg)
			{
				cell.classList.add("selected-bg");
			}

			cell.setAttribute("data-nuru-row", r);
			cell.setAttribute("data-nuru-col", c);
			cell.setAttribute("data-nuru-ch", 32);
			cell.setAttribute("data-nuru-fg", "");
			cell.setAttribute("data-nuru-bg", "");
			cell.setAttribute("title", idx + ": " + col);
			cell.innerHTML = " ";
			cell.style.backgroundColor = col;
			line.appendChild(cell);
		}
		this.colors.appendChild(line);
	}

	this.colors.addEventListener('click', this.on_click_colors.bind(this));

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

	let hotkey_elements = document.querySelectorAll("[data-nuru-hotkey]");
	let key = null;
	for (let i = 0; i < hotkey_elements.length; ++i)
	{
		key = hotkey_elements[i].getAttribute("data-nuru-hotkey").toLowerCase();
		this.hotkeys[key] = hotkey_elements[i];
	}

	// catch keyboard events
	document.addEventListener("keydown", this.on_key.bind(this));
	document.addEventListener("keyup",   this.on_key.bind(this));

	// buttons
	let buttons = document.querySelectorAll("[data-nuru-btn]");
	handler = this.on_button.bind(this);
	for (let i = 0; i < buttons.length; ++i)
	{
		buttons[i].addEventListener("click", handler);
	}

	// layer buttons
	let layers = document.querySelectorAll("[data-nuru-layer]");
	handler = this.on_layer.bind(this);
	for (let i = 0; i < layers.length; ++i)
	{
		this.layers[layers[i].getAttribute("data-nuru-layer")] = layers[i];
		layers[i].addEventListener("click", handler);
	}
	this.select_layer();

	// action buttons
	let actions = document.querySelectorAll("[data-nuru-action]");
	handler = this.on_action.bind(this);
	for (let i = 0; i < actions.length; ++i)
	{
		this.actions[actions[i].getAttribute("data-nuru-action")] = actions[i];
		actions[i].addEventListener("click", handler);
	}
	this.select_action();
	
	// toolbox buttons
	let tools = document.querySelectorAll("[data-nuru-tool]");
	handler = this.on_tool.bind(this);
	for (let i = 0; i < tools.length; ++i)
	{
		tools[i].addEventListener("click", handler);
		this.tools[tools[i].getAttribute("data-nuru-tool")] = tools[i];
	}

	this.tool = "pencil";
	this.tools[this.tool].classList.add("selected");
	
	// brush slots
	let slots = document.querySelectorAll("[data-nuru-slot]");
	handler = this.on_slot.bind(this);
	for (let i = 0; i < slots.length; ++i)
	{
		slots[i].addEventListener("click", handler);
		this.slots.push(slots[i]);
		slots[i].appendChild(this.new_cell());
	}
	
	// make fieldsets collapsible
	let fieldset_labels = document.querySelectorAll("fieldset > label");
	handler = this.on_click_fieldset.bind(this);
	for (let i = 0; i < fieldset_labels.length; ++i)
	{
		fieldset_labels[i].addEventListener("click", handler);
	}

	this.set_css_var("term-fg", this.options["term-fg"]);
	this.set_css_var("term-bg", this.options["term-bg"]);
	
	this.set_brush(this.ch, this.fg, this.bg);
	this.select_tool(this.tool);

	// MAKE SURE ALL COLORS ARE SET TO "inherit"
	this.reset_term();
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
	cell.setAttribute("data-nuru-ch", this.glyph_pal.get_space_index());
	cell.setAttribute("data-nuru-fg", this.options["fg-key"]);
	cell.setAttribute("data-nuru-bg", this.options["bg-key"]); 
	cell.innerHTML = this.glyph_pal.get_space_glyph();
	return cell;
}

Nuru.prototype.resize_term = function()
{
	// make a copy of the current term
	let clone = this.term.cloneNode(true);

	// remove all children, if any
	this.term.textContent = '';

	let rows = parseInt(this.options["rows"]);
	let cols = parseInt(this.options["cols"]);

	// create new lines and cells, but copy over existing cells
	let line = null;
	for (let r = 0; r < rows; ++r)
	{
		line = this.new_line(r);
		for (let c = 0; c < cols; ++c)
		{
			if (clone.childNodes[r] && clone.childNodes[r].childNodes[c])
			{
				line.appendChild(clone.childNodes[r].childNodes[c].cloneNode(true));
			}
			else
			{
				line.appendChild(this.new_cell(r, c));
			}
		}
		this.term.appendChild(line);
	}
};

Nuru.prototype.reset_term = function()
{
	let cells = this.term.querySelectorAll(".cell");
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

	let ch_none = this.glyph_pal.get_space_index();
	let fg_none = this.options["fg-key"];
	let bg_none = this.options["bg-key"];

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

	this.inputs["rows"].value = rows;
	this.inputs["cols"].value = cols;
	this.options["rows"] = rows;
	this.options["cols"] = cols;
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

Nuru.prototype.select_tool = function(which)
{
	this.tools[this.tool].classList.remove("selected");
	this.term.classList.remove(this.tool);
	this.tool = which;
	this.tools[this.tool].classList.add("selected");
	this.term.classList.add(this.tool);
};

Nuru.prototype.on_tool = function(evt)
{
	let btn = evt.currentTarget;
	let opt = btn.getAttribute("data-nuru-tool");

	this.select_tool(opt);
};

Nuru.prototype.get_opt = function(opt, fallback)
{
	return this.options[opt] ? this.options[opt] : fallback;
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
			this.save_img(this.get_opt("filename", this.filename) + ".nui");
			break;
		case "crop":
			this.crop_term();
			break;
		case "wipe":
			this.reset_term();
			break;
		case "pal-save":
			this.glyph_pal.save_to_file(this.glyph_pal.name + ".nup");
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
	this.options[opt] = val;
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
	return (fg == this.options["fg-key"]) ? "inherit" : this.to_col(this.ANSI8[fg]);
};

Nuru.prototype.get_bg_css = function(color=null)
{
	let bg = color === null ? this.bg : color;
	return (bg == this.options["bg-key"]) ? "inherit" : this.to_col(this.ANSI8[bg]);
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
	cell.innerHTML             = this.glyph_pal.get_space_glyph();
	cell.style.color           = "inherit";
	cell.style.backgroundColor = "inherit";

	cell.setAttribute("data-nuru-ch", this.glyph_pal.get_space_index());
	cell.setAttribute("data-nuru-fg", this.options["fg-key"]);
	cell.setAttribute("data-nuru-bg", this.options["bg-key"]);
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
	
	this.ch = ch === null ? this.glyph_pal.get_space_index() : ch;

	brush.innerHTML = this.glyph_pal.get_glyph(this.ch);
	glyph.innerHTML = this.glyph_pal.get_glyph(this.ch);

	this.select_cell_idx(this.glyphs, this.ch);
};

Nuru.prototype.set_fgcol = function(fg=null)
{
	let brush = this.panels.brush.querySelector(".cell");
	let fgcol = this.panels.fgcol.querySelector(".cell");

	this.fg = fg == null ? this.options["fg-key"] : fg;

	brush.style.color           = this.get_fg_css(); 
	fgcol.style.backgroundColor = this.to_col(this.ANSI8[fg]); //this.get_fg_css();

	this.select_cell_idx(this.colors, this.fg, "selected-fg");
};

Nuru.prototype.set_bgcol = function(bg=null)
{
	let brush = this.panels.brush.querySelector(".cell");
	let bgcol = this.panels.bgcol.querySelector(".cell");

	this.bg = bg == null ? this.options["bg-key"] : bg;

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
	let lines = panel.childNodes;
	let cells = lines[0].childNodes;
	let width = cells.length;

	let row = Math.floor(idx / width);
	let col = idx % width;

	this.select_cell(panel, row, col, classname);
};

Nuru.prototype.select_cell = function(panel, r, c, classname="selected")
{
	// deselect all cells first (should be only one)
	let cells = panel.querySelectorAll("." + classname);
	for (let c = 0; c < cells.length; ++c)
	{
		cells[c].classList.remove(classname);
	}

	// select the desired cell
	let line = panel.childNodes[r];
	let cell = line.childNodes[c];
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
