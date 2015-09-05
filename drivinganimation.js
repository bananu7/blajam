// constants
var hardDifficulty = {
    maxRoadWidth: 300,
    minRoadWidth: 100,
    projectileReloadTime: 1000,
    sceneryWidth: 3000,
    helicopterSpawnStart: 3000,
    initialHelicopterSpawnInterval: 500,
    helicopterSpawnIntervalDecrease: 0.98,
    roadBounds: 0,
    roadCurviness: 1, // <0.5, 2>
};

var normalDifficulty = {
    maxRoadWidth: 300,
    minRoadWidth: 100,
    projectileReloadTime: 1000,
    sceneryWidth: 3000,
    helicopterSpawnStart: 6000,
    initialHelicopterSpawnInterval: 100,
    helicopterSpawnIntervalDecrease: 0.9,
    roadBounds: 0.3,
    roadCurviness: 1,
};

var difficulty = hardDifficulty;

// dynamic values
var numSegments = 1000;
var roadWidth = difficulty.maxRoadWidth;
var treeWidth = 40;
var treeHeight = 40;

var projectiles = [];
var donutRadius = 30;
var projectileCooldown = 0;
var helicopterSpawnInterval = difficulty.initialHelicopterSpawnInterval;
var nextHelicopterSpawn = difficulty.helicopterSpawnStart;

var started = false;

function lerp(e, a, b) {
    return (b-a) * e + a;
}

function calcSceneryColour(distance) {
    var sceneries = [
        {colour: {r: 0, g: 102, b: 0}}, // nice grass
        {colour: {r: 153, g: 153, b: 102}}, // plains
        {colour: {r: 204, g: 153, b: 0}}, // desert
        {colour: {r: 102, g: 153, b: 153}}, // tundra
        {colour: {r: 204, g: 255, b: 255}} // ice plains
    ];

    // loop sceneries
    if (distance < 0)
        distance = 0;

    distance = distance % (difficulty.sceneryWidth * sceneries.length);

    var r, g, b;

    var e = (distance % difficulty.sceneryWidth) / difficulty.sceneryWidth;
    var i = Math.floor(distance / difficulty.sceneryWidth);
    var nextScenery = sceneries[i + 1 < sceneries.length ? i+1 : 0];
    
    var ca = sceneries[i].colour;
    var cb = nextScenery.colour;
    r = lerp(e, ca.r, cb.r);
    g = lerp(e, ca.g, cb.g);
    b = lerp(e, ca.b, cb.b);

    return "rgb(" + Math.floor(r) + "," + Math.floor(g) + "," + Math.floor(b) + ")";
}

var nextDonut = 0;

function run(ctx, canvas, car, carImage, treeImage, donuts, police, flipPolice, explosionImage) {
    var width = canvas.width;
    var height = canvas.height;

    var lastY = 0;
    var lastX = 0;

    canvas.addEventListener('mousedown', function(e){
        lastX = e.offsetX;
        lastY = e.offsetY;
        if (started == false) {
            started = true;
            lastTime = performance.now();
            window.requestAnimationFrame(step);
        } else {
            launchProjectile();
        }
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
    var lastTime;

    car.yPosition = height-10;
    car.xPosition = getRoadCenter(-car.yPosition) - 30;

    function getRoadCenter(y) {
        var e = Math.sin((y / 100) * difficulty.roadCurviness) * Math.cos((y/500) * difficulty.roadCurviness);
        e *= 1 - difficulty.roadBounds;

        return e * (width /2) + width/2;dw
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
        if (projectileCooldown > 0)
            return;

        projectileCooldown += difficulty.projectileReloadTime;

        var nextProjectile = {
            xPosition: car.xPosition, 
            yPosition: car.yPosition,
            turn: getDirectionToMouse(),
            type: nextDonut,
        };

        nextDonut = (nextDonut +1) % 5;

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
        helicopter.turn = angle;
        helicopter.yPosition += magnitude * Math.cos(angle);
        helicopter.xPosition += magnitude * Math.sin(angle);
    }

    function adjustDifficulty(distance) {
        if (distance < 0)
            distance = 0;

        roadWidth = lerp(1 - distance / 10000, difficulty.minRoadWidth, difficulty.maxRoadWidth);

        if (distance > nextHelicopterSpawn) {
            addHelicopter();
            nextHelicopterSpawn += helicopterSpawnInterval;
            helicopterSpawnInterval *= difficulty.helicopterSpawnIntervalDecrease;
        }
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

        for (var i = 0; i < projectiles.length; i++) {
            var projectile = projectiles[i];
            ctx.drawImage(donuts[projectile.type],projectile.xPosition -donutRadius/2, projectile.yPosition-donutRadius/2 + yPos, donutRadius, donutRadius);
        }

        helicopters.forEach(function(helicopter) {
            ctx.translate(helicopter.xPosition, helicopter.yPosition + yPos);
            var angle = (-Math.PI/2 - helicopter.turn + 2*Math.PI) % (2*Math.PI);
            if (angle > Math.PI/2 && angle < Math.PI*1.5) {
                ctx.rotate(angle - Math.PI);
                ctx.drawImage(flipPolice,-40, -15, 81, 30);
                ctx.rotate(-angle + Math.PI);
            } else {
                ctx.rotate(angle);
                ctx.drawImage(police,-40, -15, 81, 30);
                ctx.rotate(-angle);
            }
            ctx.translate(-helicopter.xPosition, -(helicopter.yPosition + yPos));
        });

        explosions.forEach(function(explosion) {
            ctx.drawImage(explosionImage,explosion.xPosition -20, explosion.yPosition-20 + yPos, 40, 40);
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
            return distance(helicopter, car) <= 40;
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

    function getLoseReason() {
        if (helicoptersIsTooClose()) {
            return "Been Caught By The Cops";
        }
        if (isOutOfScreen(car) || notInRoad()) {
            return "Driven Off The Road"
        }
    }

    function step(timestamp) {
        var dTime = timestamp - lastTime;
        lastTime = timestamp;      

        projectileCooldown -= dTime;
        if (projectileCooldown < 0) projectileCooldown = 0;

        car.magnitude = dTime * .15 * car.speed/100;
        var dY = -car.magnitude * Math.cos(car.turn);
        var dX = car.magnitude * Math.sin(car.turn);        
        
        var gameSpeed = dTime * .02 - dY * .3;
        gameSpeed = Math.max(gameSpeed, -dY*0.4);
        yPosition += gameSpeed

        car.yPosition += dY;
        car.xPosition += dX

        checkIfTreeIsOver();

        for (var i = 0; i < projectiles.length; i++) {
            updateProjectile(projectiles[i], dTime * .2);
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
                if (distance(projectile, helicopter) < 40) {
                    explosions.push({xPosition: helicopter.xPosition, yPosition: helicopter.yPosition, timeLeft: 1000});
                    projectile.hasHit = true;
                    helicopter.hasHit = true;
                } 
            });
        });

        projectiles = projectiles.filter(function(projectile) {
            return !isOutOfScreen(projectile, donutRadius) && !projectile.hasHit;
        });

        helicopters = helicopters.filter(function(helicopter) {
            return !helicopter.hasHit;
        });

        draw(yPosition);

        if (haveLost()) {
            ctx.fillStyle = "#808080";
            ctx.fillRect(0, 0, width, height);

            ctx.fillStyle = "Black";
            ctx.font = "20pt sans";

            ctx.fillText("You Have " + getLoseReason(), 50, 150);
            ctx.fillText("Your score was " + getScore()*100 + " centimeters", 50, 200);

            ctx.font = "16pt sans";
            ctx.fillText("Please reload to try again", 50, 250);


            didThePlayerLoseTheGameYet = true;

            // save the highscore

            var firebaseRef = new Firebase("https://criminal-chase.firebaseio.com/");
            var name = window.prompt("Please provide your name");
            var newRecord = firebaseRef.push();
            newRecord.set({ name:name, score: getScore() * 100, date:new Date().getTime() });

            return;
        }

        adjustDifficulty(getScore());

        window.requestAnimationFrame(step);
    }



    ctx.fillStyle = "#808080";
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = "Black";
    ctx.font = "20pt sans";

    ctx.fillText("Welcome to Criminal Chase", 50, 50);

    ctx.font = "16pt sans";
    ctx.fillText("You are a master theif, with a sweet ride", 50, 100);
    ctx.drawImage(carImage, 50, 105, 75, 75);
    ctx.fillText("You have just sucessed in a grand donut heist", 50, 200);
    ctx.drawImage(donuts[0], 50, 205, 75, 75);
    ctx.fillText("However, the police are after you", 50, 300);
    ctx.drawImage(flipPolice, 50, 305, 162, 60);
    ctx.fillText("Drive with the arrow keys or WASD", 50, 400);
    ctx.fillText("Shoot with your mouse", 50, 425);
    ctx.fillText("How many centimeters can you go?", 50, 450);

    ctx.fillStyle = "Red";
    ctx.font = "20pt sans";
    ctx.fillText("Click To Start", 200, 480);

    function getScore() {
        return Math.floor(yPosition);
    }

    return getScore;
}
