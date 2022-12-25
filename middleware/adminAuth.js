exports.adminauth = (req, res, next)=>{
    if(!req.session.adminLogged){
        req.flash("error","you don't have privilege to access these routes");
        res.redirect('/');
    } else{
        next();
    }
}