const express = require('express')
const Authenticate = require('../middlewares/Authenticate')
const doctorModel = require('../models/doctorModel')

const router = express.Router()

router.post('/getDoctorInfo',Authenticate, async (req,res)=>{
    try{
        const doctor = await doctorModel.findOne({userId:req.body.userId})
        console.log(doctor)
        res.status(200).send({
            success:true,
            message:'doctor info fetched successfully',
            data:doctor
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error in fetching doctor info'
        })
    }
})

router.post('/updateProfile',Authenticate, async (req,res)=>{
    try{
        const doctor = await doctorModel.findOneAndUpdate({userId:req.body.userId},req.body)
        res.status(200).send({
            success:true,
            message:'doctor profile updated',
            data:doctor
        })

    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error in updating doctor profile'
        })
    }
})

router.post('/getDoctorById',Authenticate, async (req,res)=>{
    try{
        const doctor = await doctorModel.findOne({_id:req.body.doctorId})
        res.status(200).send({
            success:true,
            message:'single doctor info',
            data:doctor
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error in getting doctor by id'
        })
    }
})

module.exports = router