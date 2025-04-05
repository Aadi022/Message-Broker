const secret="server123";
const jwt= require("jsonwebtoken");

function isAuthenticated(req,res,next){
    const authHeader= req.headers.authorization;
    //If the there exists no token in the authorization header or it doesn't start with a bearer, then return with a forbiddenn status code
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        res.status(403).json({});   
    }

    const token= authHeader.split(' ')[1];

    try{
        const decoded= jwt.verify(token,secret);
        req.user_email= decoded.email;
        req.user_name= decoded.name;
        next();   //Moves out of the middleware to the api routes
    }
    catch{
        res.status(403).json({});
    }
}

module.exports= isAuthenticated;