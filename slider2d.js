/*

 Cody Smith
 Copyright Redfish Group LLC.  15/April/2012
 MIT liscense

 */
/*

 evacGraph
 options
 callback : function
 canvas : canvasElement

 */
function Slider2d( options ){
    this.minX = -100;
    this.minY = 0;
    this.maxX = 100;
    this.maxY = 100;
    this.padding = 30; // pixels
    this.defaultX = 0;
    this.defaultY = 0;

    this.xval = this.defaultX;
    this.yval = this.defaultY;

    this.canvas;
    this.callback;
    this.showLabels = true;
    this.onchange = function(e){ //default does nothig.
    };
    var myoptions
    if(!options){ myoptions = {}}
    if( myoptions.canvas){this.canvas= myoptions.canvas};
    this.callback = function(e){console.log(e)} ;//default callack
    if( myoptions.callback){  this.callback = myoptions.callback};
    this.xunits = "mph";
    this.yunits = "seconds";

    var backimage;//the image without a cursor on it
    var this2 = this;

    var moveCursor= function(x,y){
        if( x > this2.padding && y < this2.canvas.height - this2.padding){
            var ctx= this2.canvas.getContext('2d');
            //restor old canvas
            ctx.putImageData(backimage, 0, 0);
            //draw circle
            ctx.beginPath();
            ctx.arc(x,y,10,0,Math.PI*2,true); // Outer circle
            var radgrad = ctx.createRadialGradient(x+4,y-4,1, x,y, 10);
            radgrad.addColorStop(0, 'rgba(255,255,255,0.9)');
            radgrad.addColorStop(0.9, 'rgba(150,150,150,0.7)');
            radgrad.addColorStop(1, 'rgba(100,100,100,0.2)');
            ctx.fillStyle = radgrad;
            ctx.fill();
            ctx.stroke();

            //add label
            moveToolTip(x,y);
        }
    }
    var moveToolTip = function(x,y){
        var ctx= this2.canvas.getContext('2d');
        ctx.fillStyle = "blue";
        ctx.font = "14pt Helvetica";
        var str1 = this2.xval.toPrecision(4) + this2.xunits ;
        var str2 =  this2.yval.toPrecision(4) + this2.yunits;
        ctx.textAlign = "center";
        ctx.fillText(str1, x, y-10);
        ctx.fillText(str2, x, y-24);

    }

    this.onclickHandler = function(e){
        e.preventDefault();
        var relativeXY =  relMouseCoords(e) ;

        var x=relativeXY.x;
        var y=relativeXY.y;

        if( x > this2.padding && y < this2.canvas.height - this2.padding){
            moveCursor(x,y);

            var realX = relativeXY.x - this2.padding;
            var realY = relativeXY.y;
            var xrange = this2.maxX - this2.minX;
            var yrange = this2.maxY - this2.minY;
            var xval = this2.minX + xrange*(realX/(this2.canvas.width - this2.padding) );
            var yval = this2.minY + yrange*(realY/(this2.canvas.height - this2.padding) );

            this2.xval = xval;
            this2.yval = yval;

            var returnValue = {xval:xval, yval:yval};
            this2.callback(returnValue);
            this2.onchange(returnValue);
        }
        return false;
    }
    var relMouseCoords = function (event) {
        var totalOffsetX = 0;
        var totalOffsetY = 0;

        var currentElement = event.srcElement? event.srcElement : event.target;
        var orignalElement = event.srcElement? event.srcElement : event.target;
        do {
            totalOffsetX += currentElement.offsetLeft;
            totalOffsetY += currentElement.offsetTop;
        }
        while (currentElement = currentElement.offsetParent)

        var canvasX = event.pageX - totalOffsetX;
        var canvasY = event.pageY - totalOffsetY;

        // Fix for variable canvas width
        canvasX = Math.round( canvasX * (orignalElement.width / orignalElement.offsetWidth) );
        canvasY = Math.round( canvasY * (orignalElement.height / orignalElement.offsetHeight) );

        return {x:canvasX, y:canvasY}
    }

    // this takes either an image or an image data
//
    this.initCanvas = function(image1){
        if(!this.canvas){
            var classes = document.getElementsByClassName('evacGraph');
            if( classes.length > 0 ){
                this.canvas = classes[0];
            }
        }
        if(!this.canvas){
            this.canvas = document.createElement('canvas');
            this.canvas.width = 100;//TODO: this should be a matrix manipulation so that it fits in the canvas
            this.canvas.height = 100;
        }
        var ctx = this.canvas.getContext('2d');

        if(!this.showLabels){this.padding = 0 };
        ctx.clearRect(0,0, this.canvas.width, this.canvas.height);

        //paint graph
        if(image1){
            if( image1 instanceof Image || image1 instanceof HTMLCanvasElement){
                ctx.drawImage(image1,this.padding,0, this.canvas.width - this.padding, this.canvas.height - this.padding);
            }
            else if( image1 instanceof ImageData){
                var tmpcan = document.createElement('canvas');
                tmpcan.width = image1.width;
                tmpcan.height = image1.height;
                ctx.drawImage(tmpcan,this.padding,0, this.canvas.width - this.padding, this.canvas.height - this.padding);
            }

        }


        //draw Lines
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath();
        ctx.moveTo(this.padding,0);
        ctx.lineTo(this.padding, this.canvas.height - this.padding);
        ctx.lineTo(this.canvas.width, this.canvas.height - this.padding);
        ctx.stroke();
        if( this.showLabels){
            //vertical text
            ctx.font="18pt Helvetica";
            ctx.translate(-2,this.canvas.height - this.padding);
            ctx.rotate(-Math.PI/2);
            ctx.textAlign = "left";
            ctx.fillText( this.minY, 0 , this.padding+2);
            ctx.textAlign = "center";
            ctx.fillText(  this.yunits, this.canvas.height/2 , this.padding+2);
            ctx.textAlign = "right";
            ctx.fillText( this.maxX + " ", this.canvas.height - this.padding, this.padding+2);
            ctx.rotate(Math.PI/2);

            ctx.translate(2,- (this.canvas.height-this.padding));
            // horizontal text
            ctx.textAlign = "left";
            ctx.fillText( this.minX ,  2, this.canvas.height -10 );
            ctx.textAlign = "center";
            ctx.fillText( this.xunits,  this.canvas.width/2, this.canvas.height -10 );
            ctx.textAlign = "right";
            ctx.fillText( this.maxX + " ", this.canvas.width , this.canvas.height - 10);
        }
        //cache graph
        backimage = ctx.getImageData(0,0, this.canvas.width, this.canvas.height);
        console.log(backimage)

        this.canvas.addEventListener("touchstart", this2.onclickHandler, false);
        this.canvas.addEventListener("touchmove", this2.onclickHandler, true);
        this.canvas.onmousedown = function(e){
            this2.onclickHandler(e);
            document.onmousemove = this2.onclickHandler;
            document.onmouseup = function(e){
                document.onmousemove = function(){};
            }
        }

        moveCursor( this.defaultX + this.padding + 1, this.defaultY  + 1)

    }



    this.rangeX = function(){
        return this.maxX - this.minX;
    };

    this.rangeY= function(){
        return this.maxY - this.minY;
    }



}/**
 * Created by JetBrains WebStorm.
 *___________________________________________
 * User: cody smith
 * Date: 5/2/12
 * Time: 1:14 PM
 * email: m0ose2 (at) yahoo dot Charlie Ostrage Michel
 * To change this template use File | Settings | File Templates.
 */
