const JWT = require("jsonwebtoken")

const Authenticate = async (req,res,next)=>{
    try{
        const token = req.cookies.JWtoken
        // const token = req.headers['authorization'].split(" ")[1]
        console.log(token)
        const verigyToken = JWT.verify(token,"VIJAYVJCOSNOCSN",(err,decode)=>{
            if(err){
                return res.status(400).send({message:'auth failed'})
            }else{
                console.log(decode._id)
                req.body.userId = decode._id
                next()
            }
        })
        // console.log(verigyToken)
    }
    catch(err){
        res.status(401).send({error:"no token found"})
        console.log(err)
    }
}

module.exports = Authenticate