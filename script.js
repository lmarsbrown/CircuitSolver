let circ = [];


circ.push(createResistor(Matrix.vec(0,1)));


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
function createCircMat(components,nodeCount)
{
    let size = components.length + nodeCount+1;
    let outMat = Matrix.mat(size);
    let one = size-1;
    
    for(let i = 0; i < components.length; i++)
    {
        /**@type {Component} */
        let comp = components[i];
        //Node Voltage Drop
        for(let i = 0; i < 2; i++)
        {
            let node = comp.nodes[i];
            if(node != 0)
            {
                node --;
                let nodeX = node + components.length;
                Matrix.setElement(outMat,nodeX,i,1+i*-2);
            }
        }

        //Component Voltage Drop
        Matrix.setElement(outMat,i,i,comp.ivMat[1]);
        //Component Voltage Drop
        Matrix.setElement(outMat,i,i,comp.ivMat[1]);

    }
}


/*
ivMat:
In: unknown, 1
Out: voltage, current
*/

/**
 * @param {Uint16Array} nodes Indices of in input and output nodes
 * @param {Uint16Array} resistance Resistance of the resistor
 * @type {Component}
 */
function createResistor(nodes = new Uint16Array(0,0),resistance=0.0)
{
    let ivMat = Matrix.mat(2);
    Matrix.setElement(ivMat,0,0,resistance);
    Matrix.setElement(ivMat,1,0,0);
    Matrix.setElement(ivMat,0,0,1);
    Matrix.setElement(ivMat,1,0,0);
    

    return {nodes:nodes,ivMat:ivMat};
}
