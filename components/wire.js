
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
    draw()
    {
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);
        
        
        ctx.lineWidth = this.lineWidth;

        if(this.selected)
        {
            ctx.strokeStyle = selectColor;
        }
        else if(this.editing)
        {
            ctx.strokeStyle = editColor;
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