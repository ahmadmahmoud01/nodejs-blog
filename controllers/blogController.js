import Blog from '../models/blog.js';
import pusher from '../utils/pusher.js';

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT  # This specifies that the token format is JWT
 * security:
 *   - BearerAuth: []  # This will apply the Bearer token security to all routes
 * 
 * /api/blogs:
 *   get:
 *     summary: Get all blogs
 *     description: Retrieve all blogs, ordered by creation date.
 *     security:
 *       - BearerAuth: []  # This route requires Bearer token authentication
 *     responses:
 *       200:
 *         description: A list of blogs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   snippet:
 *                     type: string
 *                   body:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Error retrieving blogs
 */
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({ order: [['createdAt', 'ASC']] });
        res.status(200).json(blogs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving blogs' });
    }
};


/**
 * @openapi
 * /api/blogs/{id}:
 *   get:
 *     summary: Get a single blog by ID
 *     description: Retrieve a single blog by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to retrieve
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []  # This route requires Bearer token authentication
 *     responses:
 *       200:
 *         description: A single blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 snippet:
 *                   type: string
 *                 body:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Error retrieving blog
 */
const getBlogById = async (req, res) => {
    const blogId = req.params.id;

    try {
        const blog = await Blog.findByPk(blogId);

        if (blog) {
            res.status(200).json(blog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error retrieving blog' });
    }
};


/**
 * @openapi
 * /api/blogs:
 *   post:
 *     summary: Add a new blog
 *     description: Create a new blog post with title, snippet, and body. A real-time notification will be triggered to all clients subscribed to the `blogs-channel` whenever a new blog is created.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               snippet:
 *                 type: string
 *               body:
 *                 type: string
 *             required:
 *               - title
 *               - snippet
 *               - body
 *     security:
 *       - BearerAuth: []  # This route requires Bearer token authentication
 *     responses:
 *       201:
 *         description: Blog created successfully and notification sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 title:
 *                   type: string
 *                 snippet:
 *                   type: string
 *                 body:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 message:
 *                   type: string
 *                   description: A message indicating that a real-time notification has been triggered.
 *                   example: "A new blog has been created!"
 *       500:
 *         description: Error creating blog
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error creating blog"
 */
const createBlog = async (req, res) => {
    const { title, snippet, body } = req.body;

    try {
        // Create new blog
        const blog = await Blog.create({ title, snippet, body });

        // Trigger a pusher event
        pusher.trigger('blogs-channel', 'new-blog', {
            message: 'A new blog has been created!',
            blog,
        });

        // Send the created blog as a response
        res.status(201).json(blog);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating blog' });
    }
};


/**
 * @openapi
 * /api/blogs/{id}:
 *   put:
 *     summary: Edit a blog
 *     description: Update a blog post with new title, snippet, and body.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to update
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               snippet:
 *                 type: string
 *               body:
 *                 type: string
 *             required:
 *               - title
 *               - snippet
 *               - body
 *     security:
 *       - BearerAuth: []  # This route requires Bearer token authentication
 *     responses:
 *       200:
 *         description: Blog updated successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Error updating blog
 */
const updateBlog = async (req, res) => {
    const blogId = req.params.id;
    const { title, snippet, body } = req.body;

    try {
        const [affectedRows] = await Blog.update({ title, snippet, body }, { where: { id: blogId } });

        if (affectedRows > 0) {
            res.status(200).json({ message: 'Blog updated successfully' });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating blog' });
    }
};


/**
 * @openapi
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a blog
 *     description: Delete a blog post by its ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the blog to delete
 *         schema:
 *           type: integer
 *     security:
 *       - BearerAuth: []  # This route requires Bearer token authentication
 *     responses:
 *       200:
 *         description: Blog deleted successfully
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Error deleting blog
 */
const deleteBlog = async (req, res) => {
    const blogId = req.params.id;

    try {
        const deletedRows = await Blog.destroy({ where: { id: blogId } });

        if (deletedRows > 0) {
            res.status(200).json({ message: 'Blog deleted successfully' });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting blog' });
    }
};


export default { getAllBlogs, getBlogById, createBlog, updateBlog, deleteBlog };

