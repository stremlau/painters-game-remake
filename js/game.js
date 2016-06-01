var width = 512;
var height = 512;


var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
canvas.width = width;
canvas.height = height;
document.body.appendChild(canvas);

var buffer_canvas = document.createElement("canvas");
var buffer = buffer_canvas.getContext("2d");
buffer_canvas.width = width;
buffer_canvas.height = height;

var image_canvas = document.createElement("canvas");
var image = image_canvas.getContext("2d");
image_canvas.width = width;
image_canvas.height = height;
image.fillStyle = 'black';
image.fillRect(0, 0, width, height);

function Brush(x, y, r, g, b) {
	this.x = x;
	this.y = y;

	this.r = r;
	this.g = g;
	this.b = b;
	this.getColor = function() { return (this.erase > 0) ? "rgb(0, 0, 0)" : "rgb(" + this.r + ", " + this.g + ", " + this.b + ")" };

	this.pixels = 0;

	this.superspeed = 0;
	this.superradius = 0;
	this.erase = 0;
	this.frozen = 0;
	this.nocolor = 0;

	this.getRadius = function() { return (this.superradius > 0) ? 15 : 10 };
	this.getSpeed = function() { return (this.superspeed > 0) ? 180 : 100 };
	this.direction = Math.round(Math.random() * 36) * 10;
	this.change_direction_speed = 180;

	this.updatePosition = function(modifier) {
		if (this.frozen <= 0) {
			this.x += Math.cos(this.direction * Math.PI/180) * this.getSpeed() * modifier;
			this.y += Math.sin(this.direction * Math.PI/180) * this.getSpeed() * modifier;

			this.x = Math.max(Math.min(this.x, width - this.getRadius()), this.getRadius());
			this.y = Math.max(Math.min(this.y, height - this.getRadius()), this.getRadius());
		}

		this.superradius = Math.max(0, this.superradius - modifier);
		this.superspeed = Math.max(0, this.superspeed - modifier);
		this.erase = Math.max(0, this.erase - modifier);
		this.frozen = Math.max(0, this.frozen - modifier);
		this.nocolor = Math.max(0, this.nocolor - modifier);
	}

	this.drawImage = function(image) {
		if (this.nocolor <= 0) {
			image.fillStyle = this.getColor();
			image.beginPath();
			image.arc(this.x, this.y, this.getRadius(), 0, 2 * Math.PI, false);
			image.closePath();
			image.fill();
		}
	}

	this.drawBuffer = function(buffer) {
		buffer.strokeStyle = "rgb(255, 255, 255)";
		buffer.beginPath();
		buffer.arc(this.x, this.y, this.getRadius(), 0, 2 * Math.PI, false);
		buffer.closePath();
		buffer.stroke();

		buffer.fillStyle = "rgb(255, 255, 255)";
		buffer.beginPath();
		buffer.arc(this.x + Math.cos(this.direction * Math.PI/180) * this.getRadius(), this.y + Math.sin(this.direction * Math.PI/180) * this.getRadius(), 3, 0, 2 * Math.PI, false);
		buffer.fill();
		//buffer.stroke();
	}
};

function Item(speed, radius, frozen, erase, nocolor, x, y, color) {
	this.speed = speed;
	this.radius = radius;
	this.erase = erase;
	this.frozen = frozen;
	this.nocolor = nocolor;

	this.visible = 40;

	this.color = color;

	this.x = x;
	this.y = y;

	this.getRadius = function() { return 3 };

	this.drawBuffer = function(buffer) {
		if (this.visible <= 0) return false;
	
		buffer.fillStyle = this.color;
                buffer.beginPath();
                buffer.arc(this.x, this.y, this.getRadius(), 0, 2 * Math.PI, false);
                buffer.fill();
                //buffer.stroke();
	}

	this.collides = function(brush) {
		if (this.visible <= 0) return false;
		
		this.visible = 0;
		brush.superspeed += this.speed;
		brush.superradius += this.radius;
		brush.erase += this.erase;
		brush.frozen += this.frozen;
		brush.nocolor += this.nocolor;
	}
}

var brushes = [];
var items = [];
var keysDown = {};

addEventListener("keydown", function (e) {
	keysDown[e.keyCode] = true;
}, false);

addEventListener("keyup", function (e) {
	delete keysDown[e.keyCode];
}, false);


var then;
var reset = function () {
	image.fillStyle = 'black';
	image.fillRect(0, 0, width, height);

	then = Date.now();
	brushes = [
		new Brush(canvas.width / 2 - 20, canvas.height / 2, 250, 0, 0),
		new Brush(canvas.width / 2 + 20, canvas.height / 2, 0, 0, 250)
	];

	items = [
		new Item(10, 10, 0, 10, 0, 50,  50, "rgb(180, 200, 10)"),
		new Item(0,  15, 0, 0,  0, 480, 50, "rgb(20,  230, 5 )"),
		new Item(15, 0,  0, 0,  0, 480, 480, "rgb(180,  100, 250)"),
		new Item(0,  0,  0, 0,  8, 50,  480, "rgb(250, 150, 130)"),
		new Item(0,  0,  5, 0,  0, 230, 480, "rgb(255, 255, 255)")
	];
};

var update = function (modifier) {
	if (37 in keysDown) {
		brushes[0].direction -= brushes[0].change_direction_speed * modifier;
	}
	if (39 in keysDown) {
		brushes[0].direction += brushes[0].change_direction_speed * modifier;
	}
	if (65 in keysDown) {
		brushes[1].direction -= brushes[1].change_direction_speed * modifier;
	}
	if (68 in keysDown) {
		brushes[1].direction += brushes[1].change_direction_speed * modifier;
	}

	for (var b = 0; b < brushes.length; b++) {
		brushes[b].updatePosition(modifier);

		for (var i = 0; i < items.length; i++) {
			if (Math.abs(items[i].x - brushes[b].x) <= brushes[b].getRadius() + items[i].getRadius()
			&&  Math.abs(items[i].y - brushes[b].y) <= brushes[b].getRadius() + items[i].getRadius())
				items[i].collides(brushes[b]);
		}
	}
};

var render = function () {
	for (var i = 0; i < brushes.length; i++) {
		brushes[i].drawImage(image);
	}

	buffer.drawImage(image_canvas, 0, 0);

	for (var i = 0; i < items.length; i++) {
                items[i].drawBuffer(buffer);
        }

	for (var i = 0; i < brushes.length; i++) {
		brushes[i].drawBuffer(buffer);
	}

	ctx.drawImage(buffer_canvas, 0, 0);
};

var calcPercent = function() {
	var imageData = image.getImageData(0, 0, width, height);
        var data = imageData.data;

	for (var i = 0; i < brushes.length; i++) {
                brushes[i].pixels = 0;
        }

        // iterate over all pixels
        for(var i = 0, n = data.length; i < n; i += 4) {
          var red = data[i];
          var green = data[i + 1];
          var blue = data[i + 2];
          var alpha = data[i + 3];

		/*for (var i = 0; i < brushes.length; i++) {
                	if (brushes[i].r == red && brushes[i].g == green && brushes[i].b == blue)
				brushes[i].pixels++;
        	}*/
        }

	console.log(brushes);
}

var running = true;

// The main game loop
var main = function () {
	var now = Date.now();
	var delta = now - then;

	//console.log(delta);

	update(delta / 1000);
	render();

	then = now;

	if (running) requestAnimationFrame(main);
};

// Cross-browser support for requestAnimationFrame
var w = window;
requestAnimationFrame = w.requestAnimationFrame || w.webkitRequestAnimationFrame || w.msRequestAnimationFrame || w.mozRequestAnimationFrame;

var startGame = function() {
	reset();
	main();
}
