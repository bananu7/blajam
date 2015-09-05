'use strict';

var ctx;
var cvs;

function Car () {
    this.turn = 0;
    this.speed = 100;

    return this;
}

Car.prototype.drawControls = function (){
    function drawSteeringWheel(turn) {
        var px = 100;
        var py = 100;
        var r = 50;

        ctx.save();

        ctx.translate(px, py);
        ctx.rotate(turn);

        circle(ctx, 0, 0, r);
        line (ctx, 0, 0, 0, r);

        ctx.restore();
    }

    drawSteeringWheel(this.turn);
}

var car = new Car();
var input = {
    turningLeft: false,
    turningRight: false
}

function keyDown(e) {
    switch (e.keyCode) {
        case 37: // left arrow
            input.turningLeft = true;
            console.log('left');
        break;
        case 38: // up arrow
        break;
        case 39: // right arrow
            input.turningRight = true;
        break;
        case 40: // down arrow
        break;
    }

    return false;
}

function keyUp(e) {
    switch (e.keyCode) {
        case 37: // left arrow
            input.turningLeft = false;
        break;
        case 38: // up arrow
        break;
        case 39: // right arrow
            input.turningRight = false;
        break;
        case 40: // down arrow
        break;
    }

    return false;
}

function update() {
    console.log("???");
    if (input.turningLeft) {
        car.turn -= 0.1;
    }
    if (input.turningRight) {
        car.turn += 0.1;
    }

    ctx.clearRect(0, 0, cvs.width, cvs.height);
    car.drawControls();
}

function load() {
    ctx = ctxInit('other-canvas');
    cvs = document.getElementById('other-canvas');

    window.addEventListener("keydown", keyDown, true);
    window.addEventListener("keyup", keyUp, true);

    var updateFn = setInterval(update, 32); // 30fps

    console.log("test");

    var otherCVS = document.getElementById('driving-canvas');
    run(ctxInit('driving-canvas'), otherCVS.width, otherCVS.height);
}

