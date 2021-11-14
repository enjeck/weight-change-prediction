// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"src/script.js":[function(require,module,exports) {
window.addEventListener('load', function () {
  // Prevent the page from reloading when form is submitted
  var form = document.getElementById("form");

  function handleForm(event) {
    event.preventDefault();
  }

  form.addEventListener("submit", handleForm); // Call the predict function when button is clicked

  document.querySelector("#predict-btn").addEventListener("click", predict);

  function predict() {
    // Get various values entered by user
    var a = parseFloat(document.querySelector("#age").value);
    var h = parseFloat(document.querySelector("#height").value);
    var w_0 = parseFloat(document.querySelector("#weight").value);
    var s, f;
    var sex_value = document.querySelector("input[name=sex]:checked").value;
    var activity_value = document.querySelector("#activity").value;
    var n = parseFloat(document.querySelector("#diet").value);

    if (isNaN(n) || isNaN(h) || isNaN(w_0) || isNaN(a) || sex_value === "") {
      return;
    } // Set value based on sex


    if (sex_value === "female") {
      s = -161;
    } else {
      s = 5;
    } // Set activity value based on selected activity


    switch (activity_value) {
      case "sedentary":
        f = 1.2;
        break;

      case "light-exercise":
        f = 1.3;
        break;

      case "moderate-exercise":
        f = 1.5;
        break;

      case "heavy-exercise":
        f = 1.7;
        break;

      case "v-heavy-exercise":
        f = 1.9;
        break;

      default:
        f = 1.2;
        break;
    } // Calculate the integration constant


    var k = (n - f * (6.25 * h - 5 * a + s)) / (10 * f);
    var c = w_0 - k;
    var table_start = "\n            <table>\n              <tr>\n              <th>Month</th>\n              <th>Weight (kg)</th>\n              <th>Monthly change (kg)</th>\n              <th>Total change (kg)</th>\n              </tr>";
    var table_end = "</table>";
    var table_data = "";
    var w_t; // dataset to be used for line chart

    var weightTime = [{
      time: 0,
      weight: w_0
    }];
    var textColor; // Calculate the monthly weight

    for (var j = 1; j < 101; j++) {
      // Using the assumption that one month is 30 days
      var t = j * 30;
      w_t = c * Math.exp(f * t / -770) + k; // Rounding to 2 decimal places

      w_t = Math.round((w_t + Number.EPSILON) * 100) / 100; // Create and insert object

      var obj = {
        time: j,
        weight: w_t
      }; // Populate the line chart dataset

      weightTime.push(obj);
      var prev_t = (j - 1) * 30;
      var prev_w_t = c * Math.exp(f * prev_t / -770) + k;
      var diff_w_t = w_t - prev_w_t;
      var diff_w_t_round = Math.round((diff_w_t + Number.EPSILON) * 100) / 100;
      var diff_w_0 = w_t - w_0;
      var diff_w_0_round = Math.round((diff_w_0 + Number.EPSILON) * 100) / 100;
      var sign = void 0;
      /* If the weight change is less than starting weight,
      give text a class corresponding to red color . Otherwise,
      green text*/

      /* Put plus sign in front of positive values */

      if (diff_w_t < 0) {
        textColor = "red";
        sign = "";
      } else {
        textColor = "green";
        sign = "+";
      }

      table_data += "\n            <tr>\n            <td> ".concat(j, "</td>\n            <td>").concat(w_t, "</td>\n            <td class=\"").concat(textColor, "\">").concat(sign).concat(diff_w_t_round, "</td>\n            <td class=\"").concat(textColor, "\">").concat(sign).concat(diff_w_0_round, "</td>\n            </tr>");
    }

    var table = table_start + table_data + table_end;
    table = new DOMParser().parseFromString(table, "text/xml");
    var output = document.getElementById("table");

    if (output.innerHTML) {
      // Prevent multiple tables from being added
      // Force every added table to replace previous table
      output.innerHTML = "";
      output.appendChild(table.documentElement);
    } else {
      output.appendChild(table.documentElement);
    } // Workaround to fix table layout bug


    table = output.innerHTML;
    output.innerHTML = table;
    /* Creating the bar chart */
    // set the dimensions of the graph

    width = Math.min(800, window.innerWidth / 1.1);
    height = Math.max(width, 600); // append the svg object to the body of the page

    document.getElementById("line-chart").innerHTML = "";
    var svg = d3.select("#line-chart").append("svg").attr("width", width).attr("height", height);
    var lastEl = weightTime[weightTime.length - 1]; // Calculate the axis values

    var xScale = d3.scaleLinear().domain([0, lastEl.time + 1]).range([0, width / 1.2]),
        yScale = d3.scaleLinear().domain([Math.min(w_0 - 5, lastEl.weight - 5), Math.max(w_0 + 2, lastEl.weight + 2)]).range([height / 1.2, 0]);
    var g = svg.append("g").attr("transform", "translate(" + 50 + "," + 50 + ")"); // X-axis label

    svg.append('text').attr('x', width / 2.2).attr('y', height / 1.05 + 10).attr('text-anchor', 'middle').style('font-family', 'Helvetica').style('font-size', 10).style('font-weight', 'bold').text('Time in months'); // Y-axis label

    svg.append('text').attr('text-anchor', 'middle').attr('transform', 'translate(20,' + height / 2 + ')rotate(-90)').style('font-family', 'Helvetica').style('font-size', 10).style('font-weight', 'bold').text('Weight in kilograms'); // X-axis scale

    g.append("g").attr("transform", "translate(0," + height / 1.2 + ")").call(d3.axisBottom(xScale));
    g.append("g").call(d3.axisLeft(yScale)); // Dots

    svg.append('g').selectAll("dot").data(weightTime).enter().append("circle").attr("cx", function (d) {
      return xScale(d.time);
    }).attr("cy", function (d) {
      return yScale(d.weight);
    }).attr("r", 3).attr("transform", "translate(" + 50 + "," + 50 + ")").style("fill", textColor); // Line        

    var line = d3.line().x(function (d) {
      return xScale(d.time);
    }).y(function (d) {
      return yScale(d.weight);
    }).curve(d3.curveMonotoneX);
    svg.append("path").datum(weightTime).attr("class", "line").attr("transform", "translate(" + 50 + "," + 50 + ")").attr("d", line).style("fill", "none").style("stroke", textColor).style("stroke-width", "2"); // Automatically scroll to the output area after it is output generated

    var anchor = document.createElement('a');
    anchor.setAttribute("href", "#output");
    anchor.click(); // Show hidden text in output area

    var hiddenText = document.querySelectorAll('.output-text');

    for (var m = 0; m < hiddenText.length; m++) {
      hiddenText[m].style.display = "block";
    }
  }
});
},{}],"node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "44445" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["node_modules/parcel-bundler/src/builtins/hmr-runtime.js","src/script.js"], null)
//# sourceMappingURL=/script.baf0e655.js.map