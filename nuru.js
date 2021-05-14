
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
		for (let i = 0; i < 256; ++i)
		{
			this.data[i] = view.getUint16((i*this.type + 16), false);
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

	static GLYPH_NONE = " ";
	static COLOR_NONE = "inherit";

	constructor(root, cols=64, rows=16)
	{
		this.root  = root;
		this.cols  = cols;
		this.rows  = rows;

		this.resize(this.cols, this.rows);
	}

	static set_cell(cell, ch, fg, bg, attrs)
	{
		cell.innerHTML             = ch ? ch : NuruTerm.GLYPH_NONE;
		cell.style.color           = fg ? fg : NuruTerm.COLOR_NONE; 
		cell.style.backgroundColor = bg ? bg : NuruTerm.COLOR_NONE; 
		NuruTerm.set_cell_attrs(cell, attrs);
	};

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

	static new_cell(col, row, ch, fg, bg, attrs={})
	{
		let cell = document.createElement(NuruTerm.CELL_ELEMENT);
		cell.classList.add(NuruTerm.CELL_CLASS);
		cell.classList.add("c" + col);
		cell.classList.add("r" + row);
		attrs.col = col;
		attrs.row = row;

		NuruTerm.set_cell(cell, ch, fg, bg, attrs);
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
			line = NuruTerm.new_line(r);
			for (let c = 0; c < this.cols; ++c)
			{
				if (clone.childNodes[r] && clone.childNodes[r].childNodes[c])
				{
					cell = clone.childNodes[r].childNodes[c].cloneNode(true);
				}
				else
				{
					cell = NuruTerm.new_cell(c, r, ch, fg, bg, attrs);
				}
				line.appendChild(cell);
			}
			this.root.appendChild(line);
		}
	}

	set_all(ch, fg, bg, attrs)
	{
		for (let r = 0; r < this.rows; ++r)
		{
			for (let c = 0; c < this.cols; ++c)
			{
				this.set_cell_at(c, r, ch, fg, bg, attrs);
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
	
	set_cell_at(col, row, ch, fg, bg, attrs)
	{
		let cell = this.get_cell_at(col, row);
		if (!cell) { return false; }
		NuruTerm.set_cell(cell, ch, fg, bg, attrs) 
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
	this.term = null; // NuruTerm instance
	this.cols = 0;
	this.rows = 0;

	this.image = null;

	// palettes
	this.glyphs = null;
	this.colors = null;

	this.glyph_pal = null;
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

Nuru.prototype.ele_by_attr = function(attr, singular=false)
{
	let eles = document.querySelectorAll("[" + attr + "]");
	return singular ? eles[0] : eles;
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

// The Terminal Canvas
Nuru.prototype.init_term = function(attr, w, h, callback)
{
	let term_root = this.ele_by_attr(attr, true);
	if (!term_root) { return false };
	this.term = new NuruTerm(term_root, w, h);
	
	let handler = callback.bind(this);
	this.term.root.addEventListener("click",      handler);
	this.term.root.addEventListener("mouseover",  handler);
	this.term.root.addEventListener("mousedown",  handler);
	this.term.root.addEventListener("mouseup",    handler);
	this.term.root.addEventListener("mouseleave", handler);
};

Nuru.prototype.init_glyphs_panel = function(attr, w, h, callback)
{
	let glyphs_root = this.ele_by_attr(attr, true);
	this.glyphs = new NuruTerm(glyphs_root, w, h);
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

			NuruTerm.set_cell(cell, glyph, null, null, cell_attrs);
		}
	}

	glyphs_root.addEventListener("click", callback.bind(this));
};

Nuru.prototype.init_colors_panel = function(attr, w, h, callback)
{
	let colors_root = this.ele_by_attr(attr, true);
	this.colors = new NuruTerm(colors_root, w, h);
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

			NuruTerm.set_cell(cell, " ", col, col, cell_attrs);
		}
	}

	colors_root.addEventListener("click", callback.bind(this));
};

// Keyboard Hotkeys
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

// Layer Buttons ("foreground", "background")
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

// Action Buttons ("set", "get")
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
	let inputs = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let input of inputs)
	{
		input.addEventListener("change", handler);
		this.inputs[input.getAttribute(attr)] = input;
	}
};

// brush, glyph, fgcol, bgcol
Nuru.prototype.init_panels = function(attr)
{
	let panels = this.ele_by_attr(attr, false);
	for (let panel of panels)
	{
		let panel_term = new NuruTerm(panel, 1, 1);
		panel_term.set_cell_at(0, 0, " ", null, null);
		this.panels[panel.getAttribute(attr)] = panel_term;
	}
}

// brush slots
Nuru.prototype.init_slot_panels = function(attr, callback)
{
	let panels = this.ele_by_attr(attr, false);
	let handler = callback.bind(this);
	for (let panel of panels)
	{
		let panel_term = new NuruTerm(panel, 1, 1);
		panel_term.set_cell_at(0, 0, " ", null, null);
		panel_term.root.addEventListener("click", handler);
		this.slots.push(panel_term);
	}
}

Nuru.prototype.init = function()
{
	// Initialize form input fields
	this.init_inputs("data-nuru-opt", this.on_input);
	
	// Initialize image (fetches value from input fields)
	this.init_image();

	// Initialize the terminal (canvas, drawing area)
	this.init_term("data-nuru-term", this.image.cols, this.image.rows, this.on_mouse_term);

	// Glyph palette
	let nurustd = new Uint8Array(this.glyph_palettes["nurustd"]);
	let cp437 = new Uint8Array(this.glyph_palettes["cp437"]);
	this.glyph_pal = new NuruPalette(nurustd.buffer);

	// TODO
	//this.color_pal = ;
	
	this.init_glyphs_panel("data-nuru-glyphs", 16, 16, this.on_click_glyphs);
	this.init_colors_panel("data-nuru-colors", 16, 16, this.on_click_colors);
	
	this.init_panels("data-nuru-panel");
	this.init_slot_panels("data-nuru-slot", this.on_slot);
	this.init_hotkeys("data-nuru-hotkey", this.on_key);
	this.init_buttons("data-nuru-btn", this.on_button);
	this.init_layer_buttons("data-nuru-layer", this.on_layer);
	this.init_action_buttons("data-nuru-action", this.on_action);
	
	this.init_tools("data-nuru-tool", this.on_tool);
	this.init_fieldsets("fieldset > label", this.on_click_fieldset);
	
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

Nuru.prototype.resize_term = function()
{
	let cols = this.get_input_val("cols");
	let rows = this.get_input_val("rows");
	this.image.resize(cols, rows);
	
	// TODO	
	this.term.resize(cols, rows);
};

Nuru.prototype.reset_term = function()
{
	let glyph_none = this.glyph_pal.get_glyph(this.get_input_val("ch-key"));
	let color_none = "inherit";
	let attributes = { 
		"ch": this.get_input_val("ch-key"),
		"fg": this.get_input_val("fg-key"),
		"bg": this.get_input_val("bg-key")
	};

	this.term.set_all(glyph_none, color_none, color_none, attributes);
};

// TODO
Nuru.prototype.crop_term = function()
{
	let rows = 1;
	let cols = 1;

	let lines = this.term.root.childNodes;
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
		this.term.root.classList.remove(this.tool);
	}
	this.tool = which;
	this.tools[this.tool].classList.add("selected");
	this.term.root.classList.add(this.tool);
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

// TODO use current color palette instead
Nuru.prototype.get_fg_css = function(color=null)
{
	let fg = color === null ? this.fg : color;
	return (fg == this.get_input_val("fg-key")) ? "inherit" : this.to_col(this.ANSI8[fg]);
};

// TODO use current color palette instead
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

	let glyph = this.glyph_pal.get_glyph(new_ch);
	let fgcol = this.get_fg_css(new_fg);
	let bgcol = this.get_bg_css(new_bg);

	let attributes = { "ch": new_ch, "fg": new_fg, "bg": new_bg };

	NuruTerm.set_cell(cell, glyph, fgcol, bgcol, attributes);
};

Nuru.prototype.del_cell = function(cell)
{
	let glyph_none = this.glyph_pal.get_glyph(this.get_input_val("ch-key"));
	let color_none = "inherit"; // TODO should probably use get_fg_css() / get_bg_css() here

	let attributes = { 
		"ch": this.get_input_val("ch-key"),
		"fg": this.get_input_val("fg-key"),
		"bg": this.get_input_val("bg-key")
	};

	NuruTerm.set_cell(cell, glyph_none, color_none, color_none, attributes);
};

// TODO use NuruTerm methods instead
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
	this.ch = ch === null ? this.get_input_val("ch-key") : ch;

	let brush_cell = this.panels.brush.get_cell_at(0, 0);
	let glyph_cell = this.panels.glyph.get_cell_at(0, 0);

	NuruTerm.set_cell(brush_cell, this.glyph_pal.get_glyph(this.ch));
	NuruTerm.set_cell(glyph_cell, this.glyph_pal.get_glyph(this.ch));

	this.select_cell_idx(this.glyphs, this.ch);
};

// TODO use NuruTerm methods instead
Nuru.prototype.set_fgcol = function(fg=null)
{
	let brush = this.panels.brush.root.querySelector(".cell");
	let fgcol = this.panels.fgcol.root.querySelector(".cell");

	this.fg = fg == null ? this.get_input_val("fg-key") : fg;

	brush.style.color           = this.get_fg_css(); 
	fgcol.style.backgroundColor = this.to_col(this.ANSI8[fg]); //this.get_fg_css();

	this.select_cell_idx(this.colors, this.fg, "selected-fg");
	

	/*
	this.fg = fg == null ? this.get_input_val("fg-key") : fg;

	let brush_cell = this.panels.brush.get_cell_at(0, 0);
	let fgcol_cell = this.panels.fgcol.get_cell_at(0, 0);

	let fgcol = this.get_fg_css();
	let bgcol = this.to_col(this.ANSI8[fg]); // TODO

	// TODO

	this.select_cell_idx(this.colors, this.fg, "selected-fg");
	*/
};

// TODO use NuruTerm methods instead
Nuru.prototype.set_bgcol = function(bg=null)
{
	let brush = this.panels.brush.root.querySelector(".cell");
	let bgcol = this.panels.bgcol.root.querySelector(".cell");

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

Nuru.prototype.glyph_palettes = {
	"nurustd": [
		// header (signature, version, type, ch_key, fg_key, bg_key, userdata)
		0x4e, 0x55, 0x52, 0x55, 0x50, 0x41, 0x4C, 0x01,	0x02, 0x20, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
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


