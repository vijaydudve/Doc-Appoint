const express = require('express')
const dotenv = require('dotenv')
const colors = require('colors')
const morgan = require('morgan')
const ConnectToMongo = require('./db')
const cookieparser = require('cookie-parser')
const app = express()

dotenv.config()

app.use(cookieparser())
app.use(express.json())
app.use(morgan('dev'))


ConnectToMongo()
app.use('/api',require('./routes/userroutes'))
app.use('/api/admin',require('./routes/adminroutes'))
app.use('/api/doctor',require('./routes/doctorroutes'))

app.get('/',(req,res)=>{
    res.status(200).send({
        message:"server running"
    })
})

const port = process.env.PORT || 8080


app.listen(port,()=>{
    console.log(`server started at  http://localhost:${port}`)
})