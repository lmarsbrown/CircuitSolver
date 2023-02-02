
class Resistor extends Component
{
    static symbol;
    constructor(resistance,p1,p2)
    {
        super();
        this.type = Resistor;
        this.defaultSize = 3;

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
    draw()
    {
        let resistorSize = Math.min(Matrix.vecDist(this.connections[0][1],this.connections[1][1]),this.defaultSize)
        const restLen = (getScreenPos(Matrix.vec(resistorSize,0))[0]-getScreenPos(Matrix.vec(0,0))[0]);
        let p1 = this.connections[0][1];
        let p2 = this.connections[1][1];
        let a = getScreenPos(p1);
        let b = getScreenPos(p2);

        let line = Matrix.subVecs(b,a);


        let dist = Matrix.vecLength(line);
        let wireLen = (dist-restLen)/2;
        let transWireLen = 1000*wireLen/restLen;
        let scale = restLen/1000;

        let restStart = Matrix.addVecs(a,Matrix.scaleVec(line,wireLen/dist));
        ctx.lineCap = "round";
        

        ctx.translate(restStart[0],restStart[1]);
        ctx.scale(scale,scale);
        ctx.rotate(Math.atan2(line[1],line[0]));
        ctx.lineWidth = this.lineWidth/scale;

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
            var grd = ctx.createLinearGradient(0,0,1000,0);
    
            grd.addColorStop(0, getVoltageColor(this.connections[0][2]));
            grd.addColorStop(1, getVoltageColor(this.connections[1][2]));
    
            ctx.strokeStyle = grd;
        }

        let restPath = new Path2D();
        restPath.moveTo(-transWireLen,0);
        restPath.lineTo(-0,0);
        restPath.addPath(this.type.symbol);
        restPath.lineTo(1000+transWireLen,0);

        ctx.stroke(restPath);
        ctx.resetTransform();
    }
}