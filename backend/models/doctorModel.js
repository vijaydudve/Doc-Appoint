const mongoose = require('mongoose')

const doctorSchema = mongoose.Schema({
    userId:{
        type:String
    },
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    specialization:{
        type:String,
        required:true
    },
    experience:{
        type:String,
        required:true
    },
    fees:{
        type:Number,
        required:true
    },
    status:{
        type:String,
        default:'pending'
    },
    timings:{
        type:Object,
        required:true
    }
},{timestamps:true})

const doctorModel = mongoose.model('doctors',doctorSchema)
module.exports = doctorModel