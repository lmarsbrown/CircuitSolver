

function getSymbolImg(name,callback)
{
    requested++;
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
var requested = 0;
function loadImage()
{
    loaded++;
    if(loaded == requested)
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


/**
 * Draws Current
 * @param {*} p1 
 * @param {*} p2 
 * @param {*} t 
 */


var currentSpeed = 1/100;
//NOTE make current not adjust position
function drawCurrentOverlay(p1,p2,t)
{
    let dist = Matrix.vecDist(p1,p2);
    let line = Matrix.subVecs(p2,p1);
    Matrix.normalize(line);
    const spacing = (getScreenPos(Matrix.vec(1,0))[0]-getScreenPos(Matrix.vec(0,0))[0])/2;
    const count = Math.ceil(dist/spacing);
    const width = 5;
    line[0] *= spacing;
    line[1] *= spacing;

    for(let j = 0; j < count; j++)
    {
        let scalar = j+t%1;
        if(t<0)
        {
            scalar++;
        }
        if(scalar*spacing<dist)
        {
            let p = Matrix.addVecs(p1,Matrix.scaleVec(line,scalar));
    
            ctx.fillStyle = `rgb(255,255,0)`;
            ctx.fillRect(p[0]-width/2,p[1]-width/2,width,width);
        }
    }
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


class Component
{
    constructor()
    {
        this.oP = 0;
        this.width = 0.7;
        this.lineWidth = 5;
        this.selected = false;
    }
    dragNode(positions,conn)
    {
        let pos = getGridPos(mouse.pos);
        Matrix.roundVec(pos);
        
        if(
            Matrix.vecDist(pos, this.connections[conn][1]) > 0.1 &&
            Matrix.vecDist(pos, this.connections[1-conn][1]) > 0.1
            )
        {
            Matrix.copyMat(pos,this.connections[conn][1]);
            return true;
        }
        return false;
    }
    drag()
    {
        let pos = getGridPos(mouse.pos);
        Matrix.roundVec(pos);
        let downPos = getGridPos(mouse.downPos);
        Matrix.roundVec(downPos);
        let diff = Matrix.subVecs(pos,downPos);
        if(Matrix.vecLength(diff)>0.1)
        {
            for(let i = 0; i < this.connections.length; i++)
            {
                this.connections[i][1] = Matrix.addVecs(this.connections[i][1],diff);
            }
        }
        Matrix.copyMat(mouse.pos,mouse.downPos);
    }
    drawCurrentOverlay()
    {
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);
        drawCurrentOverlay(a,b,this.oP);
        this.oP+= this.i*currentSpeed;
        this.oP %= 1;
    }
    isHovered()
    {
        let pos = getGridPos(mouse.pos);
        let p0 = this.connections[0][1];
        let p1 = this.connections[1][1];

        pos = Matrix.subVecs(pos,p0);
        let line = Matrix.subVecs(p1,p0);
        let lLen = Matrix.vecLength(line);

        let lineY = (pos[0]*line[0]+pos[1]*line[1])/(lLen);
        let lineX = (pos[1]*line[0]-pos[0]*line[1])/(lLen);

        let gridLinewidth = getGridPos(Matrix.vec(this.lineWidth,0))[0] - getGridPos(Matrix.vec(0,0))[0]

        return lineY>-gridLinewidth && lineY < (lLen+gridLinewidth) &&
               Math.abs(lineX) < this.width;
    }
    isCollapsed()
    {
        return Matrix.vecDist(this.connections[0][1],this.connections[1][1])<0.1;
    }
}