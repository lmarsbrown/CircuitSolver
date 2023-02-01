
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