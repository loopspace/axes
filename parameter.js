var Parameter = function(id) {
    this.formtbl = document.getElementById(id);
    this.getValues = {};
    this.setValues = {};
    this.elements = {};
}

Parameter.prototype.integer = function(desc,name,min,max,init,callback) {
    var self = this;
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
	sel.addEventListener('change',function(e) {return callback(e,self) });
    }
    this.addRow(desc,sel,'int');
    this.getValues[name] = function() {return sel.value};
    this.setValues[name] = function(v) {
	var index = 0;
//	v = toString(v);
	for (var i = 0; i < sel.children.length; i++) {
	    if (sel.children[i].value == v) {
		index = i;
		break;
	    }
	}
	sel.selectedIndex = index;
    };
    this.elements[name] = sel;
    return sel;
}

Parameter.prototype.select = function(desc,name,opts,init,callback) {
    var self = this;
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
	sel.addEventListener('change',function(e) {return callback(e,self) });
    }
    this.addRow(desc,sel,'int');
    this.getValues[name] = function() {return sel.value};
    this.setValues[name] = function(v) {
	var index = 0;
	for (var i = 0; i < sel.children.length; i++) {
	    if (sel.children[i].value == v) {
		index = i;
		break;
	    }
	}
	sel.selectedIndex = index;
    };
    this.elements[name] = sel;
    return sel;
}

Parameter.prototype.enableOptions = function(sel,opts,val) {
    if (typeof(sel) == "string") {
	sel = this.elements[sel];
    }
    var allopts = sel.children;
    for (var i = 0; i < allopts.length; i++) {
	if (val) {
	    if (opts.indexOf(allopts[i].value) != -1) {
		allopts[i].disabled = false
	    } else {
		allopts[i].disabled = true
	    }
	} else {
	    if (opts.indexOf(i) != -1) {
		allopts[i].disabled = false
	    } else {
		allopts[i].disabled = true
	    }
	}
    }
}

Parameter.prototype.text = function(desc,name,init,callback) {
    var self = this;
    var txt = document.createElement('input');
    txt.type = 'text';
    txt.value = init;
    txt.id = 'parameter_' + name;
    if (typeof callback === 'function') {
	txt.addEventListener('change',function(e) {return callback(e,self) });
    }
    this.addRow(desc,txt,'text');
    this.getValues[name] = function() {return txt.value};
    this.setValues[name] = function(v) {
	txt.value = v;
    };
    this.elements[name] = txt;
    return txt;
}

Parameter.prototype.boolean = function(desc,name,init,callback) {
    var self = this;
    var cbx = document.createElement('input');
    cbx.type = 'checkbox';
    cbx.checked = init;
    cbx.id = 'parameter_' + name;
    if (typeof callback === 'function') {
	cbx.addEventListener('change',function(e) {return callback(e,self) });
    }
    this.addRow(desc,cbx,'bool');
    this.getValues[name] = function() {return cbx.checked};
    this.setValues[name] = function(v) {
	cbx.checked = v;
    };
    this.elements[name] = cbx;
    return cbx;
}

Parameter.prototype.action = function(desc,callback) {
    var self = this;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.innerHTML = desc;
    if (typeof callback === 'function') {
	btn.addEventListener('click',function(e) {return callback(e,self) });
    }
    this.addRow('',btn,'action');
    this.elements[name] = btn;
    return btn;
}

Parameter.prototype.number = function(desc,name,min,max,init,callback) {
    var self = this;
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
	    callback(e,self);
	}
    };
    dv.addEventListener('mousedown',function(e) {moving = true; fn(e);});
    dv.addEventListener('mouseup',function() {moving = false;});
    dv.addEventListener('mousemove',fn);
    this.addRow(desc,dv,'slider');
    this.getValues[name] = function() {
	var style = sp.currentStyle || window.getComputedStyle(sp);
	var p = style.marginLeft.replace(/[^\d\.\-]/g,'');
	var w = dv.offsetWidth - 2;
	var t = p/w*(max - min) + min; 
	return t;
    };
    this.setValues[name] = function(v) {
	var p = (v - min)/(max - min)*100;
	sp.style.marginLeft = p + '%';
    };
    this.elements[name] = dv;
    return dv;
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

Parameter.prototype.setParameter = function(n,v) {
    this.setValues[n](v);
}

Parameter.prototype.getParameter = function(n) {
    return this.getValues[n]();
}
