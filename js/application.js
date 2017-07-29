paper.install(window);

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

function generateSeed() {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
  let seed = [];
  while(seed.length < 5) { seed.push(charset.charAt(Math.floor(Math.random() * charset.length))); }
  document.getElementById('seed').value = seed.join('');
}

function waveform(x, y, h, cornerSize = 0, stroke = 3, color = 'black', axis = false, drawInside = () => {}) {
  const strokeOffset = stroke + (h * 0.1)
  const rectangle = new Rectangle(x - (h/2), y - (h/2), h, h);
  const corners = new Size(cornerSize);
  const square = new Path.Rectangle(rectangle, corners);
  square.strokeColor = color;
  square.strokeWidth = stroke;

  if(axis) {
    const axis = new Path.Line(new Point(x - h/2, y), new Point(x + h/2, y));
    axis.strokeColor = color;
    axis.strokeWidth = stroke - 2;
    axis.dashArray   = [stroke, stroke];
  }

  return drawInside(x, y, h, stroke, strokeOffset, color);
}

function sine(x, y, h, stroke, strokeOffset, color) {
  const left   = new Point(x - h/2, y);
  const up     = new Point(x - h/4, y - h/2 + strokeOffset);
  const center = new Point(x      , y);
  const down   = new Point(x + h/4, y + h/2 - strokeOffset);
  const right  = new Point(x + h/2, y);
  const sine   = new Path();
  sine.add(left);
  sine.curveTo(up, center);
  sine.curveTo(down, right);
  sine.strokeColor = color;
  sine.strokeWidth = stroke;
  return sine;
}

function square(x, y, h, stroke, strokeOffset, color) {
  const leftUp     = new Point(x - h/2, y - h/2 + strokeOffset);
  const centerUp   = new Point(x      , y - h/2 + strokeOffset);
  const centerDown = new Point(x      , y + h/2 - strokeOffset);
  const rightDown  = new Point(x + h/2, y + h/2 - strokeOffset);
  const square     = new Path();
  square.add(leftUp);
  square.lineTo(centerUp);
  square.lineTo(centerDown);
  square.lineTo(rightDown);
  square.strokeColor = color;
  square.strokeWidth = stroke;
  return square;
}

function sawtooth(x, y, h, stroke, strokeOffset, color) {
  const left       = new Point(x - h/2, y);
  const centerUp   = new Point(x      , y - h/2 + strokeOffset);
  const centerDown = new Point(x      , y + h/2 - strokeOffset);
  const right      = new Point(x + h/2, y);
  const sawtooth   = new Path();
  sawtooth.add(left);
  sawtooth.lineTo(centerUp);
  sawtooth.lineTo(centerDown);
  sawtooth.lineTo(right);
  sawtooth.strokeColor = color;
  sawtooth.strokeWidth = stroke;
  return sawtooth;
}

function triangle(x, y, h, stroke, strokeOffset, color) {
  const left     = new Point(x - h/2, y + h/2 - strokeOffset);
  const up       = new Point(x      , y - h/2 + strokeOffset);
  const right    = new Point(x + h/2, y + h/2 - strokeOffset);
  const triangle = new Path();
  triangle.add(left);
  triangle.lineTo(up);
  triangle.lineTo(right);
  triangle.strokeColor = color;
  triangle.strokeWidth = stroke;
  return triangle;
}

function draw() {
  project.activeLayer.removeChildren();
  const width = parseFloat(document.getElementById('width').value);
  const padding = parseFloat(document.getElementById('padding').value);
  const stroke = parseFloat(document.getElementById('stroke').value);
  const corner = parseFloat(document.getElementById('corner').value);
  const columns = parseInt(document.getElementById('columns').value);
  const axis = document.getElementById('axis').checked;
  const symbols = [sine, square, sawtooth, triangle];

  let up = padding/2 + 100;
  let left = 0;
  symbols.forEach((symbol, position) => {
    waveform(left, up, width, corner, stroke, 'black', axis, symbol);
    left += width + padding;
    if(left >= columns * (width + padding)) {
      left = 0;
      up += width + padding;
    }
  });

  glitch();

  view.viewSize.width = project.activeLayer.bounds.width + padding;
  view.viewSize.height = project.activeLayer.bounds.height + padding;
  project.activeLayer.position = view.center;
  // view.draw();

  const background = new Path.Rectangle({
    fillColor: 'white',
    strokeWidth: 2,
    size: [project.activeLayer.bounds.width + padding, project.activeLayer.bounds.height + padding]
  });
  background.position.x = view.center.x;
  background.position.y = view.center.y;
  background.sendToBack();
}

function glitch() {
  if(!document.getElementById('glitch').checked) return;
  Math.seedrandom(document.getElementById('seed').value);

  let times = randomInt(1, 5);

  while(times--) {
    let symbols = project.activeLayer.rasterize();

    const rasterRectangle = new Rectangle(
      new Point(randomInt(0, project.activeLayer.bounds.width), randomInt(0, project.activeLayer.bounds.height)),
      new Size(randomInt(10, project.activeLayer.bounds.width), randomInt(10, project.activeLayer.bounds.height))
    );
    const segment = symbols.getSubRaster(rasterRectangle);
    const rectangle = new Path.Rectangle(segment.bounds);
    rectangle.fillColor = 'white';
    segment.position = new Point(randomInt(0, project.activeLayer.bounds.width), randomInt(0, project.activeLayer.bounds.height));
  }
}

function save() {
  var canvas = document.getElementById('canvas');
  var image = canvas.toDataURL('image/png');
  var a = document.getElementById('save');
  a.download = 'image.png';
  a.href = image;
}

window.onload = () => {
  paper.setup('canvas');
  generateSeed();
  draw();
}
