"use strict";

function ctxInit(id) {
    var cvs = document.getElementById(id);
    var ctx = cvs.getContext('2d');
    return ctx;
}

function line(ctx, x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1,y1);
    ctx.lineTo(x2,y2);
    ctx.stroke();
}

function circle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0,2*Math.PI);
    ctx.stroke();
}

function halfCircle(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, - Math.PI, 0);
    ctx.stroke();
}
