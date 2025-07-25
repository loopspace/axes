"use strict";

var px_per_mm;
const svgs = [];
const axParams = [ ];
const caxes = 0;
const defaults = {
    "fs": 16,
    "asp": true,
    "gd": true,
    "lw": 1,
    "mw": 1,
    "ml": 1,
    "xmn": -5,
    "xmx": 5,
    "xmk": 1,
    "xlb": 1,
    "xal": "_x_",
    "ymn": -7,
    "ymx": 8,
    "ymk": 1,
    "ylb": 1,
    "yal": "_y_",
};
const paramNames = [
    "fs","asp","gd","lw","mw","ml","xmn","xmx","xmk","xlb","xal","ymn","ymx","ymk","ylb","yal"
]

const pages = {
    "A0": [841,1189],
    "A1": [594,841],
    "A2": [420,594],
    "A3": [297,420],
    "A4": [210,297],
    "A5": [148,210],
    "A6": [105,148],
    "A7": [74,105],
    "A8": [52,74],
    "A9": [37,52],
    "A10": [26,37],
    "ANSI A": [216,279],
    "ANSI B": [279,432],
    "ANSI C": [432,559],
    "ANSI D": [559,864],
    "ANSI E": [864,1118],
    "letter": [216,279],
    "B0": [1414,1000],
    "B1": [1000,707],
    "B2": [707,500],
    "B3": [500,353],
    "B4": [353,250],
    "B5": [250,176],
    "B6": [176,125],
    "B7": [125,88],
    "B8": [88,62],
    "B9": [62,44],
    "B10": [44,31],
    "C0": [1297,917],
    "C1": [917,648],
    "C2": [648,458],
    "C3": [458,324],
    "C4": [324,229],
    "C5": [229,162],
    "C6": [162,114],
    "C7": [114,81],
    "C8": [81,57],
    "C9": [57,40],
    "C10": [40,28]
}

const pageNames = [
    "A0",
    "A1",
    "A2",
    "A3",
    "A4",
    "A5",
    "A6",
    "A7",
    "A8",
    "A9",
    "A10",
    "ANSI A",
    "ANSI B",
    "ANSI C",
    "ANSI D",
    "ANSI E",
    "letter",
    "B0",
    "B1",
    "B2",
    "B3",
    "B4",
    "B5",
    "B6",
    "B7",
    "B8",
    "B9",
    "B10",
    "C0",
    "C1",
    "C2",
    "C3",
    "C4",
    "C5",
    "C6",
    "C7",
    "C8",
    "C9",
    "C10"
]

// Parse query string
const qs = (function(a) {
    if (a == "") return {};
    const b = {};
    let ca = 0;
    let paramName, paramValue;
    for (let i = 0; i < a.length; ++i)
    {
        let p=a[i].split('=', 2);
	paramName = p[0];
        if (p.length == 1) {
	    paramValue = "";
        } else {
            paramValue = decodeURIComponent(p[1].replace(/\+/g, " "));
	}
	if (paramName == "ca") {
	    if (paramValue != "") {
		try {
		    ca = parseInt(paramValue);
		} catch(e) {}
	    }
	    while (ca >= axParams.length) {
		axParams.push([]);
	    }
	} else if (paramNames.includes(paramName)) {
	    axParams[ca][paramName] = paramValue;
	} else {
	    b[paramName] = paramValue;
	}
    }
    b.ca = ca;
    return b;
})(window.location.search.substr(1).split('&'));



function init() {
    make_px2cm();
    const parameter = new Parameter('paramtbl');
    parameter.separator('Page Setup');
    parameter.select('Page Size','ps',pageNames,qs.ps || 'A4',createAxes);
    parameter.text('Page Margins (px)','pm',qs.pm || 0 ,createAxes);
    parameter.text('Borders (cm)','bd',qs.bd || 1,createAxes);
    parameter.select('Page Orientation','or',["Portrait","Landscape"],qs.or || 'Portrait',createAxes);
    parameter.select('N-Up','np',[1,2,4,6,8],qs.np || 1,
		     function(e,p) {
			 let a = [];
			 for (let i = 0; i < e.target.value; i++) {
			     a.push(i);
			 }
			 svgs.length = 0;
			 parameter.enableOptions('na',a,false);
			 return createAxes(e,p);
		     });
    let na, ca;
    if ('na' in qs) {na = parseInt(qs.na)} else {na = 1};
    if ('ca' in qs) {ca = qs.ca} else {ca = 0};
    na = Math.max(na,ca);
    
    parameter.integer('Number of Axes','na',1,8,na,
		      function(e,p) {
			  let a = [];
			 let ca = parameter.getParameter('ca');
			  for (let i = 0; i < e.target.value; i++) {
			      a.push(i);
			     if (! i in axParams) {
				 axParams[i] = [];
				 for (let n in nameParams) {
				     axParams[i][n] = axParams[ca][n];
				 }
			     }
			  }
			  parameter.enableOptions('ca',a,false);
			  return createAxes(e,p);
		      });
    parameter.integer('Current Axes','ca',1,8,ca+1,function(e,p) {
	var opts;
	var ca = e.target.value - 1;
	if (axParams[ca]) {
	    opts = axParams[ca];
	} else {
	    opts = defaults;
	}
	for (var i = 0; i < paramNames.length; i++) {
	    p.setParameter(paramNames[i],opts[paramNames[i]]);
	}
    });
    let nax = [];
    let cax = [];
    for (let i = 0; i < qs.np; i++) {
	nax.push(i);
    }
    for (let i = 0; i < na; i++) {
	cax.push(i);
    }
    
    let opts = {};
    if (ca in axParams) {
	paramNames.forEach(function (name) { if (name in axParams[ca]) { opts[name] = axParams[ca][name] } else { opts[name] = defaults[name] }});
    } else {
	paramNames.forEach((name) => opts[name] = defaults[name] );
    }

    parameter.enableOptions('na',nax,false);
    parameter.enableOptions('ca',cax,false);
    parameter.separator('Axes Setup');
    parameter.integer('Font Size','fs',6,24,opts.fs,createAxes);
    parameter.boolean('Preserve aspect ratio','asp',opts.asp,createAxes);
    parameter.boolean('Grid','gd',opts.gd,createAxes);
    parameter.number('Line Width','lw',0,5,opts.lw,createAxes);
    parameter.number('Mark Length','ml',0,20,opts.ml,createAxes);
    parameter.number('Mark Width','mw',0,5,opts.mw,createAxes);
    parameter.separator('X Axis');
    parameter.text('Minimum','xmn',opts.xmn,createAxes);
    parameter.text('Maximum','xmx',opts.xmx,createAxes);
    parameter.text('Marks every','xmk',opts.xmk,createAxes);
    parameter.integer('Labels every','xlb',1,10,opts.xlb,createAxes);
    parameter.text('Axis label','xal',opts.xal,createAxes);
    parameter.separator('Y Axis');
    parameter.text('Minimum','ymn',opts.ymn,createAxes);
    parameter.text('Maximum','ymx',opts.ymx,createAxes);
    parameter.text('Marks every','ymk',opts.ymk,createAxes);
    parameter.integer('Labels every','ylb',1,10,opts.ylb,createAxes);
    parameter.text('Axis label','yal',opts.yal,createAxes);
    createAxes(null,parameter);
    
    var w = document.getElementById('paramtbl').offsetWidth;
    document.getElementById('expl').style.width = w + 'px';

    var hlnk = document.getElementById('helplink');
    var hdv = document.getElementById('help');
    hlnk.addEventListener('click', function(e) {
	e.preventDefault();
	if (hdv.style.display == 'none' || hdv.style.display == '') {
	    hdv.style.display = 'block';
	} else {
	    hdv.style.display = 'none';
	}
	return false;
    });
    var h = window.innerHeight - 20;
    hdv.style.height = h + 'px';
}

window.addEventListener('load',init,false);

function createAxes(e,p) {
    let page,
	margins,
	naxes,
	caxes,
	orient,
	nup,
	nrow,
	border,
	fontsize,
	linewidth,
	markwidth,
	marklength,
	width,
	height,
	aspect,
	grid,
	gridbl,
	xmax,
	xmin,
	ymax,
	ymin,
	xmark,
	xlabel,
	xaxlabel,
	ymark,
	ylabel,
	yaxlabel
    ;
    page = p.getParameter('ps');
    nup = parseInt(p.getParameter('np'));
    orient = p.getParameter('or');
    aspect = p.getParameter('asp');
    margins = parseInt(p.getParameter('pm'));
    width = Math.floor(mm2px(pages[page][0])) - 2*margins;
    height = Math.floor(mm2px(pages[page][1])) - 2*margins;
    if (orient == 'Landscape') {
	var swap = width;
	width = height;
	height = swap;
    }
    var out = document.getElementById('output');
    out.style.height = height + 'px';
    out.style.width = width + 'px';
    out.style.maxHeight = height + 'px';
    out.style.maxWidth = width + 'px';
    out.style.minHeight = height + 'px';
    out.style.minWidth = width + 'px';
    out.innerHTML = '';
    nrow = 1;
    if (nup == 2) {
	if (height > width) {
	    height /= 2;
	    nrow = 1;
	} else {
	    width /= 2;
	    nrow = 2;
	}
    } else if (nup == 4) {
	height /= 2;
	width /= 2;
	nrow = 2;
    } else if (nup == 6) {
	if (height > width) {
	    height /= 3;
	    width /= 2;
	    nrow = 2;
	} else {
	    height /= 2;
	    width /= 3;
	    nrow = 3;
	}
    } else if (nup == 8) {
	if (height > width) {
	    height /= 4;
	    width /= 2;
	    nrow = 2;
	} else {
	    height /= 2;
	    width /= 4;
	    nrow = 4;
	}
    }
    naxes = parseInt(p.getParameter('na'));
    caxes = parseInt(p.getParameter('ca')) - 1;
    gridbl = p.getParameter('gd');
    fontsize = parseInt(p.getParameter('fs'));
    linewidth = parseFloat(p.getParameter('lw'));
    marklength = parseFloat(p.getParameter('ml'));
    markwidth = parseFloat(p.getParameter('mw'));
    xmax = parseFloat(p.getParameter('xmx'));
    xmin = parseFloat(p.getParameter('xmn'));
    ymax = parseFloat(p.getParameter('ymx'));
    ymin = parseFloat(p.getParameter('ymn'));
    xmark = parseFloat(p.getParameter('xmk'));
    xlabel = parseInt(p.getParameter('xlb'));
    xaxlabel = p.getParameter('xal');
    ymark = parseFloat(p.getParameter('ymk'));
    ylabel = parseInt(p.getParameter('ylb'));
    yaxlabel = p.getParameter('yal');
    border = cm2px(parseFloat(p.getParameter('bd')));

    svgs[caxes] = createAxesSvg(
	width,
	height,
	border,
	xmin,
	xmax,
	xmark,
	xlabel,
	xaxlabel,
	ymin,
	ymax,
	ymark,
	ylabel,
	yaxlabel,
	aspect,
	fontsize,
	linewidth,
	gridbl,
	markwidth,
	marklength
    );
    axParams[caxes] = {
	"fs": fontsize,
	"lw": linewidth,
	"ml": marklength,
	"mw": markwidth,
	"asp": aspect,
	"gd": gridbl,
	"xmn": xmin,
	"xmx": xmax,
	"xmk": xmark,
	"xlb": xlabel,
	"xal": xaxlabel,
	"ymn": ymin,
	"ymx": ymax,
	"ymk": ymark,
	"ylb": ylabel,
	"yal": yaxlabel
    }
    let nsvg,br,tbl,tr,td;
    tbl = document.createElement('table');
    tbl.className = 'axesTable';
    for (var i=0; i < naxes; i++) {
	if (!svgs[i]) {
	    svgs[i] = createAxesSvg(
		width,
		height,
		border,
		defaults.xmn,
		defaults.xmx,
		defaults.xmk,
		defaults.xlb,
		defaults.xal,
		defaults.ymn,
		defaults.ymx,
		defaults.ymk,
		defaults.ylb,
		defaults.yal,
		defaults.asp,
		defaults.fs,
		defaults.lw,
		defaults.gd,
		defaults.mw,
		defaults.ml
	    );
	}
    }
    for (var i=0; i < nup; i++) {
	if (i%nrow == 0) {
	    tr = document.createElement('tr');
	    tbl.appendChild(tr);
	}
	td = document.createElement('td');
	nsvg = svgs[i%naxes].cloneNode(true);
	td.appendChild(nsvg);
	tr.appendChild(td);
    }
    out.appendChild(tbl);
    let query_string =
	[location.protocol, '//', location.host, location.pathname].join('');
    query_string += `?ps=${page}&np=${nup}&or=${orient}&pm=${margins}&na=${naxes}`;
    let qs;
    for (let i = 0; i < naxes; i++) {
	qs = `&ca=${i}`;
	for (let j = 0; j < paramNames.length; j++) {
	    qs += `&${paramNames[j]}=${encodeURIComponent(axParams[i][paramNames[j]])}`;
	}
	query_string += qs;
    }
    query_string += `&ca=${caxes}`;
    const sharebtn = document.getElementById("share");
    sharebtn.addEventListener("click", function(e) {
	e.preventDefault();
	console.log(query_string);
	copyToClipboard(query_string);
    });
}

function createAxesSvg (
    width,
    height,
    border,
    xmin,
    xmax,
    xmark,
    xlabel,
    xaxlabel,
    ymin,
    ymax,
    ymark,
    ylabel,
    yaxlabel,
    aspect,
    fontsize,
    linewidth,
    gridbl,
    markwidth,
    marklength
) {
    var	xwidth,
	ywidth,
    	xscale,
	yscale,
	xmark,
	xlabel,
	ymark,
	ylabel,
	xborder,
	yborder,
	precision,
	xzero,
	yzero
    ;

    xwidth = xmax - xmin;
    ywidth = ymax - ymin;
    xborder = border;
    yborder = border;
    xzero = Math.min(xmax,Math.max(0,xmin));
    yzero = Math.min(ymax,Math.max(0,ymin));
    
    if (aspect) {
	xscale = Math.min((width - 2*xborder)/xwidth,(height - 2*yborder)/ywidth);
	yscale = xscale;
	xborder = (width - xscale*xwidth)/2;
	yborder = (height - yscale*ywidth)/2;
    } else {
	xscale = (width - 2*xborder)/xwidth;
	yscale = (height - 2*yborder)/ywidth;
    }
    
    var transformX = function(x) {
        return (x - xmin)*xscale + xborder;
    };
    var transformDX = function(x) {
        return x*xscale;
    };
    var transformY = function (y) {
        return height - (y - ymin)*yscale - yborder;
    };
    var transformDY = function (y) {
        return - y*yscale;
    };
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");

    var nmin,nmax,nzero,notch,i;
    if (gridbl) {
	var grid = document.createElementNS("http://www.w3.org/2000/svg",'path');
	var gridstr = '';

	if (xlabel != 1 || ylabel !=1) {
	    var overgrid = document.createElementNS("http://www.w3.org/2000/svg",'path');
	    var overgridstr = '';
	}
	
	nmin = Math.ceil(xmin/xmark);
	nmax = Math.floor(xmax/xmark);
	nzero = Math.min(nmax,Math.max(0,nmin));
	for ( i=nmin;i<=nmax;i++) {
	    if ( (xlabel == 1) || (i%xlabel != 0)) {
		gridstr += 'M ' + transformX(i*xmark) + ' ' + transformY(ymin) + ' L ' + transformX(i*xmark) + ' ' +  transformY(ymax) + ' ';
	    } else {
		overgridstr += 'M ' + transformX(i*xmark) + ' ' + transformY(ymin) + ' L ' + transformX(i*xmark) + ' ' +  transformY(ymax) + ' ';
	    }
	}

	nmin = Math.ceil(ymin/ymark);
	nmax = Math.floor(ymax/ymark);
	nzero = Math.min(nmax,Math.max(0,nmin));
	for ( i=nmin;i<=nmax;i++) {
	    if ( (ylabel == 1) || (i%ylabel !=0)) {
		gridstr += 'M ' + transformX(xmin) + ' ' + transformY(i*ymark) + ' L ' + transformX(xmax) + ' ' +  transformY(i*ymark) + ' ';
	    } else {
		overgridstr += 'M ' + transformX(xmin) + ' ' + transformY(i*ymark) + ' L ' + transformX(xmax) + ' ' +  transformY(i*ymark) + ' ';
	    }
	}

	grid.setAttribute('d',gridstr);
	grid.setAttribute('stroke','gray');
	grid.setAttribute('stroke-width',.5*linewidth);
	svg.appendChild(grid);

	if (xlabel != 1 || ylabel !=1) {
	    overgrid.setAttribute('d',overgridstr);
	    overgrid.setAttribute('stroke','gray');
	    overgrid.setAttribute('stroke-width',linewidth);
	    svg.appendChild(overgrid);
	}
    }
    var xaxis = document.createElementNS("http://www.w3.org/2000/svg",'path');
    xaxis.setAttribute('d','M ' + transformX(xmin) + ' ' + transformY(yzero) + ' L ' + transformX(xmax) + ' ' + transformY(yzero));
    xaxis.setAttribute('stroke','black');
    xaxis.setAttribute('stroke-width',linewidth);
    xaxis.setAttribute('marker-end','url(#dart)');
    svg.appendChild(xaxis);
    var yaxis = document.createElementNS("http://www.w3.org/2000/svg",'path');
    yaxis.setAttribute('d','M ' + transformX(xzero) + ' ' + transformY(ymin) + ' L ' + transformX(xzero) + ' ' + transformY(ymax));
    yaxis.setAttribute('stroke','black');
    yaxis.setAttribute('stroke-width',linewidth);
    yaxis.setAttribute('marker-end','url(#dart)');
    svg.appendChild(yaxis);
    var tick,tlbl;
    nmin = Math.ceil(xmin/xmark);
    nmax = Math.floor(xmax/xmark);
    nzero = Math.min(nmax,Math.max(0,nmin));
    for ( i=nmin;i<=nmax;i++) {
	if (i != nzero) {
	    notch = document.createElementNS("http://www.w3.org/2000/svg",'path');
            notch.setAttribute('d','M ' + transformX(i*xmark) + ' ' + transformY(yzero) + ' l 0 ' + (i % xlabel == 0 ? 1.5 : 1) * marklength );
            notch.setAttribute('stroke','black');
            notch.setAttribute('stroke-width', markwidth);
            svg.appendChild(notch);
	}
    }
    xlabel *= xmark;
    precision = Math.min(0,Math.floor(Math.log10(xmark)));
    nmin = Math.ceil(xmin/xlabel);
    nmax = Math.floor(xmax/xlabel);
    nzero = Math.min(nmax,Math.max(0,nmin));
    
    for ( i=nmin;i<=nmax;i++) {
	if (i != nzero) {
            tick = document.createElementNS("http://www.w3.org/2000/svg",'text');
            tick.setAttribute('x',transformX(i*xlabel) + fontsize/4);
            tick.setAttribute('y',transformY(yzero) + 2*marklength);
	    tick.setAttribute('font-size',fontsize);
            tick.setAttribute('text-anchor','end');
            tick.setAttribute('style','dominant-baseline: hanging');
            tlbl = document.createTextNode(Math.round10(i*xlabel,precision));
            tick.appendChild(tlbl);
            svg.appendChild(tick);
	}
    }
    var alabel, alabeltxt, alabeltsp, alabelarr, alabelret;
    // TODO: parse xaxlabel for formatting a la Markdown
    if (xaxlabel != '') {
	alabel = document.createElementNS("http://www.w3.org/2000/svg",'text');
        alabel.setAttribute('x',transformX(xmax) + 15*linewidth);
        alabel.setAttribute('y',transformY(yzero));
	alabel.setAttribute('font-size',fontsize);
        alabel.setAttribute('text-anchor','start');
        alabel.setAttribute('style','dominant-baseline: hanging');
	alabelarr = xaxlabel.split(/ +/);
	for (i = 0; i < alabelarr.length; i++) {
	    if (i > 0) {
		alabeltsp = document.createElementNS("http://www.w3.org/2000/svg",'tspan');
		alabeltxt = document.createTextNode(' ');
		alabeltsp.appendChild(alabeltxt);
		alabel.appendChild(alabeltsp);
	    }
	    alabeltsp = document.createElementNS("http://www.w3.org/2000/svg",'tspan');
	    alabelret = getFormat(alabelarr[i]);
	    if (alabelret[1]) {
		alabeltsp.setAttribute('class',alabelret[1]);
		alabelarr[i] = alabelret[0];
	    }
	    alabelret = getFormat(alabelarr[i]);
	    if (alabelret[1]) {
		alabeltsp.setAttribute('class',alabeltsp.getAttribute('class') + ' ' + alabelret[1]);
		alabelarr[i] = alabelret[0];
	    }
	    alabeltxt = document.createTextNode(alabelarr[i]);
	    alabeltsp.appendChild(alabeltxt);
            alabel.appendChild(alabeltsp);
	}
        svg.appendChild(alabel);
    }
    nmin = Math.ceil(ymin/ymark);
    nmax = Math.floor(ymax/ymark);
    nzero = Math.min(nmax,Math.max(0,nmin));

    for ( i=nmin;i<=nmax;i++) {
	if (i != nzero) {
	    notch = document.createElementNS("http://www.w3.org/2000/svg",'path');
            notch.setAttribute('d','M ' + transformX(xzero) + ' ' + transformY(i*ymark) + ' l ' +  - (i % ylabel == 0 ? 1.5 : 1) * marklength + ' 0');
            notch.setAttribute('stroke','black');
            notch.setAttribute('stroke-width', markwidth);
            svg.appendChild(notch);
	}
    }
    ylabel *= ymark;
    precision = Math.min(0,Math.floor(Math.log10(ymark)));
    nmin = Math.ceil(ymin/ylabel);
    nmax = Math.floor(ymax/ylabel);
    nzero = Math.min(nmax,Math.max(0,nmin));
    for ( i=nmin;i<=nmax;i++) {
	if (i != nzero) {
            tick = document.createElementNS("http://www.w3.org/2000/svg",'text');
            tick.setAttribute('x',transformX(xzero) - 2*marklength);
            tick.setAttribute('y',transformY(i*ylabel) + fontsize/3);
	    tick.setAttribute('font-size',fontsize);
            tick.setAttribute('text-anchor','end');
            tick.setAttribute('style','dominant-baseline: alphabetic');
            tlbl = document.createTextNode(Math.round10(i*ylabel,precision));
            tick.appendChild(tlbl);
            svg.appendChild(tick);
	}
    }
    if (yaxlabel != '') {
	alabel = document.createElementNS("http://www.w3.org/2000/svg",'text');
        alabel.setAttribute('x',transformX(xzero));
        alabel.setAttribute('y',transformY(ymax) - 15*linewidth);
	alabel.setAttribute('font-size',fontsize);
        alabel.setAttribute('text-anchor','start');
        alabel.setAttribute('style','dominant-baseline: alphabetic');
	alabelarr = yaxlabel.split(/ +/);
	for (i = 0; i < alabelarr.length; i++) {
	    if (i > 0) {
		alabeltsp = document.createElementNS("http://www.w3.org/2000/svg",'tspan');
		alabeltxt = document.createTextNode(' ');
		alabeltsp.appendChild(alabeltxt);
		alabel.appendChild(alabeltsp);
	    }
	    alabeltsp = document.createElementNS("http://www.w3.org/2000/svg",'tspan');
	    alabelret = getFormat(alabelarr[i]);
	    if (alabelret[1]) {
		alabeltsp.setAttribute('class',alabelret[1]);
		alabelarr[i] = alabelret[0];
	    }
	    alabelret = getFormat(alabelarr[i]);
	    if (alabelret[1]) {
		alabeltsp.setAttribute('class',alabeltsp.getAttribute('class') + ' ' + alabelret[1]);
		alabelarr[i] = alabelret[0];
	    }
	    alabeltxt = document.createTextNode(alabelarr[i]);
	    alabeltsp.appendChild(alabeltxt);
            alabel.appendChild(alabeltsp);
	}
        svg.appendChild(alabel);
    }
    if (yaxlabel != '') {
    }
    if ((ymin < 0 && ymax > 0) || (xmin < 0 && xmax > 0)) {
        tick = document.createElementNS("http://www.w3.org/2000/svg",'text');
        tick.setAttribute('x',transformX(xzero-.15));
        tick.setAttribute('y',transformY(yzero-.15));
	tick.setAttribute('font-size',fontsize);
        tick.setAttribute('text-anchor','end');
        tick.setAttribute('style','dominant-baseline: hanging');
        tlbl = document.createTextNode("0");
        tick.appendChild(tlbl);
        svg.appendChild(tick);
    }
    return svg;
}

function make_px2cm() {
    var d = document.createElement('div');
    var body = document.querySelector('body');
    d.style.position = 'absolute';
    d.style.top = '-1000cm';
    d.style.left = '-1000cm';
    d.style.height = '1000cm';
    d.style.width = '1000cm';
    body.appendChild(d);
    px_per_mm = d.offsetHeight / 10000;
    body.removeChild(d);
}

function px2mm (px) {
    return px / px_per_mm;
}

function mm2px (mm) {
    return mm * px_per_mm;
}

function px2cm (px) {
    return px / px_per_mm / 10;
}

function cm2px (cm) {
    return cm * px_per_mm * 10;
}

function getFormat (s) {
    var rt,cl,bl;
    if (s.charAt(0) == s.charAt(s.length - 1)) {
	if (s.charAt(0) == "_") {
	    rt = s.substring(1,s.length-1);
	    return [rt,'italic'];
	} else if (s.charAt(0) == "*") {
	    rt = s.substring(1,s.length-1);
	    return [rt,'bold'];
	}	    
    }
    return [rt,''];
}

/*
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
*/

// Closure
(function() {
  /**
   * Decimal adjustment of a number.
   *
   * @param {String}  type  The type of adjustment.
   * @param {Number}  value The number.
   * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
   * @returns {Number} The adjusted value.
   */
  function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
      return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
      return NaN;
    }
    // If the value is negative...
    if (value < 0) {
      return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
  }

  // Decimal round
  if (!Math.round10) {
    Math.round10 = function(value, exp) {
      return decimalAdjust('round', value, exp);
    };
  }
  // Decimal floor
  if (!Math.floor10) {
    Math.floor10 = function(value, exp) {
      return decimalAdjust('floor', value, exp);
    };
  }
  // Decimal ceil
  if (!Math.ceil10) {
    Math.ceil10 = function(value, exp) {
      return decimalAdjust('ceil', value, exp);
    };
  }

    // Significant figures round
  if (!Math.roundsf) {
    Math.roundsf = function(value, exp) {
      return decimalAdjust('round', value, Math.floor(Math.log10(Math.abs(value))) + 1 - exp);
    };
  }
  //  Significant figures floor
  if (!Math.floorsf) {
      Math.floorsf = function(value, exp) {
	return decimalAdjust('floor', value, Math.floor(Math.log10(Math.abs(value))) + 1 - exp);
    };
  }
  //  Significant figures ceil
  if (!Math.ceilsf) {
    Math.ceilsf = function(value, exp) {
      return decimalAdjust('ceil', value, Math.floor(Math.log10(Math.abs(value))) + 1 - exp);
    };
  }
})();


// From http://stackoverflow.com/a/22581382

function copyToClipboard(text) {
    // create hidden text element, if it doesn't already exist
    const targetId = "_hiddenCopyText_";
    let origSelectionStart, origSelectionEnd, target;
    // must use a temporary form element for the selection and copy
    target = document.getElementById(targetId);
    if (!target) {
        target = document.createElement("textarea");
        target.style.position = "absolute";
        target.style.left = "-9999px";
        target.style.top = "0";
        target.id = targetId;
        document.body.appendChild(target);
    }
    target.textContent = text;
    // select the content
    const currentFocus = document.activeElement;
    target.focus();
    target.setSelectionRange(0, target.value.length);
    
    // copy the selection
    let succeed;
    try {
    	  succeed = document.execCommand("copy");
    } catch(e) {
        succeed = false;
    }
    // restore original focus
    if (currentFocus && typeof currentFocus.focus === "function") {
        currentFocus.focus();
    }
    
    // clear temporary content
    target.textContent = "";

    return succeed;
}
