import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app =express();
const port = 3000;
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

var email=null;
const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"users",
    password:"7864842",
    port:5432
});


db.connect();





app.get("/",(req,res)=>{
res.render("index.ejs");
});
app.get("/register",(req,res)=>{
    res.render("index.ejs");
})

app.post("/register",async (req,res)=>{
try{
    await db.query("INSERT into newuser(name,email,password) values($1,$2,$3)",[req.body.name,req.body.email,req.body.password]);
    res.render("login.ejs");
}catch(err){
console.log(err);
res.render("index.ejs",{error:"User already existed"});
}
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");

})

app.post("/login",async (req,res)=>{

    try{
        let userlogin = {
            email:req.body.email,
            password:req.body.password
        }
            const dboutput= await db.query("select * from newuser where email = $1",[req.body.email])
            console.log(dboutput.rows);
            const username = dboutput.rows[0].name;
            email = dboutput.rows[0].email;
            console.log(email);
            let dob = dboutput.rows[0].dob;
            if(dob != null){
                dob= dob.toLocaleDateString();
            }
            
            if(email == userlogin.email && dboutput.rows[0].password == userlogin.password ){
                res.render("home.ejs",{username:username,email:email,age:dboutput.rows[0].age,gender:dboutput.rows[0].gender,phone_number:dboutput.rows[0].phone_number,dob:dob});
            }else{
                res.render("login.ejs",{error:"Email or password is wrong"});
            }        
    }catch(err){
        console.log(err);
        res.render("login.ejs",{error:"Email or password is wrong"});
    }
});

app.post("/updation",async (req,res)=>{
    try{
        const age= req.body.age;
        const phone_number = req.body.phone_number;
        const gender = req.body.gender;
        const dob= req.body.dob;
        console.log(email);
        const updated= await db.query(`UPDATE newuser set age=$1, phone_number=$2, gender=$3, dob=$4 where email=$5 returning *;`,
        [age,phone_number,gender,dob,email]);
        res.render("home.ejs",{age:updated.rows[0].age,gender:updated.rows[0].gender,phone_number:updated.rows[0].phone_number,dob:updated.rows[0].dob.toLocaleDateString(),email:email,username:updated.rows[0].name});

    }catch(err){
        console.log(err);
    }
})




app.listen(port,()=>{
    console.log("server is running");
})