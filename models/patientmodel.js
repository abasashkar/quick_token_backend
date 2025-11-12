const mongoose=require("mongoose");
const patientSchema =new mongoose.Schema({
     name:{type:String,required:true},
     phone:{type:String,required:true},
     dob:{type:String,required:true},
     country:{type:String,required:true},
     state:{type:String,required:true},
     city:{type:String,required:true},
     address1:{type:String,required:true},
     address2:{type:String,required:true},
     pincode:{type:String,required:true},
     gender:{type:String,required:true},
},{timestamps:true});
module.exports=mongoose.model("Patient",patientSchema)