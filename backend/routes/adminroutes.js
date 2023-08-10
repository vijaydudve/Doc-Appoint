const express = require("express");
const Authenticate = require("../middlewares/Authenticate");
const userModel = require("../models/Usermodel");
const doctorModel = require("../models/doctorModel");

const router = express.Router()

router.get('/getAllUsers',Authenticate, async (req,res)=>{
    try{
        const response = await userModel.find({})
        res.status(200).send({
            success:true,
            message:'users data',
            data:response
        })

    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error while fetching users',
        })
    }

})

router.get('/getAllDoctors',Authenticate, async (req,res)=>{
    try{
        const response = await doctorModel.find({})
        res.status(200).send({
            success:true,
            message:'doctors data',
            data:response
        })

    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error while fetching doctors',
        })
    }
})

router.post('/changeAccountStatus',Authenticate, async (req,res)=>{
    try{
        const {doctorId,status} = req.body
        const doctor = await doctorModel.findByIdAndUpdate(doctorId,{status})
        const user = await userModel.findOne({_id:doctor.userId})
        const notification = user.notification
        notification.push({
            type:'doctor-account-request-updated',
            message:`your doctor account request has ${status}`,
            onclickpath:'/notification'
        })
        user.isDoctor = status==='approved'?true:false
        await user.save()
        res.status(200).send({
            success:true,
            message:'Account status updated',
            data:doctor
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error while change account status',
        })
    }
})


module.exports  =  router