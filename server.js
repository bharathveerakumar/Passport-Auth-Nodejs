require('dotenv').config()

const express=require('express')
const passport=require('passport')
const session=require('express-session')
const flash=require('express-flash')
const multer=require('multer')
const localStrategy=require('passport-local').Strategy
const app=express()

//Instead of database I use this to store User data
const users=[]


//Own module import
const crypt=require('./crypt')


//Server Port
app.listen(process.env.PORT||5000, ()=>{
    console.log('listening')
})


//Middlewares
app.set('view engine', 'ejs')
app.set('views', 'views/')
app.use(session({
    secret:process.env.SESSION_SECRET,
    saveUninitialized:true,
    resave:true
}))
app.use(flash())
app.use(multer().single('images'))
app.use(passport.initialize())
app.use(passport.session())


passport.use(new localStrategy(
    async function(username, password, done){
        let user=users.find((data)=>username==data.username)
        let psMatch=await crypt.compare(password, user.password)
        if(user&&psMatch) done(null, user)
        else done(null, false)
    }
))

passport.serializeUser((user, done)=>{
    return done(null, user.username)
})

passport.deserializeUser((name, done)=>{
    let user=users.find((data)=>data.username==name)
    return done(null, user)
})



app.get('/', isAuthenticated, (req, res)=>{
    res.render('home', { name:req.user.username })
})

app.get('/register', isNotAuthenticated, (req, res)=>{
    res.render('register')
})

app.get('/login', isNotAuthenticated, (req, res)=>{
    res.render('login')
})

app.post('/register', async (req, res)=>{
    try{
        let user=users.find((user)=>user.username==req.body.username)
        if(user) res.status(200).send(`${req.body.username} already exists....`)
        else{
            let hashkey=await crypt.cryption(req.body.password)
            users.push({
                username:req.body.username,
                email:req.body.email,
                password:hashkey
            })
            res.redirect('/login')
        }
    }catch{
        if(err) res.send(err)
    }
})

app.post('/login', passport.authenticate('local', {
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:'wrong password'
}))

function isAuthenticated(req, res, next){
    if(req.isAuthenticated()) next()
    else res.redirect('/login')
}

function isNotAuthenticated(req, res, next){
    if(req.isAuthenticated()) res.redirect('/')
    else next()
}