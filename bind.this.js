(function(global) {
  var Model = function Model(native) {
    this.native = native;
    this.__getter = [];
    this.__setter = [];
    this.native.build(this);
  };
  Model.prototype.addProperty = function(name) {
    this[name] = function(value) {
      if (typeof(value) == 'undefined') {
        return this._get(name);
      } else {
        this._set(name, value);
      }
    };
  };
  Model.prototype._addGetter = function(name, func) {
    this.__getter.push(name);
    this['bind.this.get' + name] = func;
  };
  Model.prototype._addSetter = function(name, func) {
    this.__setter.push(name);
    this['bind.this.set' + name] = func;
  };
  Model.prototype._get = function(name) {
    if (this['bind.this.get' + name]) {
      return this['bind.this.get' + name]();
    }
    return undefined;
  };
  Model.prototype._set = function(name, value) {
    if (this['bind.this.set' + name]) {
      this['bind.this.set' + name](value);
      // TODO: send notify
    }
  };
  Model.prototype.connect = function(dest, fillFromSource) {
    if (!!fillFromSource) {
      // for each getter 
      for (var i = 0, n = this.__getter.length; i < n; i++) {
        var name = this.__getter[i];
        // set val in dest
        dest._set(name, this._get(name));
      }
    }
    // TODO
    // for each setter
    //   add listener in dest
  };
  Model.prototype.getNative = function() {
    return this.native.getNative();
  };

  /**
   * A JS-object model implementation
   */
  var JsModel = function JsModel(bind, object) {
    this.bind = bind;
    this.object = object;
  };
  JsModel.prototype.build = function(model) {
    for (var prop in this.object) {
      this._buildSingle(model, prop, this.object);
    }
  };
  JsModel.prototype._buildSingle = function(model, name, object) {
    model.addProperty(name);
    model._addGetter(name, function() {
      return object[name];
    });
    model._addSetter(name, function(value) {
      object[name] = value;
    });
  };
  JsModel.prototype.getNative = function() {
    return this.object;
  };
  
  /**
   * A DOM model implementation
   */
  var DomModel = function DomModel(bind, node) {
    this.bind = bind;
    this.node = node;
  };
  DomModel.prototype.build = function(model) {
    var specs = this.node.querySelectorAll('*[data-bind]');
    for (var i = 0, n = specs.length; i < n; i++) {
      var el = specs[i];
      var name = el.getAttribute('data-bind');
      var tag = el.tagName;
      if (this['_build' + tag]) {
        this['_build' + tag](model, name, el);
      } else {
        this._buildElement(model, name, el);
      }
    }
  };
  DomModel.prototype._buildElement = function(model, name, el) {
    model.addProperty(name);
    model._addGetter(name, function() {
      return el.innerHTML;
    });
    model._addSetter(name, function(value) {
      el.innerHTML = value;
    });
  };
  DomModel.prototype._buildList = function(model, name, el) {
    model.addProperty(name);
    model._addGetter(name, function() {
      var result = [];
      var items = el.querySelectorAll('li');
      for (var i = 0, n = items.length; i < n; i++) {
        result.push(items[i].innerHTML);
      }
      return result;
    });
    model._addSetter(name, function(value) {
      var result = [];
      for (var i = 0, n = value.length; i < n; i++) {
        result.push('<li>' + value[i] + '</li>');
      }
      el.innerHTML = result.join('');
    });
  };
  DomModel.prototype._buildUL = DomModel.prototype._buildList;
  DomModel.prototype._buildOL = DomModel.prototype._buildList;
  DomModel.prototype._buildINPUT = function(model, name, el) {
    model.addProperty(name);
    model._addGetter(name, function() {
      return el.getAttribute('value');
    });
    model._addSetter(name, function(value) {
      el.setAttribute('value', value);
    });
  };
  DomModel.prototype._buildSELECT = function(model, name, el) {
    model.addProperty(name);
    model._addGetter(name, function() {
      var result = [];
      var options = el.querySelectorAll('option');
      for (var i = 0, n = options.length; i < n; i++) {
        result.push(options[i].getAttribute('value'));
      }
      return result;
    });
    model._addSetter(name, function(value) {
      var result = [];
      for (var i = 0, n = value.length; i < n; i++) {
        result.push('<option value="' + value[i] + '">' + value[i] + '</option>');
      }
      el.innerHTML = result.join('');
    });
  };
  DomModel.prototype.getNative = function() {
    return this.node;
  };
  
  /**
   * The global exports
   */
  global['bind'] = {
      connect: function(source, dest, fillFromSource) {
        if (typeof(fillFromSource) == 'undefined') {
          fillFromSource = true;
        }
        var sourceModel = null;
        var destModel = null;
        // TODO: Change to factory pattern
        if (source instanceof Node) {
          sourceModel = new Model(new DomModel(this, source));
        }
        if (dest instanceof Object) {
          destModel = new Model(new JsModel(this, dest));
        }
        sourceModel.connect(destModel, fillFromSource);
        return { source: sourceModel, dest: destModel };
      }
  };
})(this);
