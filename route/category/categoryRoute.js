const express=require('express')
const {createCategoryCtrl,
fetchCategoriesCtrl,
fetchsingleCategoryCtrl,
updateCategoryCtrl,
deleteCategoryCtrl} = require('../../controllers/Category/categoryController')
authMiddleware = require('../../middleware/auth/authMiddleware')
const categoryRoute=express.Router()
categoryRoute.post('/',authMiddleware,createCategoryCtrl)
categoryRoute.get('/',fetchCategoriesCtrl)
categoryRoute.get('/:id',fetchsingleCategoryCtrl)
categoryRoute.put('/:id',authMiddleware,updateCategoryCtrl)
categoryRoute.delete('/:id',authMiddleware,deleteCategoryCtrl)
module.exports=categoryRoute