import { DataTypes } from 'sequelize'
import { sequelize } from './sequelize.js'; // Import the Sequelize instance

// Define a User model
const Blog = sequelize.define('Blog', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    snippet: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    body: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
}, { timestamps: true });

export default Blog;