const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const Razorpay = require("Razorpay");
const app = express();
const bcrypt = require("bcrypt");
const saltRounds = 10;

app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}));
app.use(express.static('public'));

mongoose.connect("mongodb://localhost:27017/hoteldb",{useNewUrlParser:true});

const HotelSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Email required"]
    },
    email:{
        type:String,
        required:[true,"Email required"]
    },
    password:{
        type:String,
        required:[true,"Password required"]
    }
});

const roomSchema = new mongoose.Schema({

    checkindate:{
        type:String,
        required:[true,"Check in date required"]
    },
    checkoutdate:{
        type:String,
        required:[true,"Check out date required"]
    },
    adults:{
        type:Number,
        required:[true,"Number of adults required"]
    },
    children:{
        type:Number,
        required:[true,"Number of children required"]
    },
    infants:{
        type:Number,
        required:[true,"Number of infants required"]
    },
    num:{
        type:Number,
        required:[true,"Hotel number required"]
    }
});

const login = new mongoose.model("Login",HotelSchema);

// creating models

const firstroom = new mongoose.model("Roomone",roomSchema);
const secondroom = new mongoose.model("Roomtwo",roomSchema);
const thirdroom = new mongoose.model("Roomthree",roomSchema);
const fourthroom = new mongoose.model("Roomfour",roomSchema);
const fifthroom = new mongoose.model("RoomFive",roomSchema);

//end of models

app.get("/",function(req,res){  
    //res.sendFile(__dirname+"/home.html");
    res.sendFile(__dirname+"/signup.html");
});
app.get("/login",function(req,res){
    
    res.sendFile(__dirname+"/login.html");
});

app.post("/abc",function(req,res){
    res.render("success",{result:"Success"});
});

app.post("/login",function(req,res){
    login.findOne({email:req.body.email},function(err,result){
        if(err){
            console.log("Error");
        }
        else{
            if(result === null){
                res.render("success",{result:"Email-ID not found"});
            }
            else{
                if(result){
                    bcrypt.compare(req.body.password,result.password,function(err,callbac){
                        if(callbac === true){
                            res.sendFile(__dirname+"/home.html");
                        }
                        else{
                            res.render("success",{result:"Password Not Found"});
                        }
                    });
                }
            }
        }
    });
});
app.post("/signup",function(req,res){

    bcrypt.hash(req.body.password,saltRounds,function(err,hash){
        const user = new login({
            name:req.body.name,
            email:req.body.email,
            password:hash
        });
        login.find({email:req.body.email},function(err,result){
            if(err){
                console.log("Error detected!");
            }
            else{
                if(result.length != 0){
                    res.render("success",{result:"Email-ID already registered"});
                }
                else{
                    
                    login.find({},function(err,answer){
                        if(err){
                            console.log("Error detected");
                        }
                        else{
                            let f = false;
                            for(let i=0;i<answer.length;i++){
                                console.log("hello");
                                let pp =answer[i].password;
                                bcrypt.compare(req.body.password,pp,function(err,callbac){
                                    if(err){
                                        console.log("Error");
                                    }
                                    if(callbac === true){
                                        f = false;
                                    }
                                    else{
                                        f = true;
                                    }
                                });
                                if(f === false){
                                    break;
                                }
                            }
                            if(f){
                                res.sendFile(__dirname+"/home.html");
                                user.save();
                            }
                            else{
                                res.render("success",{result:"Password already exists"});
                            }
                        }
                    });
                    
                }
            }
        });
    });
});
app.get("/signup",function(req,res){
    res.sendFile(__dirname+"/signup.html");
});
app.post("/jumplogin",function(req,res){
    res.sendFile(__dirname+"/login.html");
});

app.post("/newroute",function(req,res){
    if(req.body.input === "Erumdadam- The Treehouse"){
        res.sendFile(__dirname+"/hotel1.html");
    }
    else if(req.body.input === "Le Tranquil"){
        res.sendFile(__dirname+"/hotel2.html");
    }
    else if(req.body.input === "Quinta Da Santana Luxury Villa"){
        res.sendFile(__dirname+"/hotel3.html");
    }
    else if(req.body.input === "Paddle HouseBoats 1"){
            let count = 0;        
            fourthroom.find({},function(err,records){
            if(err){
                console.log("Error detected !");
            }
            else{
                count = 10-records.length;
                res.render("hotel4",{bc:count});
            }
        });
    }
    else{
        res.sendFile(__dirname+"/hotel5.html");
    }
});

app.post("/checkrooms",function(req,res){
    if(req.body.index == 1){
        const fi = new firstroom({
            checkindate:req.body.checkin,
            checkoutdate:req.body.checkout,
            adults:req.body.adults,
            children:req.body.children,
            infants:req.body.infants,
            num:1
        });
        firstroom.find({},function(err,records){
            records.forEach(function(item){
                var v = new Date();
                var year = v.getFullYear();
                var month = v.getMonth()+1;
                if(month<10){
                    month='0'+month;
                }
                let day = v.getDate();
                if(day <10){
                    day='0'+day;
                }
                var ff=0;
                var check_out_param;
                let array = item.checkoutdate.split("-");
                if( array[0] == year && array[1] == month && array[2] == day){
                    check_out_param = item.checkoutdate;
                    firstroom.deleteOne({checkoutdate:check_out_param},function(err,obj){
                        if(err){
                            console.log("Error detected");
                        }
                        else{
                            console.log("Deleted successfully");
                        }
                    });
                }
            }); 
        });
        firstroom.find({},function(err,records){

            let current_check_in = new Date(req.body.checkin); 
            let current_check_out = new Date(req.body.checkout);
    
            if(err){
                console.log("Error found!");
            }
            else{
                let flag = true;
                    records.forEach(function(item){
                        //check invalid dates
                        const checking_in = new Date(item.checkindate);
                        const checking_out = new Date(item.checkoutdate);
    
                        if( (current_check_in>=checking_in &&  current_check_in<= checking_out )  ){
                            flag=false;
                        }
                        if( (current_check_out>=checking_in && current_check_out<=checking_out ) ){
                            flag=false;
                        }
                        if(current_check_in <= checking_in && current_check_out >=checking_out){
                            flag=false;
                        }
                    });
    
                    if(flag == true){
                        //fi.save();
                        res.render("booking",{index:1,data:JSON.stringify(fi)});
                    }
                    else{
                        res.render("success",{result:"Rooms Unavailable"});
                    }
            }
        });
    }
    else if(req.body.index == 2){
        const se = new secondroom({
            checkindate:req.body.checkin,
            checkoutdate:req.body.checkout,
            adults:req.body.adults,
            children:req.body.children,
            infants:req.body.infants,
            num:2
        });
        secondroom.find({},function(err,records){
            records.forEach(function(item){
                var v = new Date();
                var year = v.getFullYear();
                var month = v.getMonth()+1;
                if(month<10){
                    month='0'+month;
                }
                let day = v.getDate();
                if(day <10){
                    day='0'+day;
                }
                var ff=0;
                var check_out_param;
                let array = item.checkoutdate.split("-");
                if( array[0] == year && array[1] == month && array[2] == day){
                    check_out_param = item.checkoutdate;
                    secondroom.deleteOne({checkoutdate:check_out_param},function(err,obj){
                        if(err){
                            console.log("Error detected");
                        }
                        else{
                            console.log("Deleted successfully");
                        }
                    });
                }
            }); 
        });
        secondroom.find({},function(err,records){

            let current_check_in = new Date(req.body.checkin); 
            let current_check_out = new Date(req.body.checkout);
    
            if(err){
                console.log("Error found!");
            }
            else{
                let flag = true;
                    records.forEach(function(item){
                        //check invalid dates
                        const checking_in = new Date(item.checkindate);
                        const checking_out = new Date(item.checkoutdate);
    
                        if( (current_check_in>=checking_in &&  current_check_in<= checking_out )  ){
                            flag=false;
                        }
                        if( (current_check_out>=checking_in && current_check_out<=checking_out ) ){
                            flag=false;
                        }
                        if(current_check_in <= checking_in && current_check_out >=checking_out){
                            flag=false;
                        }
                    });
                    if(flag == true){
                        //se.save();
                        res.render("booking",{index:2,data:JSON.stringify(se)});
                    }
                    else{
                        res.render("success",{result:"Rooms Unavailable"});
                    }
            }
        });
    }
    //third hotel
    else if(req.body.index == 3){
        console.log(req.body.index);
        const th = new thirdroom({
            checkindate:req.body.checkin,
            checkoutdate:req.body.checkout,
            adults:req.body.adults,
            children:req.body.children,
            infants:req.body.infants,
            num:3
        });
        //delete records of checkout == today
        thirdroom.find({},function(err,records){
            records.forEach(function(item){
                var v = new Date();
                var year = v.getFullYear();
                var month = v.getMonth()+1;
                if(month<10){
                    month='0'+month;
                }
                let day = v.getDate();
                if(day <10){
                    day='0'+day;
                }
                var ff=0;
                var check_out_param;
                let array = item.checkoutdate.split("-");
                if( array[0] == year && array[1] == month && array[2] == day){
                    check_out_param = item.checkoutdate;
                    thirdroom.deleteOne({checkoutdate:check_out_param},function(err,obj){
                        if(err){
                            console.log("Error detected");
                        }
                        else{
                            console.log("Deleted successfully");
                        }
                    });
                }
            }); 
        });
        thirdroom.find({},function(err,records){

            let current_check_in = new Date(req.body.checkin); 
            let current_check_out = new Date(req.body.checkout);
    
            if(err){
                console.log("Error found!");
            }
            else{
                let flag = true;
                    records.forEach(function(item){
                        //check invalid dates
                        const checking_in = new Date(item.checkindate);
                        const checking_out = new Date(item.checkoutdate);
    
                        if( (current_check_in>=checking_in &&  current_check_in<= checking_out )  ){
                            flag=false;
                        }
                        if( (current_check_out>=checking_in && current_check_out<=checking_out ) ){
                            flag=false;
                        }
                        if(current_check_in <= checking_in && current_check_out >=checking_out){
                            flag=false;
                        }
                    });
    
                    if(flag == true){
                        //th.save();
                        res.render("booking",{index:3,data:JSON.stringify(th)});
                    }
                    else{
                        res.render("success",{result:"Rooms Unavailable"});
                    }
            }
        });
    }
    else if(req.body.index == 4){
        const xy = new fourthroom({
            checkindate:req.body.checkin,
            checkoutdate:req.body.checkout,
            adults:req.body.adults,
            children:req.body.children,
            infants:req.body.infants,
            num:4
        });
        var count = 0;
        //wipe out data if checkout == today's date
        fourthroom.find({},function(err,records){
            records.forEach(function(item){
                var v = new Date();
                var year = v.getFullYear();
                var month = v.getMonth()+1;
                if(month<10){
                    month='0'+month;
                }
                let day = v.getDate();
                if(day <10){
                    day='0'+day;
                }
                var ff=0;
                var check_out_param;
                let array = item.checkoutdate.split("-");
                if( array[0] == year && array[1] == month && array[2] == day){
                    check_out_param = item.checkoutdate;
                    fourthroom.deleteOne({checkoutdate:check_out_param},function(err,obj){
                        if(err){
                            console.log("Error detected");
                        }
                        else{
                            console.log("Deleted successfully");
                        }
                    });
                }
            }); 
        });
        
        //insert new records
        fourthroom.find({},function(err,records){

            if(err){console.log("Error");}
            else{
                if(records.length == 10){
                    res.render("success",{result:"No Boats are available!"});
                }
                else{   
                    //xy.save();
                    res.render("booking",{index:4,data:JSON.stringify(xy)});
                }
            }
        });
    }
    else if(req.body.index == 5){
        const ab = new fifthroom({
            checkindate:req.body.checkin,
            checkoutdate:req.body.checkout,
            adults:req.body.adults,
            children:req.body.children,
            infants:req.body.infants,
            num:5
        });
        fifthroom.find({},function(err,records){
            records.forEach(function(item){
                var v = new Date();
                var year = v.getFullYear();
                var month = v.getMonth()+1;
                if(month<10){
                    month='0'+month;
                }
                let day = v.getDate();
                if(day <10){
                    day='0'+day;
                }
                var ff=0;
                var check_out_param;
                let array = item.checkoutdate.split("-");
                if( array[0] == year && array[1] == month && array[2] == day){
                    check_out_param = item.checkoutdate;
                    fifthroom.deleteOne({checkoutdate:check_out_param},function(err,obj){
                        if(err){
                            console.log("Error detected");
                        }
                        else{
                            console.log("Deleted successfully");
                        }
                    });
                }
            }); 
        });
        fifthroom.find({},function(err,records){

            let current_check_in = new Date(req.body.checkin); 
            let current_check_out = new Date(req.body.checkout);
    
            if(err){
                console.log("Error found!");
            }
            else{
                let flag = true;
                    records.forEach(function(item){
                        //check invalid dates
                        const checking_in = new Date(item.checkindate);
                        const checking_out = new Date(item.checkoutdate);
    
                        if( (current_check_in>=checking_in &&  current_check_in<= checking_out )  ){
                            flag=false;
                        }
                        if( (current_check_out>=checking_in && current_check_out<=checking_out ) ){
                            flag=false;
                        }
                        if(current_check_in <= checking_in && current_check_out >=checking_out){
                            flag=false;
                        }
                    });
    
                    if(flag == true){
                        //ab.save();
                        res.render("booking",{index:5,data:JSON.stringify(ab)});
                    }
                    else{
                        res.render("success",{result:"Rooms Unavailable"});
                    }
            }
        });
    }
});
app.post("/confirmbooking",function(req,res){
    let obj = req.body.number;
    obj = JSON.parse(obj);
    if(obj.num === 1){
        firstroom.insertMany([obj],function(err,respone){
            if(err){
                console.log("Error");
            }
        });
        res.render("payment",{index:1});
    }
    else if(obj.num == 2){
        secondroom.insertMany([obj],function(err,respone){
            if(err){
                console.log("Error");
            }
        });
        res.render("payment",{index:2});
    }
    else if(obj.num == 3){
        thirdroom.insertMany([obj],function(err,respone){
            if(err){
                console.log("Error");
            }
        });
        res.render("payment",{index:3});
    }
    else if(obj.num == 4){
        fourthroom.insertMany([obj],function(err,respone){
            if(err){
                console.log("Error");
            }
        });
        res.render("payment",{index:4});
    }
    else{
        fifthroom.insertMany([obj],function(err,respone){
            if(err){
                console.log("Error");
            }
        });
        res.render("payment",{index:5});
    }
});
app.listen(3000,function(){
    console.log("App listening on port 3000.");
});