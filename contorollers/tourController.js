const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

const catchAsync = require('./../utils/catchAsync');
// 
exports.aliasTopTours = (req, res, next) =>{
    req.query.limit ='5'
    req.query.sort='-ratingsAverage,price';
    req.query.fields ='name,price,ratingsAverage,difficulty';
    next();
}


exports.getAllTours =catchAsync (async(req, res,next) => {
    const features = new APIFeatures(Tour.find(),req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;
        res.status(200).json({
            status: 'OK',
            results: tours.length, 
            data: {
                tours: tours 
            }
        });
})

exports.getTour =catchAsync ( async (req, res,next) => {
    const tour= await Tour.findById(req.params.id);
    res.status(200).json({
            status: 'OK',
            data: {
                 tour
            }
        });
})


exports.createTour = catchAsync(async (req, res) => {
    const newTour = await Tour.create(req.body);//"req.body" that's the data that comes with the post request
        res.status(201).json({
            status: 'ok',
            data: {
                tour: newTour // Sending the newly created tour in the response 
            }
        });
})

exports.updateTour = catchAsync( async (req, res,next) => {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
        new: true ,
        runValidators: true
    });
    res.status(200).json({
        status: 'OK',
        data: {
            tour
        }
    }   
    ) 
})

exports.deleteTour = catchAsync(async (req, res,next) => {
    await Tour.findByIdAndDelete(req.params.id)
        
        res.status(204).json({
            status: 'OK',
            data: null
   })
})

exports.getTourStats =catchAsync(async (req, res,next) => {
    const stats = await Tour.aggregate([
        {
            /*I'm gonna start with match, and match is basically to slect or to filter
            certain documents */
            $match : {
                ratingsAverge: {
                    $gte: 4.5
                }
            }
        },
        {
            $group : {
                _id: { $toUpper: '$difficulty' },
                avgRating: { $avg: '$ratingsAverge' },
                numTours: { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgPrice: { $avg: '$price' },
                minPrice: { $min: '$price' },
                maxPrice: { $max: '$price' }

            }
        },
        {
          $sort: { avgPrice: 1 }//use fields from thr group
        }
    ])
    console.log(stats);
    res.status(200).json({
        status: 'success',
        data: {
          stats : stats
        }
    });
})

exports.getMonthlyPlan = catchAsync(async (req, res,next) => {
    const year = req.params.year * 1; // 2021
  
      const plan = await Tour.aggregate([
        {
            /*what unwind is gonna do si basically deconstruct an array field
            from the info documents and then output one document for each element
            of array */
            $unwind : '$startDates'
        },
        {
            $match: {
              startDates: {
                $gte: new Date(`${year}-01-01`),
                $lte: new Date(`${year}-12-31`)
              }
            }
        },
        {
          $group: {
            _id: { $month: '$startDates' },
            numTourStarts: { $sum: 1 },
            tours: { $push: '$name' }//create array fo tours
          }
        },
        {
          $addFields: { month: '$_id' }
        },
        {
          $project: {
            _id: 0 //make it the _id no longer shows up if put 1 it would acutaly show up
          }
        },
        {
          $sort: { numTourStarts: -1 }
        },
        {
          $limit: 12
        }
      ]);
  
      res.status(200).json({
        status: 'success',
        data: {
          plan
        }
      });
});
  