var parameter;
var px_per_cm;

function init() {
    make_px2cm();
    parameter = new Parameter('paramtbl');
    parameter.text('Page Width (cm)','w',10,createAxes);
    parameter.text('Page Height (cm)','h',15,createAxes);
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
    console.log(w);
    document.getElementById('expl').style.width = w + 'px';
}

window.addEventListener('load',init,false);

function createAxes() {
    var width,
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
    width = cm2px(parameter.getParameter('w'));
    height = cm2px(parameter.getParameter('h'));
    aspect = parameter.getParameter('asp');
    gridbl = parameter.getParameter('gd');
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
	xscale = Math.min((width - 2*xborder)/xwidth,height/ywidth);
	yscale = xscale;
	yborder = xborder;
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
    svg.setAttribute('style', 'border: 1px solid back');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
    var arrow = document.createElementNS("http://www.w3.org/2000/svg", 'marker');
    arrow.setAttribute('id','triangle');
    arrow.setAttribute('viewBox',"0 0 10 10");
    arrow.setAttribute('refX',"0");
    arrow.setAttribute('refY',"5");
    arrow.setAttribute('markerUnits',"strokeWidth");
    arrow.setAttribute('markerWidth',"20");
    arrow.setAttribute('markerHeight',"15");
    arrow.setAttribute('orient',"auto");
    var apath = document.createElementNS("http://www.w3.org/2000/svg",'path');
    apath.setAttribute('d',"M 0 0 L 10 5 L 0 10 z");
    arrow.appendChild(apath);
    svg.appendChild(arrow);
    var dart = document.createElementNS("http://www.w3.org/2000/svg", 'marker');
    dart.setAttribute('id','dart');
    dart.setAttribute('viewBox',"0 0 10 10");
    dart.setAttribute('refX',"0");
    dart.setAttribute('refY',"5");
    dart.setAttribute('markerUnits',"strokeWidth");
    dart.setAttribute('markerWidth',"20");
    dart.setAttribute('markerHeight',"15");
    dart.setAttribute('orient',"auto");
    var dpath = document.createElementNS("http://www.w3.org/2000/svg",'path');
    dpath.setAttribute('d',"M 0 5 L 3 2 L 10 5 L 3 8 z");
    dart.appendChild(dpath);
    svg.appendChild(dart);
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
        tick.setAttribute('text-anchor','end');
        tick.setAttribute('style','dominant-baseline: hanging');
        var tlbl = document.createTextNode("0");
        tick.appendChild(tlbl);
        svg.appendChild(tick);
    }
    var out = document.getElementById('output');
    out.innerHTML = '';
    out.appendChild(svg);
    var svgtxt = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' + "\n" + '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">' + "\n" + out.innerHTML;

/*    var blob = new Blob([svgtxt], {'type':'text/svg'});
    var a = document.querySelector('#gdownload');
    a.href = window.URL.createObjectURL(blob);
    var fname = document.querySelector('#filename');
    var filename;
    if (fname.value == '') {
        filename = 'sociogram';
    } else {
        filename = fname.value;
    }
    a.download = filename + "Chart.svg";
    a.style.display = 'inline';
    a.innerHTML = 'Download the Chart';
*/
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
    px_per_cm = d.offsetHeight / 1000;
    body.removeChild(d);
}

function px2cm (px) {
    return px / px_per_cm;
}

function cm2px (cm) {
    return cm * px_per_cm;
}
