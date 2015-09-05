var numSegments = 1000;
var roadWidth = 150;

function run(ctx, width, height, car) {
    var yPosition = 0;
    var lastTime = performance.now();

    var carYPosition = height-1;
    var carXPosition = getRoadCenter(carYPosition);

    function getRoadCenter(y) {
        return Math.sin(y/100) * (width /2) + width/2
    }

    function draw(yPos) {

        ctx.fillStyle = "black";
        for (var roadSegment = 0; roadSegment < numSegments; roadSegment++) {
            var roadStart = (roadSegment/numSegments) * height;
            var roadEnd = (roadSegment +1)/numSegments * height;

            var roadCenterStart = getRoadCenter(roadStart + yPos);
            var roadCenterEnd = getRoadCenter(roadEnd + yPos);

            ctx.fillRect(roadCenterStart-roadWidth/2, roadStart, roadWidth, height/numSegments);
        }

        ctx.fillStyle = "green";
        ctx.fillRect(carXPosition, carYPosition - yPos, 10, 10);
    }

    function notInRoad() {
        var roadCenter = getRoadCenter(carYPosition);
        return (carXPosition < (roadCenter - roadWidth/2) || carXPosition > (roadCenter + roadWidth/2));
    }

    function haveLost() {
        var offOfRoadSides = (carXPosition < 0 || carXPosition > width);
        var offOfRoadTop = (carYPosition < yPosition || carYPosition > (yPosition + height));
        return offOfRoadSides || offOfRoadTop || notInRoad();
    }

    function step(timestamp) {
        var dTime = timestamp - lastTime;
        lastTime = timestamp;

        yPosition += dTime * .01;

        ctx.clearRect(0, 0, width, height);

        carMagnitude = dTime * .04;
        carDY = -carMagnitude * Math.cos(car.turn);
        carDX = carMagnitude * Math.sin(car.turn);

        carYPosition += carDY;
        carXPosition += carDX;

        draw(yPosition);

        if (haveLost()) {
            alert("You lose");
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
