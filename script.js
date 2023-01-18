let circ = [];


circ.push(createResistor(Matrix.vec(0,1),1000));
circ.push(createVoltageSrc(Matrix.vec(0,1),5));
circ.push(createResistor(Matrix.vec(1,2),200));
circ.push(createResistor(Matrix.vec(2,0),890));


/**
 * @typedef Component
 * @type {Object}
 * @property {Uint16Array} nodes - Indices of the input and output nodes
 * @property {Float32Array} ivMat - Matrix transforming unknown and 1 to voltage and current.
 */

/*
In
Component Unknowns...
Node Voltages...

Matrix
Node Volt Drop - Component Volt Drop = 0
Node current sum = 0

Out
0
0
...
1
*/


/**
 * @param {Component[]} components Components in the circuit
 * @param {Number} nodeCount Number of nodes in the circuit including the referece node. 
 * @type {Float32Array}
 */
function createCircMat(components,nodeCount)
{
    let size = components.length + nodeCount;
    let outMat = Matrix.mat(size);
    let one = size-1;
    Matrix.setElement(outMat,one,one,1);
    
    for(let i = 0; i < components.length; i++)
    {
        /**@type {Component} */
        let comp = components[i];

        //Nodes
        for(let n = 0; n < 2; n++)
        {
            let node = comp.nodes[i];
            if(node != 0)
            {
                node --;
                let nodeI = node + components.length;
                //Node voltage drop
                Matrix.addElement(outMat,nodeI,i,1+n*-2);

                //Node current
                //Current Unknown
                Matrix.addElement(outMat, i  , nodeI, comp.ivMat[2]);
                Matrix.addElement(outMat, one, nodeI, comp.ivMat[3]);
            }
        }

        //Component Voltage Drop
        //Resistive
        Matrix.addElement(outMat,i,i,-comp.ivMat[0]);
        //Constant
        Matrix.addElement(outMat,one,i,-comp.ivMat[1]);

    }
    return outMat;
}


/*
ivMat:
In: unknown, 1
Out: voltage, current
*/

/**
 * @param {Uint16Array} nodes Indices of in input and output nodes
 * @param {Number} resistance Resistance of the resistor
 * @type {Component}
 */
function createResistor(nodes,resistance)
{
    let ivMat = Matrix.mat(2);
    ivMat[0] = resistance;
    ivMat[1] = 0;
    ivMat[2] = 1;
    ivMat[3] = 0;
    

    return {nodes:nodes,ivMat:ivMat};
}
/**
 * @param {Uint16Array} nodes Indices of in input and output nodes
 * @param {Uint16Array} voltage Voltage of the Voltage Source
 * @type {Component}
 */
function createVoltageSrc(nodes,voltage)
{
    let ivMat = Matrix.mat(2);
    ivMat[0] = 0;
    ivMat[1] = voltage;
    ivMat[2] = 1;
    ivMat[3] = 0;
    
    return {nodes:nodes,ivMat:ivMat};
}
