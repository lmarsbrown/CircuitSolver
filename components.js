

function getSymbolImg(name,callback)
{
    let xhr = new XMLHttpRequest();
    xhr.open("GET","symbols/"+name);
    xhr.onload = ()=>{
        let svgDiv = document.createElement("div");
        svgDiv.innerHTML = xhr.response;
        let svg = svgDiv.getElementsByTagName("svg")[0];
        let path = svg.getElementsByTagName("path")[0];
        let pData = path.getAttribute("d");
        callback(pData);
    };
    xhr.send()
}


getSymbolImg("resistor.svg",(data)=>{
    Resistor.symbol = new Path2D(data);
})


class VoltageSource
{
    constructor(voltage)
    {
        

        this.connections = [
            [0,Matrix.vec(0,0)],
            [0,Matrix.vec(2,0)]
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
        let start = getScreenPos(p1);

        let end = getScreenPos(p2);
        // console.log(p1,end);
        
        ctx.strokeStyle=`rgb(0,255,50)`;

        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(start[0],start[1]);
        ctx.lineTo(end[0],end[1]);
        ctx.stroke();
    }

    /**
     * @param {MousePositions}positions
     */
    getHovering(positions)
    {
        if(Matrix.vecDist(positions.screenPos,positions.roundScreenPos)<8)
        {
            for(let i = 0; i < this.connections.length; i++)
            {
                if(Matrix.vecDist(positions.gridPos,this.connections[i][1]) < 0.1)
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
        Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
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
        Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
    }
}

class Resistor
{
    static symbol;
    constructor(resistance,p1,p2)
    {
        

        this.connections = [
            [0,p1],
            [0,p2]
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
    draw(getScreenPos)
    {
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let start = getScreenPos(p1);

        let end = getScreenPos(p2);
        // console.log(p1,end);
        
        ctx.strokeStyle=`rgb(255,100,50)`;

        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(start[0],start[1]);
        ctx.lineTo(end[0],end[1]);
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
        Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
    }
}


class Ground
{
    constructor(position)
    {
        

        this.connections = [
            [0,position]
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
        Matrix.copyMat(positions.roundPos,this.connections[conn][1]);
    }
}