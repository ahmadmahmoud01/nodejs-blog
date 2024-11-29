import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0', // Swagger version
        info: {
            title: 'My API Docs', // Title of the API
            version: '1.0.0', // API version
            description: 'A simple Express API CRUD using Swagger',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Server URL
            },
        ],
    },
    apis: ['./controllers/*.js'], // Path to the routes where Swagger will scan for API endpoints
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
