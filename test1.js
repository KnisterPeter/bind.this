function assertEquals(a, b, msg) {
  if (msg) msg += "\n"; else msg = "\n";
  if (a != b)
    throw msg + "Expected: " + JSON.stringify(b) + "\n     Got: " + JSON.stringify(a);
}
function assertArrayEquals(a, b, msg) {
  if (msg) msg += "\n"; else msg = "\n";
  if (a < b || a > b)
    throw msg + "Expected: " + JSON.stringify(b) + "\n     Got: " + JSON.stringify(a);
}

var obj = {
  title: "title",
  list: ["x", "y", "z"],
  name: "name",
  select: [10, 20, 30],
};

var bindings = bind.connect(document.getElementById('wrapper'), obj, false);
console.log(bindings);
assertEquals(bindings.dest.title(), obj.title);
assertArrayEquals(bindings.dest.list(), obj.list);
assertEquals(bindings.dest.name(), obj.name);
assertArrayEquals(bindings.dest.select(), obj.select);

var bindings = bind.connect(document.getElementById('wrapper'), obj);
console.log(bindings);
assertEquals(bindings.dest.title(), bindings.source.title());
assertArrayEquals(bindings.dest.list(), bindings.source.list());
assertEquals(bindings.dest.name(), bindings.source.name());
assertArrayEquals(bindings.dest.select(), bindings.source.select());
