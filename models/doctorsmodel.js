const mongoose = require("mongoose");

const doctorSchema= new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    ratings:{
        type:Number,
        required:true,
        min:0,
        max:5
    },
    reviews: {
        type: String,
        required: true,
        minlength: 1
},
    imageUrl:{
        type:String,
        required:true

    },
    specialization:{
        type:String,
        default:'Cardiologist'
    },
    qualification:{
        type:String
    },
    sessionfee:{
        type:Number
    },
    followupFee:{
        type:Number
    },
    experience:{
        type:String
    },
    patienttreated:{
        type:String
    },
    description:{
        type:String
    },

});

module.exports=mongoose.model("Doctor",doctorSchema)