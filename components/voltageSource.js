

class VoltageSource extends Component
{
    constructor(voltage,p1,p2)
    {
        super();
        this.type = VoltageSource;

        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];

        this.voltage = voltage;
        
        this.iInd = 0;
        let n1 = this.connections[0][0]; 
        let n2 = this.connections[1][0]; 
        this.deps = [
            //voltage
            [n1,this.iInd, -1],
            [n2,this.iInd,  1],
            //n1 current
            [this.iInd,n1, -1],
            //n2 current
            [this.iInd,n2,  1],
        ];
    }
    getIndependents(count)
    {
        this.iInd = count;
        return [this.voltage];
    }
    getDependents()
    {
        let n1 = this.connections[0][0]; 
        let n2 = this.connections[1][0]; 
        
        this.deps[0][0] = n1;
        this.deps[1][0] = n2;
        this.deps[2][1] = n1;
        this.deps[3][1] = n2;

        this.deps[0][1] = this.iInd;
        this.deps[1][1] = this.iInd;
        this.deps[2][0] = this.iInd;
        this.deps[3][0] = this.iInd;
        return this.deps;
    }
    updateValues(outVec)
    {
        super.updateValues(outVec);
        this.i = outVec[this.iInd];
    }
    draw()
    {
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
        ctx.lineWidth = this.lineWidth /scale;

        

        let col0;
        let col1;
        if(this.editing)
        {
            col0 = editColor;
            col1 = editColor;
        }
        else if(this.selected)
        {
            col0 = selectColor;
            col1 = selectColor;
        }
        else
        {
            col0 = getVoltageColor(this.connections[0][2]);
            col1 = getVoltageColor(this.connections[1][2]);
        }

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
}