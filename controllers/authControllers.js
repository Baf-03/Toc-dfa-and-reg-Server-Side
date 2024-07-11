import jwt from "jsonwebtoken"
import userModel from "../models/userSchema.js";



const signupUser = async (req, res) => {
    const { email, password ,name} = req.body;
    console.log("hit howa")
    if (!email || !password || !name) {
      console.log("Required fields are missing");
      return res.status(400).json({
        data: null,
        status: false,
        message: "Required fields are missing",
      });
    }
  
    try {
      // Check if the email already exists
      const checkEmail = await userModel.findOne({ email: email });
      if (checkEmail) {
        console.log("Email already taken");
        return res.status(400).send("Email already taken");
      }
  
      // Create the user
      const objToSend = {
        email,
        password,
        name
      };
      await userModel.create(objToSend);
  
      console.log("User created successfully");
      res.json({
        data: null,
        status: true,
        message: "User created",
      });
    } catch (error) {
      console.error("Error during signup", error);
      res.status(500).json({
        data: null,
        status: false,
        message: "Internal server error",
      });
    }
  };
  


  
const loginUser = async(req,res)=>{
    console.log("chala 1 ")
    const {email,password}=req.body
    console.log("chala",email,password)
    
    if(!email || !password){
        console.log("chala 2 ")
        res.status(400).json({
            data:null,
            status:false,
            message:"required fields are missing"
        })
        return
    }
    const verifyEmail = await userModel.findOne({email});
    if(!verifyEmail){
        console.log("chala 3 ")

        res.status(400).json({
            data:null,
            status:false,
            message:"either email or password is wrong"
        })
        return
    }
    if(verifyEmail.password !=password){
        console.log("wrn pass")
        res.status(400).json({
            data:null,
            status:false,
            message:"either email or password is wrong"
        })
        return
    }
    let payload = {
        email
      };

      const token = jwt.sign(payload, "todoB@f123", {
        expiresIn: '1hr',
      });
      console.log("pass")
    res.json({
        data:verifyEmail,
        status:true,
        message:"user logged in",
        token
    })
}

const verify =(req,res)=>{
    console.log("howa hit")
    res.json("verified")
}

export {signupUser,loginUser,verify}