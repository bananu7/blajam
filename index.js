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
        var px = 300;
        var py = 400;
        var r = 50;

        ctx.save();
        ctx.lineWidth = 5;

        ctx.translate(px, py);
        ctx.rotate(turn);

        circle(ctx, 0, 0, r);
        line (ctx, 0, 0, 0, -r);

        ctx.restore();
    }

    function drawSpeedoMeter(speed) {
        var px = 300;
        var py = 200;
        var r = 150;

        var maxSpeedometerSpeed = 200;

        ctx.save();
            ctx.translate(px, py);
            ctx.fillStyle = "black";
            halfCircle (ctx, 0, 0, r);
            ctx.fill();

            function speedToArc(speed) {
                return (speed / maxSpeedometerSpeed) * 3.14  - 3.14;
            }

            ctx.strokeStyle = "white";

            // measurements
            for (var i = 0; i < maxSpeedometerSpeed; i += 10) {
                ctx.save();
                ctx.rotate(speedToArc(i));
                line (ctx, r, 0, r-10, 0);
                ctx.restore();
            }

            // dial
            ctx.save();
                ctx.lineWidth = 8;
                ctx.rotate(speedToArc(speed));
                line (ctx, 0, 0, r-15, 0);
            ctx.restore();

        ctx.restore();
    }

    drawSpeedoMeter(this.speed);
    drawSteeringWheel(this.turn);
}

// Actual game state
// Global because fuck it

var car = new Car();
var input = {
    turningLeft: false,
    turningRight: false
}
;
var getScore;
function drawScore() {
    var $scorebox = document.getElementById('scorebox');
    $scorebox.innerText = getScore() + 'm';
}

function keyDown(e) {
    switch (e.keyCode) {
        case 37: // left arrow
            input.turningLeft = true;
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
    if (input.turningLeft) {
        car.turn -= 0.1;
    }
    if (input.turningRight) {
        car.turn += 0.1;
    }

    ctx.fillStyle = "#5C5C5C";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    car.drawControls();
    drawScore();
}

function load() {
    ctx = ctxInit('other-canvas');
    cvs = document.getElementById('other-canvas');

    window.addEventListener("keydown", keyDown, true);
    window.addEventListener("keyup", keyUp, true);

    var updateFn = setInterval(update, 32); // 30fps

    var otherCVS = document.getElementById('driving-canvas');
    getScore = run(ctxInit('driving-canvas'), otherCVS.width, otherCVS.height, car);
}

