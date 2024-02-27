const express = require('express');
const router = express.Router();
const HouseSchema = require('Models/House');
const multer = require('multer');


router.post('/house', async (req, res) => {
    //Crear un usuario
    let house = HouseSchema({
        state: req.body.state,
        city: req.body.city,
    })

    house.save().then((result) => {
        res.send(result)
    }).catch((err) => {        
            res.send({"status" : "error", "message" :err.message})
    })
})

module.exports = router