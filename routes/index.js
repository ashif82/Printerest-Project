var express = require('express');
var router = express.Router();
const userModal= require("./users");
const postModal= require("./post");
const passport = require('passport');
const localStrategy = require("passport-local")
passport.use(new localStrategy(userModal.authenticate()))
const upload = require("./multer");



router.get('/', function(req, res, next) {
  res.render('index',{nav:false});
});

router.get("/register", function(req,res){
  res.render("register",{nav:false})
})
router.get("/profile",isLoggedIn, async function(req,res){
  const user = await userModal.findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("profile",{user,nav:true})
})
router.get("/show",isLoggedIn, async function(req,res){
  const user = await userModal.findOne({username:req.session.passport.user})
  .populate("posts")
  res.render("show",{user,nav:true})
})
router.get("/feed",isLoggedIn, async function(req,res){
  const user = await userModal.findOne({username:req.session.passport.user})
  const posts = await postModal.find()
 .populate("user")
 res.render("feed",{user,posts,nav:true})
})

router.get("/add",isLoggedIn, async function(req,res){
  const user = await userModal.findOne({username:req.session.passport.user})
  res.render("add",{user,nav:true })
})
router.post("/createpost",isLoggedIn,upload.single("postImage"), async function(req,res){
  const user = await userModal.findOne({username:req.session.passport.user})
   const post = await postModal.create({
    user:user._id,
    title:req.body.title,
    description:req.body.description,
    Image:req.file.filename
  })
  user.posts.push(post._id)
  await user.save();
  res.redirect("/profile")
  
})
router.post("/fileupload",isLoggedIn,upload.single("image"), async function(req,res){
  const user = await userModal.findOne({username:req.session.passport.user})
  user.profileImage = req.file.filename;
   await user.save();
   res.redirect("profile")
})



router.post("/register" ,function(req,res){
  const data= new userModal({
    username:req.body.username,
    email:req.body.email,
    name:req.body.fullname,
    contect:req.body.contect
  })
  userModal.register(data,req.body.password)
  .then(function(){
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile")
    })
  })
})
router.post("/login",passport.authenticate("local",{
  successRedirect:"/profile",
  failureRedirect:"/",
}), function(req,res){

})
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next()
  }
  res.redirect("/")
}

 


module.exports = router;
