const dao = require('../model/UserDaoMongo');
const passUtil = require('../util/PasswordUtil');

exports.getAll = async function(req,res){ // REST get (all) method
    res.status(200); // 200 = Ok
    res.send(await dao.readAll()); //send the users back to the client
    res.end(); 
}

exports.get = function(req,res){ //REST get (one) method
    //URL parameter always on req.params.<name>
    let id = req.params.id; //get param and convert to int
    let found = dao.read(id);

    if(found !== null){ //We found the requested user
        res.status(200); //200 = OK
        res.send(found); //Send the found user
    }
    else{ //The requested id does not exist
        res.status(404); //404 = Not Found
        res.send({msg:'User not found.'}); //send a message
    }
    res.end(); //ends the response (only 1 end per response)
}

exports.postCreateOrUpdate = function(req,res){
    let newuser = {}; //empty obj
    newuser.name = req.body.txt_name;
    newuser.login = req.body.txt_login;
    newuser.password = passUtil.hashPassword(req.body.txt_pass);
    newuser.permission = parseInt(req.body.txt_perm);

    if(req.body.txt_id){
        //update user
        console.log('Update user');
        dao.update(newuser);
    }
    else{
        //insert user
        dao.create(newuser);        
    }
    res.redirect('users.html');
}

exports.deleteOne = function(req,res){
    //URL parameter always on req.params.<name>
    let id = req.params.id; //get param and convert to int    
    
    let user = req.session.user;
    //if(user!=null && user.permission===1){ //extra layer of security using session, not always necessary   
        dao.del(id);
    //}
    res.redirect('../users.html');
}

exports.login = async function(req, res){
    let plogin = req.body.txt_login;
    let pwd = passUtil.hashPassword(req.body.txt_pass);
    let user = await dao.login(plogin, pwd);
    console.log(user);
    if(user != null){ //login successful
        user.password = null; //for security
        //Save the user in the session
        req.session.user = user;
        res.redirect('index.html');
    }
    else{ //incorrect login or password
        res.redirect('login.html?error=1');
    }
}

exports.loggedUser = function(req,res){
    res.status(200); // 200 = Ok
    res.send( req.session.user ); //send the logged user
    res.end(); 
}

exports.logout = function(req, res){
    req.session.user = null;
    res.redirect('index.html');
}