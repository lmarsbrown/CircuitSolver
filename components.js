

function getSymbolImg(name,callback)
{
    let xhr = new XMLHttpRequest();
    xhr.open("GET","symbols/"+name);
    xhr.onload = ()=>{
        let svgDiv = document.createElement("div");
        svgDiv.innerHTML = xhr.response;
        let svg = svgDiv.getElementsByTagName("svg")[0];
        let paths = svg.getElementsByTagName("path");
        let pathsData = [];
        for(let i = 0; i < paths.length; i++)
        {
            pathsData.push(paths[i].getAttribute("d"));
        }
        callback(pathsData,paths);
        loadImage();
    };
    xhr.send()
}

function getVoltageColor(v)
{
    const maxV = 5;
    if(v>0)
    {
        return `rgb(${100-v/maxV*100},${100+v/maxV*155},${100-v/maxV*100})`;
    }
    else
    {
        return `rgb(${100-v/maxV*155},${100+v/maxV*100},${100+v/maxV*100})`;
    }
}

var loaded = 0;
function loadImage()
{
    loaded++;
    if(loaded == 4)
    {
        main();
    }
}

/**
 * 
 * @typedef MousePositions
 * @type {Object}
 * @property {Float32Array} gridPos
 * @property {Float32Array} roundPos
 * @property {Float32Array} screenPos
 * @property {Float32Array} roundScreenPos
 */


/**
 * @param {MousePositions}positions
 */
function hoverNode(positions,comp)
{
    if(Matrix.vecDist(positions.screenPos,positions.roundScreenPos)<12)
    {
        for(let i = 0; i < comp.connections.length; i++)
        {
            if(Matrix.vecDist(positions.roundPos,comp.connections[i][1]) < 0.1)
            {
                return i;
            }
        }
    }
}

function dragNodeDefault(comp,positions,conn)
{
    if(
        Matrix.vecDist(positions.roundPos, comp.connections[conn][1]) > 0.1 &&
        Matrix.vecDist(positions.roundPos, comp.connections[1-conn][1]) > 0.1
        )
    {
        Matrix.copyMat(positions.roundPos,comp.connections[conn][1]);
        return true;
    }
    return false;
}


getSymbolImg("resistor.svg",(data,paths)=>{
    Resistor.symbol = new Path2D(data[0]);
    Resistor.path = paths[0];
})
getSymbolImg("isrc.svg",(data,paths)=>{
    CurrentSource.symbol = new Path2D(data[0]);
    CurrentSource.path = paths[0];
})
getSymbolImg("inductor.svg",(data,paths)=>{
    Inductor.symbol = new Path2D(data[0]);
    Inductor.path = paths[0];
})

getSymbolImg("vsrc.svg",(data)=>{
    VoltageSource.symbol = [new Path2D(data[0]),new Path2D(data[1])];
})


getSymbolImg("capacitor.svg",(data)=>{
    Capacitor.symbol = [new Path2D(data[0]),new Path2D(data[1])];
});


class VoltageSource
{
    constructor(voltage,p1,p2)
    {
        this.type = VoltageSource;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = 0;
        ivMat[1] = -voltage;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        this.v = 0;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
    }
    updateSimple() 
    {
        this.simple.nodes[0]= this.connections[0][0];
        this.simple.nodes[1]= this.connections[1][0];
    }
    draw(getScreenPos)
    {
        const lineWidth = 5;
        const compLen = (getScreenPos(Matrix.vec(0.5,0))[0]-getScreenPos(Matrix.vec(0,0))[0]);
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);

        let line = Matrix.subVecs(b,a);


        let dist = Matrix.vecLength(line);
        let wireLen = (dist-compLen)/2;
        let transWireLen = 1000*wireLen/compLen;
        let scale = compLen/1000;

        let compStart = Matrix.addVecs(a,Matrix.scaleVec(line,wireLen/dist));
        ctx.lineCap = "round";
        

        ctx.translate(compStart[0],compStart[1]);
        ctx.scale(scale,scale);
        ctx.rotate(Math.atan2(line[1],line[0]));
        ctx.lineWidth = lineWidth/scale;

        let col0 = getVoltageColor(this.connections[0][2]);
        let col1 = getVoltageColor(this.connections[1][2]);

        ctx.strokeStyle = col0;

        ctx.beginPath()
        ctx.moveTo(-transWireLen,0);
        ctx.lineTo(0,0);
        ctx.stroke();
        ctx.stroke(this.type.symbol[0]);
        ctx.strokeStyle = col1;

        ctx.stroke(this.type.symbol[1]);
        ctx.beginPath()
        ctx.moveTo(1000,0);
        ctx.lineTo(transWireLen+1000,0);
        ctx.stroke();
        // compPath.lineTo(1000+transWireLen,0);

        // ctx.stroke(compPath);
        ctx.resetTransform();
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        return dragNodeDefault(this,positions,conn);
    }
}

class Resistor
{
    static symbol;
    constructor(resistance,p1,p2)
    {
        this.type = Resistor;
        this.defaultSize = 3;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = resistance;
        ivMat[1] = 0;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        this.v = 0;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
        this.t = 0;
    }
    updateSimple() 
    {
        this.simple.nodes[0]= this.connections[0][0];
        this.simple.nodes[1]= this.connections[1][0];
    }
     /**
     * @param {CanvasRenderingContext2D}ctx
     */
    draw(getScreenPos)
    {
        let resistorSize = Math.min(Matrix.vecDist(this.connections[0][1],this.connections[1][1]),this.defaultSize)
        const lineWidth = 5;
        const restLen = (getScreenPos(Matrix.vec(resistorSize,0))[0]-getScreenPos(Matrix.vec(0,0))[0]);
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);

        let line = Matrix.subVecs(b,a);


        let dist = Matrix.vecLength(line);
        let wireLen = (dist-restLen)/2;
        let transWireLen = 1000*wireLen/restLen;
        let scale = restLen/1000;

        let restStart = Matrix.addVecs(a,Matrix.scaleVec(line,wireLen/dist));
        ctx.lineCap = "round";
        

        ctx.translate(restStart[0],restStart[1]);
        ctx.scale(scale,scale);
        ctx.rotate(Math.atan2(line[1],line[0]));
        ctx.lineWidth = lineWidth/scale;

        var grd = ctx.createLinearGradient(0,0,1000,0);

        grd.addColorStop(0, getVoltageColor(this.connections[0][2]));
        grd.addColorStop(1, getVoltageColor(this.connections[1][2]));

        ctx.strokeStyle = grd;

        let restPath = new Path2D();
        restPath.moveTo(-transWireLen,0);
        restPath.lineTo(-0,0);
        restPath.addPath(this.type.symbol);
        restPath.lineTo(1000+transWireLen,0);

        ctx.stroke(restPath);
        ctx.resetTransform();
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        return dragNodeDefault(this,positions,conn);
    }
}

class CurrentSource extends Resistor
{
    constructor(current,p1,p2)
    {
        super();
        this.type = CurrentSource;
        this.defaultSize = 2;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = 1;
        ivMat[1] = 0;
        ivMat[2] = 0;
        ivMat[3] = current;
        
        this.v = 0;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
        this.t = 0;
    }
}





class Capacitor extends VoltageSource
{
    constructor(voltage,capacitance,p1,p2)
    {
        super(voltage,p1,p2);
        this.type = Capacitor;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = dT/(2*capacitance);
        ivMat[1] = -voltage;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        this.v = -voltage;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
    }
    updateSimple() 
    {
        this.simple.nodes[0]= this.connections[0][0];
        this.simple.nodes[1]= this.connections[1][0];
        this.simple.ivMat[1] = 2*this.v-this.simple.ivMat[1];
    }
}

class Inductor extends CurrentSource
{
    constructor(current,inductance,p1,p2)
    {
        super(current,p1,p2);
        this.type = Inductor;
        this.defaultSize = 2.5;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = 1;
        ivMat[1] = 0;
        ivMat[2] = dT/(2*inductance);
        ivMat[3] = current;
        
        this.v = 0;
        this.i = current;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
        this.t = 0;
    }
    updateSimple() 
    {
        this.simple.nodes[0]= this.connections[0][0];
        this.simple.nodes[1]= this.connections[1][0];
        this.simple.ivMat[3] = 2*this.i-this.simple.ivMat[3];
    }
}

class Wire
{
    constructor(p1,p2)
    {
        

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = 0;
        ivMat[1] = 0;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        this.v = 0;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
    }
    updateSimple() 
    {
        this.simple.nodes[0]= this.connections[0][0];
        this.simple.nodes[1]= this.connections[1][0];
    }
     /**
     * @param {CanvasRenderingContext2D}ctx
     */
    draw(getScreenPos)
    {
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);
        
        
        ctx.lineWidth = 5;

        ctx.strokeStyle = getVoltageColor(this.connections[0][2]);
        ctx.beginPath();
        ctx.moveTo(a[0],a[1]);
        ctx.lineTo(b[0],b[1]);
        ctx.stroke();
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        return dragNodeDefault(this,positions,conn);
    }
}

class Ground
{
    constructor(position)
    {
        

        this.connections = [
            [0,position,0]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = 0;
        ivMat[1] = 0;
        ivMat[2] = 1;
        ivMat[3] = 0;
        
        this.v = 0;
        this.i = 0;
        

        this.simple = {nodes:[0,0],ivMat:ivMat};
    }
    updateSimple() 
    {
        this.simple.nodes[0] = this.connections[0][0];
        this.simple.nodes[1] = 0;
    }
    draw(getScreenPos)
    {
        let p = this.connections[0][1];
        let loc = getScreenPos(p);

        ctx.fillStyle=`rgb(100,100,100)`;
        ctx.fillRect(loc[0]-10,loc[1]-10,20,20);
    }

    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        if(
            Matrix.vecDist(positions.roundPos, this.connections[conn][1]) > 0.1
            )
        {
            Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
            return true;
        }
        return false;
    }
}