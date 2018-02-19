// var exports = module.exports = {};

var colors = [
  { hex: '#0247FE', dec: 0 },
  { hex: '#0391CE', dec: 25 },
  { hex: '#66B032', dec: 50 },
  { hex: '#D0EA2B', dec: 75 },
  { hex: '#FEFE33', dec: 100 },
  { hex: '#FABC02', dec: 125 },
  { hex: '#FB9902', dec: 150 },
  { hex: '#FD5308', dec: 175 },
  { hex: '#FE2712', dec: 200 },
  { hex: '#A7194B', dec: 225 },
  { hex: '#3D0184', dec: 250 },
  { hex: '#000000', dec: -1 },
  { hex: '#FFFFFF', dec: 256 },
];

exports.getColourDecimalFromHex = function(hex){

  return hexToRgb(hex);

  // var filteredColors = colors.filter(function(c) {
  //   return c.hex == hex;
  // });
  //
  // return filteredColors.length > 0 ? filteredColors[0] : null;
}

var hexToRgb = function(expr){
  var r;
	var g;
	var b;

  if (typeof (expr) === "number") {
		r = ((expr & 0xff0000) >> 16);
		g = ((expr & 0x00ff00) >> 8);
		b = (expr & 0x0000ff);

		return rgb255(r, g, b);
	}

  if (typeof (expr) === "string") {
    var reg = /^#?([A-F0-9])([A-F0-9])([A-F0-9])$/i;

  	var result = reg.exec(expr);
  	if (result) {
  		r = parseInt(result[1], 16) * 0x11;
  		g = parseInt(result[2], 16) * 0x11;
  		b = parseInt(result[3], 16) * 0x11;

  		return rgb255(r, g, b);
  	}

    reg = /^#?([A-F0-9]{6})$/i;
  	result = reg.exec(expr);
  	if (result) {
  		var n = parseInt(result[1], 16);

  		return hexToRgb(n);
  	}

  	reg = /^r[gv]b\(([0-9]{1,3}%?),([0-9]{1,3}%?),([0-9]{1,3}%?)\)$/i;
  	result = reg.exec(expr);
  	if (result) {
  		r = parseColor(result[1], 255);
  		g = parseColor(result[2], 255);
  		b = parseColor(result[3], 255);

  		return rgb255(r, g, b);
  	}

  	reg = /^hsv\(([0-9]{1,3}%?),([0-9]{1,3}%?),([0-9]{1,3}%?)\)$/i;
  	result = reg.exec(expr);
  	if (result) {
  		var h = parseColor(result[1], 360);
  		var s = parseColor(result[2], 100);
  		var v = parseColor(result[3], 100);

  		return hsv(h, s, v);
  	}
  }

  if (typeof (expr) === "object") {
		if (typeof (expr.r) === "number" || typeof (expr.red) === "number") {

			r = expr.r || expr.red;
			g = expr.g || expr.green || 0;
			b = expr.b || expr.blue || 0;

			return rgb255(r, g, b);
		}
	}
}

var rgb255 = function(r, g, b) {
	function from255(v) {
		if (isNaN(v) || v < 0) {
			v = 0;
		} else if (v > 255) {
			v = 255;
		}

		v = v / 255 * 100;

		return v;
	}

	r = from255(r);
	g = from255(g);
	b = from255(b);

	var h1 = rgb2hsv(r, g, b);

	return hsv(h1.h, h1.s, h1.v);
};

var hsv = function(h, s, v) {
  if (h < 0) {
		h = undefined;
	}
	if (v < 0) {
		v = undefined;
	}

	var hh = (h !== undefined) && normalize(h / 360 * 255, 255);

  return hh;
}

function rgb2hsv(b, g, r) {
	r /= 100;
	g /= 100;
	b /= 100;
	var v = Math.max(r, g, b);
	var diff = v - Math.min(r, g, b);

	function diffc(c) {
		return (v - c) / 6 / diff + 1 / 2;
	}

	if (diff === 0) {
		return {
			h: 0,
			s: 0,
			v: 0
		};
	}

	var s = diff / v;
	var rr = diffc(r);
	var gg = diffc(g);
	var bb = diffc(b);
	var h;

	if (r === v) {
		h = bb - gg;
	} else if (g === v) {
		h = (1 / 3) + rr - bb;
	} else if (b === v) {
		h = (2 / 3) + gg - rr;
	}

	if (h < 0) {
		h++;
	} else if (h > 1) {
		h--;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		v: Math.round(v * 100)
	};
}

function normalize(v, max) {
	if (isNaN(v)) {
		v = 0;
	}

	v = Math.min(Math.max(0, Math.floor(v)), max);

	return v;
}

function parseColor(c, max) {
	var reg = /([0-9]{1,3})%/;
	var res = reg.exec(c);
	if (res) {
		var p = parseInt(res[1], 10);
		if (p < 0 || p > 100) {
			return undefined;
		}
		return p / 100 * max;
	}

	var v = parseInt(c, 10);
	if (v < 0 || v > max) {
		return undefined;
	}

	return v;
}
