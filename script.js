class Circuit
{
    constructor()
    {
        this.nodes = [];
        this.components = [];
    }
    createNode(src,voltage=0)
    {
        let node = {index:this.nodes.length,voltage:voltage,src:src};
        if(!src)
        {
            this.nodes.push(node);
        }
        return node;
    }
    createResistor(node1,node2,resistance)
    {
        let c = {n1:node1,n2:node2,val:resistance,type:0};
        this.components.push(c);
        return c;
    }
    createVoltageSupply(node1,node2,voltage)
    {
        let c = {n1:node1,n2:node2,val:voltage,type:1};
        this.components.push(c);
        return c;
    }
    createCurrentSupply(node1,node2,current)
    {
        let c = {n1:node1,n2:node2,val:current,type:2};
        this.components.push(c);
        return c;
    }
    getLinear()
    {
        let size = this.components.length+this.nodes.length+1;
        let cLen = this.components.length;
        let mat = Matrix.mat(size);
        let vec = Matrix.vec(size);
        Matrix.setElement(mat,size-1,size-1,1);
        vec[size-1] = 1;
        for(let r = 0; r < this.components.length; r++)
        {
            //Voltage difference across part
            let comp = this.components[r];
            if(comp.type == 0)
            {
                Matrix.setElement(mat,r,r,comp.val);
            }
            else if(comp.type == 1)
            {
                Matrix.setElement(mat,size-1,r,comp.val);
            }
            else if(comp.type == 2)
            {
                Matrix.setElement(mat,r,r,1);
            }

            //Voltage of connecting components
            if(!comp.n1.src)
            {
                let ind = cLen+comp.n1.index;
                Matrix.setElement(mat,ind,r,-1);
                if(comp.type != 2)
                {
                    Matrix.setElement(mat,r,ind,-1);
                }
                else
                {
                    let existVal = Matrix.getElement(mat,size-1,ind);
                    Matrix.setElement(mat,size-1,ind,existVal-comp.val);
                }
            }
            else
            {
                vec[r] = comp.n1.voltage;
            }
            if(!comp.n2.src)
            {
                let ind = cLen+comp.n2.index;
                Matrix.setElement(mat,ind,r,1);
                if(comp.type != 2)
                {
                    Matrix.setElement(mat,r,ind,1);
                }
                else
                {
                    let existVal = Matrix.getElement(mat,size-1,ind);
                    Matrix.setElement(mat,size-1,ind,existVal+comp.val);
                }
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
        Matrix.invert(lin[0],lin[0]);
        let out = Matrix.mulVec(lin[0],lin[1])
        let rC = 0;
        let vC = 0;
        let iC = 0;
        for(let i = 0; i < this.components.length; i++)
        {
            let str = "";
            let comp = this.components[i];
            if(comp.type == 0)
            {
                rC++;
                console.log("Resistor "+rC+", "+comp.val+" Ohms: "+Circuit.formatValue(out[i])+"A");
            }
            if(comp.type==1)
            {
                vC++;
                console.log("Voltage Supply "+vC+", "+comp.val+" Volts: "+Circuit.formatValue(out[i])+"A");
            }
            if(comp.type==2)
            {
                iC++;
                console.log("Current Supply "+iC+", "+comp.val+" Amps: "+Circuit.formatValue(out[i])+"V");
            }
        }
        console.log("\n");
        for(let i = 0; i < this.nodes.length; i++)
        {
            let str = "";
            let node = this.nodes[i];
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

let circ = new Circuit();
let vin = circ.createNode(true,5);
let n1 = circ.createNode(false);
let n2 = circ.createNode(false);
let n3 = circ.createNode(false);
let gnd = circ.createNode(true,0);


circ.createCurrentSupply(n1,n3,1);
circ.createVoltageSupply(n3,gnd,8);

circ.createResistor(vin,n1,134);
circ.createResistor(n1,gnd,50);
circ.createResistor(n1,n2,1000);

circ.createResistor(vin,n2,1);
circ.createVoltageSupply(n2,gnd,4.9);

circ.solve();
// circ.createResistor(n1,n2,42);
// circ.createResistor(n1,n3,1000);
// circ.createCurrentSupply(n2,n3,4.2);
// circ.createResistor(n2,gnd,200);
// circ.createResistor(n3,gnd,300);

