var numSegments = 1000;
var roadWidth = 150;
var treeWidth = 40;
var treeHeight = 40;

var projectiles = [];

function calcSceneryColour(distance) {
    var sceneries = [
        {colour: {r: 0, g: 102, b: 0}}, // nice grass
        {colour: {r: 153, g: 153, b: 102}}, // plains
        {colour: {r: 204, g: 153, b: 0}}, // desert
        {colour: {r: 102, g: 153, b: 153}}, // tundra
        {colour: {r: 204, g: 255, b: 255}} // ice plains
    ];

    var sceneryWidth = 300;
    // loop sceneries
    if (distance < 0)
        distance = 0;

    distance = distance % (sceneryWidth * sceneries.length);

    function lerp(e, a, b) {
        return (b-a) * e + a;
    }

    var r, g, b;

    var e = (distance % sceneryWidth) / sceneryWidth;
    var i = Math.floor(distance / sceneryWidth);
    var nextScenery = sceneries[i + 1 < sceneries.length ? i+1 : 0];
    
        console.log(distance, i);
    var ca = sceneries[i].colour;
    var cb = nextScenery.colour;
    r = lerp(e, ca.r, cb.r);
    g = lerp(e, ca.g, cb.g);
    b = lerp(e, ca.b, cb.b);

    return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
}



function run(ctx, canvas, car, carImage, treeImage) {
    var width = canvas.width;
    var height = canvas.height;

    var lastY = 0;
    var lastX = 0;

    canvas.addEventListener('mousedown', function(e){
        lastX = e.offsetX;
        lastY = e.offsetY;
        launchProjectile();
        addHelicopter();
    });

    canvas.addEventListener('mousemove', function(e){
        lastX = e.offsetX;
        lastY = e.offsetY;
    });

    function getDirectionToMouse() {
        var dy = lastY - (car.yPosition + yPosition);
        var dx = lastX - car.xPosition;

        var angle = Math.atan2(dx, dy);
        return angle;
    }

    var yPosition = 0;
    var lastTime = performance.now();

    car.yPosition = height-10;
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

    function launchProjectile() {
        var nextProjectile = {
            xPosition: car.xPosition, 
            yPosition: car.yPosition,
            turn: getDirectionToMouse()
        };
        updateProjectile(nextProjectile, 40);
        projectiles.push(nextProjectile);
    }

    function updateProjectile(projectile, magnitude) {
        projectile.yPosition += magnitude * Math.cos(projectile.turn);
        projectile.xPosition += magnitude * Math.sin(projectile.turn);
    }

    var helicopters = [];

    function createHelicopter() {
        var side = Math.random();

        if (side < .25) {
            return {
                xPosition: 0,
                yPosition: -yPosition + Math.random()*height
            };
        } else if (side < .50) {
            return {
                xPosition: width,
                yPosition: -yPosition + Math.random()*height
            };
        } else if (side < .75) {
            return {
                xPosition: Math.random() * width,
                yPosition: -yPosition
            };
        } else {
            return {
                xPosition: Math.random() * width,
                yPosition: -yPosition + height
            };
        }
    }

    function addHelicopter() {
        helicopters.push(createHelicopter());
    }

    function updateHelicopter(helicopter, magnitude) {
        var dy = car.yPosition - helicopter.yPosition;
        var dx = car.xPosition - helicopter.xPosition;

        var angle = Math.atan2(dx, dy);
        
        helicopter.yPosition += magnitude * Math.cos(angle);
        helicopter.xPosition += magnitude * Math.sin(angle);
    }

    var explosions = [];

    function draw(yPos) {
        ctx.fillStyle = calcSceneryColour(getScore());
        ctx.fillRect(0, 0, width, height);

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

        ctx.fillStyle = "grey";
        ctx.rotate(-getDirectionToMouse());
        ctx.fillRect(-5, -5, 10, 50);
        ctx.rotate(getDirectionToMouse());

        ctx.translate(-(car.xPosition), -(car.yPosition + yPos));

        ctx.fillStyle = "blue";
        for (var i = 0; i < projectiles.length; i++) {
            var projectile = projectiles[i];
            ctx.fillRect(projectile.xPosition -10, projectile.yPosition-10 + yPos, 20, 20);
        }

        ctx.fillStyle = "black";
        helicopters.forEach(function(helicopter) {
            ctx.fillRect(helicopter.xPosition -10, helicopter.yPosition-10 + yPos, 20, 20);
        });

        ctx.fillStyle = "red";
        explosions.forEach(function(explosion) {
            ctx.fillRect(explosion.xPosition -10, explosion.yPosition-10 + yPos, 20, 20);
        });

    }

    function notInRoad() {
        var roadCenter = getRoadCenter(-car.yPosition);
        return (car.xPosition < (roadCenter - roadWidth/2) || car.xPosition > (roadCenter + roadWidth/2));
    }

    function isOutOfScreen(thing, radius) {
        if (!radius) {
            radius = 0;
        }

        var offOfRoadSides = (thing.xPosition + radius < 0 || thing.xPosition - radius> width);
        var offOfRoadTop = (thing.yPosition + yPosition + radius) < 0 || (thing.yPosition + yPosition - radius) > height;
        return offOfRoadTop || offOfRoadSides;
    }

    function helicoptersIsTooClose() {
        return helicopters.some(function(helicopter) {
            return distance(helicopter, car) <= 20;
        });
    }

    function haveLost() {
        return helicoptersIsTooClose() || isOutOfScreen(car) || notInRoad();
    }

    function distance(thing1, thing2) {
        var dx = thing1.xPosition - thing2.xPosition;
        var dy = thing1.yPosition - thing2.yPosition;
        return Math.sqrt(dx*dx + dy*dy);
    }

    function step(timestamp) {
        var dTime = timestamp - lastTime;
        lastTime = timestamp;      

        car.magnitude = dTime * .04 * car.speed/100;
        var dY = -car.magnitude * Math.cos(car.turn);
        var dX = car.magnitude * Math.sin(car.turn);        
        
        var gameSpeed = dTime * .02 - dY * .2;
        yPosition += gameSpeed

        car.yPosition += dY;
        car.xPosition += dX

        checkIfTreeIsOver();

        for (var i = 0; i < projectiles.length; i++) {
            updateProjectile(projectiles[i], dTime * .04);
        }

        helicopters.forEach(function(helicopter) {
            updateHelicopter(helicopter, gameSpeed*1.1);
        });

        explosions.forEach(function(explosion) {
            explosion.timeLeft -= dTime;
        });

        explosions = explosions.filter(function(explosion){
            return explosion.timeLeft >= 0;
        });

        var nextProjectiles = [];
        var nextHelicopters = [];
        projectiles.forEach(function(projectile) {
            helicopters.forEach(function(helicopter) {
                if (distance(projectile, helicopter) < 10) {
                    explosions.push({xPosition: helicopter.xPosition, yPosition: helicopter.yPosition, timeLeft: 1000});
                    projectile.hasHit = true;
                    helicopter.hasHit = true;
                } 
            });
        });

        projectiles = projectiles.filter(function(projectile) {
            return !isOutOfScreen(projectile, 10) && !projectile.hasHit;
        });

        helicopters = helicopters.filter(function(helicopter) {
            return !helicopter.hasHit;
        });

        console.log(projectiles.length);

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
