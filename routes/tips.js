const express = require('express');
const router = express.Router();

router.get('/tip1', (req, res, next)=>{
    res.render("tip1");
});

router.get('/tip2', (req, res, next)=>{
    res.render("tip2");
});

router.get('/tip3', (req, res, next)=>{
    res.render("tip3");
});

module.exports = router;