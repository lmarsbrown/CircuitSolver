class Circuit
{
    constructor()
    {
        this.components = [];
        this.simpleCircuit = [];
        this.currentNode = 2;
        this.gridW = 20;
        this.gridH = 20;
        this.grid = new Uint16Array(gridW*gridH);

        this.can = document.createElement("canvas");
        this.canW = 600;
        this.canH = 600;
        can.width = canW;
        can.height = canH;
        document.body.appendChild(can);
        let ctx = can.getContext("2d");
    }
}

class Resistor
{
    constructor(resistance)
    {
        

        this.connections = [
            [0,Matrix.vec(0,0)],
            [0,Matrix.vec(2,0)]
        ];

        let ivMat = Matrix.mat(2);
        ivMat[0] = resistance;
        ivMat[1] = 0;
        ivMat[2] = 1;
        ivMat[3] = 0;
        

        this.simple = {nodes:nodes,ivMat:ivMat};
    }
    getSimple() 
    {
        this.simple.nodes[0]= this.connections[0][0];
        this.simple.nodes[1]= this.connections[1][0];
        return this.simple;
    }
    draw(ctx,canWidth,gridWidth)
    {
        
        let start = getScreenPos(comp.p1[0],comp.p1[1]);
        let end = getScreenPos(comp.p2[0],comp.p2[1]);
        
        ctx.strokeStyle=`rgb(255,100,50)`;

        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(start[0],start[1]);
        ctx.lineTo(end[0],end[1]);
        ctx.stroke();
    }
}