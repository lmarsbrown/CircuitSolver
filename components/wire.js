
class Wire extends Component
{
    constructor(p1,p2)
    {
        super();
        this.type = Wire;
        this.connections = [
            [0,p1,0],
            [0,p2,0]
        ];
        
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
        return [0];
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


     /**
     * @param {CanvasRenderingContext2D}ctx
     */
    draw()
    {
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);
        
        
        ctx.lineWidth = this.lineWidth;

        if(this.editing)
        {
            ctx.strokeStyle = editColor;
        }
        else if(this.selected)
        {
            ctx.strokeStyle = selectColor;
        }
        else
        {
            ctx.strokeStyle = getVoltageColor(this.connections[0][2]);
        }
        ctx.beginPath();
        ctx.moveTo(a[0],a[1]);
        ctx.lineTo(b[0],b[1]);
        ctx.stroke();
    }
}