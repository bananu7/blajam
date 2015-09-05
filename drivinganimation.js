var numSegments = 1000;
var roadWidth = 150;

function run(ctx, width, height, car, carImage) {
    var yPosition = 0;
    var lastTime = performance.now();

    car.yPosition = height-1;
    car.xPosition = getRoadCenter(-car.yPosition) - 30;

    function getRoadCenter(y) {
        return Math.sin(y/100) * (width /2) + width/2
    }

    var trees = [];
    var numTrees = 10;
    function genTree(yPos) {
        var nextY = Math.random()*20 + yPos;
        var nextX = Math.random()*width;

        return {x: nextX, y:nextY};
    }

    function genTrees() {
        for (var i =0 ; i < numTrees; i++)  {
            trees.push(genTree(yPosition + height/numTrees * i));
        }
    }

    genTrees();

    function draw(yPos) {

        ctx.fillStyle = "black";
        for (var roadSegment = 0; roadSegment < numSegments; roadSegment++) {
            var roadStart = (roadSegment/numSegments) * height;
            var roadEnd = (roadSegment +1)/numSegments * height;

            var roadCenterStart = getRoadCenter(yPos - roadStart);
            var roadCenterEnd = getRoadCenter(yPos - roadEnd);

            ctx.fillRect(roadCenterStart-roadWidth/2, roadStart, roadWidth, height/numSegments);
        }

        ctx.fillStyle = "green";
        for (var i =0; i < numTrees; i++) {
            ctx.fillRect(trees[i].x, trees[i].y + yPos, 20,20);
        }
       
        ctx.translate(+(car.xPosition), +(car.yPosition + yPos));
        ctx.rotate((-Math.PI/2 + car.turn));
        ctx.drawImage(carImage, -20, -20, 40, 40);
        ctx.rotate(-(-Math.PI/2 + car.turn));
        ctx.translate(-(car.xPosition), -(car.yPosition + yPos));
    }

    function notInRoad() {
        var roadCenter = getRoadCenter(-car.yPosition);
        return (car.xPosition < (roadCenter - roadWidth/2) || car.xPosition > (roadCenter + roadWidth/2));
    }

    function haveLost() {
        var offOfRoadSides = (car.xPosition < 0 || car.xPosition > width);
        var offOfRoadTop = (car.yPosition + yPosition) < 0 || (car.yPosition + yPosition) > height;
        return offOfRoadSides || offOfRoadTop || notInRoad();
    }

    function step(timestamp) {
        var dTime = timestamp - lastTime;
        lastTime = timestamp;

        yPosition += dTime * .01;

        ctx.clearRect(0, 0, width, height);

        car.magnitude = dTime * .04 * car.speed/100;
        car.dY = -car.magnitude * Math.cos(car.turn);
        car.dX = car.magnitude * Math.sin(car.turn);

        car.yPosition += car.dY;
        car.xPosition += car.dX;

        draw(yPosition);

        if (haveLost()) {
            alert("You lose");
            didThePlayerLoseTheGameYet = true;
            return;
        }

        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);

    function getScore() {
        return Math.floor(yPosition);
    }

    return getScore;
}
