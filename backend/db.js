const mongoose = require('mongoose')


const ConnectToMongo = async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log('database connected')
    }catch(err){
        console.log(err)
    }
}

module.exports = ConnectToMongo