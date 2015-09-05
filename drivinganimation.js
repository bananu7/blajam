var numSegments = 1000;
var roadWidth = 150;
var treeWidth = 40;
var treeHeight = 40;


function run(ctx, width, height, car, carImage, treeImage) {
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
        var nextY = -Math.random()*5 + yPos;
        var roadX = getRoadCenter(-nextY);

        while (true) {
            var nextX = Math.random()*width;

            if (nextX < (roadX - roadWidth/2 - treeWidth) || nextX > (roadX + roadWidth/2 + treeWidth)) {
                return {x: nextX, y: nextY};
            }
        }
    }

    function genTrees() {
        for (var i =0 ; i < numTrees; i++)  {
            trees.push(genTree(yPosition + height/numTrees * i));
        }
    }

    function checkIfTreeIsOver() {
        for (var i = 0; i < numTrees; i++) {
            if ((trees[i].y + yPosition - treeHeight) > height) {
                trees[i] = genTree(-yPosition);
            }
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
            ctx.drawImage(treeImage, trees[i].x - treeWidth/2, trees[i].y + yPos - treeHeight/2, treeWidth, treeHeight);
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

        checkIfTreeIsOver();

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
