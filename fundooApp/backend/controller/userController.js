const userService = require("../service/userService")
/**
* @description:Requiring Bcrypt middleware function to create hash of the user password stored in database
**/
const bcrypt = require("../middleware/bcrypt")

class ControllerMethods {
    register(req, res) {
        let responseResult = {};
        try {
/**
* @description : checking the request body for validation using express-validator
**/            
            req.checkBody("firstName", "must be valid").notEmpty().isAlpha();

            req.checkBody("lastName", "must be valid").notEmpty().isAlpha();

            req.checkBody("userName", "userName must be valid").notEmpty().isEmail();

            req.checkBody("password", "password must be valid").notEmpty().matches(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,15}$/, "gm");

            req.checkBody("confirm", "should match password").notEmpty().matches(req.body.password)

            let errors = req.validationErrors();


            if (errors) {
                responseResult.success = false;
                responseResult.errors = errors;
                res.status(406).send(responseResult);
            } else {
                var userData = {
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    userName: req.body.userName,
                    password: bcrypt(req.body.password),
                    active: false
                }
                //  console.log("controller--->33",userData);

                userService.registrationService(userData).then(data => {
                    responseResult.status = true;
                    responseResult.message = "User Registered Successfully..!";
                    responseResult.data = data;
                    return res.status(201).send(responseResult);
                }).catch(err => {
                    return res.status(500).send(err)
                });
            }
        } catch (err) {
            return res.status(406).send(err)
        }
    }

    async login(req, res) {
        let responseResult = {};
        try {
            req.checkBody("userName", "userName must be valid").notEmpty().isEmail();

            // req.checkBody("password", "password must be valid").notEmpty().matches(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,15}$/, "gm");

            let errors = req.validationErrors();


            if (errors) {
                responseResult.success = false;
                responseResult.errors = errors;
                res.status(406).send(responseResult);
            } else {
                var userInfo = {
                    userName: req.body.userName,
                    password: req.body.password
                }
                let result = await userService.logInService(userInfo)
                // console.log("control--->", result);
                if (result.message === 'User is not registered ..!') {
                    return res.status(404).send(result.message)
                } else {
                    return res.status(200).send(result)
                }
            }
        } catch (err) {
            // console.log("controller--->59", err);

            return res.status(404).send(err)
        }
    }

    forget(req, res) {
        var varifyEmail = {
            userName: req.body.userName
        }
        userService.forgotPassword(varifyEmail).then(data => {
            return res.status(202).send(data)
        }).catch(err => {
            return res.status(400).send(err)
        })
    }

    reset(req, res) {
        let responseResult = {};
        try {
            req.checkBody("password", "password must be valid").notEmpty().matches(/^(?=.*[0-9]+.*)(?=.*[a-zA-Z]+.*)[0-9a-zA-Z]{6,15}$/, "gm");

            let errors = req.validationErrors();

            if (errors) {
                responseResult.success = false;
                responseResult.message = "provide correct information"
                responseResult.errors = errors;
                res.status(406).send(responseResult);
            } else {
                let idPassword = {
                    _id: req.decoded._id,
                    password: bcrypt(req.body.password)
                }
                userService.resetPassword(idPassword).then((data) => {
                    responceResult.status = true;
                    responceResult.message = "password reset successfully..!";
                    responceResult.data = data;
                    return res.status(200).send(responceResult)

                }).catch((err) => {
                    responceResult.status = false;
                    responceResult.message = "password not set..!";
                    responceResult.error = err;
                    return res.status(400).send(responceResult)

                })
            }
        } catch (err) {
            responceResult.status = false;
            responceResult.message = "Something went wrong..!";
            responceResult.error = err;
            return res.status(406).send(responceResult)
        }

    }

    allUsers(req, res) {
        let data = {
            _id: req.decoded._id,
            userName: req.decoded.userName,
            active: req.decoded.active
        }
        console.log("control--->109", data)
        userService.getAllUsers(data, (err, data) => {
            if (err) {
                return res.status(400).send(err)
            } else {
                return res.status(200).send(data)
            }
        })
    }

    imgUpload(req, res) {
        console.log("controller----->145", req.file);

        try {
            if (!req.decoded._id) {
                throw "id is not provided to find user"
            } else if (!req.file.location) {
                throw "AWS file location not found"
            }
            let image = {
                _id: req.decoded._id,
                imageUrl: req.file.location
            }
            console.log("controller---->151", image);

            userService.imageUpload(image).then((data) => {
                return res.status(200).send(data)
            }).catch((err) => {
                return res.status(422).send(err)
            })
        } catch (err) {
            return res.status(422).send(err)
        }
    }

}

module.exports = new ControllerMethods();
