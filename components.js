

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
}

class Resistor
{
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
    getHovering(screenPos,getGridPos,getScreenPos)
    {
        let gridPos = getGridPos(screenPos);
        let roundGridPos = Matrix.vec(Math.round(gridPos[0]),Math.round(gridPos[1]));
        let roundScreenPos = getScreenPos(roundGridPos);
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
}