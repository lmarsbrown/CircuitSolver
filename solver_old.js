class Circuit
{
    constructor()
    {
        // this.nodes = [];
        this.nodeCount = 0;
        this.components = [];
    }
    createNode(src,voltage=0)
    {
        let node = {index:this.nodeCount,voltage:voltage,src:src};
        if(!src)
        {
            // this.nodes.push(node);
            this.nodeCount++;
        }
        return node;
    }
    createResistor(node1,node2,resistance)
    {
        let c = this.createComponent(node1,node2,resistance,0,"Resistor","A");

        //Unknown is current
        //Voltage is current*val
        c.vVec = [resistance,0];
        //Current is unknown
        c.iVec = [1,0];

        c.name        = "Resistor";
        c.unknownUnit = "A";
        c.valUnit     = "Ohm";

        this.components.push(c);
        return c;
    }
    createVoltageSupply(node1,node2,voltage)
    {
        let c = this.createComponent(node1,node2,voltage,1);

        //Unknown is current
        //Voltage is val
        c.vVec = [0,voltage];
        //Current is unknown
        c.iVec = [1,0];

        c.name        = "Voltage Supply";
        c.unknownUnit = "A";
        c.valUnit     = "V";

        this.components.push(c);
        return c;
    }
    createCurrentSupply(node1,node2,current)
    {
        let c = this.createComponent(node1,node2,current,2);

        //Unknown is voltage
        //Voltage is unknown
        c.vVec = [1,0];
        //Current is current
        c.iVec = [0,current];

        c.name        = "Current Supply";
        c.unknownUnit = "V";
        c.valUnit     = "A";

        this.components.push(c);
        return c;
    }
    createComponent(node1,node2,val)
    {
        //[Unknown multiplier, const multiplier]
        let c = {n1:node1,n2:node2,val:val,name:"",unknownUnit:"",valUnit:"",vVec:[0,0],iVec:[0,0]};
        return c;
    }

    getLinear()
    {
        let size = this.components.length+this.nodeCount+1;
        let cLen = this.components.length;
        let mat = Matrix.mat(size);
        let vec = Matrix.vec(size);
        Matrix.setElement(mat,size-1,size-1,1);
        vec[size-1] = 1;
        console.log(Matrix.vec(size))

        for(let r = 0; r < this.components.length; r++)
        {
            //Voltage difference across part
            let comp = this.components[r];
                
            //Unknown voltage
            Matrix.setElement(mat,r,r,comp.vVec[0]);
            //Const voltage
            Matrix.setElement(mat,size-1,r,comp.vVec[1]);

            //Voltage of connecting components
            if(!comp.n1.src)
            {
                let ind = cLen+comp.n1.index;
                //Add voltage of node to row so that is sums to zero
                Matrix.setElement(mat,ind,r,-1);

                //Current of node
                let existVal1 = Matrix.getElement(mat,      r, ind);
                let existVal2 = Matrix.getElement(mat, size-1, ind);
                
                //Unknown Current
                Matrix.setElement(mat, r     , ind, existVal1-comp.iVec[0]);
                //Const Current
                Matrix.setElement(mat, size-1, ind, existVal2-comp.iVec[1]);
            }
            else
            {
                vec[r] = comp.n1.voltage;
            }

            if(!comp.n2.src)
            {
                let ind = cLen+comp.n2.index;
                //Add voltage of node to row so that is sums to zero
                Matrix.setElement(mat,ind,r,1);

                //Current of node
                let existVal1 = Matrix.getElement(mat,      r, ind);
                let existVal2 = Matrix.getElement(mat, size-1, ind);
                
                //Unknown Current
                Matrix.setElement(mat, r     , ind, existVal1+comp.iVec[0]);
                //Const Current
                Matrix.setElement(mat, size-1, ind, existVal2+comp.iVec[1]);
            }
            else
            {
                vec[r] = -comp.n2.voltage;
            }
        }
        return [mat,vec];
    }
    solve()
    {
        let lin = circ.getLinear();
        Matrix.logMat(lin[0])
        Matrix.invert(lin[0],lin[0]);
        let out = Matrix.mulVec(lin[0],lin[1])
        let rC = 0;
        let vC = 0;
        let iC = 0;
        for(let i = 0; i < this.components.length; i++)
        {
            let str = "";
            let comp = this.components[i];
            // if(comp.type == 0)
            // {
            //     rC++;
            //     console.log("Resistor "+rC+", "+comp.val+" Ohms: "+Circuit.formatValue(out[i])+"A");
            // }
            // if(comp.type==1)
            // {
            //     vC++;
            //     console.log("Voltage Supply "+vC+", "+comp.val+" Volts: "+Circuit.formatValue(out[i])+"A");
            // }
            // if(comp.type==2)
            // {
            //     iC++;
            //     console.log("Current Supply "+iC+", "+comp.val+" Amps: "+Circuit.formatValue(out[i])+"V");
            // }
            console.log(comp.name+" "+Circuit.formatValue(comp.val)+comp.valUnit+": "+Circuit.formatValue(out[i])+comp.unknownUnit);
        }
        console.log("\n");
        for(let i = 0; i < this.nodeCount; i++)
        {
            let str = "";
            // let node = this.nodes[i];
            console.log("Node "+i+": "+Circuit.formatValue(out[i+this.components.length])+"V")
        }
        // Matrix.logVec(out);
            
    }
    static formatValue(x)
    {
        let prefixes = ["","m","u","n","p"];
        let scale = Math.ceil(-Math.log(Math.abs(x))/Math.log(1000));
        if(scale>0)
        {
            return x*(1000**scale)+prefixes[scale];
        }
        else
        {
            return x;
        }
    }
}
