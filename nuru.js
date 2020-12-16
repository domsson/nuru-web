function Nuru()
{
	// term / canvas
	this.term = null;
	this.cols = 0;
	this.rows = 0;

	// palettes
	this.glyphs = null;
	this.colors = null;

	// brush, brush atoms
	this.brush = null;
	this.fgcol = null;
	this.bgcol = null;

	this.pal = [];

	// current brush values
	this.ch = 32;
	this.fg = 15;
	this.bg = 0;

	//this.space = 32; // TODO needs to come from palette object/file

	// keyboard / mouse
	this.drag = false;

	// currently selected tool
	this.tool = null;
	this.action = "get";
	this.layer = "fg";

	// file signatures etc
	this.nui_sig = "NURUIMG";
	this.nup_sig = "NURUPAL";

	// some other defaults
	this.filename  = "drawing";
	this.signature = "nuruweb";

	// will be filled during init
	this.options = {};
	this.inputs = {};
	this.slots = [];
	this.tools = {};
	this.layers = {};
	this.actions = {};
	this.hotkeys = {};
};

Nuru.prototype.palettes = {
	"CP437": {
		"space": 32,
		"codepoints": [
			"\u0000", "\u263A", "\u263B", "\u2665", "\u2666", "\u2663", "\u2660", "\u2022",
			"\u25D8", "\u25CB", "\u25D8", "\u2642", "\u2640", "\u266A", "\u266B", "\u263C",
			"\u25BA", "\u25C4", "\u2195", "\u203C", "\u00B6", "\u00A7", "\u25AC", "\u21A8",
			"\u2191", "\u2193", "\u2192", "\u2190", "\u221F", "\u2194", "\u25B2", "\u25BC",
			"\u0020", "\u0021", "\u0022", "\u0023", "\u0024", "\u0025", "\u0026", "\u0027",
			"\u0028", "\u0029", "\u002A", "\u002B", "\u002C", "\u002D", "\u002E", "\u002F", 
			"\u0030", "\u0031", "\u0032", "\u0033", "\u0034", "\u0035", "\u0036", "\u0037",
			"\u0038", "\u0039", "\u003A", "\u003B", "\u003C", "\u003D", "\u003E", "\u003F",
			"\u0040", "\u0041", "\u0042", "\u0043", "\u0044", "\u0045", "\u0046", "\u0047",
			"\u0048", "\u0049", "\u004A", "\u004B", "\u004C", "\u004D", "\u004E", "\u004F",
			"\u0050", "\u0051", "\u0052", "\u0053", "\u0054", "\u0055", "\u0056", "\u0057",
			"\u0058", "\u0059", "\u005A", "\u005B", "\u005C", "\u005D", "\u005E", "\u005F",
			"\u0060", "\u0061", "\u0062", "\u0063", "\u0064", "\u0065", "\u0066", "\u0067",
			"\u0068", "\u0069", "\u006A", "\u006B", "\u006C", "\u006D", "\u006E", "\u006F",
			"\u0070", "\u0071", "\u0072", "\u0073", "\u0074", "\u0075", "\u0076", "\u0077",
			"\u0078", "\u0079", "\u007A", "\u007B", "\u007C", "\u007D", "\u007E", "\u2302",
			"\u00C7", "\u00FC", "\u00E9", "\u00E2", "\u00E4", "\u00E0", "\u00E5", "\u00E7",
			"\u00EA", "\u00EB", "\u00E8", "\u00EF", "\u00EE", "\u00EC", "\u00C4", "\u00C5",
			"\u00C9", "\u00E6", "\u00C6", "\u00F4", "\u00F6", "\u00F2", "\u00FB", "\u00F9",
			"\u00FF", "\u00D6", "\u00DC", "\u00A2", "\u00A3", "\u00A5", "\u20A7", "\u0192",
			"\u00E1", "\u00ED", "\u00F3", "\u00FA", "\u00F1", "\u00D1", "\u00AA", "\u00BA",
			"\u00BF", "\u2310", "\u00AC", "\u00BD", "\u00BC", "\u00A1", "\u00AB", "\u00BB",
			"\u2591", "\u2592", "\u2593", "\u2502", "\u2524", "\u2561", "\u2562", "\u2556",
			"\u2555", "\u2563", "\u2551", "\u2557", "\u255D", "\u255C", "\u255B", "\u2510",
			"\u2514", "\u2543", "\u252C", "\u251C", "\u2500", "\u253C", "\u255E", "\u255F",
			"\u255A", "\u2554", "\u2569", "\u2566", "\u2560", "\u2550", "\u256C", "\u2567",
			"\u2568", "\u2564", "\u2565", "\u2559", "\u2558", "\u2552", "\u2553", "\u256B",
			"\u256A", "\u2518", "\u250C", "\u2588", "\u2584", "\u258C", "\u2590", "\u2580",
			"\u03B1", "\u00DF", "\u0393", "\u03C0", "\u03A3", "\u03C3", "\u00B5", "\u03C4",
			"\u03A6", "\u0398", "\u03A9", "\u03B4", "\u221E", "\u03C6", "\u03B5", "\u2229",
			"\u2261", "\u00B1", "\u2265", "\u2264", "\u2320", "\u2321", "\u00F7", "\u2248",
			"\u00B0", "\u2219", "\u00B7", "\u221A", "\u207F", "\u00B2", "\u25A0", "\u00A0"
		]
	},
	"NURUSTD": {
		"space": 32,
		"codepoints": [
			"\u2580", "\u2581", "\u2582", "\u2583", "\u2584", "\u2585", "\u2586", "\u2587",
			"\u2588", "\u2589", "\u258A", "\u258B", "\u258C", "\u258D", "\u258E", "\u258F",
			"\u2590", "\u2591", "\u2592", "\u2593", "\u2594", "\u2595", "\u2596", "\u2597",
			"\u2598", "\u2599", "\u259A", "\u259B", "\u259C", "\u259D", "\u259E", "\u259F",
			"\u0020", "\u0021", "\u0022", "\u0023", "\u0024", "\u0025", "\u0026", "\u0027",
			"\u0028", "\u0029", "\u002A", "\u002B", "\u002C", "\u002D", "\u002E", "\u002F",
			"\u0030", "\u0031", "\u0032", "\u0033", "\u0034", "\u0035", "\u0036", "\u0037",
			"\u0038", "\u0039", "\u003A", "\u003B", "\u003C", "\u003D", "\u003E", "\u003F",
			"\u0040", "\u0041", "\u0042", "\u0043", "\u0044", "\u0045", "\u0046", "\u0047",
			"\u0048", "\u0049", "\u004A", "\u004B", "\u004C", "\u004D", "\u004E", "\u004F",
			"\u0050", "\u0051", "\u0052", "\u0053", "\u0054", "\u0055", "\u0056", "\u0057",
			"\u0058", "\u0059", "\u005A", "\u005B", "\u005C", "\u005D", "\u005E", "\u005F",
			"\u0060", "\u0061", "\u0062", "\u0063", "\u0064", "\u0065", "\u0066", "\u0067",
			"\u0068", "\u0069", "\u006A", "\u006B", "\u006C", "\u006D", "\u006E", "\u006F",
			"\u0070", "\u0071", "\u0072", "\u0073", "\u0074", "\u0075", "\u0076", "\u0077",
			"\u0078", "\u0079", "\u007A", "\u007B", "\u007C", "\u007D", "\u007E", "\u2302",
			"\u2500", "\u2501", "\u2502", "\u2503", "\u2504", "\u2505", "\u2506", "\u2507",
			"\u2508", "\u2509", "\u250A", "\u250B", "\u250C", "\u250D", "\u250E", "\u250F",
			"\u2510", "\u2511", "\u2512", "\u2513", "\u2514", "\u2515", "\u2516", "\u2517",
			"\u2518", "\u2519", "\u251A", "\u251B", "\u251C", "\u251D", "\u251E", "\u251F",
			"\u2520", "\u2521", "\u2522", "\u2523", "\u2524", "\u2525", "\u2526", "\u2527",
			"\u2528", "\u2529", "\u252A", "\u252B", "\u252C", "\u252D", "\u252E", "\u252F",
			"\u2530", "\u2531", "\u2532", "\u2533", "\u2534", "\u2535", "\u2536", "\u2537",
			"\u2538", "\u2539", "\u253A", "\u253B", "\u253C", "\u253D", "\u253E", "\u253F",
			"\u2540", "\u2541", "\u2542", "\u2543", "\u2544", "\u2545", "\u2546", "\u2547",
			"\u2548", "\u2549", "\u254A", "\u254B", "\u254C", "\u254D", "\u254E", "\u254F",
			"\u2550", "\u2551", "\u2552", "\u2553", "\u2554", "\u2555", "\u2556", "\u2557",
			"\u2558", "\u2559", "\u255A", "\u255B", "\u255C", "\u255D", "\u255E", "\u255F",
			"\u2560", "\u2561", "\u2562", "\u2563", "\u2564", "\u2565", "\u2566", "\u2567",
			"\u2568", "\u2569", "\u256A", "\u256B", "\u256C", "\u256D", "\u256E", "\u256F",
			"\u2570", "\u2571", "\u2572", "\u2573", "\u2574", "\u2575", "\u2576", "\u2577",
			"\u2578", "\u2579", "\u257A", "\u257B", "\u257C", "\u257D", "\u257E", "\u257F"
		]
	}
};

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

Nuru.prototype.download_data = function(data, filename)
{
	let a = document.createElement("a");
	document.body.appendChild(a);
	a.style = "display: none";
	
	let blob = new Blob([data], {type: "application/octet-stream"});
	let url = window.URL.createObjectURL(blob);
	a.href = url;
	a.download = filename;
	a.click();
	window.URL.revokeObjectURL(url);
};

Nuru.prototype.save_pal = function(filename)
{
	let size = (this.pal.codepoints.length * 2) + 16;
	let data = new Uint8Array(size);
	let i = 0;

	// header: file format signature (8 bytes)
	data.set(this.str_to_uint8arr(this.nup_sig, 8), i);
	i += 7;
	data[i++] = 0x01; // 1 - file format version

	// header: default fill character (1 byte)
	data[i++] = this.pal.space; // index 32, space in ASCII

	// header: palette name (7 bytes)
	data.set(this.str_to_uint8arr(this.options["palette"], 7), i);
	i += 7;

	// body: palette data
	let cp = 0;
	for (let c = 0; c < this.pal.length; ++c)
	{
		cp = this.pal[c].charCodeAt(0);
		data[i++] = (0xFF00 & cp) >> 8;
		data[i++] = (0x00FF & cp);
	}

	//console.log(data);
	this.download_data(data, filename);
};

Nuru.prototype.save_img = function(filename)
{
	// header is 16 bytes
	// each cell = 1 byte for char, 2 bytes for color

	let cols = this.options["cols"];
	let rows = this.options["rows"];

	let size = (cols * rows * 3) + 32;
	let data = new Uint8Array(size);
	let i = 0;

	// file format signaturei (8 bytes)
	data.set(this.str_to_uint8arr(this.nui_sig, 8), i);
	i += 7;
	data[i++] = 0x01; // 1 - file format version

	// data format (3 bytes)
	data[i++] = 0xFF & this.options["glyph-mode"];
	data[i++] = 0xFF & this.options["color-mode"];
	data[i++] = 0xFF & this.options["mdata-mode"]; 

	// image format (4 bytes)
	data[i++] = (0xFF00 & cols) >> 8; // image width
	data[i++] = (0x00FF & cols);      // image width
	data[i++] = (0xFF00 & rows) >> 8; // image height
	data[i++] = (0x00FF & rows);      // image height

	// default colors (2 bytes)
	data[i++] = 0xFF & this.options["fg-key"]; // 0x0F; // foreground color
	data[i++] = 0xFF & this.options["bg-key"]; // 0x01; // background color 

	// default palette name (7 bytes)
	data.set(this.str_to_uint8arr(this.options["palette"], 7), i);
	i += 7;

	// meta / signature / padding (8 bytes, leave empty)
	data.set(this.str_to_uint8arr(this.options["comment"], 7), i);
	i += 8;

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

			data[i++] = 0xFF & ch;
			data[i++] = 0xFF & fg;
			data[i++] = 0xFF & bg;
		}
	}

	this.download_data(data, filename);
};

Nuru.prototype.str_to_uint8arr = function(str, len, space=32)
{
	let strlen = str.length;
	let arr = new Uint8Array(len);
	for (let i = 0; i < len; ++i)
	{
		arr[i] = i < strlen ? str.charCodeAt(i) : 32;
	}
	return arr;
};

Nuru.prototype.to_col = function(hex)
{
	let col = hex.toString(16);
	while (col.length < 6) { col = "0" + col; }
	return "#" + col;
};

Nuru.prototype.printable = function(ch)
{
	let cp = ch.charCodeAt(0);
	if (cp < 0x0020) return false;
	if (cp > 0x007E && cp < 0x00A0) return false;
	return true;
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
	this.pal = this.palettes[this.options["palette"]];

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
			let ch = this.pal.codepoints[r*16+c];
			cell = document.createElement("pre");
			cell.classList.add("cell", "r"+r, "c"+c);
			cell.setAttribute("data-nuru-np", "0");
			cell.setAttribute("data-nuru-row", r);
			cell.setAttribute("data-nuru-col", c);
			cell.setAttribute("title", (r*16+c) + ": U+" + ch.charCodeAt(0).toString(16));
			cell.innerHTML = ch;

			if (r*16+c == this.ch)
			{
				cell.classList.add("selected");
			}

			if (!this.printable(ch))
			{
				cell.classList.add("non-printable");
				cell.setAttribute("data-nuru-np", "1");
				cell.innerHTML = this.pal.codepoints[this.pal.space];
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

	this.brush = document.querySelector("[data-nuru-brush]");
	cell = document.createElement("pre");
	cell.classList.add("cell");
	cell.innerHTML = this.pal.codepoints[this.ch];
	this.brush.appendChild(cell);

	this.glyph = document.querySelector("[data-nuru-glyph]");
	cell = document.createElement("pre");
	cell.classList.add("cell");
	cell.innerHTML = this.pal.codepoints[this.ch];
	this.glyph.appendChild(cell);

	this.fgcol = document.querySelector("[data-nuru-fgcol]");
	cell = document.createElement("pre");
	cell.classList.add("cell");
	cell.innerHTML = " ";
	this.fgcol.appendChild(cell);

	this.bgcol = document.querySelector("[data-nuru-bgcol]");
	cell = document.createElement("pre");
	cell.classList.add("cell");
	cell.innerHTML = " ";
	this.bgcol.appendChild(cell);

	let hotkey_elements = document.querySelectorAll("[data-nuru-hotkey]");
	let key = null;
	for (let i = 0; i < hotkey_elements.length; ++i)
	{
		key = hotkey_elements[i].getAttribute("data-nuru-hotkey").toLowerCase();
		this.hotkeys[key] = hotkey_elements[i];
	}

	// catch keyboard events
	document.addEventListener("keydown", this.on_key.bind(this));
	document.addEventListener("keyup", this.on_key.bind(this));

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

			cell.innerHTML             = this.pal.codepoints[ch];
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
	cell.setAttribute("data-nuru-ch", this.pal.space);
	cell.setAttribute("data-nuru-fg", this.options["fg-key"]);
	cell.setAttribute("data-nuru-bg", this.options["bg-key"]); 
	cell.innerHTML = this.pal.codepoints[this.pal.space];
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

	let ch_none = this.pal.space;
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
			console.log("Not implemented: " + opt);
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
		case "psave":
			this.save_pal(this.options["palette"] + ".nup");	
			break;
		case "popen":
			console.log(evt);
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
	let fg = color == null ? this.fg : color;
	return (fg == this.options["fg-key"]) ? "inherit" : this.to_col(this.ANSI8[fg]);
};

Nuru.prototype.get_bg_css = function(color=null)
{
	let bg = color == null ? this.bg : color;
	return (bg == this.options["bg-key"]) ? "inherit" : this.to_col(this.ANSI8[bg]);
};

Nuru.prototype.set_cell = function(cell)
{
	cell.innerHTML             = this.pal.codepoints[this.ch];
	cell.style.color           = this.get_fg_css(); 
	cell.style.backgroundColor = this.get_bg_css(); 

	cell.setAttribute("data-nuru-ch", this.ch);
	cell.setAttribute("data-nuru-fg", this.fg);
	cell.setAttribute("data-nuru-bg", this.bg);
};

Nuru.prototype.del_cell = function(cell)
{
	cell.innerHTML             = this.pal.codepoints[this.pal.space];
	cell.style.color           = "inherit";
	cell.style.backgroundColor = "inherit";

	cell.setAttribute("data-nuru-ch", this.pal.space);
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
	let brush = this.brush.querySelector(".cell");
	let glyph = this.glyph.querySelector(".cell");
	
	this.ch = ch == null ? this.pal.space : ch; 

	brush.innerHTML = this.pal.codepoints[this.ch];
	glyph.innerHTML = this.pal.codepoints[this.ch];

	this.select_cell_idx(this.glyphs, this.ch);
};

Nuru.prototype.set_fgcol = function(fg=null)
{
	let brush = this.brush.querySelector(".cell");
	let fgcol = this.fgcol.querySelector(".cell");

	this.fg = fg == null ? this.options["fg-key"] : fg;

	brush.style.color           = this.get_fg_css(); 
	fgcol.style.backgroundColor = this.to_col(this.ANSI8[fg]); //this.get_fg_css();

	this.select_cell_idx(this.colors, this.fg, "selected-fg");
};

Nuru.prototype.set_bgcol = function(bg=null)
{
	let brush = this.brush.querySelector(".cell");
	let bgcol = this.bgcol.querySelector(".cell");

	this.bg = bg == null ? this.options["bg-key"] : bg;

	brush.style.backgroundColor = this.get_bg_css();
	bgcol.style.backgroundColor = this.get_bg_css();

	this.select_cell_idx(this.colors, this.bg, "selected-bg");
};

Nuru.prototype.set_brush = function(ch=null, fg=null, bg=null)
{
	let cell = this.brush.querySelector(".cell");

	if (ch!=null && this.brush)
	{
		this.set_glyph(ch);
	}
	if (fg!=null && this.fgcol)
	{
		this.set_fgcol(fg);
	}
	if (bg!=null && this.bgcol)
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

	if (this.layer == "fg")
	{
		this.set_brush(null, r*16+c, null);
	}
	else
	{
		this.set_brush(null, null, r*16+c);
	}
};
