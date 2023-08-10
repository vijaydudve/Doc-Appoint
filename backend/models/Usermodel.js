const mongoose = require('mongoose')
const JWT = require('jsonwebtoken')


const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    isAdmin:{
        type:Boolean,
        default:false
    },
    isDoctor:{
        type:Boolean,
        default:false,
    },
    notification:{
        type:Array,
        default:[]
    },
    seenNotification:{
        type:Array,
        default:[]
    }
})

userSchema.methods.generateAuthToken = async function(){
    try{
        let tokenData = JWT.sign({_id:this._id},'VIJAYVJCOSNOCSN')
        // this.tokens = this.tokens.concat({token:tokenData})
        // await this.save()
        return tokenData
    }
    catch(err){
        console.log(err)
    }
  }

const userModel = mongoose.model('users',userSchema)

module.exports = userModel