var express = require("express"); // Importing Express framework for building web applications
var multer = require('multer'); // Importing multer for handling multipart/form-data
var app = express(); // Creating Express application
const bcrypt = require('bcrypt'); // Importing bcrypt for password hashing
var jwt = require('jsonwebtoken'); // Importing jsonwebtoken for user authentication
var cors = require('cors'); // Importing CORS for handling Cross-Origin Resource Sharing
var bodyParser = require('body-parser');  // Importing bodyParser for parsing request bodies
var path = require('path'); // Importing Mongoose for MongoDB object modeling
var mongoose = require("mongoose");
mongoose.connect("your/mongoDB/link"); // Connecting to MongoDB
var fs = require('fs'); // Importing fs module for file system operations
var user = require("./model/user.js"); // Importing user model
var task = require("./model/task.js"); // Importing task model
var https = require('https'); // Importing HTTPS module for creating HTTPS server
const { clear } = require("console"); // Importing clear method from console module
// SSL certificates
var privateKey = fs.readFileSync('/Users/Admin/Desktop/MERN/frontend/localhost+2-key.pem', 'utf8');
var certificate = fs.readFileSync('/Users/Admin/Desktop/MERN/frontend/localhost+2.pem', 'utf8');
var credentials = { key: privateKey, cert: certificate };

var upload = multer({ dest: 'uploads/' }); // Setting up multer for file uploads
app.use(cors()); // Enabling CORS
app.use(bodyParser.json()); // Parsing JSON-encoded bodies
app.use(bodyParser.urlencoded({ // Parsing URL-encoded bodies
  extended: false
}));

// Middleware for user authentication
app.use("/", (req, res, next) => {
  try {
    if (req.path == "/login" || req.path == "/register" || req.path == "/") {
      next();
    } else {
      // Verifying JWT token
      jwt.verify(req.headers.token, 'shhhhh11111', function (err, decoded) {
        if (decoded && decoded.user) {
          req.user = decoded;
          next();
        } else {
          return res.status(401).json({
            errorMessage: 'User unauthorized!',
            status: false
          });
        }
      })
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
})


// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    status: true,
    title: 'Apis'
  });
});



// Login API 
app.post("/login", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {
      user.find({ username: req.body.username }, (err, data) => {
        if (data.length > 0) {

          if (bcrypt.compareSync(data[0].password, req.body.password)) {
            checkUserAndGenerateToken(data[0], req, res);
          } else {

            res.status(400).json({
              errorMessage: 'Username or password is incorrect!',
              status: false
            });
          }

        } else {
          res.status(400).json({
            errorMessage: 'Username or password is incorrect!',
            status: false
          });
        }
      })
    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});


// Register API
app.post("/register", (req, res) => {
  try {
    if (req.body && req.body.username && req.body.password) {

      user.find({ username: req.body.username }, (err, data) => {

        if (data.length == 0) {

          let User = new user({
            username: req.body.username,
            password: req.body.password
          });
          User.save((err, data) => {
            if (err) {
              res.status(400).json({
                errorMessage: err,
                status: false
              });
            } else {
              res.status(200).json({
                status: true,
                title: 'Registered Successfully.'
              });
            }
          });

        } else {
          res.status(400).json({
            errorMessage: `UserName ${req.body.username} Already Exist!`,
            status: false
          });
        }

      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


// Function to generate token upon successful login
function checkUserAndGenerateToken(data, req, res) {
  jwt.sign({ user: data.username, id: data._id }, 'shhhhh11111', { expiresIn: '1d' }, (err, token) => {
    if (err) {
      res.status(400).json({
        status: false,
        errorMessage: err,
      });
    } else {
      res.json({
        message: 'Login Successfully.',
        token: token,
        status: true
      });
    }
  });
}


// API to add task
app.post("/add-task", upload.single('file'), (req, res) => {
  try {
    
    if (req.body && req.body.name && req.body.description && req.body.category) {

      let new_task = new task();
      new_task.name = req.body.name;
      new_task.description = req.body.description;
      new_task.category = req.body.category;
      new_task.user_id = req.user.id;
      new_task.save((err, data) => {
        if (err) {
          res.status(400).json({
            errorMessage: err,
            status: false
          });
        } else {
          res.status(200).json({
            status: true,
            title: 'Task Added successfully.'
          });
        }
      });

    } else {
      res.status(400).json({
        errorMessage: 'Add proper parameter first!',
        status: false
      });
    }
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


// API to update Task
app.put("/update-task", upload.single('file'), (req, res) => {
  try {
    
    if (req.body && req.body.name && req.body.description && req.body.category &&
      req.body.id ) {

      task.findById(req.body.id, (err, new_task) => {
        if (err || !new_task) {
          return res.status(400).json({
            errorMessage: "Task not found.",
            status: false
          });
        }

        // Update task fields
        if (req.body.name) {
          new_task.name = req.body.name;
        }
        
        if (req.body.description) {
          new_task.description = req.body.description;
        }
        
        if (req.body.category) {
          new_task.category = req.body.category;
        }
        
        // Save updated task
        new_task.save((err, data) => {
          if (err) {
            
            return res.status(400).json({
              errorMessage: err,
              status: false
            });
          } else {
            
            return res.status(200).json({
              status: true,
              title: 'Task updated.'
            });
          }
        });
      });

    } else {
      return res.status(400).json({
        errorMessage: 'Add proper parameters first!',
        status: false
      });
    }
  } catch (e) {
    return res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


// API to delete task
app.delete("/delete-task/:id", (req, res) => {
  try {
    const taskId = req.params.id;
    task.findByIdAndUpdate(taskId, { is_delete: true }, { new: true }, (err, data) => {
      if (err) {
        res.status(400).json({
          errorMessage: err,
          status: false
        });
      } else if (data && data.is_delete) {
        res.status(200).json({
          status: true,
          title: 'Task deleted.'
        });
      } else {
        res.status(400).json({
          errorMessage: 'Task not found or already deleted.',
          status: false
        });
      }
    });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }
});


//API to get and search task by pagination and search by name
app.get("/get-task", (req, res) => {
  try {
    var query = {};
    query["$and"] = [];
    query["$and"].push({
      is_delete: false,
      user_id: req.user.id
    });
    if (req.query && req.query.search) {
      query["$and"].push({
        name: { $regex: req.query.search }
      });
    }
    var perPage = 9;
    var page = req.query.page || 1;
    task.find(query, { date: 1, name: 1, id:1, description: 1, category: 1 })
      .skip((perPage * page) - perPage).limit(perPage)
      .then((data) => {
        task.find(query).count()
          .then((count) => {

            if (data && data.length > 0) {
              res.status(200).json({
                status: true,
                title: 'Task retrived.',
                tasks: data,
                current_page: page,
                total: count,
                pages: Math.ceil(count / perPage),
              });
            } else {
              res.status(400).json({
                errorMessage: 'There is no task!',
                status: false
              });
            }

          });

      }).catch(err => {
        res.status(400).json({
          errorMessage: err.message || err,
          status: false
        });
      });
  } catch (e) {
    res.status(400).json({
      errorMessage: 'Something went wrong!',
      status: false
    });
  }

});


// Creating HTTPS server
var httpsServer = https.createServer(credentials, app);
httpsServer.listen(2000, () => {
  console.log("HTTPS Server running on port 2000");

});

