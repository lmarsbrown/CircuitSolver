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