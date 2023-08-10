const express = require('express')
const userModel = require('../models/Usermodel')
const bcrypt = require('bcryptjs')
const JWT = require('jsonwebtoken')
const Authenticate = require('../middlewares/Authenticate')
const doctorModel = require('../models/doctorModel')
const appointmentModel = require('../models/appointmentModel')
const moment = require('moment')

const router = express.Router()

router.post('/register', async (req,res)=>{
    
    // console.log(req.body)
    // if(!name || !email || !password){
    //     return res.status(400).send({error:"please fill the data"})
    // }
    try{
        const userexist = await userModel.findOne({email:req.body.email})
        if(userexist){
            return res.status(400).send({message:"email already exist"})
        } 
        const password = req.body.password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password,salt)
        req.body.password = hashedPassword
        const user = new userModel(req.body)
        await user.save()
        return res.status(200).send({message:"successfully registered"})

    }catch(err){
        console.log(err)
    }
})

router.post('/login',async (req,res)=>{
    const {email,password} = req.body
    if(!email || !password){
        return res.status(400).send({error:"please fill login details"})
    }
    try{
        const response = await userModel.findOne({email:email})
        if(!response){
            return res.status(400).send({error:"not found/not registered"})
        }
        const passwordcheck = await bcrypt.compare(password,response.password)
        if(passwordcheck){
            // const token = JWT.sign({id:response._id} ,process.env.JWT_SECRET,{expiresIn:'1d'})
            token  = await response.generateAuthToken()
            console.log(token)

            res.cookie("JWtoken",token,{
                expires: new Date(Date.now() + 25892000000),
                httpOnly:true
            }) 
            return res.status(200).send({message:"successfully login",token})
        }
        res.status(400).send({message:"login failed"})
    }catch(err){
        console.log(err)
    }
})

router.post('/getUserData',Authenticate, async (req,res)=>{
    try{
        const user = await userModel.findOne({_id:req.body.userId})
        // console.log(req.body.userId)
        user.password = undefined
        if(!user){
            return res.status(400).send({message:'user not found'})
        }
        else{
            res.status(200).send({data:user
            })
        }
    }catch(err){
        console.log(err)
    }
})

router.post('/apply-doctor',Authenticate, async (req,res)=>{
    try{
        const newdoctor = await doctorModel({...req.body,status:'pending'})
        console.log(req.body)
        await newdoctor.save()
        const adminuser = await userModel.findOne({isAdmin:true})
        const notification = adminuser.notification
        notification.push({
            type:'apply-doctor-request',
            message:`${newdoctor.firstname} ${newdoctor.lastname} applied for a doctor account`,
            data:{
                doctorId:newdoctor._id,
                name: newdoctor.firstname+" "+newdoctor.lastname,
                onclickpath:'/doctors'
            }
        })
        await userModel.findByIdAndUpdate(adminuser._id,{notification})
        res.status(200).send({
            message:'doctor account applyied successfully'
        })

    }catch(err){
        console.log(err)

    }
})

router.post('/get-all-notification', Authenticate,async (req,res)=>{
    try{
        const user = await userModel.findOne({_id:req.body.userId})
        const seenNotification = user.seenNotification
        const notification = user.notification
        seenNotification.push(...notification)
        user.notification = []
        user.seenNotification = notification
        const updatedUser = await user.save()
        res.status(200).send({
            message:'all notification marked as read',
            success:true,
            data:updatedUser
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            message:'error in notifiacation',
            success:false
        })
    }
})

router.post('/delete-all-notification',Authenticate, async (req,res)=>{
    try{
        const user = await userModel.findOne({_id:req.body.userId})
        user.notification = []
        user.seenNotification = []
        const updatedUser = await user.save()
        updatedUser.password = undefined
        res.status(200).send({
            success:true,
            message:'successfully deleted all notification',
            data:updatedUser
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error in delete all notification'
        })
    }
})

router.get('/getAllDoctors',Authenticate, async (req,res)=>{
    try{
        const doctors = await doctorModel.find({status:'approved'})
        res.status(200).send({
            success:true,
            message:'doctors list fetched successfully',
            data:doctors
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error while fetching all doctors'
        })
    }
})

router.post('/book-appointment',Authenticate, async (req,res)=>{
    try{
        req.body.date = moment(req.body.date,"DD-MM-YYYY").toISOString()
        req.body.time = moment(req.body.time,"HH:mm").toISOString()
        req.body.status = 'pending'
        const newAppointment = new appointmentModel(req.body)
        await newAppointment.save()
        const user = await userModel.findOne({_id:req.body.doctorInfo.userId})
        user.notification.push({
            type:'new-appointment-request',
            message:`New Appointment request from ${req.body.userInfo.name}`,
            onclickpath:'/user/appointments'
        })
        await user.save()
        res.status(200).send({
            success:true,
            message:'Appointment booked successfully'
        })
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error while booking appointment'
        })
    }
})

router.post('/booking-availability',Authenticate, async (req,res)=>{
    try{
        const date = moment(req.body.date,"DD-MM-YYYY").toISOString()
        const starttime = moment(req.body.time,"HH:mm").subtract(1,'hours').toISOString()
        const endtime = moment(req.body.time,"HH:mm").add(1,'hours').toISOString()
        const doctorId = req.body.doctorId
        const appointment = await appointmentModel.find({doctorId,date,time:{
            $gte:starttime,$lte:endtime
        }})
        if(appointment.length>0){
            return res.status(200).send({
                success:true,
                message:'Appointment not available at this time'
            })
        }else{
            return res.status(200).send({
                success:true,
                message:'Appointment  available'
            })
        }
    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error in booking availability'
        })
    }
})

router.get('/user-appointments',Authenticate, async (req,res)=>{
    try{
        const appointments = await appointmentModel.find({userId:req.body.userId})
        res.status(200).send({
            success:true,
            message:'user appointments fetched',
            data:appointments
        })

    }catch(err){
        console.log(err)
        res.status(500).send({
            success:false,
            message:'error while fetching user appointments'
        })
    }
})

router.get("/logout",(req,res)=>{
    res.clearCookie("JWtoken",path="/")
    res.status(200).send({message:"logout successful"})
})

module.exports = router