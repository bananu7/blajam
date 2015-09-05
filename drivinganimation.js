function run(ctx, width, height) {
    var yPosition = 0;
    var lastTime = performance.now();

    function getRoadCenter(y) {
        return Math.sin(y/100) * (width /2) + width/2
    }

    function draw(yPos) {
        var numSegments = 100;
        var roadWidth = 100;

        for (var roadSegment = 0; roadSegment < numSegments; roadSegment++) {
            var roadStart = (roadSegment/numSegments) * height;
            var roadEnd = (roadSegment +1)/numSegments * height;

            var roadCenterStart = getRoadCenter(roadStart + yPos);
            var roadCenterEnd = getRoadCenter(roadEnd + yPos);

            ctx.fillRect(roadCenterStart-roadWidth/2, roadStart, roadWidth, height/numSegments);
        }
    }

    function step(timestamp) {
        


        var dTime = timestamp - lastTime;
        lastTime = timestamp;

        yPosition += dTime * .01;

        ctx.clearRect(0, 0, width, height);

        draw(yPosition);

        window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
}
