
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
        this.resistance = resistance;

        let n1 = this.connections[0][0]; 
        let n2 = this.connections[1][0]; 
        this.deps = [
            //n1 current
            [n1,n1, -1/resistance],
            [n2,n1,  1/resistance],
            //n2 current
            [n1,n2,  1/resistance],
            [n2,n2, -1/resistance]
        ];
    }
    getDependents()
    {
        if(!this.isCollapsed())
        {
            let n1 = this.connections[0][0]; 
            let n2 = this.connections[1][0]; 
            
            this.deps[0][0] = n1;
            this.deps[0][1] = n1;
            
            this.deps[1][0] = n2;
            this.deps[1][1] = n1;
            
            this.deps[2][0] = n1;
            this.deps[2][1] = n2;
            
            this.deps[3][0] = n2;
            this.deps[3][1] = n2;
    
            return this.deps;
        }
        else
        {
            return [];
        }
    }
    updateValues(outVec)
    {
        if(!this.isCollapsed())
        {
            super.updateValues(outVec);
            this.i = -this.v/this.resistance;
        }
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