const patient=require("../models/patientmodel");

exports.createPatient=async(req,res)=>{
    try{
        const{ 
      name,
      phone,
      dob,
      country,
      state,
      city,
      address1,
      address2,
      pincode,
      gender,}=req.body;
        if(!name ||!phone){
            return res.status(400).json({message:"Name and phone are required"});
        }
        const newPatient=await patient.create({
      name,
      phone,
      dob,
      country,
      state,
      city,
      address1,
      address2,
      pincode,
      gender,
        });
        res.status(201).json({
            message:"Patient created succuessfully",data:newPatient
        });

}catch(error){
    res.status(500).json({message:error.message})

}

    }


exports.getPatientById=async(req,res)=>{
    try{
        const{id}=req.params;
        const patientData=await patient.findById(id);
        if(!patientData){
            return res.status(404).json({message:"patient not found"});
        }
        res.status(200).json({message:"patient fetched succuessfully",data:patientData});
    }
    catch(error){
        res.status(500).json({message:error.message});
        }
    };

