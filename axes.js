var parameter;
var px_per_mm;

var pages = {
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

var pageNames = [
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

function init() {
    make_px2cm();
    parameter = new Parameter('paramtbl');
    parameter.select('Page Size','ps',pageNames,'A4',createAxes);
    parameter.select('Page Orientation','or',["Portrait","Landscape"],'Portrait',createAxes);
    parameter.select('N-Up','np',[1,2,4,6,8],1,createAxes);
    parameter.integer('Font Size','fs',6,24,16,createAxes);
//    parameter.text('Page Width (cm)','w',10,createAxes);
//    parameter.text('Page Height (cm)','h',15,createAxes);
    parameter.boolean('Preserve aspect ratio','asp',true,createAxes);
    parameter.boolean('Grid','gd',true,createAxes);
    parameter.separator('X Axis');
    parameter.text('Maximum','xmx',5,createAxes);
    parameter.text('Minimum','xmn',-5,createAxes);
    parameter.text('Marks every','xmk',1,createAxes);
    parameter.text('Labels every','xlb',1,createAxes);
    parameter.separator('Y Axis');
    parameter.text('Maximum','ymx',8,createAxes);
    parameter.text('Minimum','ymn',-7,createAxes);
    parameter.text('Marks every','ymk',1,createAxes);
    parameter.text('Labels every','ylb',1,createAxes);
    createAxes();
    
    var w = document.getElementById('paramtbl').offsetWidth;
    document.getElementById('expl').style.width = w + 'px';
}

window.addEventListener('load',init,false);

function createAxes() {
    var page,
	orient,
	nup,
	nrow,
	fontsize,
	width,
	height,
	aspect,
	grid,
	gridbl,
	xmax,
	xmin,
	ymax,
	ymin,
	xwidth,
	ywidth,
	xscale,
	yscale,
	xmark,
	xlabel,
	ymark,
	ylabel,
	xborder,
	yborder
    ;
    page = parameter.getParameter('ps');
    orient = parameter.getParameter('or');
    width = Math.floor(mm2px(pages[page][0])) - 10;
    height = Math.floor(mm2px(pages[page][1])) - 10;
    if (orient == 'Landscape') {
	var swap = width;
	width = height;
	height = swap;
    }
    console.log(width,height);
    var out = document.getElementById('output');
    out.innerHTML = '';
    out.style.height = height;
    out.style.width = width;
    out.style.maxHeight = height;
    out.style.maxWidth = width;
    nup = parseInt(parameter.getParameter('np'));
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
//    width = cm2px(parameter.getParameter('w'));
//    height = cm2px(parameter.getParameter('h'));
    aspect = parameter.getParameter('asp');
    gridbl = parameter.getParameter('gd');
    fontsize = parseInt(parameter.getParameter('fs'));
    xmax = parseFloat(parameter.getParameter('xmx'));
    xmin = parseFloat(parameter.getParameter('xmn'));
    ymax = parseFloat(parameter.getParameter('ymx'));
    ymin = parseFloat(parameter.getParameter('ymn'));
    xmark = parseFloat(parameter.getParameter('xmk'));
    xlabel = parseFloat(parameter.getParameter('xlb'));
    ymark = parseFloat(parameter.getParameter('ymk'));
    ylabel = parseFloat(parameter.getParameter('ylb'));
    xwidth = xmax - xmin;
    ywidth = ymax - ymin;
    xborder = 20;
    yborder = 20;
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

    var nmin,nmax,notch,i;
    if (gridbl) {
	var grid = document.createElementNS("http://www.w3.org/2000/svg",'path');
	var gridstr = '';
	
	nmin = Math.ceil(xmin/xmark);
	nmax = Math.floor(xmax/xmark);
	for ( i=nmin;i<=nmax;i++) {
            gridstr += 'M ' + transformX(i*xmark) + ' ' + transformY(ymin) + ' L ' + transformX(i*xmark) + ' ' +  transformY(ymax) + ' ';
	}

	nmin = Math.ceil(ymin/ymark);
	nmax = Math.floor(ymax/ymark);
	for ( i=nmin;i<=nmax;i++) {
            gridstr += 'M ' + transformX(xmin) + ' ' + transformY(i*ymark) + ' L ' + transformX(xmax) + ' ' +  transformY(i*ymark) + ' ';
	}

	grid.setAttribute('d',gridstr);
	grid.setAttribute('stroke','gray');
	grid.setAttribute('stroke-width',.5);
	svg.appendChild(grid);
    }
    var xaxis = document.createElementNS("http://www.w3.org/2000/svg",'path');
    xaxis.setAttribute('d','M ' + transformX(xmin) + ' ' + transformY(0) + ' L ' + transformX(xmax) + ' ' + transformY(0));
    xaxis.setAttribute('stroke','black');
    xaxis.setAttribute('stroke-width',1);
    xaxis.setAttribute('marker-end','url(#dart)');
    svg.appendChild(xaxis);
    var yaxis = document.createElementNS("http://www.w3.org/2000/svg",'path');
    yaxis.setAttribute('d','M ' + transformX(0) + ' ' + transformY(ymin) + ' L ' + transformX(0) + ' ' + transformY(ymax));
    yaxis.setAttribute('stroke','black');
    yaxis.setAttribute('stroke-width',1);
    yaxis.setAttribute('marker-end','url(#dart)');
    svg.appendChild(yaxis);
    var tick,tlbl;
    nmin = Math.ceil(xmin/xmark);
    nmax = Math.floor(xmax/xmark);
    for ( i=nmin;i<=nmax;i++) {
	if (i != 0) {
	    notch = document.createElementNS("http://www.w3.org/2000/svg",'path');
            notch.setAttribute('d','M ' + transformX(i*xmark) + ' ' + transformY(0) + ' l 0 ' +  transformDY(-.3));
            notch.setAttribute('stroke','black');
            notch.setAttribute('stroke-width', 1);
            svg.appendChild(notch);
	}
    }
    nmin = Math.ceil(xmin/xlabel);
    nmax = Math.floor(xmax/xlabel);
    for ( i=nmin;i<=nmax;i++) {
	if (i != 0) {
            tick = document.createElementNS("http://www.w3.org/2000/svg",'text');
            tick.setAttribute('x',transformX(i*xlabel));
            tick.setAttribute('y',transformY(-.35));
	    tick.setAttribute('font-size',fontsize);
            tick.setAttribute('text-anchor','middle');
            tick.setAttribute('style','dominant-baseline: hanging');
            var tlbl = document.createTextNode(i*xlabel);
            tick.appendChild(tlbl);
            svg.appendChild(tick);
	}
    }
    nmin = Math.ceil(ymin/ymark);
    nmax = Math.floor(ymax/ymark);
    for ( i=nmin;i<=nmax;i++) {
	if (i != 0) {
	    notch = document.createElementNS("http://www.w3.org/2000/svg",'path');
            notch.setAttribute('d','M ' + transformX(0) + ' ' + transformY(i*ymark) + ' l ' +  transformDX(-.3) + ' 0');
            notch.setAttribute('stroke','black');
            notch.setAttribute('stroke-width', 1);
            svg.appendChild(notch);
	}
    }
    nmin = Math.ceil(ymin/ylabel);
    nmax = Math.floor(ymax/ylabel);
    for ( i=nmin;i<=nmax;i++) {
	if (i != 0) {
            tick = document.createElementNS("http://www.w3.org/2000/svg",'text');
            tick.setAttribute('x',transformX(-.35));
            tick.setAttribute('y',transformY(i*ylabel));
	    tick.setAttribute('font-size',fontsize);
            tick.setAttribute('text-anchor','end');
            tick.setAttribute('style','dominant-baseline: middle');
            var tlbl = document.createTextNode(i*ylabel);
            tick.appendChild(tlbl);
            svg.appendChild(tick);
	}
    }
    if ((ymin < 0 && ymax > 0) || (xmin < 0 && xmax > 0)) {
        tick = document.createElementNS("http://www.w3.org/2000/svg",'text');
        tick.setAttribute('x',transformX(-.15));
        tick.setAttribute('y',transformY(-.15));
	tick.setAttribute('font-size',fontsize);
        tick.setAttribute('text-anchor','end');
        tick.setAttribute('style','dominant-baseline: hanging');
        var tlbl = document.createTextNode("0");
        tick.appendChild(tlbl);
        svg.appendChild(tick);
    }

    var nsvg,br,tbl,tr,td;
    tbl = document.createElement('table');
    tbl.className = 'axesTable';
    for (i=0; i < nup; i++) {
	if (i%nrow == 0) {
	    tr = document.createElement('tr');
	    tbl.appendChild(tr);
	}
	nsvg = svg.cloneNode(true);
	td = document.createElement('td');
	td.appendChild(nsvg);
	tr.appendChild(td);
    }
    out.appendChild(tbl);
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
