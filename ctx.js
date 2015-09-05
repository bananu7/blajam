"use strict";

var ctx;

function ctxInit() {
    var cvs = document.getElementById('cvs');
    ctx = cvs.getContext('2d');
    ctx.line = line; 
}

function line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}
