const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


// npm install express @prisma/client
// npx prisma generate

// check database
// npx prisma studio
