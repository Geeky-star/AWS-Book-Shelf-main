const express = require("express");
const app = express();
const cors = require('cors');  
const { randomUUID } = require('crypto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const process = require("dotenv").config()

const corsOptions = {
  credentials: true,
  origin: 'http://localhost:3000',  // Ensure this matches your React frontend's origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin,X-Requested-With,Content-Type,Accept,Authorization',
 
};

app.use(cors(corsOptions));
app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bcrypt = require("bcryptjs");

const jwt = require('jsonwebtoken');

const jwtSecret = process.env.jwtSecret

// Remove unused AWS SDK import
const AWS = require("aws-sdk");


const s3 = new AWS.S3();

const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand, QueryCommand } = require("@aws-sdk/lib-dynamodb");
const { resourceUsage } = require("process");


// Create DynamoDB client with the appropriate AWS region
const client = new DynamoDBClient({
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.ACCESS_KEY, // Use environment variables instead
    secretAccessKey: process.env.SECRET_ACCESS_KEY // Use environment variables instead
  }
});

const docClient = DynamoDBDocumentClient.from(client);

// Configure Multer for handling file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');  // Files will be stored in the 'uploads/' folder
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));  // Add a timestamp to the filename
  }
});

const upload = multer({ storage });

// Route to handle file upload
async function uploadFile(file){
  try {
      const fileContent = fs.readFileSync(file.path);  // Read file content
      const params = {
          Bucket: process.env.BUCKET,  // Replace with your S3 bucket name
          Key: file.filename,         // File name in S3
          Body: fileContent,              // File content
          ContentType: file.mimetype  // File MIME type
      };

      // Uploading files to the bucket
      const data = await s3.upload(params).promise();
      
      // Deleting the file from local storage after uploading to S3
      fs.unlinkSync(file.path);

      return {
          message: 'File uploaded successfully!',
          fileUrl: data.Location  // S3 file URL
      }
  } catch (error) {
      console.error('Error uploading file:', error);
      return { message: 'File upload failed', error };
  }
}


async function addBook(data,file) {
    const uid = randomUUID()
    data.book_id = uid
    data.book_rating = "5"
    data.datetime = Date.now();
    data.storage_id = ""
    const result = await uploadFile(file)
    console.log(`result - ${JSON.stringify(result)}`)
    if(result){
      data.storage_id = result.fileUrl;
    }
  const params = {
    TableName: "Books",
    Item: data
  };

  try {
    const data = await docClient.send(new PutCommand(params));
    console.log('book added:', JSON.stringify(data));
  } catch (error) {
    console.error("Error adding product:", error);
  }
}

async function getProduct(email, password) {
    console.log(`Verifying user with email: ${email}`);

    const params = {
        TableName: "People",
        Key: {
            email: email
        }
    };

    try {
        const data = await docClient.send(new GetCommand(params));

        // Check if user exists
        if (!data.Item) {
            throw new Error('User not found');
        }

        // Compare the hashed password stored in the database with the provided password
        const isPasswordValid = await bcrypt.compare(password, data.Item.password); // Assuming the password is stored hashed

        if (!isPasswordValid) {
            throw new Error('Invalid credentials');
        }

        // Password is valid, return the user data (excluding password)
        const user = { ...data.Item };
        delete user.password; // Don't return the password in response

        return user;
    } catch (error) {
        console.error("Error verifying user:", error);
        throw error;  // Rethrow to handle in calling function
    }
}


async function getAllBooks() {
  const params = {
    TableName: "Books"
  };

  try {
    const data = await docClient.send(new ScanCommand(params)); // Use ScanCommand for retrieving all items
    console.log('Books retrieved:', JSON.stringify(data.Items)); // data.Items contains all the records
    return JSON.stringify(data.Items);
  } catch (error) {
    console.error("Error retrieving books:", error);
    throw new Error("Error retrieving books");
  }
}

async function getMyBooks(email) {
  const params = {
    TableName: "Books",
    IndexName: "author_email-index", // Use this if `author_email` is part of a GSI
    KeyConditionExpression: "author_email = :email",
    ExpressionAttributeValues: {
      ":email": email
    }
  };

  try {
    const data = await docClient.send(new QueryCommand(params)); // Use QueryCommand for fetching specific items
    console.log('Books retrieved:', JSON.stringify(data.Items)); // data.Items contains all the records
   let result = []
   result.push(JSON.stringify(data))
    return result;
  } catch (error) {
    console.error("Error retrieving books:", error);
    throw new Error("Error retrieving books");
  }
}

// Call functions to add and get product
//addProduct();
//getProduct();

async function addUser(email, password) {
    // Hash the password before storing it in the database
    const hashedPassword = await bcrypt.hash(password, 8);
console.log("email-password - ",email,password)
    const params = {
        TableName: "People",
        Item: {
          id: randomUUID(),
            email: email,         // Key
            password: hashedPassword, // Store the hashed password
            // You can add more user attributes here if needed
        }
    };

    try {
        const data = await docClient.send(new PutCommand(params));
        console.log('User added:', JSON.stringify(data));
        return { success: true, message: "User added successfully" };
    } catch (error) {
        console.error("Error adding user:", error);
        return null;
    }
}


app.post("/register", (req, res) => {
    const { email, password } = req.body; // Extract email and password
    const user = {email,password}
    console.log(`Email: ${email}, Password: ${password}`);
    if(addUser(email,password)){
      jwt.sign(user, jwtSecret, {}, (err, token) => {
        if (err) throw err;
       res.cookie('token', token, {
          httpOnly: true,
          secure: false,  // Set to true if you're using HTTPS
          sameSite: 'None'  // Required for cross-origin cookies
      }).json(user);
    })
     //   res.status(200).send({message:"User registered successfully"});
    }
   else{
    res.status(204).send("User not added!")
   }
  });

  app.post("/signIn", (req, res) => {
    const { email, password } = req.body;
  
    // Simulate user authentication logic here
    const user = { email }; // Placeholder user object
  
    if (user) {
      const token = jwt.sign({ email }, jwtSecret, { expiresIn: '1h' });
  
      // Set the JWT token in a cookie
      res.cookie('token', token, {
        httpOnly: true,        // Prevent access by JavaScript on the frontend
        secure: false,         // Set to true if using HTTPS
        sameSite: 'Lax',       // Allows sending cookies across sites with specific limitations
      });
  
      return res.status(200).json({ message: "Login successful" });
    } else {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });
  
  
app.get("/allBooks",async (req,res)=>{
  const result = await getAllBooks()
   if(result){
    res.send({status:200,message:"Books retrieved successfully.",data:JSON.parse(result)})
   }
   else{
    res.send({status:400,message:"Some Issue in retrieving books."})
   }
})

app.post("/myBooks", async (req, res) => {
  // Log the cookies to verify if the token is present
  console.log('Cookies:', req.cookies);

  const { token } = req.cookies;  // Extract token from cookies
  console.log(`token - ${token}`);

  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, user) => {
      if (err) {
        console.error("JWT verification error:", err);
        return res.status(401).send({ message: "Unauthorized" });
      }

      console.log(`user logged in with token - ${user}`);
      const result = await getMyBooks(user?.email);
      if (result) {
        return res.status(200).send({ message: "Books retrieved successfully.", data: JSON.parse(result) });
      } else {
        return res.status(200).send({ message: "Some issue in retrieving books." });
      }
    });
  } else {
    return res.status(401).json({ message: "Token not found, unauthorized" });
  }
});

app.post("/addBook",upload.single('file'), async (req,res)=>{
  const params = req.body;
  const file = req.file;
  const result = await addBook(params,file);
  console.log(result);

  console.log(params);
})




app.listen(3005, () => {
  console.log("Server is running on port 3005");
});
