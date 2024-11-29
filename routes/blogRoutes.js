import express from 'express';
import blogController from '../controllers/blogController.js';
import isAuthenticated from '../middlewares/auth.js';

const router = express.Router();

router.get('/', isAuthenticated, blogController.getAllBlogs);
router.get('/:id', isAuthenticated, blogController.getBlogById);
router.post('/', isAuthenticated, blogController.createBlog);
router.put('/:id', isAuthenticated, blogController.updateBlog);
router.delete('/:id', isAuthenticated, blogController.deleteBlog);

export default router;
