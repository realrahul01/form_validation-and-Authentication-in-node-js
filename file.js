


// without using express js in your project this is how server will be look in node js

// const http = require('http')

// const fs = require('fs')

// const home = fs.readFileSync(('./index.html'))   // to read a file

// const server = http.createServer((req,res)=>{
//     if(req.url == '/'){
//         res.end(home)
//     }
//     else if(req.url == '/about'){
//         res.end("<h1>About page</h1>")
//     }
//     else{
//         res.end("<h1>Page is not found</h1>")
//     }
    
// })

// server.listen(5000, ()=>{
//     console.log('server is working')
// })



// using ejs or pug
import express from 'express'
import mongoose from 'mongoose'
import cookieParser from 'cookie-parser'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const app = express()
app.set("view engine", "ejs")
mongoose.connect('mongodb://127.0.0.1:27017',{
    dbName: "backend"
}).then(()=>console.log("connect with database"))
.catch((err)=>console.log(err))

const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password:String
})

const User = mongoose.model("User", userSchema)



import path from 'path'

// let user = []


// using middlwware here
app.use(express.urlencoded({extended:true}))  // this is the middleware which helps to read data from the form 
app.use(express.static(path.join(path.resolve(), "public")))
app.use(cookieParser())


const isAuthenticated = async (req,res,next)=>{
    const {token} = req.cookies
    if(token){
        const decoded = jwt.verify(token, "ljfnwlfnwelfnwlefn")
        req.user = await User.findById(decoded._id)
        console.log(decoded)
        // console.log(req.user)
        next()
    }else{
        res.redirect('/login')
    }    
}


app.get('/',isAuthenticated, async (req,res)=>{
    console.log(req.user)
    res.render('logout',{name:req.user.name})
})


app.post('/login', async (req,res)=>{
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.redirect('/register')
    }

    const isMatch = await bcrypt.compare(password, user.password)


    if(!isMatch){
        return res.render('login', {message: "Incorrect password",email:user.email})
    }

    const token = await jwt.sign({_id:user.id}, "ljfnwlfnwelfnwlefn")

        res.cookie('token', token,{
            httpOnly:true,
            expires: new Date(Date.now() + 60*1000)
        })
        res.redirect("/")

})

app.post('/register', async (req,res)=>{

    console.log(req.body)
    const {name, email,password} = req.body
    
    let user = await User.findOne({email})
    if(user){
        return res.redirect('/login')
    }

    const hashedPassword = await bcrypt.hash(password,10) 

    user = await User.create({
        name,
        email,
        password:hashedPassword
    })


    const token = jwt.sign({_id:user._id}, "ljfnwlfnwelfnwlefn")
    console.log(token)

    res.cookie("token", token,{
        httpOnly:true, 
        expires: new Date(Date.now() + 60*1000)  // 60 sec 
    })
    res.redirect("/")
})


app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/register', async (req,res)=>{
    res.render("register")
})


app.get('/logout', (req,res)=>{
    res.cookie("token", null, {
        httpOnly:false,
        expires: new Date(Date.now())
    })
    res.redirect('/')
})












app.listen(3000, (req,res)=>{
    console.log('server is working')
})