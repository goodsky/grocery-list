# Grocery List

A little grocery list tool I made to practice what I've learned about React + Node.

## Setup

1. Install [Node.js](https://nodejs.org/en/download/)
1. Install [PostgreSQL 14](https://www.postgresql.org/download/) (for running locally)
   1. Run /scripts/setup-postgresql.ps1 to generate the DATABASE_URL for localhost
1. Configure .env with the following contents
   ```
   DATABASE_URL={output from setup-postgresql.ps1}
   ```
1. Run `npm install`
1. Run `npm build` (for backend)

## Tools & Tech

Here are the tools I'm using. Consider this an incomplete list since I'll likely forget to update this:

- Concurrently: run multiple npm scripts simultaneously
- Create-React-App: bootstrapping the React frontend project
- Cloud Flare: DNS
- ESLint: code quality
- Express: Node.js web host
- Heroku: simple cloud hosting
- Nodemon: host backend during development with hot reloading
- PostgreSQL: open source SQL database (hosted in Heroku)
- Prettier: code formatting

## Resources

Thanks to the following resources that I used while working on this project:

- https://fullstackopen.com/en/
- https://github.com/fullstack-hy2020/create-app
- https://www.freecodecamp.org/news/how-to-create-a-react-app-with-a-node-backend-the-complete-guide
