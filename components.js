

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
        callback(pathsData);
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
    if(loaded == 2)
    {
        main();
    }
}


getSymbolImg("resistor.svg",(data)=>{
    Resistor.symbol = new Path2D(data[0]);
})

getSymbolImg("vsrc.svg",(data)=>{
    VoltageSource.symbol = [new Path2D(data[0]),new Path2D(data[1])];
})


class VoltageSource
{
    constructor(voltage)
    {
        

        this.connections = [
            [0,Matrix.vec(0,0),0],
            [0,Matrix.vec(2,0),0]
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
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);
        let line = Matrix.subVecs(b,a);

        let dist = Matrix.vecLength(line);
        let scale = (dist/1000);
        
        
        ctx.lineWidth = 5/scale;

        ctx.translate(a[0],a[1]);
        ctx.scale(scale,scale);
        ctx.rotate(Math.atan2(line[1],line[0]));

        
        ctx.strokeStyle = getVoltageColor(this.connections[1][2]);
        ctx.stroke(VoltageSource.symbol[1]);

        ctx.strokeStyle =  getVoltageColor(this.connections[0][2]);
        ctx.stroke(VoltageSource.symbol[0]);
        ctx.resetTransform();
    }

    /**
     * @param {MousePositions}positions
     */
    getHovering(positions)
    {
        if(Matrix.vecDist(positions.screenPos,positions.roundScreenPos)<12)
        {
            for(let i = 0; i < this.connections.length; i++)
            {
                if(Matrix.vecDist(positions.roundPos,this.connections[i][1]) < 0.1)
                {
                    return i;
                }
            }
        }
        return undefined;
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        if(Matrix.vecDist(positions.roundPos,this.connections[conn][1]) > 0.1)
        {
            Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
            return true;
        }
        return false;
    }
}

class Resistor
{
    static symbol;
    constructor(resistance,p1,p2)
    {
        

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
        let line = Matrix.subVecs(b,a);

        let dist = Matrix.vecLength(line);
        let scale = (dist/1000);
        
        
        ctx.lineWidth = 5/scale;

        ctx.translate(a[0],a[1]);
        ctx.scale(scale,scale);
        ctx.rotate(Math.atan2(line[1],line[0]));

        var grd = ctx.createLinearGradient(0,0,1000,0);

        grd.addColorStop(0, getVoltageColor(this.connections[0][2]));
        grd.addColorStop(1, getVoltageColor(this.connections[1][2]));

        ctx.strokeStyle=grd;
        
        ctx.stroke(Resistor.symbol);

        ctx.resetTransform();
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
    getHovering(positions)
    {
        if(Matrix.vecDist(positions.screenPos,positions.roundScreenPos)<12)
        {
            for(let i = 0; i < this.connections.length; i++)
            {
                if(Matrix.vecDist(positions.roundPos,this.connections[i][1]) < 0.1)
                {
                    return i;
                }
            }
        }
        return undefined;
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        if(Matrix.vecDist(positions.roundPos,this.connections[conn][1]) > 0.1)
        {
            Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
            return true;
        }
        return false;
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
    getHovering(positions)
    {
        if(Matrix.vecDist(positions.screenPos,positions.roundScreenPos)<12)
        {
            for(let i = 0; i < this.connections.length; i++)
            {
                if(Matrix.vecDist(positions.roundPos,this.connections[i][1]) < 0.1)
                {
                    return i;
                }
            }
        }
        return undefined;
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        if(Matrix.vecDist(positions.roundPos,this.connections[conn][1]) > 0.1)
        {
            Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
            return true;
        }
        return false;
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
    getHovering(positions)
    {
        if(Matrix.vecDist(positions.screenPos,positions.roundScreenPos)<12)
        {
            for(let i = 0; i < this.connections.length; i++)
            {
                if(Matrix.vecDist(positions.roundPos,this.connections[i][1]) < 0.1)
                {
                    return i;
                }
            }
        }
        return undefined;
    }
    /**
     * @param {MousePositions}positions
     */
    drag(positions,conn)
    {
        if(Matrix.vecDist(positions.roundPos,this.connections[conn][1]) > 0.1)
        {
            Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
            return true;
        }
        return false;
    }
}