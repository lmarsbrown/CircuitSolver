class Matrix
{
    static mulVec(mat,vec)
    {
        let out = new Float32Array(vec.length);
        for(let y = 0; y < vec.length; y++)
        {
            let sum = 0;
            for(let x = 0; x < vec.length; x++)
            {
                sum+=vec[x]*mat[x+y*vec.length];
            }
            out[y] = sum;
        }
        return out;
    }

    static addVecs(vec0,vec1)
    {
        let out = Matrix.vec(vec0.length);
        for(let i = 0; i < out.length; i++)
        {
            out[i] = vec0[i]+vec1[i];
        }
        return out;
    }

    static scaleVec(vec0,scalar)
    {
        let out = Matrix.vec(vec0.length);
        for(let i = 0; i < out.length; i++)
        {
            out[i]=scalar*vec0[i];
        }
        return out;
    }

    static dot(vec0,vec1)
    {
        let out = 0;
        for(let i = 0; i < vec0.length; i++)
        {
            out+=vec0[i]*vec1[i];
        }
        return out;
    }
    static normalize(vec)
    {
        let length = Matrix.vecLength(vec);
        
        for(let i = 0; i < vec.length; i++)
        {
            vec[i] /= length;
        }
    }

    static vecLength(vec)
    {
        let length = 0
        for(let i = 0; i < vec.length; i++)
        {
            length += vec[i]**2;
        }
        return Math.sqrt(length);
    }

    static invert(src,dst)
    {
        let width = Math.sqrt(src.length);
        let proccesingMat = Matrix.newCopyMat(src);
        let outMat = new Float32Array(src.length);
        Matrix.identity(outMat);

        for(let x = 0; x < width; x++)
        {
            let scale0 = 1/Matrix.getElement(proccesingMat,x,x);
            Matrix.scaleRow(outMat,scale0,x);
            Matrix.scaleRow(proccesingMat,scale0,x);
            for(let y = x+1; y < width; y++)
            {
                let scale1 = -Matrix.getElement(proccesingMat,x,y);
                Matrix.addScaleRow(proccesingMat,proccesingMat,scale1,x,y);
                Matrix.addScaleRow(outMat,outMat,scale1,x,y);
            }
        }
        for(let x = 0; x < width; x++)
        {
            for(let y = 0; y < x; y++)
            {
                let scale1 = -Matrix.getElement(proccesingMat,x,y);
                Matrix.addScaleRow(proccesingMat,proccesingMat,scale1,x,y);
                Matrix.addScaleRow(outMat,outMat,scale1,x,y);
            }
        }
        Matrix.copyMat(outMat,dst);
    }

    static getElement(mat,x,y)
    {
        return mat[x+y*Math.sqrt(mat.length)];
    }

    static setElement(mat,x,y,val)
    {
        mat[x+y*Math.sqrt(mat.length)]=val;
    }
    /**
     * @param {Float32Array} src source mat
     * @param {Float32Array} dst dest mat
     * @param {Number} scale scale amount
     * @param {Number} row0 src row index
     * @param {Number} row1 dest row index
     */
    static addScaleRow(src,dst,scale,row0,row1)
    {
        let width = Math.sqrt(src.length);
        for(let i = 0; i < width; i++)
        {
            dst[row1*width+i] += src[row0*width+i]*scale;
        }
    }

    static translateVec(vec0,vec1)
    {
        for(let i = 0; i < vec1.length; i++)
        {
            vec0[i]+=vec1[i];
        }
    }
    static vecDist(vec0,vec1)
    {
        let out = 0;
        for(let i = 0; i < vec0.length; i++)
        {
            out += (vec0[i]-vec1[i])**2;
        }
        return Math.sqrt(out);
    }

    static scaleRow(mat,scale,row)
    {
        let width = Math.sqrt(mat.length);
        for(let x = 0; x < width; x++)
        {
            mat[x+row*width] *= scale;
        }
    }

    static copyMat(src,dst)
    {
        for(let i = 0; i < dst.length; i++)
        {
            dst[i] = src[i];
        }
    }
    static newCopyMat(src)
    {
        let out = new Float32Array(src.length);
        for(let i = 0; i < src.length; i++)
        {
            out[i] = src[i];
        }
        return out;
    }

    static logMat(mat)
    {
        let width = Math.sqrt(mat.length);
        let out = "";
        for(let y = 0; y < width; y++)
        {
            let str = "";
            for(let x = 0; x < width; x++)
            {
                str+=mat[x+y*width]+", ";
            }
            out+=str+"\n";
        }
        console.log(out);
    }

    static identity(mat)
    {
        let width = Math.sqrt(mat.length);
        for(let y = 0; y < width; y++)
        {
            for(let x = 0; x < width; x++)
            {
                mat[x+y*width] = 0;
            }
        }
        for(let i = 0; i < width; i++)
        {
            mat[i*(width+1)] = 1;
        }
    }

    static logVec(vec)
    {
        let out = "";
        for(let i = 0; i < vec.length; i++)
        {
            out+=vec[i]+"\n";
        }
        console.log(out);
    }

    static mat(size)
    {
        return new Float32Array(size*size);
    }
    static vec(size)
    {
        return new Float32Array(size);
    }
}