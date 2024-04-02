export default {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'vizmed-api-node',
      version: '1.0.0',
      description: 'The API documentation of our Final Year Project VizMed',
      license: {
        name: 'MIT',
        url: 'https://choosealicense.com/licenses/mit/',
      },
      contact: {
        name: 'Muhammad Abdullah',
        url: 'https://github.com/Abd-Labs',
        email: 'abdulla152535@gmail.com',
      },
    },
    basePath: '/api',
    servers: [
      {
        url: 'http://localhost:8080/api/',
      },
    ],
  },
  tags: [
    {
      "name": "User",
      "description": "API for users"
    }
  ],
  apis: [
    "src/models/*.js",
    "src/utils/helpers/*.js",
    "src/api/controllers/user/*.js",
    "src/api/controllers/user/edit/*.js",
    "src/api/controllers/user/auth/*.js"
  ]
};