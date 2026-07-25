var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res, err) => function __init() {
  if (err) throw err[0];
  try {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  } catch (e) {
    throw err = [e], e;
  }
};
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};

// node_modules/@salusoft89/planegcs/dist/planegcs_dist/enums.js
var Constraint_Alignment, Algorithm;
var init_enums = __esm({
  "node_modules/@salusoft89/planegcs/dist/planegcs_dist/enums.js"() {
    Constraint_Alignment = {
      NoInternalAlignment: 0,
      InternalAlignment: 1
    };
    Algorithm = {
      BFGS: 0,
      LevenbergMarquardt: 1,
      DogLeg: 2
    };
  }
});

// node_modules/@salusoft89/planegcs/dist/sketch/sketch_primitive.js
function is_sketch_geometry(primitive) {
  if (primitive === void 0 || primitive.type === "param") {
    return false;
  }
  return GEOMETRY_TYPES.includes(primitive.type);
}
function is_sketch_constraint(primitive) {
  if (primitive === void 0) {
    return false;
  }
  return !is_sketch_geometry(primitive);
}
var GEOMETRY_TYPES;
var init_sketch_primitive = __esm({
  "node_modules/@salusoft89/planegcs/dist/sketch/sketch_primitive.js"() {
    GEOMETRY_TYPES = ["point", "line", "circle", "arc", "ellipse", "arc_of_ellipse", "hyperbola", "arc_of_hyperbola", "parabola", "arc_of_parabola", "bspline"];
  }
});

// node_modules/@salusoft89/planegcs/dist/sketch/sketch_index.js
var SketchIndexBase, SketchIndex;
var init_sketch_index = __esm({
  "node_modules/@salusoft89/planegcs/dist/sketch/sketch_index.js"() {
    init_sketch_primitive();
    SketchIndexBase = class {
      get_primitive_or_fail(id) {
        const obj = this.get_primitive(id);
        if (obj === void 0) {
          throw new Error(`sketch object ${id} not found`);
        }
        return obj;
      }
      get_sketch_point(id) {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== "point") {
          throw new Error(`sketch object ${id} is not a sketch point`);
        }
        return obj;
      }
      get_sketch_line(id) {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== "line") {
          throw new Error(`sketch object ${id} is not a sketch line`);
        }
        return obj;
      }
      get_sketch_circle(id) {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== "circle") {
          throw new Error(`sketch object ${id} is not a sketch circle`);
        }
        return obj;
      }
      get_sketch_arc(id) {
        const obj = this.get_primitive_or_fail(id);
        if (obj.type !== "arc") {
          throw new Error(`sketch object ${id} is not a sketch arc`);
        }
        return obj;
      }
      get_constraints() {
        return this.get_primitives().filter((o) => !is_sketch_geometry(o));
      }
      toString() {
        return this.get_primitives().map((o) => JSON.stringify(o)).join("\n");
      }
    };
    SketchIndex = class extends SketchIndexBase {
      constructor() {
        super(...arguments);
        this.index = /* @__PURE__ */ new Map();
        this.primitive_ids = [];
      }
      has(id) {
        return this.index.has(id);
      }
      delete_primitive(id) {
        return this.index.delete(id);
      }
      set_primitive(obj) {
        if (!this.has(obj.id)) {
          this.primitive_ids.push(obj.id);
        }
        this.index.set(obj.id, obj);
      }
      get_primitive(id) {
        return this.index.get(id);
      }
      get_primitives() {
        return Array.from(this.index.values());
      }
      get_id_by_index(index) {
        return this.primitive_ids[index - 1];
      }
      clear() {
        this.index.clear();
        this.primitive_ids = [];
      }
      counter() {
        return this.primitive_ids.length;
      }
    };
  }
});

// node_modules/@salusoft89/planegcs/dist/planegcs_dist/constraints.js
var init_constraints = __esm({
  "node_modules/@salusoft89/planegcs/dist/planegcs_dist/constraints.js"() {
  }
});

// node_modules/@salusoft89/planegcs/dist/planegcs_dist/planegcs.js
var Module, planegcs_default;
var init_planegcs = __esm({
  "node_modules/@salusoft89/planegcs/dist/planegcs_dist/planegcs.js"() {
    Module = (() => {
      var _scriptDir = import.meta.url;
      return (async function(moduleArg = {}) {
        var h = moduleArg, aa, ba;
        h.ready = new Promise((b, a) => {
          aa = b;
          ba = a;
        });
        var ca = Object.assign({}, h), da = "./this.program", ea = "object" == typeof window, r = "function" == typeof importScripts, fa = "object" == typeof process && "object" == typeof process.versions && "string" == typeof process.versions.node, w = "", ha, ia, ja;
        if (fa) {
          const { createRequire: b } = await import("module");
          var require2 = b(import.meta.url), fs = require2("fs"), ka = require2("path");
          r ? w = ka.dirname(w) + "/" : w = require2("url").fileURLToPath(new URL("./", import.meta.url));
          ha = (a, c) => {
            a = a.startsWith("file://") ? new URL(a) : ka.normalize(a);
            return fs.readFileSync(a, c ? void 0 : "utf8");
          };
          ja = (a) => {
            a = ha(a, true);
            a.buffer || (a = new Uint8Array(a));
            return a;
          };
          ia = (a, c, d, f = true) => {
            a = a.startsWith("file://") ? new URL(a) : ka.normalize(a);
            fs.readFile(
              a,
              f ? void 0 : "utf8",
              (g, l) => {
                g ? d(g) : c(f ? l.buffer : l);
              }
            );
          };
          !h.thisProgram && 1 < process.argv.length && (da = process.argv[1].replace(/\\/g, "/"));
          process.argv.slice(2);
          h.inspect = () => "[Emscripten Module object]";
        } else if (ea || r) r ? w = self.location.href : "undefined" != typeof document && document.currentScript && (w = document.currentScript.src), _scriptDir && (w = _scriptDir), 0 !== w.indexOf("blob:") ? w = w.substr(0, w.replace(/[?#].*/, "").lastIndexOf("/") + 1) : w = "", ha = (b) => {
          var a = new XMLHttpRequest();
          a.open("GET", b, false);
          a.send(null);
          return a.responseText;
        }, r && (ja = (b) => {
          var a = new XMLHttpRequest();
          a.open("GET", b, false);
          a.responseType = "arraybuffer";
          a.send(null);
          return new Uint8Array(a.response);
        }), ia = (b, a, c) => {
          var d = new XMLHttpRequest();
          d.open("GET", b, true);
          d.responseType = "arraybuffer";
          d.onload = () => {
            200 == d.status || 0 == d.status && d.response ? a(d.response) : c();
          };
          d.onerror = c;
          d.send(null);
        };
        h.print || console.log.bind(console);
        var x = h.printErr || console.error.bind(console);
        Object.assign(h, ca);
        ca = null;
        h.thisProgram && (da = h.thisProgram);
        var y;
        h.wasmBinary && (y = h.wasmBinary);
        var noExitRuntime = h.noExitRuntime || true;
        "object" != typeof WebAssembly && la("no native wasm support detected");
        var ma, na = false, z, A, C, D, F, G, oa, pa, qa, ra = [], sa = [], ta = [];
        function ua() {
          var b = h.preRun.shift();
          ra.unshift(b);
        }
        var H = 0, va = null, I = null;
        function la(b) {
          if (h.onAbort) h.onAbort(b);
          b = "Aborted(" + b + ")";
          x(b);
          na = true;
          b = new WebAssembly.RuntimeError(b + ". Build with -sASSERTIONS for more info.");
          ba(b);
          throw b;
        }
        function wa(b) {
          return b.startsWith("data:application/octet-stream;base64,");
        }
        var J;
        if (h.locateFile) {
          if (J = "planegcs.wasm", !wa(J)) {
            var xa = J;
            J = h.locateFile ? h.locateFile(xa, w) : w + xa;
          }
        } else J = new URL("planegcs.wasm", import.meta.url).href;
        function ya(b) {
          if (b == J && y) return new Uint8Array(y);
          if (ja) return ja(b);
          throw "both async and sync fetching of the wasm failed";
        }
        function za(b) {
          if (!y && (ea || r)) {
            if ("function" == typeof fetch && !b.startsWith("file://")) return fetch(b, { credentials: "same-origin" }).then((a) => {
              if (!a.ok) throw "failed to load wasm binary file at '" + b + "'";
              return a.arrayBuffer();
            }).catch(() => ya(b));
            if (ia) return new Promise((a, c) => {
              ia(b, (d) => a(new Uint8Array(d)), c);
            });
          }
          return Promise.resolve().then(() => ya(b));
        }
        function Aa(b, a, c) {
          return za(b).then((d) => WebAssembly.instantiate(d, a)).then((d) => d).then(c, (d) => {
            x(`failed to asynchronously prepare wasm: ${d}`);
            la(d);
          });
        }
        function Ba(b, a) {
          var c = J;
          return y || "function" != typeof WebAssembly.instantiateStreaming || wa(c) || c.startsWith("file://") || fa || "function" != typeof fetch ? Aa(c, b, a) : fetch(c, { credentials: "same-origin" }).then((d) => WebAssembly.instantiateStreaming(d, b).then(a, function(f) {
            x(`wasm streaming compile failed: ${f}`);
            x("falling back to ArrayBuffer instantiation");
            return Aa(c, b, a);
          }));
        }
        var Ca = { 39908: () => {
          console.log("Solving with DogLeg\n");
        }, 39950: () => {
          console.log("Solving with LevenbergMarquardt\n");
        }, 40004: () => {
          console.log("Solving with BFGS\n");
        } }, Da = (b) => {
          for (; 0 < b.length; ) b.shift()(h);
        };
        function Ea(b) {
          this.N = b - 24;
          this.ua = function(a) {
            G[this.N + 4 >> 2] = a;
          };
          this.ma = function(a) {
            G[this.N + 8 >> 2] = a;
          };
          this.fa = function(a, c) {
            this.la();
            this.ua(a);
            this.ma(c);
          };
          this.la = function() {
            G[this.N + 16 >> 2] = 0;
          };
        }
        var Fa = 0, Ga = 0, Ha = void 0, K = (b) => {
          for (var a = ""; A[b]; ) a += Ha[A[b++]];
          return a;
        }, L = {}, M = {}, Ia = {}, N = void 0, Ja = (b) => {
          throw new N(b);
        }, O = void 0, R = (b, a, c) => {
          function d(k) {
            k = c(k);
            if (k.length !== b.length) throw new O("Mismatched type converter count");
            for (var m = 0; m < b.length; ++m) P(b[m], k[m]);
          }
          b.forEach(function(k) {
            Ia[k] = a;
          });
          var f = Array(a.length), g = [], l = 0;
          a.forEach((k, m) => {
            M.hasOwnProperty(k) ? f[m] = M[k] : (g.push(k), L.hasOwnProperty(k) || (L[k] = []), L[k].push(() => {
              f[m] = M[k];
              ++l;
              l === g.length && d(f);
            }));
          });
          0 === g.length && d(f);
        };
        function Ka(b, a, c = {}) {
          var d = a.name;
          if (!b) throw new N(`type "${d}" must have a positive integer typeid pointer`);
          if (M.hasOwnProperty(b)) {
            if (c.za) return;
            throw new N(`Cannot register type '${d}' twice`);
          }
          M[b] = a;
          delete Ia[b];
          L.hasOwnProperty(b) && (a = L[b], delete L[b], a.forEach((f) => f()));
        }
        function P(b, a, c = {}) {
          if (!("argPackAdvance" in a)) throw new TypeError("registerType registeredInstance requires argPackAdvance");
          Ka(b, a, c);
        }
        var La = (b) => {
          throw new N(b.H.O.M.name + " instance already deleted");
        }, Ma = false, Na = () => {
        }, Oa = (b, a, c) => {
          if (a === c) return b;
          if (void 0 === c.R) return null;
          b = Oa(b, a, c.R);
          return null === b ? null : c.wa(b);
        }, Pa = {}, S = [], Qa = () => {
          for (; S.length; ) {
            var b = S.pop();
            b.H.aa = false;
            b["delete"]();
          }
        }, T = void 0, Ra = {}, Sa = (b, a) => {
          if (void 0 === a) throw new N("ptr should not be undefined");
          for (; b.R; ) a = b.ea(a), b = b.R;
          return Ra[a];
        }, Ua = (b, a) => {
          if (!a.O || !a.N) throw new O("makeClassHandle requires ptr and ptrType");
          if (!!a.S !== !!a.P) throw new O("Both smartPtrType and smartPtr must be specified");
          a.count = { value: 1 };
          return Ta(Object.create(b, { H: { value: a } }));
        }, Ta = (b) => {
          if ("undefined" === typeof FinalizationRegistry) return Ta = (a) => a, b;
          Ma = new FinalizationRegistry((a) => {
            a = a.H;
            --a.count.value;
            0 === a.count.value && (a.P ? a.S.X(a.P) : a.O.M.X(a.N));
          });
          Ta = (a) => {
            var c = a.H;
            c.P && Ma.register(a, { H: c }, a);
            return a;
          };
          Na = (a) => {
            Ma.unregister(a);
          };
          return Ta(b);
        };
        function U() {
        }
        var Va = (b) => {
          if (void 0 === b) return "_unknown";
          b = b.replace(/[^a-zA-Z0-9_]/g, "$");
          var a = b.charCodeAt(0);
          return 48 <= a && 57 >= a ? `_${b}` : b;
        };
        function Wa(b, a) {
          b = Va(b);
          return { [b]: function() {
            return a.apply(this, arguments);
          } }[b];
        }
        var Xa = (b, a, c) => {
          if (void 0 === b[a].W) {
            var d = b[a];
            b[a] = function() {
              if (!b[a].W.hasOwnProperty(arguments.length)) throw new N(`Function '${c}' called with an invalid number of arguments (${arguments.length}) - expects one of (${b[a].W})!`);
              return b[a].W[arguments.length].apply(this, arguments);
            };
            b[a].W = [];
            b[a].W[d.ga] = d;
          }
        }, Ya = (b, a) => {
          if (h.hasOwnProperty(b)) throw new N(`Cannot register public name '${b}' twice`);
          h[b] = a;
        };
        function Za(b, a, c, d, f, g, l, k) {
          this.name = b;
          this.constructor = a;
          this.ba = c;
          this.X = d;
          this.R = f;
          this.xa = g;
          this.ea = l;
          this.wa = k;
          this.Ba = [];
        }
        var $a = (b, a, c) => {
          for (; a !== c; ) {
            if (!a.ea) throw new N(`Expected null or instance of ${c.name}, got an instance of ${a.name}`);
            b = a.ea(b);
            a = a.R;
          }
          return b;
        };
        function ab(b, a) {
          if (null === a) {
            if (this.na) throw new N(`null is not a valid ${this.name}`);
            return 0;
          }
          if (!a.H) throw new N(`Cannot pass "${bb(a)}" as a ${this.name}`);
          if (!a.H.N) throw new N(`Cannot pass deleted object as a pointer of type ${this.name}`);
          return $a(a.H.N, a.H.O.M, this.M);
        }
        function cb(b, a) {
          if (null === a) {
            if (this.na) throw new N(`null is not a valid ${this.name}`);
            if (this.ia) {
              var c = this.Ca();
              null !== b && b.push(this.X, c);
              return c;
            }
            return 0;
          }
          if (!a.H) throw new N(`Cannot pass "${bb(a)}" as a ${this.name}`);
          if (!a.H.N) throw new N(`Cannot pass deleted object as a pointer of type ${this.name}`);
          if (!this.ha && a.H.O.ha) throw new N(`Cannot convert argument of type ${a.H.S ? a.H.S.name : a.H.O.name} to parameter type ${this.name}`);
          c = $a(a.H.N, a.H.O.M, this.M);
          if (this.ia) {
            if (void 0 === a.H.P) throw new N("Passing raw pointer to smart pointer is illegal");
            switch (this.Ea) {
              case 0:
                if (a.H.S === this) c = a.H.P;
                else throw new N(`Cannot convert argument of type ${a.H.S ? a.H.S.name : a.H.O.name} to parameter type ${this.name}`);
                break;
              case 1:
                c = a.H.P;
                break;
              case 2:
                if (a.H.S === this) c = a.H.P;
                else {
                  var d = a.clone();
                  c = this.Da(c, db(() => d["delete"]()));
                  null !== b && b.push(this.X, c);
                }
                break;
              default:
                throw new N("Unsupporting sharing policy");
            }
          }
          return c;
        }
        function eb(b, a) {
          if (null === a) {
            if (this.na) throw new N(`null is not a valid ${this.name}`);
            return 0;
          }
          if (!a.H) throw new N(`Cannot pass "${bb(a)}" as a ${this.name}`);
          if (!a.H.N) throw new N(`Cannot pass deleted object as a pointer of type ${this.name}`);
          if (a.H.O.ha) throw new N(`Cannot convert argument of type ${a.H.O.name} to parameter type ${this.name}`);
          return $a(a.H.N, a.H.O.M, this.M);
        }
        function fb(b) {
          return this.fromWireType(G[b >> 2]);
        }
        function V(b, a, c, d) {
          this.name = b;
          this.M = a;
          this.na = c;
          this.ha = d;
          this.ia = false;
          this.X = this.Da = this.Ca = this.sa = this.Ea = this.Aa = void 0;
          void 0 !== a.R ? this.toWireType = cb : (this.toWireType = d ? ab : eb, this.T = null);
        }
        var gb = (b, a) => {
          if (!h.hasOwnProperty(b)) throw new O("Replacing nonexistant public symbol");
          h[b] = a;
          h[b].ga = void 0;
        }, hb = [], ib = (b) => {
          var a = hb[b];
          a || (b >= hb.length && (hb.length = b + 1), hb[b] = a = qa.get(b));
          return a;
        }, jb = (b, a) => {
          var c = [];
          return function() {
            c.length = 0;
            Object.assign(c, arguments);
            if (b.includes("j")) {
              var d = h["dynCall_" + b];
              d = c && c.length ? d.apply(null, [a].concat(c)) : d.call(null, a);
            } else d = ib(a).apply(null, c);
            return d;
          };
        }, W = (b, a) => {
          b = K(b);
          var c = b.includes("j") ? jb(b, a) : ib(a);
          if ("function" != typeof c) throw new N(`unknown function pointer with signature ${b}: ${a}`);
          return c;
        }, kb = void 0, mb = (b) => {
          b = lb(b);
          var a = K(b);
          X(b);
          return a;
        }, nb = (b, a) => {
          function c(g) {
            f[g] || M[g] || (Ia[g] ? Ia[g].forEach(c) : (d.push(g), f[g] = true));
          }
          var d = [], f = {};
          a.forEach(c);
          throw new kb(`${b}: ` + d.map(mb).join([", "]));
        }, ob = (b, a) => {
          for (var c = [], d = 0; d < b; d++) c.push(G[a + 4 * d >> 2]);
          return c;
        }, pb = (b) => {
          for (; b.length; ) {
            var a = b.pop();
            b.pop()(a);
          }
        };
        function qb(b) {
          var a = Function;
          if (!(a instanceof Function)) throw new TypeError(`new_ called with constructor type ${typeof a} which is not a function`);
          var c = Wa(a.name || "unknownFunctionName", function() {
          });
          c.prototype = a.prototype;
          c = new c();
          b = a.apply(c, b);
          return b instanceof Object ? b : c;
        }
        function rb(b, a, c, d, f, g) {
          var l = a.length;
          if (2 > l) throw new N("argTypes array size mismatch! Must at least get return value and 'this' types!");
          var k = null !== a[1] && null !== c, m = false;
          for (c = 1; c < a.length; ++c) if (null !== a[c] && void 0 === a[c].T) {
            m = true;
            break;
          }
          var q = "void" !== a[0].name, n = "", u = "";
          for (c = 0; c < l - 2; ++c) n += (0 !== c ? ", " : "") + "arg" + c, u += (0 !== c ? ", " : "") + "arg" + c + "Wired";
          b = `
        return function ${Va(b)}(${n}) {
        if (arguments.length !== ${l - 2}) {
          throwBindingError('function ${b} called with ' + arguments.length + ' arguments, expected ${l - 2}');
        }`;
          m && (b += "var destructors = [];\n");
          var v = m ? "destructors" : "null";
          n = "throwBindingError invoker fn runDestructors retType classParam".split(" ");
          d = [Ja, d, f, pb, a[0], a[1]];
          k && (b += "var thisWired = classParam.toWireType(" + v + ", this);\n");
          for (c = 0; c < l - 2; ++c) b += "var arg" + c + "Wired = argType" + c + ".toWireType(" + v + ", arg" + c + "); // " + a[c + 2].name + "\n", n.push("argType" + c), d.push(a[c + 2]);
          k && (u = "thisWired" + (0 < u.length ? ", " : "") + u);
          b += (q || g ? "var rv = " : "") + "invoker(fn" + (0 < u.length ? ", " : "") + u + ");\n";
          if (m) b += "runDestructors(destructors);\n";
          else for (c = k ? 1 : 2; c < a.length; ++c) g = 1 === c ? "thisWired" : "arg" + (c - 2) + "Wired", null !== a[c].T && (b += g + "_dtor(" + g + "); // " + a[c].name + "\n", n.push(g + "_dtor"), d.push(a[c].T));
          q && (b += "var ret = retType.fromWireType(rv);\nreturn ret;\n");
          n.push(b + "}\n");
          return qb(n).apply(null, d);
        }
        function sb() {
          this.V = [void 0];
          this.ra = [];
        }
        var Y = new sb(), tb = (b) => {
          b >= Y.fa && 0 === --Y.get(b).ta && Y.ma(b);
        }, db = (b) => {
          switch (b) {
            case void 0:
              return 1;
            case null:
              return 2;
            case true:
              return 3;
            case false:
              return 4;
            default:
              return Y.la({ ta: 1, value: b });
          }
        };
        function wb(b) {
          return this.fromWireType(F[b >> 2]);
        }
        var xb = (b, a, c) => {
          switch (a) {
            case 1:
              return c ? function(d) {
                return this.fromWireType(z[d >> 0]);
              } : function(d) {
                return this.fromWireType(A[d >> 0]);
              };
            case 2:
              return c ? function(d) {
                return this.fromWireType(C[d >> 1]);
              } : function(d) {
                return this.fromWireType(D[d >> 1]);
              };
            case 4:
              return c ? function(d) {
                return this.fromWireType(F[d >> 2]);
              } : function(d) {
                return this.fromWireType(G[d >> 2]);
              };
            default:
              throw new TypeError(`invalid integer width (${a}): ${b}`);
          }
        }, yb = (b, a) => {
          var c = M[b];
          if (void 0 === c) throw b = a + " has unknown type " + mb(b), new N(b);
          return c;
        }, bb = (b) => {
          if (null === b) return "null";
          var a = typeof b;
          return "object" === a || "array" === a || "function" === a ? b.toString() : "" + b;
        }, zb = (b, a) => {
          switch (a) {
            case 4:
              return function(c) {
                return this.fromWireType(oa[c >> 2]);
              };
            case 8:
              return function(c) {
                return this.fromWireType(pa[c >> 3]);
              };
            default:
              throw new TypeError(`invalid float width (${a}): ${b}`);
          }
        }, Ab = (b, a, c) => {
          switch (a) {
            case 1:
              return c ? (d) => z[d >> 0] : (d) => A[d >> 0];
            case 2:
              return c ? (d) => C[d >> 1] : (d) => D[d >> 1];
            case 4:
              return c ? (d) => F[d >> 2] : (d) => G[d >> 2];
            default:
              throw new TypeError(`invalid integer width (${a}): ${b}`);
          }
        }, Bb = (b, a, c, d) => {
          if (0 < d) {
            d = c + d - 1;
            for (var f = 0; f < b.length; ++f) {
              var g = b.charCodeAt(f);
              if (55296 <= g && 57343 >= g) {
                var l = b.charCodeAt(++f);
                g = 65536 + ((g & 1023) << 10) | l & 1023;
              }
              if (127 >= g) {
                if (c >= d) break;
                a[c++] = g;
              } else {
                if (2047 >= g) {
                  if (c + 1 >= d) break;
                  a[c++] = 192 | g >> 6;
                } else {
                  if (65535 >= g) {
                    if (c + 2 >= d) break;
                    a[c++] = 224 | g >> 12;
                  } else {
                    if (c + 3 >= d) break;
                    a[c++] = 240 | g >> 18;
                    a[c++] = 128 | g >> 12 & 63;
                  }
                  a[c++] = 128 | g >> 6 & 63;
                }
                a[c++] = 128 | g & 63;
              }
            }
            a[c] = 0;
          }
        }, Cb = (b) => {
          for (var a = 0, c = 0; c < b.length; ++c) {
            var d = b.charCodeAt(c);
            127 >= d ? a++ : 2047 >= d ? a += 2 : 55296 <= d && 57343 >= d ? (a += 4, ++c) : a += 3;
          }
          return a;
        }, Db = "undefined" != typeof TextDecoder ? new TextDecoder("utf8") : void 0, Eb = (b, a) => {
          var c = A, d = b + a;
          for (a = b; c[a] && !(a >= d); ) ++a;
          if (16 < a - b && c.buffer && Db) return Db.decode(c.subarray(b, a));
          for (d = ""; b < a; ) {
            var f = c[b++];
            if (f & 128) {
              var g = c[b++] & 63;
              if (192 == (f & 224)) d += String.fromCharCode((f & 31) << 6 | g);
              else {
                var l = c[b++] & 63;
                f = 224 == (f & 240) ? (f & 15) << 12 | g << 6 | l : (f & 7) << 18 | g << 12 | l << 6 | c[b++] & 63;
                65536 > f ? d += String.fromCharCode(f) : (f -= 65536, d += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023));
              }
            } else d += String.fromCharCode(f);
          }
          return d;
        }, Fb = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, Gb = (b, a) => {
          var c = b >> 1;
          for (var d = c + a / 2; !(c >= d) && D[c]; ) ++c;
          c <<= 1;
          if (32 < c - b && Fb) return Fb.decode(A.subarray(b, c));
          c = "";
          for (d = 0; !(d >= a / 2); ++d) {
            var f = C[b + 2 * d >> 1];
            if (0 == f) break;
            c += String.fromCharCode(f);
          }
          return c;
        }, Hb = (b, a, c) => {
          void 0 === c && (c = 2147483647);
          if (2 > c) return 0;
          c -= 2;
          var d = a;
          c = c < 2 * b.length ? c / 2 : b.length;
          for (var f = 0; f < c; ++f) C[a >> 1] = b.charCodeAt(f), a += 2;
          C[a >> 1] = 0;
          return a - d;
        }, Ib = (b) => 2 * b.length, Jb = (b, a) => {
          for (var c = 0, d = ""; !(c >= a / 4); ) {
            var f = F[b + 4 * c >> 2];
            if (0 == f) break;
            ++c;
            65536 <= f ? (f -= 65536, d += String.fromCharCode(55296 | f >> 10, 56320 | f & 1023)) : d += String.fromCharCode(f);
          }
          return d;
        }, Kb = (b, a, c) => {
          void 0 === c && (c = 2147483647);
          if (4 > c) return 0;
          var d = a;
          c = d + c - 4;
          for (var f = 0; f < b.length; ++f) {
            var g = b.charCodeAt(f);
            if (55296 <= g && 57343 >= g) {
              var l = b.charCodeAt(++f);
              g = 65536 + ((g & 1023) << 10) | l & 1023;
            }
            F[a >> 2] = g;
            a += 4;
            if (a + 4 > c) break;
          }
          F[a >> 2] = 0;
          return a - d;
        }, Lb = (b) => {
          for (var a = 0, c = 0; c < b.length; ++c) {
            var d = b.charCodeAt(c);
            55296 <= d && 57343 >= d && ++c;
            a += 4;
          }
          return a;
        }, Mb = [], Nb = {}, Pb = () => {
          if (!Ob) {
            var b = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: da || "./this.program" }, a;
            for (a in Nb) void 0 === Nb[a] ? delete b[a] : b[a] = Nb[a];
            var c = [];
            for (a in b) c.push(`${a}=${b[a]}`);
            Ob = c;
          }
          return Ob;
        }, Ob, Qb = (b) => 0 === b % 4 && (0 !== b % 100 || 0 === b % 400), Rb = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], Sb = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        function Tb(b) {
          var a = Array(Cb(b) + 1);
          Bb(b, a, 0, a.length);
          return a;
        }
        for (var Ub = (b, a, c, d) => {
          function f(e, p, t) {
            for (e = "number" == typeof e ? e.toString() : e || ""; e.length < p; ) e = t[0] + e;
            return e;
          }
          function g(e, p) {
            return f(e, p, "0");
          }
          function l(e, p) {
            function t(Q) {
              return 0 > Q ? -1 : 0 < Q ? 1 : 0;
            }
            var B;
            0 === (B = t(e.getFullYear() - p.getFullYear())) && 0 === (B = t(e.getMonth() - p.getMonth())) && (B = t(e.getDate() - p.getDate()));
            return B;
          }
          function k(e) {
            switch (e.getDay()) {
              case 0:
                return new Date(e.getFullYear() - 1, 11, 29);
              case 1:
                return e;
              case 2:
                return new Date(e.getFullYear(), 0, 3);
              case 3:
                return new Date(
                  e.getFullYear(),
                  0,
                  2
                );
              case 4:
                return new Date(e.getFullYear(), 0, 1);
              case 5:
                return new Date(e.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(e.getFullYear() - 1, 11, 30);
            }
          }
          function m(e) {
            var p = e.Z;
            for (e = new Date(new Date(e.$ + 1900, 0, 1).getTime()); 0 < p; ) {
              var t = e.getMonth(), B = (Qb(e.getFullYear()) ? Rb : Sb)[t];
              if (p > B - e.getDate()) p -= B - e.getDate() + 1, e.setDate(1), 11 > t ? e.setMonth(t + 1) : (e.setMonth(0), e.setFullYear(e.getFullYear() + 1));
              else {
                e.setDate(e.getDate() + p);
                break;
              }
            }
            t = new Date(e.getFullYear() + 1, 0, 4);
            p = k(new Date(
              e.getFullYear(),
              0,
              4
            ));
            t = k(t);
            return 0 >= l(p, e) ? 0 >= l(t, e) ? e.getFullYear() + 1 : e.getFullYear() : e.getFullYear() - 1;
          }
          var q = G[d + 40 >> 2];
          d = { Ha: F[d >> 2], Ga: F[d + 4 >> 2], ja: F[d + 8 >> 2], oa: F[d + 12 >> 2], ka: F[d + 16 >> 2], $: F[d + 20 >> 2], U: F[d + 24 >> 2], Z: F[d + 28 >> 2], Ka: F[d + 32 >> 2], Fa: F[d + 36 >> 2], Ia: q ? q ? Eb(q) : "" : "" };
          c = c ? Eb(c) : "";
          q = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var n in q) c = c.replace(new RegExp(n, "g"), q[n]);
          var u = "Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "), v = "January February March April May June July August September October November December".split(" ");
          q = { "%a": (e) => u[e.U].substring(0, 3), "%A": (e) => u[e.U], "%b": (e) => v[e.ka].substring(0, 3), "%B": (e) => v[e.ka], "%C": (e) => g((e.$ + 1900) / 100 | 0, 2), "%d": (e) => g(e.oa, 2), "%e": (e) => f(e.oa, 2, " "), "%g": (e) => m(e).toString().substring(2), "%G": (e) => m(e), "%H": (e) => g(e.ja, 2), "%I": (e) => {
            e = e.ja;
            0 == e ? e = 12 : 12 < e && (e -= 12);
            return g(e, 2);
          }, "%j": (e) => {
            for (var p = 0, t = 0; t <= e.ka - 1; p += (Qb(e.$ + 1900) ? Rb : Sb)[t++]) ;
            return g(e.oa + p, 3);
          }, "%m": (e) => g(e.ka + 1, 2), "%M": (e) => g(e.Ga, 2), "%n": () => "\n", "%p": (e) => 0 <= e.ja && 12 > e.ja ? "AM" : "PM", "%S": (e) => g(e.Ha, 2), "%t": () => "	", "%u": (e) => e.U || 7, "%U": (e) => g(Math.floor((e.Z + 7 - e.U) / 7), 2), "%V": (e) => {
            var p = Math.floor((e.Z + 7 - (e.U + 6) % 7) / 7);
            2 >= (e.U + 371 - e.Z - 2) % 7 && p++;
            if (p) 53 == p && (t = (e.U + 371 - e.Z) % 7, 4 == t || 3 == t && Qb(e.$) || (p = 1));
            else {
              p = 52;
              var t = (e.U + 7 - e.Z - 1) % 7;
              (4 == t || 5 == t && Qb(e.$ % 400 - 1)) && p++;
            }
            return g(p, 2);
          }, "%w": (e) => e.U, "%W": (e) => g(Math.floor((e.Z + 7 - (e.U + 6) % 7) / 7), 2), "%y": (e) => (e.$ + 1900).toString().substring(2), "%Y": (e) => e.$ + 1900, "%z": (e) => {
            e = e.Fa;
            var p = 0 <= e;
            e = Math.abs(e) / 60;
            return (p ? "+" : "-") + String("0000" + (e / 60 * 100 + e % 60)).slice(-4);
          }, "%Z": (e) => e.Ia, "%%": () => "%" };
          c = c.replace(/%%/g, "\0\0");
          for (n in q) c.includes(n) && (c = c.replace(new RegExp(n, "g"), q[n](d)));
          c = c.replace(/\0\0/g, "%");
          n = Tb(c);
          if (n.length > a) return 0;
          z.set(n, b);
          return n.length - 1;
        }, Vb = Array(256), Wb = 0; 256 > Wb; ++Wb) Vb[Wb] = String.fromCharCode(Wb);
        Ha = Vb;
        N = h.BindingError = class extends Error {
          constructor(b) {
            super(b);
            this.name = "BindingError";
          }
        };
        O = h.InternalError = class extends Error {
          constructor(b) {
            super(b);
            this.name = "InternalError";
          }
        };
        U.prototype.isAliasOf = function(b) {
          if (!(this instanceof U && b instanceof U)) return false;
          var a = this.H.O.M, c = this.H.N, d = b.H.O.M;
          for (b = b.H.N; a.R; ) c = a.ea(c), a = a.R;
          for (; d.R; ) b = d.ea(b), d = d.R;
          return a === d && c === b;
        };
        U.prototype.clone = function() {
          this.H.N || La(this);
          if (this.H.da) return this.H.count.value += 1, this;
          var b = Ta, a = Object, c = a.create, d = Object.getPrototypeOf(this), f = this.H;
          b = b(c.call(a, d, { H: { value: { count: f.count, aa: f.aa, da: f.da, N: f.N, O: f.O, P: f.P, S: f.S } } }));
          b.H.count.value += 1;
          b.H.aa = false;
          return b;
        };
        U.prototype["delete"] = function() {
          this.H.N || La(this);
          if (this.H.aa && !this.H.da) throw new N("Object already scheduled for deletion");
          Na(this);
          var b = this.H;
          --b.count.value;
          0 === b.count.value && (b.P ? b.S.X(b.P) : b.O.M.X(b.N));
          this.H.da || (this.H.P = void 0, this.H.N = void 0);
        };
        U.prototype.isDeleted = function() {
          return !this.H.N;
        };
        U.prototype.deleteLater = function() {
          this.H.N || La(this);
          if (this.H.aa && !this.H.da) throw new N("Object already scheduled for deletion");
          S.push(this);
          1 === S.length && T && T(Qa);
          this.H.aa = true;
          return this;
        };
        h.getInheritedInstanceCount = () => Object.keys(Ra).length;
        h.getLiveInheritedInstances = () => {
          var b = [], a;
          for (a in Ra) Ra.hasOwnProperty(a) && b.push(Ra[a]);
          return b;
        };
        h.flushPendingDeletes = Qa;
        h.setDelayFunction = (b) => {
          T = b;
          S.length && T && T(Qa);
        };
        V.prototype.ya = function(b) {
          this.sa && (b = this.sa(b));
          return b;
        };
        V.prototype.qa = function(b) {
          this.X && this.X(b);
        };
        V.prototype.argPackAdvance = 8;
        V.prototype.readValueFromPointer = fb;
        V.prototype.deleteObject = (b) => {
          if (null !== b) b["delete"]();
        };
        V.prototype.fromWireType = function(b) {
          function a() {
            return this.ia ? Ua(this.M.ba, { O: this.Aa, N: c, S: this, P: b }) : Ua(this.M.ba, { O: this, N: b });
          }
          var c = this.ya(b);
          if (!c) return this.qa(b), null;
          var d = Sa(this.M, c);
          if (void 0 !== d) {
            if (0 === d.H.count.value) return d.H.N = c, d.H.P = b, d.clone();
            d = d.clone();
            this.qa(b);
            return d;
          }
          d = this.M.xa(c);
          d = Pa[d];
          if (!d) return a.call(this);
          d = this.ha ? d.va : d.pointerType;
          var f = Oa(c, this.M, d.M);
          return null === f ? a.call(this) : this.ia ? Ua(d.M.ba, { O: d, N: f, S: this, P: b }) : Ua(d.M.ba, { O: d, N: f });
        };
        kb = h.UnboundTypeError = ((b, a) => {
          var c = Wa(a, function(d) {
            this.name = a;
            this.message = d;
            d = Error(d).stack;
            void 0 !== d && (this.stack = this.toString() + "\n" + d.replace(/^Error(:[^\n]*)?\n/, ""));
          });
          c.prototype = Object.create(b.prototype);
          c.prototype.constructor = c;
          c.prototype.toString = function() {
            return void 0 === this.message ? this.name : `${this.name}: ${this.message}`;
          };
          return c;
        })(Error, "UnboundTypeError");
        Object.assign(sb.prototype, { get(b) {
          return this.V[b];
        }, has(b) {
          return void 0 !== this.V[b];
        }, la(b) {
          var a = this.ra.pop() || this.V.length;
          this.V[a] = b;
          return a;
        }, ma(b) {
          this.V[b] = void 0;
          this.ra.push(b);
        } });
        Y.V.push({ value: void 0 }, { value: null }, { value: true }, { value: false });
        Y.fa = Y.V.length;
        h.count_emval_handles = () => {
          for (var b = 0, a = Y.fa; a < Y.V.length; ++a) void 0 !== Y.V[a] && ++b;
          return b;
        };
        var Yb = {
          b: (b, a, c) => {
            new Ea(b).fa(a, c);
            Fa = b;
            Ga++;
            throw Fa;
          },
          q: () => {
          },
          x: (b, a, c, d) => {
            a = K(a);
            P(b, { name: a, fromWireType: function(f) {
              return !!f;
            }, toWireType: function(f, g) {
              return g ? c : d;
            }, argPackAdvance: 8, readValueFromPointer: function(f) {
              return this.fromWireType(A[f]);
            }, T: null });
          },
          e: (b, a, c, d, f, g, l, k, m, q, n, u, v) => {
            n = K(n);
            g = W(f, g);
            k && (k = W(l, k));
            q && (q = W(m, q));
            v = W(u, v);
            var e = Va(n);
            Ya(e, function() {
              nb(`Cannot construct ${n} due to unbound types`, [d]);
            });
            R([b, a, c], d ? [d] : [], function(p) {
              p = p[0];
              if (d) {
                var t = p.M;
                var B = t.ba;
              } else B = U.prototype;
              p = Wa(e, function() {
                if (Object.getPrototypeOf(this) !== Q) throw new N("Use 'new' to construct " + n);
                if (void 0 === E.Y) throw new N(n + " has no accessible constructor");
                var ub = E.Y[arguments.length];
                if (void 0 === ub) throw new N(`Tried to invoke ctor of ${n} with invalid number of parameters (${arguments.length}) - expected (${Object.keys(E.Y).toString()}) parameters instead!`);
                return ub.apply(this, arguments);
              });
              var Q = Object.create(B, { constructor: { value: p } });
              p.prototype = Q;
              var E = new Za(n, p, Q, v, t, g, k, q);
              E.R && (void 0 === E.R.pa && (E.R.pa = []), E.R.pa.push(E));
              t = new V(n, E, true, false);
              B = new V(n + "*", E, false, false);
              var vb = new V(n + " const*", E, false, true);
              Pa[b] = { pointerType: B, va: vb };
              gb(e, p);
              return [t, B, vb];
            });
          },
          h: (b, a, c, d, f, g) => {
            var l = ob(a, c);
            f = W(d, f);
            R([], [b], function(k) {
              k = k[0];
              var m = `constructor ${k.name}`;
              void 0 === k.M.Y && (k.M.Y = []);
              if (void 0 !== k.M.Y[a - 1]) throw new N(`Cannot register multiple constructors with identical number of parameters (${a - 1}) for class '${k.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
              k.M.Y[a - 1] = () => {
                nb(`Cannot construct ${k.name} due to unbound types`, l);
              };
              R([], l, (q) => {
                q.splice(1, 0, null);
                k.M.Y[a - 1] = rb(m, q, null, f, g);
                return [];
              });
              return [];
            });
          },
          a: (b, a, c, d, f, g, l, k, m) => {
            var q = ob(c, d);
            a = K(a);
            g = W(f, g);
            R([], [b], function(n) {
              function u() {
                nb(`Cannot call ${v} due to unbound types`, q);
              }
              n = n[0];
              var v = `${n.name}.${a}`;
              a.startsWith("@@") && (a = Symbol[a.substring(2)]);
              k && n.M.Ba.push(a);
              var e = n.M.ba, p = e[a];
              void 0 === p || void 0 === p.W && p.className !== n.name && p.ga === c - 2 ? (u.ga = c - 2, u.className = n.name, e[a] = u) : (Xa(
                e,
                a,
                v
              ), e[a].W[c - 2] = u);
              R([], q, function(t) {
                t = rb(v, t, n, g, l, m);
                void 0 === e[a].W ? (t.ga = c - 2, e[a] = t) : e[a].W[c - 2] = t;
                return [];
              });
              return [];
            });
          },
          w: (b, a) => {
            a = K(a);
            P(b, { name: a, fromWireType: (c) => {
              if (!c) throw new N("Cannot use deleted val. handle = " + c);
              var d = Y.get(c).value;
              tb(c);
              return d;
            }, toWireType: (c, d) => db(d), argPackAdvance: 8, readValueFromPointer: wb, T: null });
          },
          g: (b, a, c, d) => {
            function f() {
            }
            a = K(a);
            f.values = {};
            P(b, {
              name: a,
              constructor: f,
              fromWireType: function(g) {
                return this.constructor.values[g];
              },
              toWireType: (g, l) => l.value,
              argPackAdvance: 8,
              readValueFromPointer: xb(a, c, d),
              T: null
            });
            Ya(a, f);
          },
          c: (b, a, c) => {
            var d = yb(b, "enum");
            a = K(a);
            b = d.constructor;
            d = Object.create(d.constructor.prototype, { value: { value: c }, constructor: { value: Wa(`${d.name}_${a}`, function() {
            }) } });
            b.values[c] = d;
            b[a] = d;
          },
          m: (b, a, c) => {
            a = K(a);
            P(b, { name: a, fromWireType: (d) => d, toWireType: (d, f) => f, argPackAdvance: 8, readValueFromPointer: zb(a, c), T: null });
          },
          f: (b, a, c, d, f) => {
            a = K(a);
            -1 === f && (f = 4294967295);
            f = (k) => k;
            if (0 === d) {
              var g = 32 - 8 * c;
              f = (k) => k << g >>> g;
            }
            var l = a.includes("unsigned") ? function(k, m) {
              return m >>> 0;
            } : function(k, m) {
              return m;
            };
            P(b, { name: a, fromWireType: f, toWireType: l, argPackAdvance: 8, readValueFromPointer: Ab(a, c, 0 !== d), T: null });
          },
          d: (b, a, c) => {
            function d(g) {
              return new f(z.buffer, G[g + 4 >> 2], G[g >> 2]);
            }
            var f = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array][a];
            c = K(c);
            P(b, { name: c, fromWireType: d, argPackAdvance: 8, readValueFromPointer: d }, { za: true });
          },
          l: (b, a) => {
            a = K(a);
            var c = "std::string" === a;
            P(b, { name: a, fromWireType: (d) => {
              var f = G[d >> 2], g = d + 4;
              if (c) for (var l = g, k = 0; k <= f; ++k) {
                var m = g + k;
                if (k == f || 0 == A[m]) {
                  l = l ? Eb(l, m - l) : "";
                  if (void 0 === q) var q = l;
                  else q += String.fromCharCode(0), q += l;
                  l = m + 1;
                }
              }
              else {
                q = Array(f);
                for (k = 0; k < f; ++k) q[k] = String.fromCharCode(A[g + k]);
                q = q.join("");
              }
              X(d);
              return q;
            }, toWireType: (d, f) => {
              f instanceof ArrayBuffer && (f = new Uint8Array(f));
              var g = "string" == typeof f;
              if (!(g || f instanceof Uint8Array || f instanceof Uint8ClampedArray || f instanceof Int8Array)) throw new N("Cannot pass non-string to std::string");
              var l = c && g ? Cb(f) : f.length;
              var k = Xb(4 + l + 1), m = k + 4;
              G[k >> 2] = l;
              if (c && g) Bb(f, A, m, l + 1);
              else if (g) for (g = 0; g < l; ++g) {
                var q = f.charCodeAt(g);
                if (255 < q) throw X(m), new N("String has UTF-16 code units that do not fit in 8 bits");
                A[m + g] = q;
              }
              else for (g = 0; g < l; ++g) A[m + g] = f[g];
              null !== d && d.push(X, k);
              return k;
            }, argPackAdvance: 8, readValueFromPointer: fb, T: (d) => X(d) });
          },
          i: (b, a, c) => {
            c = K(c);
            if (2 === a) {
              var d = Gb;
              var f = Hb;
              var g = Ib;
              var l = () => D;
              var k = 1;
            } else 4 === a && (d = Jb, f = Kb, g = Lb, l = () => G, k = 2);
            P(b, { name: c, fromWireType: (m) => {
              for (var q = G[m >> 2], n = l(), u, v = m + 4, e = 0; e <= q; ++e) {
                var p = m + 4 + e * a;
                if (e == q || 0 == n[p >> k]) v = d(v, p - v), void 0 === u ? u = v : (u += String.fromCharCode(0), u += v), v = p + a;
              }
              X(m);
              return u;
            }, toWireType: (m, q) => {
              if ("string" != typeof q) throw new N(`Cannot pass non-string to C++ string type ${c}`);
              var n = g(q), u = Xb(4 + n + a);
              G[u >> 2] = n >> k;
              f(q, u + 4, n + a);
              null !== m && m.push(X, u);
              return u;
            }, argPackAdvance: 8, readValueFromPointer: wb, T: (m) => X(m) });
          },
          y: (b, a) => {
            a = K(a);
            P(b, { Ja: true, name: a, argPackAdvance: 0, fromWireType: () => {
            }, toWireType: () => {
            } });
          },
          n: tb,
          o: (b) => {
            4 < b && (Y.get(b).ta += 1);
          },
          j: (b, a) => {
            b = yb(b, "_emval_take_value");
            b = b.readValueFromPointer(a);
            return db(b);
          },
          k: () => {
            la("");
          },
          p: (b, a, c) => {
            Mb.length = 0;
            for (var d; d = A[a++]; ) c += 105 != d && c % 8 ? 4 : 0, Mb.push(105 == d ? F[c >> 2] : pa[c >> 3]), c += 105 == d ? 4 : 8;
            return Ca[b].apply(null, Mb);
          },
          v: (b, a, c) => A.copyWithin(b, a, a + c),
          u: () => {
            la("OOM");
          },
          s: (b, a) => {
            var c = 0;
            Pb().forEach((d, f) => {
              var g = a + c;
              f = G[b + 4 * f >> 2] = g;
              for (g = 0; g < d.length; ++g) z[f++ >> 0] = d.charCodeAt(g);
              z[f >> 0] = 0;
              c += d.length + 1;
            });
            return 0;
          },
          t: (b, a) => {
            var c = Pb();
            G[b >> 2] = c.length;
            var d = 0;
            c.forEach((f) => d += f.length + 1);
            G[a >> 2] = d;
            return 0;
          },
          z: function(b) {
            console.log(b ? Eb(b) : "");
          },
          r: (b, a, c, d) => Ub(b, a, c, d)
        }, Z = (function() {
          function b(c) {
            Z = c = c.exports;
            ma = Z.A;
            var d = ma.buffer;
            h.HEAP8 = z = new Int8Array(d);
            h.HEAP16 = C = new Int16Array(d);
            h.HEAPU8 = A = new Uint8Array(d);
            h.HEAPU16 = D = new Uint16Array(d);
            h.HEAP32 = F = new Int32Array(d);
            h.HEAPU32 = G = new Uint32Array(d);
            h.HEAPF32 = oa = new Float32Array(d);
            h.HEAPF64 = pa = new Float64Array(d);
            qa = Z.C;
            sa.unshift(Z.B);
            H--;
            h.monitorRunDependencies && h.monitorRunDependencies(H);
            0 == H && (null !== va && (clearInterval(va), va = null), I && (d = I, I = null, d()));
            return c;
          }
          var a = { a: Yb };
          H++;
          h.monitorRunDependencies && h.monitorRunDependencies(H);
          if (h.instantiateWasm) try {
            return h.instantiateWasm(a, b);
          } catch (c) {
            x(`Module.instantiateWasm callback failed with error: ${c}`), ba(c);
          }
          Ba(a, function(c) {
            b(c.instance);
          }).catch(ba);
          return {};
        })(), X = (b) => (X = Z.D)(b), Xb = (b) => (Xb = Z.E)(b), lb = (b) => (lb = Z.F)(b);
        h.__embind_initialize_bindings = () => (h.__embind_initialize_bindings = Z.G)();
        h.dynCall_viijii = (b, a, c, d, f, g, l) => (h.dynCall_viijii = Z.I)(b, a, c, d, f, g, l);
        h.dynCall_iiiiij = (b, a, c, d, f, g, l) => (h.dynCall_iiiiij = Z.J)(b, a, c, d, f, g, l);
        h.dynCall_iiiiijj = (b, a, c, d, f, g, l, k, m) => (h.dynCall_iiiiijj = Z.K)(b, a, c, d, f, g, l, k, m);
        h.dynCall_iiiiiijj = (b, a, c, d, f, g, l, k, m, q) => (h.dynCall_iiiiiijj = Z.L)(b, a, c, d, f, g, l, k, m, q);
        h.___start_em_js = 40044;
        h.___stop_em_js = 40101;
        var Zb;
        I = function $b() {
          Zb || ac();
          Zb || (I = $b);
        };
        function ac() {
          function b() {
            if (!Zb && (Zb = true, h.calledRun = true, !na)) {
              Da(sa);
              aa(h);
              if (h.onRuntimeInitialized) h.onRuntimeInitialized();
              if (h.postRun) for ("function" == typeof h.postRun && (h.postRun = [h.postRun]); h.postRun.length; ) {
                var a = h.postRun.shift();
                ta.unshift(a);
              }
              Da(ta);
            }
          }
          if (!(0 < H)) {
            if (h.preRun) for ("function" == typeof h.preRun && (h.preRun = [h.preRun]); h.preRun.length; ) ua();
            Da(ra);
            0 < H || (h.setStatus ? (h.setStatus("Running..."), setTimeout(function() {
              setTimeout(function() {
                h.setStatus("");
              }, 1);
              b();
            }, 1)) : b());
          }
        }
        if (h.preInit) for ("function" == typeof h.preInit && (h.preInit = [h.preInit]); 0 < h.preInit.length; ) h.preInit.pop()();
        ac();
        return moduleArg.ready;
      });
    })();
    planegcs_default = Module;
  }
});

// node_modules/@salusoft89/planegcs/dist/planegcs_dist/constraint_param_index.js
var constraint_param_index;
var init_constraint_param_index = __esm({
  "node_modules/@salusoft89/planegcs/dist/planegcs_dist/constraint_param_index.js"() {
    constraint_param_index = {
      equal: {
        param1: "object_param_or_number",
        param2: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type",
        internalalignment: "primitive_type"
      },
      proportional: {
        param1: "object_param_or_number",
        param2: "object_param_or_number",
        ratio: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      difference: {
        param1: "object_param_or_number",
        param2: "object_param_or_number",
        difference: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2p_distance: {
        p1_id: "object_id",
        p2_id: "object_id",
        distance: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2p_angle_incr_angle: {
        p1_id: "object_id",
        p2_id: "object_id",
        angle: "object_param_or_number",
        incrAngle: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2p_angle: {
        p1_id: "object_id",
        p2_id: "object_id",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2l_distance: {
        p_id: "object_id",
        l_id: "object_id",
        distance: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_line_pl: {
        p_id: "object_id",
        l_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_line_ppp: {
        p_id: "object_id",
        lp1_id: "object_id",
        lp2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_perp_bisector_pl: {
        p_id: "object_id",
        l_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_perp_bisector_ppp: {
        p_id: "object_id",
        lp1_id: "object_id",
        lp2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      parallel: {
        l1_id: "object_id",
        l2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_ll: {
        l1_id: "object_id",
        l2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_pppp: {
        l1p1_id: "object_id",
        l1p2_id: "object_id",
        l2p1_id: "object_id",
        l2p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      l2l_angle_ll: {
        l1_id: "object_id",
        l2_id: "object_id",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      l2l_angle_pppp: {
        l1p1_id: "object_id",
        l1p2_id: "object_id",
        l2p1_id: "object_id",
        l2p2_id: "object_id",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      angle_via_point: {
        crv1_id: "object_id",
        crv2_id: "object_id",
        p_id: "object_id",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      angle_via_two_points: {
        crv1_id: "object_id",
        crv2_id: "object_id",
        p1_id: "object_id",
        p2_id: "object_id",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      angle_via_point_and_param: {
        crv1_id: "object_id",
        crv2_id: "object_id",
        p_id: "object_id",
        cparam: "object_param_or_number",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      angle_via_point_and_two_params: {
        crv1_id: "object_id",
        crv2_id: "object_id",
        p_id: "object_id",
        cparam1: "object_param_or_number",
        cparam2: "object_param_or_number",
        angle: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      midpoint_on_line_ll: {
        l1_id: "object_id",
        l2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      midpoint_on_line_pppp: {
        l1p1_id: "object_id",
        l1p2_id: "object_id",
        l2p1_id: "object_id",
        l2p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_circumf: {
        p1_id: "object_id",
        p2_id: "object_id",
        rd1: "object_param_or_number",
        rd2: "object_param_or_number",
        internal: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_at_bspline_knot: {
        b_id: "object_id",
        l_id: "object_id",
        knotindex: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2p_coincident: {
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      horizontal_l: {
        l_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      horizontal_pp: {
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      vertical_l: {
        l_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      vertical_pp: {
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      coordinate_x: {
        p_id: "object_id",
        x: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      coordinate_y: {
        p_id: "object_id",
        y: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_rules: {
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_circle: {
        p_id: "object_id",
        c_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_ellipse: {
        p_id: "object_id",
        e_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_hyperbolic_arc: {
        p_id: "object_id",
        e_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_parabolic_arc: {
        p_id: "object_id",
        e_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_bspline: {
        p_id: "object_id",
        b_id: "object_id",
        pointparam: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_of_ellipse_rules: {
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      curve_value: {
        p_id: "object_id",
        a_id: "object_id",
        u: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_of_hyperbola_rules: {
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_of_parabola_rules: {
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      point_on_arc: {
        p_id: "object_id",
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_line2arc: {
        p1_id: "object_id",
        p2_id: "object_id",
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_arc2line: {
        a_id: "object_id",
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_circle2arc: {
        center_id: "object_id",
        radius: "object_param_or_number",
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_arc2circle: {
        a_id: "object_id",
        center_id: "object_id",
        radius: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      perpendicular_arc2arc: {
        a1_id: "object_id",
        reverse1: "primitive_type",
        a2_id: "object_id",
        reverse2: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_lc: {
        l_id: "object_id",
        c_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_le: {
        l_id: "object_id",
        e_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_la: {
        l_id: "object_id",
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_cc: {
        c1_id: "object_id",
        c2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_aa: {
        a1_id: "object_id",
        a2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      tangent_ca: {
        c_id: "object_id",
        a_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      circle_radius: {
        c_id: "object_id",
        radius: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_radius: {
        a_id: "object_id",
        radius: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      circle_diameter: {
        c_id: "object_id",
        diameter: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_diameter: {
        a_id: "object_id",
        diameter: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_length: {
        l1_id: "object_id",
        l2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_radius_cc: {
        c1_id: "object_id",
        c2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_radii_ee: {
        e1_id: "object_id",
        e2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_radii_ahah: {
        a1_id: "object_id",
        a2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_radius_ca: {
        c1_id: "object_id",
        a2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_radius_aa: {
        a1_id: "object_id",
        a2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      equal_focus: {
        a1_id: "object_id",
        a2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2p_symmetric_ppl: {
        p1_id: "object_id",
        p2_id: "object_id",
        l_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2p_symmetric_ppp: {
        p1_id: "object_id",
        p2_id: "object_id",
        p_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      snells_law: {
        ray1_id: "object_id",
        ray2_id: "object_id",
        boundary_id: "object_id",
        p_id: "object_id",
        n1: "object_param_or_number",
        n2: "object_param_or_number",
        flipn1: "primitive_type",
        flipn2: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      c2cdistance: {
        c1_id: "object_id",
        c2_id: "object_id",
        dist: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      c2ldistance: {
        c_id: "object_id",
        l_id: "object_id",
        dist: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      p2cdistance: {
        p_id: "object_id",
        c_id: "object_id",
        distance: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      arc_length: {
        a_id: "object_id",
        dist: "object_param_or_number",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_point2ellipse: {
        e_id: "object_id",
        p1_id: "object_id",
        alignmentType: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_ellipse_major_diameter: {
        e_id: "object_id",
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_ellipse_minor_diameter: {
        e_id: "object_id",
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_ellipse_focus1: {
        e_id: "object_id",
        p1_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_ellipse_focus2: {
        e_id: "object_id",
        p1_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_point2hyperbola: {
        e_id: "object_id",
        p1_id: "object_id",
        alignmentType: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_hyperbola_major_diameter: {
        e_id: "object_id",
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_hyperbola_minor_diameter: {
        e_id: "object_id",
        p1_id: "object_id",
        p2_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_hyperbola_focus: {
        e_id: "object_id",
        p1_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_parabola_focus: {
        e_id: "object_id",
        p1_id: "object_id",
        tagId: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_bspline_control_point: {
        b_id: "object_id",
        c_id: "object_id",
        poleindex: "primitive_type",
        tag: "primitive_type",
        driving: "primitive_type"
      },
      internal_alignment_knot_point: {
        b_id: "object_id",
        p_id: "object_id",
        knotindex: "primitive_type",
        tagId: "primitive_type",
        driving: "primitive_type"
      }
    };
  }
});

// node_modules/@salusoft89/planegcs/dist/sketch/emsc_vectors.js
function arr_to_intvec(gcs_module, arr) {
  const vec = new gcs_module.IntVector();
  for (const val of arr) {
    vec.push_back(val);
  }
  return vec;
}
function emsc_vec_to_arr(vec) {
  const result = [];
  for (let i = 0; i < vec.size(); ++i) {
    result.push(vec.get(i));
  }
  vec.delete();
  return result;
}
var init_emsc_vectors = __esm({
  "node_modules/@salusoft89/planegcs/dist/sketch/emsc_vectors.js"() {
  }
});

// node_modules/@salusoft89/planegcs/dist/sketch/geom_params.js
function get_property_offset(primitive_type, property_key) {
  const primitive_offsets = property_offsets[primitive_type];
  if (primitive_offsets) {
    const offset = primitive_offsets[property_key];
    if (offset !== void 0) {
      return offset;
    }
  }
  throw new Error(`Unknown property ${property_key} for primitive <${primitive_type}>`);
}
var property_offsets;
var init_geom_params = __esm({
  "node_modules/@salusoft89/planegcs/dist/sketch/geom_params.js"() {
    property_offsets = {
      point: {
        x: 0,
        y: 1
      },
      circle: {
        radius: 0
      },
      arc: {
        start_angle: 0,
        end_angle: 1,
        radius: 2
      },
      ellipse: {
        radmin: 0
      },
      arc_of_ellipse: {
        start_angle: 0,
        end_angle: 1,
        radmin: 2
      },
      parabola: {},
      arc_of_parabola: {
        start_angle: 0,
        end_angle: 1
      },
      hyperbola: {
        radmin: 0
      },
      arc_of_hyperbola: {
        start_angle: 0,
        end_angle: 1,
        radmin: 2
      },
      line: {},
      bspline: {}
    };
  }
});

// node_modules/@salusoft89/planegcs/dist/sketch/gcs_wrapper.js
var GcsWrapper;
var init_gcs_wrapper = __esm({
  "node_modules/@salusoft89/planegcs/dist/sketch/gcs_wrapper.js"() {
    init_constraint_param_index();
    init_sketch_index();
    init_emsc_vectors();
    init_sketch_primitive();
    init_enums();
    init_geom_params();
    GcsWrapper = class {
      get debug_mode() {
        return this.gcs.get_debug_mode();
      }
      set debug_mode(mode) {
        this.gcs.set_debug_mode(mode);
      }
      get equal_optimization() {
        return this.enable_equal_optimization;
      }
      set equal_optimization(val) {
        this.enable_equal_optimization = val;
      }
      constructor(gcs, mod) {
        this.p_param_index = /* @__PURE__ */ new Map();
        this.sketch_index = new SketchIndex();
        this.bspline_gcs_cache = /* @__PURE__ */ new Map();
        this.sketch_param_index = /* @__PURE__ */ new Map();
        this.nondriving_constraint_params_order = /* @__PURE__ */ new Map();
        this.enable_equal_optimization = false;
        this.gcs = gcs;
        this.module = mod;
      }
      destroy_gcs_module() {
        this.gcs.clear_data();
        this.gcs.delete();
      }
      clear_data() {
        this.nondriving_constraint_params_order.clear();
        this.gcs.clear_data();
        this.p_param_index.clear();
        this.sketch_param_index.clear();
        this.sketch_index.clear();
        this.bspline_gcs_cache.clear();
      }
      // ------ Sketch -> GCS ------- (when building up a sketch)
      push_primitive(o) {
        switch (o.type) {
          case "point":
            this.push_point(o);
            break;
          case "line":
            this.push_line(o);
            break;
          case "circle":
            this.push_circle(o);
            break;
          case "arc":
            this.push_arc(o);
            break;
          case "ellipse":
            this.push_ellipse(o);
            break;
          case "arc_of_ellipse":
            this.push_arc_of_ellipse(o);
            break;
          case "hyperbola":
            this.push_hyperbola(o);
            break;
          case "arc_of_hyperbola":
            this.push_arc_of_hyperbola(o);
            break;
          case "parabola":
            this.push_parabola(o);
            break;
          case "arc_of_parabola":
            this.push_arc_of_parabola(o);
            break;
          case "bspline":
            this.push_bspline(o);
            break;
          default:
            this.push_constraint(o);
        }
        if (this.sketch_index.has(o.id)) {
          throw new Error(`object with id ${o.id} already exists`);
        }
        this.sketch_index.set_primitive(o);
      }
      push_primitives_and_params(objects) {
        for (const o of objects) {
          if (o.type === "param") {
            this.push_sketch_param(o.name, o.value);
          } else {
            this.push_primitive(o);
          }
        }
      }
      solve(algorithm = Algorithm.DogLeg) {
        return this.gcs.solve_system(algorithm);
      }
      apply_solution() {
        this.gcs.apply_solution();
        for (const obj of this.sketch_index.get_primitives()) {
          this.pull_primitive(obj);
        }
      }
      set_convergence_threshold(threshold) {
        this.gcs.set_covergence_threshold(threshold);
      }
      get_convergence_threshold() {
        return this.gcs.get_convergence_threshold();
      }
      set_max_iterations(n) {
        this.gcs.set_max_iterations(n);
      }
      get_max_iterations() {
        return this.gcs.get_max_iterations();
      }
      get_gcs_params() {
        return emsc_vec_to_arr(this.gcs.get_p_params());
      }
      get_gcs_conflicting_constraints() {
        return emsc_vec_to_arr(this.gcs.get_conflicting()).map((i) => this.sketch_index.get_id_by_index(i));
      }
      get_gcs_redundant_constraints() {
        return emsc_vec_to_arr(this.gcs.get_redundant()).map((i) => this.sketch_index.get_id_by_index(i));
      }
      get_gcs_partially_redundant_constraints() {
        return emsc_vec_to_arr(this.gcs.get_partially_redundant()).map((i) => this.sketch_index.get_id_by_index(i));
      }
      has_gcs_conflicting_constraints() {
        return this.gcs.has_conflicting();
      }
      has_gcs_redundant_constraints() {
        return this.gcs.has_redundant();
      }
      has_gcs_partially_redundant_constraints() {
        return this.gcs.has_partially_redundant();
      }
      push_sketch_param(name, value, fixed = true) {
        const pos = this.gcs.params_size();
        this.gcs.push_p_param(value, fixed);
        this.sketch_param_index.set(name, pos);
        return pos;
      }
      set_sketch_param(name, value) {
        const pos = this.sketch_param_index.get(name);
        if (pos === void 0) {
          throw new Error(`sketch param ${name} not found`);
        }
        this.gcs.set_p_param(pos, value, true);
      }
      get_sketch_param_value(name) {
        const pos = this.sketch_param_index.get(name);
        return pos === void 0 ? void 0 : this.gcs.get_p_param(pos);
      }
      get_sketch_param_values() {
        const result = /* @__PURE__ */ new Map();
        for (const [name, pos] of this.sketch_param_index) {
          result.set(name, this.gcs.get_p_param(pos));
        }
        return result;
      }
      push_p_params(id, values, fixed = false) {
        const pos = this.gcs.params_size();
        for (const value of values) {
          this.gcs.push_p_param(value, fixed);
        }
        if (!this.p_param_index.has(id)) {
          this.p_param_index.set(id, pos);
        }
        return pos;
      }
      push_point(p) {
        if (this.p_param_index.has(p.id)) {
          return;
        }
        this.push_p_params(p.id, [p.x, p.y], p.fixed);
      }
      push_line(l) {
        const p1 = this.sketch_index.get_sketch_point(l.p1_id);
        const p2 = this.sketch_index.get_sketch_point(l.p2_id);
        this.push_point(p1);
        this.push_point(p2);
      }
      push_circle(c) {
        const p = this.sketch_index.get_sketch_point(c.c_id);
        this.push_point(p);
        this.push_p_params(c.id, [c.radius], false);
      }
      push_arc(a) {
        const center = this.sketch_index.get_sketch_point(a.c_id);
        this.push_point(center);
        const start = this.sketch_index.get_sketch_point(a.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(a.end_id);
        this.push_point(end);
        this.push_p_params(a.id, [a.start_angle, a.end_angle, a.radius], false);
      }
      push_ellipse(e) {
        const center = this.sketch_index.get_sketch_point(e.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(e.focus1_id);
        this.push_point(focus1);
        this.push_p_params(e.id, [e.radmin], false);
      }
      push_hyperbola(h) {
        const center = this.sketch_index.get_sketch_point(h.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(h.focus1_id);
        this.push_point(focus1);
        this.push_p_params(h.id, [h.radmin], false);
      }
      push_arc_of_hyperbola(ah) {
        const center = this.sketch_index.get_sketch_point(ah.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(ah.focus1_id);
        this.push_point(focus1);
        const start = this.sketch_index.get_sketch_point(ah.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(ah.end_id);
        this.push_point(end);
        this.push_p_params(ah.id, [ah.start_angle, ah.end_angle, ah.radmin], false);
      }
      push_parabola(p) {
        const vertex = this.sketch_index.get_sketch_point(p.vertex_id);
        this.push_point(vertex);
        const focus1 = this.sketch_index.get_sketch_point(p.focus1_id);
        this.push_point(focus1);
      }
      push_arc_of_parabola(ap) {
        const vertex = this.sketch_index.get_sketch_point(ap.vertex_id);
        this.push_point(vertex);
        const focus1 = this.sketch_index.get_sketch_point(ap.focus1_id);
        this.push_point(focus1);
        const start = this.sketch_index.get_sketch_point(ap.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(ap.end_id);
        this.push_point(end);
        this.push_p_params(ap.id, [ap.start_angle, ap.end_angle], false);
      }
      push_arc_of_ellipse(ae) {
        const center = this.sketch_index.get_sketch_point(ae.c_id);
        this.push_point(center);
        const focus1 = this.sketch_index.get_sketch_point(ae.focus1_id);
        this.push_point(focus1);
        const start = this.sketch_index.get_sketch_point(ae.start_id);
        this.push_point(start);
        const end = this.sketch_index.get_sketch_point(ae.end_id);
        this.push_point(end);
        this.push_p_params(ae.id, [ae.start_angle, ae.end_angle, ae.radmin], false);
      }
      push_bspline(b) {
        for (const poleId of b.pole_ids) {
          const pole = this.sketch_index.get_sketch_point(poleId);
          this.push_point(pole);
        }
      }
      sketch_primitive_to_gcs(o) {
        switch (o.type) {
          case "point": {
            const p_i = this.get_primitive_addr(o.id);
            return this.gcs.make_point(p_i + property_offsets.point.x, p_i + property_offsets.point.y);
          }
          case "line": {
            const p1_i = this.get_primitive_addr(o.p1_id);
            const p2_i = this.get_primitive_addr(o.p2_id);
            return this.gcs.make_line(p1_i + property_offsets.point.x, p1_i + property_offsets.point.y, p2_i + property_offsets.point.x, p2_i + property_offsets.point.y);
          }
          case "circle": {
            const cp_i = this.get_primitive_addr(o.c_id);
            const circle_i = this.get_primitive_addr(o.id);
            return this.gcs.make_circle(cp_i + property_offsets.point.x, cp_i + property_offsets.point.y, circle_i + property_offsets.circle.radius);
          }
          case "arc": {
            const c_i = this.get_primitive_addr(o.c_id);
            const start_i = this.get_primitive_addr(o.start_id);
            const end_i = this.get_primitive_addr(o.end_id);
            const a_i = this.get_primitive_addr(o.id);
            return this.gcs.make_arc(c_i + property_offsets.point.x, c_i + property_offsets.point.y, start_i + property_offsets.point.x, start_i + property_offsets.point.y, end_i + property_offsets.point.x, end_i + property_offsets.point.y, a_i + property_offsets.arc.start_angle, a_i + property_offsets.arc.end_angle, a_i + property_offsets.arc.radius);
          }
          case "ellipse": {
            const c_i = this.get_primitive_addr(o.c_id);
            const focus1_i = this.get_primitive_addr(o.focus1_id);
            const radmin_i = this.get_primitive_addr(o.id);
            return this.gcs.make_ellipse(c_i + property_offsets.point.x, c_i + property_offsets.point.y, focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y, radmin_i + property_offsets.ellipse.radmin);
          }
          case "arc_of_ellipse": {
            const c_i = this.get_primitive_addr(o.c_id);
            const focus1_i = this.get_primitive_addr(o.focus1_id);
            const start_i = this.get_primitive_addr(o.start_id);
            const end_i = this.get_primitive_addr(o.end_id);
            const a_i = this.get_primitive_addr(o.id);
            return this.gcs.make_arc_of_ellipse(c_i + property_offsets.point.x, c_i + property_offsets.point.y, focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y, start_i + property_offsets.point.x, start_i + property_offsets.point.y, end_i + property_offsets.point.x, end_i + property_offsets.point.y, a_i + property_offsets.arc_of_ellipse.start_angle, a_i + property_offsets.arc_of_ellipse.end_angle, a_i + property_offsets.arc_of_ellipse.radmin);
          }
          case "hyperbola": {
            const c_i = this.get_primitive_addr(o.c_id);
            const focus1_i = this.get_primitive_addr(o.focus1_id);
            const radmin_i = this.get_primitive_addr(o.id + property_offsets.hyperbola.radmin);
            return this.gcs.make_hyperbola(c_i + property_offsets.point.x, c_i + property_offsets.point.y, focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y, radmin_i + property_offsets.hyperbola.radmin);
          }
          case "arc_of_hyperbola": {
            const c_i = this.get_primitive_addr(o.c_id);
            const focus1_i = this.get_primitive_addr(o.focus1_id);
            const start_i = this.get_primitive_addr(o.start_id);
            const end_i = this.get_primitive_addr(o.end_id);
            const a_i = this.get_primitive_addr(o.id);
            return this.gcs.make_arc_of_hyperbola(c_i + property_offsets.point.x, c_i + property_offsets.point.y, focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y, start_i + property_offsets.point.x, start_i + property_offsets.point.y, end_i + property_offsets.point.x, end_i + property_offsets.point.y, a_i + property_offsets.arc_of_hyperbola.start_angle, a_i + property_offsets.arc_of_hyperbola.end_angle, a_i + property_offsets.arc_of_hyperbola.radmin);
          }
          case "parabola": {
            const vertex_i = this.get_primitive_addr(o.vertex_id);
            const focus1_i = this.get_primitive_addr(o.focus1_id);
            return this.gcs.make_parabola(vertex_i + property_offsets.point.x, vertex_i + property_offsets.point.y, focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y);
          }
          case "arc_of_parabola": {
            const vertex_i = this.get_primitive_addr(o.vertex_id);
            const focus1_i = this.get_primitive_addr(o.focus1_id);
            const start_i = this.get_primitive_addr(o.start_id);
            const end_i = this.get_primitive_addr(o.end_id);
            const a_i = this.get_primitive_addr(o.id);
            return this.gcs.make_arc_of_parabola(vertex_i + property_offsets.point.x, vertex_i + property_offsets.point.y, focus1_i + property_offsets.point.x, focus1_i + property_offsets.point.y, start_i + property_offsets.point.x, start_i + property_offsets.point.y, end_i + property_offsets.point.x, end_i + property_offsets.point.y, a_i + property_offsets.arc_of_parabola.start_angle, a_i + property_offsets.arc_of_parabola.end_angle);
          }
          case "bspline": {
            if (!this.module)
              throw new Error("ModuleStatic required for BSpline creation");
            const b = o;
            const cached = this.bspline_gcs_cache.get(b.id);
            if (cached !== void 0)
              return cached;
            if (b.pole_ids.length < 2) {
              throw new Error("BSpline must have at least 2 control points, got " + b.pole_ids.length);
            }
            const poleIndices = [];
            for (const poleId of b.pole_ids) {
              const addr = this.get_primitive_addr(poleId);
              poleIndices.push(addr + property_offsets.point.x);
              poleIndices.push(addr + property_offsets.point.y);
            }
            const startx_i = this.gcs.push_p_param(this.gcs.get_p_param(poleIndices[0]), false);
            const starty_i = this.gcs.push_p_param(this.gcs.get_p_param(poleIndices[1]), false);
            const endx_i = this.gcs.push_p_param(this.gcs.get_p_param(poleIndices[poleIndices.length - 2]), false);
            const endy_i = this.gcs.push_p_param(this.gcs.get_p_param(poleIndices[poleIndices.length - 1]), false);
            const weightIndices = [];
            for (const w of b.weights) {
              weightIndices.push(this.gcs.push_p_param(w, true));
            }
            const knotIndices = [];
            for (const k of b.knots) {
              knotIndices.push(this.gcs.push_p_param(k, true));
            }
            const polesVec = arr_to_intvec(this.module, poleIndices);
            const weightsVec = arr_to_intvec(this.module, weightIndices);
            const knotsVec = arr_to_intvec(this.module, knotIndices);
            const multVec = arr_to_intvec(this.module, b.mult);
            const result = this.gcs.make_bspline(startx_i, starty_i, endx_i, endy_i, polesVec, weightsVec, knotsVec, multVec, b.degree, b.periodic);
            this.bspline_gcs_cache.set(b.id, result);
            return result;
          }
          default:
            throw new Error(`not-implemented object type: ${o.type}`);
        }
      }
      push_constraint(c) {
        var _a, _b, _c, _d;
        const add_constraint_args = [];
        const deletable = [];
        const constraint_params = constraint_param_index[c.type];
        if (constraint_params === void 0) {
          throw new Error(`unknown constraint type: ${c.type}`);
        }
        let numeric_tag_id = -1;
        if (!c.temporary) {
          numeric_tag_id = this.sketch_index.counter() + 1;
        }
        for (const parameter of Object.keys(constraint_params)) {
          const type = constraint_params[parameter];
          if (type === void 0) {
            throw new Error(`unknown parameter type: ${type} in constraint ${c.type}`);
          }
          if (parameter === "tagId") {
            add_constraint_args.push(numeric_tag_id);
            continue;
          }
          if (parameter === "driving") {
            add_constraint_args.push((_a = c.driving) !== null && _a !== void 0 ? _a : true);
            continue;
          }
          if (parameter === "internalalignment" && c.type === "equal") {
            add_constraint_args.push((_b = c.internalalignment) !== null && _b !== void 0 ? _b : Constraint_Alignment.NoInternalAlignment);
            continue;
          }
          const val = c[parameter];
          const is_fixed = (_c = c.driving) !== null && _c !== void 0 ? _c : true;
          if (type === "object_param_or_number") {
            if (typeof val === "number") {
              if (!c.driving) {
                const list = this.nondriving_constraint_params_order.get(c.id);
                if (list === void 0) {
                  this.nondriving_constraint_params_order.set(c.id, [parameter]);
                } else {
                  list.push(parameter);
                }
              }
              const pos = this.push_p_params(c.id, [val], is_fixed);
              add_constraint_args.push(pos);
            } else if (typeof val === "string") {
              const param_addr = this.sketch_param_index.get(val);
              if (param_addr === void 0) {
                throw new Error(`couldn't parse object param: ${parameter} in constraint ${c.type}: unknown param ${val}`);
              }
              add_constraint_args.push(param_addr);
            } else if (typeof val === "boolean") {
              add_constraint_args.push(val);
            } else if (val !== void 0) {
              const ref_primitive = this.sketch_index.get_primitive_or_fail(val.o_id);
              if (!is_sketch_geometry(ref_primitive)) {
                throw new Error(`Primitive #${val.o_id} (${ref_primitive.type}) is not supported to be referenced from a constraint.`);
              }
              const param_addr = this.get_primitive_addr(val.o_id) + get_property_offset(ref_primitive.type, val.prop);
              add_constraint_args.push(param_addr);
            }
          } else if (type === "object_id" && typeof val === "string") {
            const obj = this.sketch_index.get_primitive_or_fail(val);
            const gcs_obj = this.sketch_primitive_to_gcs(obj);
            add_constraint_args.push(gcs_obj);
            if (obj.type !== "bspline") {
              deletable.push(gcs_obj);
            }
          } else if (type === "primitive_type" && (typeof val === "number" || typeof val === "boolean")) {
            add_constraint_args.push(val);
          } else {
            throw new Error(`unhandled parameter ${parameter} type: ${type}`);
          }
        }
        const c_name = c.type;
        this.gcs[`add_constraint_${c_name}`](...add_constraint_args, (_d = c.scale) !== null && _d !== void 0 ? _d : 1);
        if (this.enable_equal_optimization && c_name === "equal") {
          const [param_1_addr, param_2_addr] = [add_constraint_args[0], add_constraint_args[1]];
          if (typeof param_1_addr === "number" && typeof param_2_addr === "number") {
            if (this.gcs.get_is_fixed(param_1_addr) && !this.gcs.get_is_fixed(param_2_addr)) {
              this.gcs.set_p_param(param_2_addr, this.gcs.get_p_param(param_1_addr), false);
            } else if (this.gcs.get_is_fixed(param_2_addr) && !this.gcs.get_is_fixed(param_1_addr)) {
              this.gcs.set_p_param(param_1_addr, this.gcs.get_p_param(param_2_addr), false);
            }
          }
        }
        for (const geom_shape of deletable) {
          geom_shape.delete();
        }
      }
      // delete_constraint_by_id(id: oid): boolean {
      //     if (id !== '-1') {
      //         const item = this.sketch_index.get_primitive(id);
      //         if (item !== undefined && !is_sketch_geometry(item)) {
      //             throw new Error(`object #${id} (${item.type}) is not a constraint (delete_constraint_by_id)`);
      //         }
      //     }
      //     this.gcs.clear_by_id(id);
      //     return this.sketch_index.delete_primitive(id);
      // }
      get_primitive_addr(id) {
        const addr = this.p_param_index.get(id);
        if (addr === void 0) {
          throw new Error(`sketch object ${id} not found in p-params index`);
        }
        return addr;
      }
      // ------- GCS -> Sketch ------- (when retrieving a solution)
      pull_primitive(p) {
        if (this.p_param_index.has(p.id)) {
          if (p.type === "point") {
            this.pull_point(p);
          } else if (p.type === "line") {
            this.pull_line(p);
          } else if (p.type === "arc") {
            this.pull_arc(p);
          } else if (p.type === "circle") {
            this.pull_circle(p);
          } else if (p.type === "ellipse") {
            this.pull_ellipse(p);
          } else if (p.type === "arc_of_ellipse") {
            this.pull_arc_of_ellipse(p);
          } else if (p.type === "hyperbola") {
            this.pull_hyperbola(p);
          } else if (p.type === "arc_of_hyperbola") {
            this.pull_arc_of_hyperbola(p);
          } else if (p.type === "parabola") {
            this.pull_parabola(p);
          } else if (p.type === "arc_of_parabola") {
            this.pull_arc_of_parabola(p);
          } else if (p.type === "bspline") {
            this.pull_bspline(p);
          } else if (is_sketch_constraint(p)) {
            this.pull_constraint(p);
          } else {
            this.sketch_index.set_primitive(p);
          }
        } else {
          this.sketch_index.set_primitive(p);
        }
      }
      pull_point(p) {
        const point_addr = this.get_primitive_addr(p.id);
        const point = Object.assign(Object.assign({}, p), { x: this.gcs.get_p_param(point_addr + property_offsets.point.x), y: this.gcs.get_p_param(point_addr + property_offsets.point.y) });
        this.sketch_index.set_primitive(point);
      }
      pull_line(l) {
        this.sketch_index.set_primitive(l);
      }
      pull_arc(a) {
        const addr = this.get_primitive_addr(a.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, a), { start_angle: this.gcs.get_p_param(addr + property_offsets.arc.start_angle), end_angle: this.gcs.get_p_param(addr + property_offsets.arc.end_angle), radius: this.gcs.get_p_param(addr + property_offsets.arc.radius) }));
      }
      pull_circle(c) {
        const addr = this.get_primitive_addr(c.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, c), { radius: this.gcs.get_p_param(addr + property_offsets.circle.radius) }));
      }
      pull_ellipse(e) {
        const addr = this.get_primitive_addr(e.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, e), { radmin: this.gcs.get_p_param(addr + property_offsets.ellipse.radmin) }));
      }
      pull_arc_of_ellipse(ae) {
        const addr = this.get_primitive_addr(ae.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, ae), { start_angle: this.gcs.get_p_param(addr + property_offsets.arc_of_ellipse.start_angle), end_angle: this.gcs.get_p_param(addr + property_offsets.arc_of_ellipse.end_angle), radmin: this.gcs.get_p_param(addr + property_offsets.arc_of_ellipse.radmin) }));
      }
      pull_hyperbola(h) {
        const addr = this.get_primitive_addr(h.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, h), { radmin: this.gcs.get_p_param(addr + property_offsets.hyperbola.radmin) }));
      }
      pull_arc_of_hyperbola(ah) {
        const addr = this.get_primitive_addr(ah.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, ah), { start_angle: this.gcs.get_p_param(addr + property_offsets.arc_of_hyperbola.start_angle), end_angle: this.gcs.get_p_param(addr + property_offsets.arc_of_hyperbola.end_angle), radmin: this.gcs.get_p_param(addr + property_offsets.arc_of_hyperbola.radmin) }));
      }
      pull_parabola(p) {
        this.sketch_index.set_primitive(p);
      }
      pull_arc_of_parabola(ap) {
        const addr = this.get_primitive_addr(ap.id);
        this.sketch_index.set_primitive(Object.assign(Object.assign({}, ap), { start_angle: this.gcs.get_p_param(addr + property_offsets.arc_of_parabola.start_angle), end_angle: this.gcs.get_p_param(addr + property_offsets.arc_of_parabola.end_angle) }));
      }
      pull_bspline(b) {
        this.sketch_index.set_primitive(b);
      }
      pull_constraint(c) {
        if (c.driving !== false) {
          return;
        }
        const constraint_addr = this.get_primitive_addr(c.id);
        const offsets = this.nondriving_constraint_params_order.get(c.id);
        if (!offsets) {
          console.warn(`No offsets for constraint type ${c.type}`);
          return;
        }
        const constraint_copy = Object.assign({}, c);
        function update_property(obj, key, value) {
          obj[key] = value;
        }
        for (const [offset, constraint_property_name] of offsets.entries()) {
          const param = this.gcs.get_p_param(constraint_addr + offset);
          update_property(constraint_copy, constraint_property_name, param);
        }
        this.sketch_index.set_primitive(constraint_copy);
      }
    };
  }
});

// node_modules/@salusoft89/planegcs/dist/index.js
var init_dist = __esm({
  "node_modules/@salusoft89/planegcs/dist/index.js"() {
    init_enums();
    init_sketch_primitive();
    init_sketch_index();
    init_constraints();
    init_planegcs();
    init_gcs_wrapper();
  }
});

// src/solver.js
function getModule() {
  if (!modPromise) {
    modPromise = planegcs_default({ locateFile: () => "planegcs.wasm" });
  }
  return modPromise;
}
async function solveLineLength(x1, y1, x2, y2, newDistance) {
  const mod = await getModule();
  const gcs_system = new mod.GcsSystem();
  const gcs_wrapper = new GcsWrapper(gcs_system);
  const primitives = [
    { id: "p1", type: "point", x: x1, y: y1, fixed: true },
    { id: "p2", type: "point", x: x2, y: y2, fixed: false },
    { id: "d", type: "p2p_distance", p1_id: "p1", p2_id: "p2", distance: newDistance }
  ];
  gcs_wrapper.push_primitives_and_params(primitives);
  gcs_wrapper.solve();
  gcs_wrapper.apply_solution();
  const result = gcs_wrapper.sketch_index.get_primitives();
  const movedPoint = result.find((p) => p.id === "p2");
  gcs_wrapper.destroy_gcs_module();
  return { x: movedPoint.x, y: movedPoint.y };
}
var modPromise;
var init_solver = __esm({
  "src/solver.js"() {
    init_dist();
    modPromise = null;
  }
});

// src/script.js
var require_script = __commonJS({
  "src/script.js"() {
    init_solver();
    var canvas = document.getElementById("viewport");
    var ctx = canvas.getContext("2d");
    var coordsLabel = document.getElementById("coords");
    var zoomLabel = document.getElementById("zoom-level");
    var treeList = document.getElementById("tree-list");
    var SIDEBAR_WIDTH = 180;
    function resizeCanvas() {
      canvas.width = window.innerWidth - SIDEBAR_WIDTH;
      canvas.height = window.innerHeight;
      drawShapes();
    }
    window.addEventListener("resize", resizeCanvas);
    var SCALE = 4;
    var panX = 0;
    var panY = 0;
    var GRID_SIZE = 10;
    var MAJOR_EVERY = 5;
    var MIN_SCALE = 0.5;
    var MAX_SCALE = 30;
    function worldToScreen(x, y) {
      return { x: x * SCALE + panX, y: y * SCALE + panY };
    }
    function screenToWorld(x, y) {
      return { x: (x - panX) / SCALE, y: (y - panY) / SCALE };
    }
    function snapToGrid(value) {
      return Math.round(value / GRID_SIZE) * GRID_SIZE;
    }
    var activeTool = "rectangle";
    var gridSnapEnabled = false;
    var constructionModeEnabled = false;
    var rectBtn = document.getElementById("rect-tool");
    var circleBtn = document.getElementById("circle-tool");
    var lineBtn = document.getElementById("line-tool");
    var dimensionBtn = document.getElementById("dimension-tool");
    var gridSnapBtn = document.getElementById("grid-snap-tool");
    var constructionBtn = document.getElementById("construction-tool");
    var dimensionFirstEntity = null;
    var hoverEntity = null;
    var hoverDimensionShape = null;
    var justFinishedDimensionDrag = false;
    function setActiveTool(tool) {
      activeTool = tool;
      rectBtn.classList.toggle("active", tool === "rectangle");
      circleBtn.classList.toggle("active", tool === "circle");
      lineBtn.classList.toggle("active", tool === "line");
      dimensionBtn.classList.toggle("active", tool === "dimension");
      dimensionFirstEntity = null;
      hoverEntity = null;
      hoverDimensionShape = null;
    }
    rectBtn.addEventListener("click", () => setActiveTool("rectangle"));
    circleBtn.addEventListener("click", () => setActiveTool("circle"));
    lineBtn.addEventListener("click", () => setActiveTool("line"));
    dimensionBtn.addEventListener("click", () => setActiveTool("dimension"));
    gridSnapBtn.addEventListener("click", () => {
      gridSnapEnabled = !gridSnapEnabled;
      gridSnapBtn.classList.toggle("active", gridSnapEnabled);
      gridSnapBtn.textContent = gridSnapEnabled ? "Grid Snap: On" : "Grid Snap: Off";
    });
    constructionBtn.addEventListener("click", () => {
      constructionModeEnabled = !constructionModeEnabled;
      constructionBtn.classList.toggle("active", constructionModeEnabled);
      constructionBtn.textContent = constructionModeEnabled ? "Construction: On" : "Construction: Off";
    });
    var mouseIsDown = false;
    var isDrawing = false;
    var isMoving = false;
    var isMovingDimensionOffset = false;
    var isPanning = false;
    var panStartX;
    var panStartY;
    var panStartPanX;
    var panStartPanY;
    var startX;
    var startY;
    var currentX;
    var currentY;
    var moveOffsetX;
    var moveOffsetY;
    var mouseScreenX = 0;
    var mouseScreenY = 0;
    var mouseOnCanvas = false;
    var DRAG_THRESHOLD = 2;
    var ENTITY_TOLERANCE = 3;
    var LINE_HIT_TOLERANCE = 2;
    var nextShapeId = 1;
    var typeCounters = { rectangle: 0, circle: 0, line: 0, dimension: 0 };
    var shapes = [];
    var selectedShape = null;
    var clipboardShape = null;
    function createShape(props) {
      props.id = nextShapeId++;
      if (props.hidden === void 0) props.hidden = false;
      if (props.isConstruction === void 0) props.isConstruction = false;
      if (!props.name) {
        typeCounters[props.type] = (typeCounters[props.type] || 0) + 1;
        const label = props.type.charAt(0).toUpperCase() + props.type.slice(1);
        props.name = `${label} ${typeCounters[props.type]}`;
      }
      shapes.push(props);
      renderModelTree();
      return props;
    }
    function getShapeById(id) {
      return shapes.find((s) => s.id === id) || null;
    }
    function selectShape(shape) {
      selectedShape = shape;
      renderModelTree();
    }
    function renderModelTree() {
      treeList.innerHTML = "";
      for (const shape of shapes) {
        const item = document.createElement("div");
        item.className = "tree-item";
        if (shape === selectedShape) item.classList.add("selected");
        if (shape.hidden) item.classList.add("hidden-item");
        if (shape.isConstruction) item.classList.add("construction-item");
        const nameSpan = document.createElement("span");
        nameSpan.className = "tree-item-name";
        nameSpan.textContent = shape.name;
        item.appendChild(nameSpan);
        const actions = document.createElement("span");
        actions.className = "tree-item-actions";
        if (shape.type !== "dimension") {
          const constrBtn = document.createElement("span");
          constrBtn.className = "tree-btn" + (shape.isConstruction ? " on" : "");
          constrBtn.textContent = "Constr";
          constrBtn.addEventListener("click", (ev) => {
            ev.stopPropagation();
            shape.isConstruction = !shape.isConstruction;
            renderModelTree();
            drawShapes();
          });
          actions.appendChild(constrBtn);
        }
        const eyeBtn = document.createElement("span");
        eyeBtn.className = "tree-btn";
        eyeBtn.textContent = shape.hidden ? "Show" : "Hide";
        eyeBtn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          shape.hidden = !shape.hidden;
          if (shape.hidden && selectedShape === shape) selectedShape = null;
          renderModelTree();
          drawShapes();
        });
        actions.appendChild(eyeBtn);
        item.appendChild(actions);
        item.addEventListener("click", () => {
          if (shape.hidden) return;
          selectShape(shape);
          drawShapes();
        });
        treeList.appendChild(item);
      }
    }
    function shapeArea(shape) {
      if (shape.type === "rectangle") return Math.abs(shape.width * shape.height);
      if (shape.type === "circle") return Math.PI * shape.radius * shape.radius;
      if (shape.type === "line") return 0.01;
      if (shape.type === "dimension") return 0.01;
      return Infinity;
    }
    function resolveEntity(shapeId, edgeIndex) {
      const shape = getShapeById(shapeId);
      if (!shape || shape.hidden) return null;
      if (edgeIndex === "circle") {
        return { kind: "circle", cx: shape.x, cy: shape.y, radius: shape.radius };
      }
      if (shape.type === "line") {
        return { kind: "edge", x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 };
      }
      if (shape.type === "rectangle") {
        const corners = [
          { x: shape.x, y: shape.y },
          { x: shape.x + shape.width, y: shape.y },
          { x: shape.x + shape.width, y: shape.y + shape.height },
          { x: shape.x, y: shape.y + shape.height }
        ];
        const a = corners[edgeIndex];
        const b = corners[(edgeIndex + 1) % 4];
        return { kind: "edge", x1: a.x, y1: a.y, x2: b.x, y2: b.y };
      }
      return null;
    }
    function getAllEntityRefs() {
      const refs = [];
      for (const shape of shapes) {
        if (shape.hidden) continue;
        if (shape.type === "line") {
          refs.push({ shapeId: shape.id, edgeIndex: 0 });
        } else if (shape.type === "rectangle") {
          for (let i = 0; i < 4; i++) refs.push({ shapeId: shape.id, edgeIndex: i });
        } else if (shape.type === "circle") {
          refs.push({ shapeId: shape.id, edgeIndex: "circle" });
        }
      }
      return refs;
    }
    function getEntityAt(x, y) {
      let best = null;
      let bestDist = ENTITY_TOLERANCE;
      for (const ref of getAllEntityRefs()) {
        const r = resolveEntity(ref.shapeId, ref.edgeIndex);
        if (!r) continue;
        const d = r.kind === "circle" ? Math.abs(Math.hypot(x - r.cx, y - r.cy) - r.radius) : distanceToSegment(x, y, r.x1, r.y1, r.x2, r.y2);
        if (d < bestDist) {
          bestDist = d;
          best = ref;
        }
      }
      return best;
    }
    function getDimensionAt(x, y) {
      let best = null;
      let bestDist = LINE_HIT_TOLERANCE;
      for (const shape of shapes) {
        if (shape.hidden || shape.type !== "dimension") continue;
        const geo = computeDimensionGeometry(shape);
        if (!geo) continue;
        const d = distanceToSegment(x, y, geo.dp1.x, geo.dp1.y, geo.dp2.x, geo.dp2.y);
        if (d < bestDist) {
          bestDist = d;
          best = shape;
        }
      }
      return best;
    }
    function closestPointOnSegment(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lenSq = dx * dx + dy * dy;
      if (lenSq === 0) return { x: x1, y: y1, dist: Math.hypot(px - x1, py - y1) };
      let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
      t = Math.max(0, Math.min(1, t));
      const cx = x1 + t * dx;
      const cy = y1 + t * dy;
      return { x: cx, y: cy, dist: Math.hypot(px - cx, py - cy) };
    }
    function segmentMinDistance(segA, segB) {
      const candidates = [];
      let c = closestPointOnSegment(segA.x1, segA.y1, segB.x1, segB.y1, segB.x2, segB.y2);
      candidates.push({ p1: { x: segA.x1, y: segA.y1 }, p2: { x: c.x, y: c.y }, distance: c.dist });
      c = closestPointOnSegment(segA.x2, segA.y2, segB.x1, segB.y1, segB.x2, segB.y2);
      candidates.push({ p1: { x: segA.x2, y: segA.y2 }, p2: { x: c.x, y: c.y }, distance: c.dist });
      c = closestPointOnSegment(segB.x1, segB.y1, segA.x1, segA.y1, segA.x2, segA.y2);
      candidates.push({ p1: { x: c.x, y: c.y }, p2: { x: segB.x1, y: segB.y1 }, distance: c.dist });
      c = closestPointOnSegment(segB.x2, segB.y2, segA.x1, segA.y1, segA.x2, segA.y2);
      candidates.push({ p1: { x: c.x, y: c.y }, p2: { x: segB.x2, y: segB.y2 }, distance: c.dist });
      candidates.sort((a, b) => a.distance - b.distance);
      return candidates[0];
    }
    function computeDimensionGeometry(dim) {
      const A = resolveEntity(dim.entityA.shapeId, dim.entityA.edgeIndex);
      const B = resolveEntity(dim.entityB.shapeId, dim.entityB.edgeIndex);
      if (!A || !B) return null;
      const segA = A.kind === "edge" ? A : { x1: A.cx, y1: A.cy, x2: A.cx, y2: A.cy };
      const segB = B.kind === "edge" ? B : { x1: B.cx, y1: B.cy, x2: B.cx, y2: B.cy };
      const { p1, p2, distance } = segmentMinDistance(segA, segB);
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.hypot(dx, dy) || 1;
      const perp = { x: -dy / len, y: dx / len };
      const offset = dim.offset ?? 15;
      const dp1 = { x: p1.x + perp.x * offset, y: p1.y + perp.y * offset };
      const dp2 = { x: p2.x + perp.x * offset, y: p2.y + perp.y * offset };
      return { p1, p2, dp1, dp2, distance, perp };
    }
    function drawGrid() {
      const topLeftWorld = screenToWorld(0, 0);
      const bottomRightWorld = screenToWorld(canvas.width, canvas.height);
      const startXWorld = Math.floor(topLeftWorld.x / GRID_SIZE) * GRID_SIZE;
      const endXWorld = Math.ceil(bottomRightWorld.x / GRID_SIZE) * GRID_SIZE;
      const startYWorld = Math.floor(topLeftWorld.y / GRID_SIZE) * GRID_SIZE;
      const endYWorld = Math.ceil(bottomRightWorld.y / GRID_SIZE) * GRID_SIZE;
      let lineIndex = Math.round(startXWorld / GRID_SIZE);
      for (let x = startXWorld; x <= endXWorld; x += GRID_SIZE) {
        const sx = worldToScreen(x, 0).x;
        ctx.strokeStyle = lineIndex % MAJOR_EVERY === 0 ? "#33363b" : "#242629";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, canvas.height);
        ctx.stroke();
        lineIndex++;
      }
      lineIndex = Math.round(startYWorld / GRID_SIZE);
      for (let y = startYWorld; y <= endYWorld; y += GRID_SIZE) {
        const sy = worldToScreen(0, y).y;
        ctx.strokeStyle = lineIndex % MAJOR_EVERY === 0 ? "#33363b" : "#242629";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, sy);
        ctx.lineTo(canvas.width, sy);
        ctx.stroke();
        lineIndex++;
      }
    }
    function drawCrosshair() {
      if (!mouseOnCanvas) return;
      ctx.strokeStyle = "#6a6d72";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mouseScreenX, 0);
      ctx.lineTo(mouseScreenX, canvas.height);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, mouseScreenY);
      ctx.lineTo(canvas.width, mouseScreenY);
      ctx.stroke();
      ctx.fillStyle = "#e8b04b";
      ctx.beginPath();
      ctx.arc(mouseScreenX, mouseScreenY, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    function drawEntityHighlight(ref, color) {
      const resolved = resolveEntity(ref.shapeId, ref.edgeIndex);
      if (!resolved) return;
      ctx.setLineDash([]);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      if (resolved.kind === "circle") {
        const c = worldToScreen(resolved.cx, resolved.cy);
        ctx.beginPath();
        ctx.arc(c.x, c.y, resolved.radius * SCALE, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        const a = worldToScreen(resolved.x1, resolved.y1);
        const b = worldToScreen(resolved.x2, resolved.y2);
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
    function drawShapes() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid();
      for (const shape of shapes) {
        if (shape.hidden) continue;
        if (shape.type === "dimension") continue;
        const isSelected = shape === selectedShape;
        if (shape.isConstruction) {
          ctx.setLineDash([6, 4]);
          ctx.strokeStyle = isSelected ? "#e8b04b" : "#7a8a99";
        } else {
          ctx.setLineDash([]);
          ctx.strokeStyle = isSelected ? "#e8b04b" : "#5b9bd5";
        }
        ctx.lineWidth = 2;
        if (shape.type === "rectangle") {
          const topLeft = worldToScreen(shape.x, shape.y);
          const size = { x: shape.width * SCALE, y: shape.height * SCALE };
          ctx.strokeRect(topLeft.x, topLeft.y, size.x, size.y);
        } else if (shape.type === "circle") {
          const center = worldToScreen(shape.x, shape.y);
          ctx.beginPath();
          ctx.arc(center.x, center.y, shape.radius * SCALE, 0, Math.PI * 2);
          ctx.stroke();
        } else if (shape.type === "line") {
          const p1 = worldToScreen(shape.x1, shape.y1);
          const p2 = worldToScreen(shape.x2, shape.y2);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }
      for (const shape of shapes) {
        if (shape.hidden) continue;
        if (shape.type !== "dimension") continue;
        const geo = computeDimensionGeometry(shape);
        if (!geo) continue;
        const p1s = worldToScreen(geo.p1.x, geo.p1.y);
        const p2s = worldToScreen(geo.p2.x, geo.p2.y);
        const dp1s = worldToScreen(geo.dp1.x, geo.dp1.y);
        const dp2s = worldToScreen(geo.dp2.x, geo.dp2.y);
        const isSelected = shape === selectedShape;
        const isHovered = shape === hoverDimensionShape;
        ctx.setLineDash([]);
        ctx.strokeStyle = "#5c5f63";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(p1s.x, p1s.y);
        ctx.lineTo(dp1s.x, dp1s.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p2s.x, p2s.y);
        ctx.lineTo(dp2s.x, dp2s.y);
        ctx.stroke();
        const lineColor = isSelected ? "#ffce6b" : isHovered ? "#f7c877" : "#e8b04b";
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = isSelected || isHovered ? 2.5 : 1.5;
        ctx.beginPath();
        ctx.moveTo(dp1s.x, dp1s.y);
        ctx.lineTo(dp2s.x, dp2s.y);
        ctx.stroke();
        const midX = (dp1s.x + dp2s.x) / 2;
        const midY = (dp1s.y + dp2s.y) / 2;
        ctx.font = "12px monospace";
        ctx.textAlign = "center";
        const label = geo.distance.toFixed(1) + " mm";
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = "#1c1e21";
        ctx.fillRect(midX - textWidth / 2 - 4, midY - 16, textWidth + 8, 16);
        ctx.fillStyle = lineColor;
        ctx.fillText(label, midX, midY - 4);
      }
      if (activeTool === "dimension") {
        if (hoverEntity) drawEntityHighlight(hoverEntity, "#6fc9e8");
        if (dimensionFirstEntity) drawEntityHighlight(dimensionFirstEntity, "#7fc97f");
      }
      ctx.setLineDash([]);
      drawCrosshair();
    }
    function distanceToSegment(px, py, x1, y1, x2, y2) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const lengthSq = dx * dx + dy * dy;
      if (lengthSq === 0) return Math.hypot(px - x1, py - y1);
      let t = ((px - x1) * dx + (py - y1) * dy) / lengthSq;
      t = Math.max(0, Math.min(1, t));
      const closestX = x1 + t * dx;
      const closestY = y1 + t * dy;
      return Math.hypot(px - closestX, py - closestY);
    }
    function getShapeAt(x, y) {
      let bestMatch = null;
      let bestArea = Infinity;
      for (const shape of shapes) {
        if (shape.hidden) continue;
        let hit = false;
        if (shape.type === "rectangle") {
          const left = Math.min(shape.x, shape.x + shape.width);
          const right = Math.max(shape.x, shape.x + shape.width);
          const top = Math.min(shape.y, shape.y + shape.height);
          const bottom = Math.max(shape.y, shape.y + shape.height);
          hit = x >= left && x <= right && y >= top && y <= bottom;
        } else if (shape.type === "circle") {
          const distance = Math.hypot(x - shape.x, y - shape.y);
          hit = distance <= shape.radius;
        } else if (shape.type === "line") {
          const distance = distanceToSegment(x, y, shape.x1, shape.y1, shape.x2, shape.y2);
          hit = distance <= LINE_HIT_TOLERANCE;
        } else if (shape.type === "dimension") {
          const geo = computeDimensionGeometry(shape);
          if (geo) {
            const distance = distanceToSegment(x, y, geo.dp1.x, geo.dp1.y, geo.dp2.x, geo.dp2.y);
            hit = distance <= LINE_HIT_TOLERANCE;
          }
        }
        if (hit) {
          const area = shapeArea(shape);
          if (area < bestArea) {
            bestArea = area;
            bestMatch = shape;
          }
        }
      }
      return bestMatch;
    }
    function getWorldMouse(e) {
      const world = screenToWorld(e.offsetX, e.offsetY);
      if (gridSnapEnabled) {
        return { x: snapToGrid(world.x), y: snapToGrid(world.y) };
      }
      return world;
    }
    canvas.addEventListener("mousedown", (e) => {
      if (e.button === 1) {
        e.preventDefault();
        isPanning = true;
        panStartX = e.offsetX;
        panStartY = e.offsetY;
        panStartPanX = panX;
        panStartPanY = panY;
        return;
      }
      if (activeTool === "dimension") {
        const world2 = screenToWorld(e.offsetX, e.offsetY);
        const dimHit = getDimensionAt(world2.x, world2.y);
        if (dimHit) {
          mouseIsDown = true;
          selectShape(dimHit);
          isMovingDimensionOffset = true;
          drawShapes();
        }
        return;
      }
      mouseIsDown = true;
      isDrawing = false;
      isMoving = false;
      isMovingDimensionOffset = false;
      const world = getWorldMouse(e);
      startX = world.x;
      startY = world.y;
      if (selectedShape) {
        const hit = getShapeAt(startX, startY);
        if (hit === selectedShape) {
          if (selectedShape.type === "dimension") {
            isMovingDimensionOffset = true;
          } else {
            isMoving = true;
            moveOffsetX = startX - (selectedShape.x ?? selectedShape.x1);
            moveOffsetY = startY - (selectedShape.y ?? selectedShape.y1);
          }
        }
      }
    });
    canvas.addEventListener("mousemove", (e) => {
      mouseScreenX = e.offsetX;
      mouseScreenY = e.offsetY;
      mouseOnCanvas = true;
      if (isPanning) {
        panX = panStartPanX + (e.offsetX - panStartX);
        panY = panStartPanY + (e.offsetY - panStartY);
        drawShapes();
        return;
      }
      const worldPos = screenToWorld(e.offsetX, e.offsetY);
      coordsLabel.textContent = `X: ${worldPos.x.toFixed(1)}  Y: ${worldPos.y.toFixed(1)}`;
      if (isMovingDimensionOffset) {
        const geo = computeDimensionGeometry(selectedShape);
        if (geo) {
          const relX = worldPos.x - geo.p1.x;
          const relY = worldPos.y - geo.p1.y;
          selectedShape.offset = relX * geo.perp.x + relY * geo.perp.y;
        }
        drawShapes();
        return;
      }
      if (activeTool === "dimension") {
        hoverDimensionShape = getDimensionAt(worldPos.x, worldPos.y);
        hoverEntity = hoverDimensionShape ? null : getEntityAt(worldPos.x, worldPos.y);
        drawShapes();
        return;
      }
      if (!mouseIsDown) {
        drawShapes();
        return;
      }
      const world = getWorldMouse(e);
      currentX = world.x;
      currentY = world.y;
      const dragDistance = Math.hypot(currentX - startX, currentY - startY);
      if (isMoving) {
        if (selectedShape.type === "line") {
          const dx = currentX - moveOffsetX - selectedShape.x1;
          const dy = currentY - moveOffsetY - selectedShape.y1;
          selectedShape.x1 += dx;
          selectedShape.y1 += dy;
          selectedShape.x2 += dx;
          selectedShape.y2 += dy;
        } else {
          selectedShape.x = currentX - moveOffsetX;
          selectedShape.y = currentY - moveOffsetY;
        }
        drawShapes();
        return;
      }
      if (!isDrawing && dragDistance > DRAG_THRESHOLD) {
        isDrawing = true;
        selectShape(null);
      }
      if (!isDrawing) {
        drawShapes();
        return;
      }
      drawShapes();
      if (constructionModeEnabled) {
        ctx.setLineDash([6, 4]);
        ctx.strokeStyle = "#7a8a99";
      } else {
        ctx.setLineDash([]);
        ctx.strokeStyle = "#5b9bd5";
      }
      ctx.lineWidth = 2;
      if (activeTool === "rectangle") {
        const topLeft = worldToScreen(startX, startY);
        const size = { x: (currentX - startX) * SCALE, y: (currentY - startY) * SCALE };
        ctx.strokeRect(topLeft.x, topLeft.y, size.x, size.y);
      } else if (activeTool === "circle") {
        const radius = Math.hypot(currentX - startX, currentY - startY);
        const center = worldToScreen(startX, startY);
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius * SCALE, 0, Math.PI * 2);
        ctx.stroke();
      } else if (activeTool === "line") {
        const p1 = worldToScreen(startX, startY);
        const p2 = worldToScreen(currentX, currentY);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    });
    canvas.addEventListener("mouseleave", () => {
      mouseOnCanvas = false;
      drawShapes();
    });
    canvas.addEventListener("click", (e) => {
      if (justFinishedDimensionDrag) {
        justFinishedDimensionDrag = false;
        return;
      }
      if (activeTool !== "dimension") return;
      const world = screenToWorld(e.offsetX, e.offsetY);
      if (getDimensionAt(world.x, world.y)) return;
      const entity = getEntityAt(world.x, world.y);
      if (!entity) return;
      if (!dimensionFirstEntity) {
        dimensionFirstEntity = entity;
      } else {
        const isSameEntity = entity.shapeId === dimensionFirstEntity.shapeId && entity.edgeIndex === dimensionFirstEntity.edgeIndex;
        if (!isSameEntity) {
          createShape({
            type: "dimension",
            entityA: dimensionFirstEntity,
            entityB: entity,
            offset: 15
          });
          dimensionFirstEntity = null;
        }
      }
      drawShapes();
    });
    document.addEventListener("mouseup", (e) => {
      if (isPanning) {
        isPanning = false;
        return;
      }
      if (!mouseIsDown) return;
      mouseIsDown = false;
      if (isMovingDimensionOffset) {
        isMovingDimensionOffset = false;
        justFinishedDimensionDrag = true;
        drawShapes();
        return;
      }
      if (isMoving) {
        isMoving = false;
        drawShapes();
        return;
      }
      if (isDrawing) {
        if (activeTool === "rectangle") {
          const width = currentX - startX;
          const height = currentY - startY;
          createShape({ type: "rectangle", x: startX, y: startY, width, height, isConstruction: constructionModeEnabled });
        } else if (activeTool === "circle") {
          const radius = Math.hypot(currentX - startX, currentY - startY);
          createShape({ type: "circle", x: startX, y: startY, radius, isConstruction: constructionModeEnabled });
        } else if (activeTool === "line") {
          createShape({ type: "line", x1: startX, y1: startY, x2: currentX, y2: currentY, isConstruction: constructionModeEnabled });
        }
        isDrawing = false;
        drawShapes();
        return;
      }
      selectShape(getShapeAt(startX, startY));
      drawShapes();
    });
    canvas.addEventListener("auxclick", (e) => e.preventDefault());
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      const worldBefore = screenToWorld(e.offsetX, e.offsetY);
      canvas.addEventListener("dblclick", async (e2) => {
        console.log("double click fired");
        if (activeTool === "dimension") return;
        const world = screenToWorld(e2.offsetX, e2.offsetY);
        const hit = getShapeAt(world.x, world.y);
        if (!hit || hit.type !== "line") return;
        const currentLength = Math.hypot(hit.x2 - hit.x1, hit.y2 - hit.y1);
        const input = prompt("New length (mm):", currentLength.toFixed(1));
        if (input === null) return;
        const newLength = parseFloat(input);
        if (isNaN(newLength) || newLength <= 0) return;
        const result = await solveLineLength(hit.x1, hit.y1, hit.x2, hit.y2, newLength);
        hit.x2 = result.x;
        hit.y2 = result.y;
        drawShapes();
      });
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      SCALE = Math.min(MAX_SCALE, Math.max(MIN_SCALE, SCALE * zoomFactor));
      panX = e.offsetX - worldBefore.x * SCALE;
      panY = e.offsetY - worldBefore.y * SCALE;
      zoomLabel.textContent = `Zoom: ${Math.round(SCALE / 4 * 100)}%`;
      drawShapes();
    }, { passive: false });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        dimensionFirstEntity = null;
        drawShapes();
        return;
      }
      if (e.key === "Delete" && selectedShape) {
        const index = shapes.indexOf(selectedShape);
        shapes.splice(index, 1);
        selectedShape = null;
        renderModelTree();
        drawShapes();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") {
        if (selectedShape) {
          e.preventDefault();
          clipboardShape = JSON.parse(JSON.stringify(selectedShape));
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") {
        if (clipboardShape) {
          e.preventDefault();
          const clone = JSON.parse(JSON.stringify(clipboardShape));
          delete clone.id;
          delete clone.name;
          const OFFSET = 10;
          if (clone.type === "rectangle" || clone.type === "circle") {
            clone.x += OFFSET;
            clone.y += OFFSET;
          } else if (clone.type === "line") {
            clone.x1 += OFFSET;
            clone.y1 += OFFSET;
            clone.x2 += OFFSET;
            clone.y2 += OFFSET;
          }
          const newShape = createShape(clone);
          selectShape(newShape);
          drawShapes();
        }
        return;
      }
    });
    resizeCanvas();
  }
});
export default require_script();
