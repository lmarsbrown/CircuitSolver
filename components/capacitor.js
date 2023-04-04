class Capacitor extends Resistor
{
    constructor(voltage,capacitance,p1,p2)
    {
        super(dT/(2*capacitance) ,p1,p2);
        this.pseudoResistance = dT/(2*capacitance);
        this.type = Capacitor;
        this.defaultSize = 2.5;

        this.v = 0;

        this.voltage = voltage;
        this.current = this.voltage/this.pseudoResistance;
        // this.i = current;
        

        this.t = 0;
    }
    updateValues(outVec,indeps,deps)
    {
        if(!this.isCollapsed())
        {
            super.updateValues(outVec);

            if(resetCirc)
            {
                resetCirc = false;
                window.t = 0;
                this.v = 10;
                this.voltage = 10;
                console.log("test");
            }

            this.voltage += 2*(this.v-this.voltage);
            this.i += this.current;
        }
    }
    updateParams(paramList)
    {
        this.current = this.voltage/this.pseudoResistance;
        paramList[this.connections[0][0]] += this.current;
        paramList[this.connections[1][0]] -= this.current;
    }
    initParams(paramList)
    {
        this.updateParams(paramList);
    }

    // constructor(voltage,capacitance,p1,p2)
    // {
    //     super(dT/2*capacitance,p1,p2);
    //     this.calcResist = dT/2*capacitance;
    //     this.type = Capacitor;

    //     this.v = 0;
    //     this.i = 0;

    //     this.voltage = voltage;
    //     this.current = this.voltage/this/this.calcResist;

    //     this.iInd = 0;
    // }
    // updateValues(outVec,indeps,deps)
    // {
    //     if(!this.isCollapsed())
    //     {
    //         super.updateValues(outVec);
    //         this.voltage = this.v;
    //         this.current = this.voltage/this/this.calcResist;
    //         this.i -= this.current;
    //     }
    // }
    // updateParams(paramList)
    // {
    //     paramList[this.connections[0][0]] += this.i;
    //     paramList[this.connections[1][0]] -= this.i;
    // }
    // initParams(paramList)
    // {
    //     this.updateParams(paramList);
    // }


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
    // updateValues(outVec,indeps,deps) 
    // {
    //     super.updateValues(outVec,indeps,deps);
    //     this.voltage = 2*this.v-this.pV;
    //     indeps[this.iInd] = this.voltage;
    //     this.pV = this.v;
    // }
}