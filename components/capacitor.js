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