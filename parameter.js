var Parameter = function(id) {
    this.formtbl = document.getElementById(id);
    this.values = {};
}

Parameter.prototype.integer = function(desc,name,min,max,init,callback) {
    var sel = document.createElement('select');
    var opt;
    var index = 0;
    for (var i = min; i <= max; i++) {
	opt = document.createElement('option');
	opt.value = i;
	opt.innerHTML = i;
	sel.appendChild(opt);
	if (i < init) {
	    index++;
	}
    }
    sel.selectedIndex = index;
    sel.id = 'parameter_' + name;
    if (typeof callback === 'function') {
	sel.addEventListener('change',callback);
    }
    this.addRow(desc,sel,'int');
    this.values[name] = function() {return sel.value};
}

Parameter.prototype.select = function(desc,name,opts,init,callback) {
    var sel = document.createElement('select');
    var opt;
    var index = 0;
    var n = opts.length;
    for (var i = 0; i < n; i++) {
	opt = document.createElement('option');
	opt.value = opts[i];
	opt.innerHTML = opts[i];
	sel.appendChild(opt);
	if (opts[i] == init) {
	    index = i;
	}
    }
    sel.selectedIndex = index;
    sel.id = 'parameter_' + name;
    if (typeof callback === 'function') {
	sel.addEventListener('change',callback);
    }
    this.addRow(desc,sel,'int');
    this.values[name] = function() {return sel.value};
}

Parameter.prototype.text = function(desc,name,init,callback) {
    var txt = document.createElement('input');
    txt.type = 'text';
    txt.value = init;
    txt.id = 'parameter_' + name;
    if (typeof callback === 'function') {
	txt.addEventListener('change',callback);
    }
    this.addRow(desc,txt,'text');
    this.values[name] = function() {return txt.value};
}

Parameter.prototype.boolean = function(desc,name,init,callback) {
    var cbx = document.createElement('input');
    cbx.type = 'checkbox';
    cbx.checked = init;
    cbx.id = 'parameter_' + name;
    if (typeof callback === 'function') {
	cbx.addEventListener('change',callback);
    }
    this.addRow(desc,cbx,'bool');
    this.values[name] = function() {return cbx.checked};
}

Parameter.prototype.action = function(desc,callback) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = desc;
    if (typeof callback === 'function') {
	btn.addEventListener('click',callback);
    }
    this.addRow('',btn,'action');
}

Parameter.prototype.number = function(desc,name,min,max,init,callback) {
    var dv = document.createElement('div');
    dv.id = 'parameter_' + name;
    var sp = document.createElement('span');
    var sph = document.createElement('span');
    dv.appendChild(sph);
    dv.appendChild(sp);
    dv.className += ' sliderCtr';
    sp.className += ' slider';
    sph.className += ' sliderBg';
    var p = (init - min)/(max - min)*100;
    sp.style.marginLeft = p + '%';
    var moving;
    if (typeof callback !== "function") {
	callback = function() {};
    }
    var fn = function(e) {
	e.preventDefault();
	if (moving) {
	    var w = dv.offsetWidth - 2;
	    var t = Math.min(w,Math.max(0,e.pageX - dv.offsetLeft));
	    sp.style.marginLeft = t + 'px';
	    callback();
	}
    };
    dv.addEventListener('mousedown',function(e) {moving = true; fn(e);});
    dv.addEventListener('mouseup',function() {moving = false;});
    dv.addEventListener('mousemove',fn);
    this.addRow(desc,dv,'slider');
    this.values[name] = function() {
	var style = sp.currentStyle || window.getComputedStyle(sp);
	var p = style.marginLeft.replace(/[^\d\.\-]/g,'');
	var w = dv.offsetWidth - 2;
	var t = p/w*(max - min) + min; 
	return t;
    };
}

Parameter.prototype.separator = function(desc) {
    this.addRow(desc,null,'sep');
}

Parameter.prototype.addRow = function(lbl,elt,cls) {
    var row = document.createElement('tr');
    row.className += 'paramRow ' + cls;
    var cell = document.createElement('td');
    var label = document.createTextNode(lbl);
    cell.appendChild(label);
    row.appendChild(cell);
    if (elt) {
	cell = document.createElement('td');
	cell.appendChild(elt);
	row.appendChild(cell);
    }
    this.formtbl.appendChild(row);
}

Parameter.prototype.getParameter = function(n) {
    return this.values[n]();
}
