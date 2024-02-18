const fs = require('fs'); 
const Tour = require('./../models/tourModel');
const { query } = require('express');

exports.getAllTours =async (req, res) => {
    try {
        console.log(req.query);
        //Build Query
        //1)Filtring
        const queryObj = {...req.query};
        const excludeFields = ['page','sort','limit','fields'];
        excludeFields.forEach(el=>delete queryObj[el]);
        //2) Advance filtring (gte,gt,lt,lte)
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, match=>`$${match}`); 
        console.log("JSON.parse(queryStr)=",JSON.parse(queryStr));  
        
        const query = await Tour.find(JSON.parse(queryStr));// return query
        //Execute Query
        const tours = await query;
        
        //Send Response
        res.status(200).json({
            
            status: 'OK',
            
            results: tours.length, // Number of tours in the data
            
            data: {
                tours: tours // Sending the array of tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.getTour = async (req, res) => {
    try {
       
        const tour= await Tour.findById(req.params.id);
        //Tour.findOne({_id: req.params.id})

        res.status(200).json({
            status: 'OK',
            data: {
                 tour
            }
        
        });
    }catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

exports.createTour = async (req, res) => {
    try{
        //create() return a promise 
        const newTour = await Tour.create(req.body);//"req.body" that's the data that comes with the post request
        res.status(201).json({
            status: 'ok',
            data: {
                tour: newTour // Sending the newly created tour in the response 
            }
        });
    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
    
}

exports.updateTour = async (req, res) => {
    
    try{
        const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
            new: true ,
            runValidators: true
        });
        res.status(200).json({
            status: 'OK',
            data: {
                /*In fact "tour"==== " tour : "tour" "
                so the tour property is set the "tour" object, but thanks to ES6, we no longer have to do that
                when the property nams has the same name of the value  */
                tour
            }
    }
        
    )
    }catch(err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}

exports.deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id)
        
        res.status(204).json({
            status: 'OK',
            data: null
   })
    }catch(err){

    res.status(400).json({
        status: 'fail',
        message: err})
   
    }
}