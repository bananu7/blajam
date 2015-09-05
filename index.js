'use strict';

var ctx;
var cvs;

var projectiles;

function Car () {
    this.turn = 0;
    this.speed = 100;
    this.xPosition = 150;
    this.yPosition = 300;

    return this;
}

Car.prototype.drawControls = function (){
    function drawSteeringWheel(turn) {
        var px = 300;
        var py = 280;
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
            // disc
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

    function drawPedals() {
        var px = 300;
        var py = 350;

        ctx.save();
            ctx.translate(px, py);
            ctx.fillStyle = "#eeeeee";
            ctx.fillRect(-60, 0, 50, 100);
            ctx.fillRect(10, 0, 50, 100);
        ctx.restore();
    }

    drawPedals();
    drawSpeedoMeter(this.speed);
    drawSteeringWheel(this.turn);
}

// Actual game state
// Global because fuck it

var car = new Car();
var input = {
    turning: 0,
    turningLeft: false,
    turningRight: false,
    accelerating: false,
    braking: false
};

var getScore;
var didThePlayerLoseTheGameYet;

function drawScore() {
    var $scorebox = document.getElementById('scorebox');
    $scorebox.innerText = getScore()*100 + ' centimeters';
}

function keyDown(e) {
    switch (e.keyCode) {
        case 37: // left arrow
        case 65: // A
            input.turningLeft = true;
        break;
        case 38: // up arrow
        case 87: // W
            input.accelerating = true;
        break;
        case 39: // right arrow
        case 68: // D
            input.turningRight = true;
        break;
        case 40: // down arrow
        case 83: // S
            input.braking = true;
        break;
    }

    return false;
}

function keyUp(e) {
    switch (e.keyCode) {
        case 37: // left arrow
        case 65: // A
            input.turningLeft = false;
        break;
        case 38: // up arrow
        case 87: // W
            input.accelerating = false;
        break;
        case 39: // right arrow
        case 68: // D
            input.turningRight = false;
        break;
        case 40: // down arrow
        case 83: // S
            input.braking = false;
        break;
    }

    return false;
}

function resetGame() {
    car = new Car;
}

function update() {
    if (input.turningLeft) input.turning -= 0.01;
    if (input.turningRight) input.turning += 0.01;

    car.turn += input.turning;
    input.turning *= 0.9;

    if (input.accelerating) {
        // accelerating to a maximum
        car.speed += Math.min((200 - car.speed) * 0.02, 0.5);
    }
    if (input.braking) {
        car.speed -= 0.5;
    }
    if (car.speed < 0) car.speed = 0;

    // slowing to a minimum
    car.speed -= (car.speed - 20) * 0.002;

    ctx.fillStyle = "#5C5C5C";
    ctx.fillRect(0, 0, cvs.width, cvs.height);
    car.drawControls();
    drawScore();

    if (didThePlayerLoseTheGameYet){
        resetGame();
    }
}

function load() {
    ctx = ctxInit('other-canvas');
    cvs = document.getElementById('other-canvas');

    window.addEventListener("keydown", keyDown, true);
    window.addEventListener("keyup", keyUp, true);

    var updateFn = setInterval(update, 32); // 30fps

    var carImage = new Image();
    carImage.src = "car.png";

    var treeImage = new Image();
    treeImage.src = "tree.png";

    var donuts = [];
    for (var i =1; i <=5; i++) {
        var newDonut = new Image();
        newDonut.src = "donut/" + i + ".png";
        donuts.push(newDonut);
    }

    var otherCVS = document.getElementById('driving-canvas');
    getScore = run(ctxInit('driving-canvas'), otherCVS, car, carImage, treeImage, donuts);
}

