import React, { Component } from 'react';
import {
  Button, TextField, Dialog, DialogActions, LinearProgress,
  DialogTitle, DialogContent, Card, CardContent, CardActions
} from '@material-ui/core';
import './dashboard.css';
import { Pagination } from '@material-ui/lab';
import swal from 'sweetalert';
import { withRouter } from './utils';
const axios = require('axios');


class Dashboard extends Component {
  constructor() {
    super();
    this.state = {
      token: '',    
      openTaskModal: false,
      openTaskEditModal: false,
      id: '',
      name: '',
      description: '',
      category: '',
      file: '',
      page: 1,
      search: '',
      tasks: [],
      pages: 0,
      loading: false
    };
  }


  componentDidMount = () => {
    let token = localStorage.getItem('token');
    if (!token) {
      this.props.navigate("/login");
    } else {
      this.setState({ token: token }, () => {
        this.getTask();
      });
    }
  }


  getTask = () => {

    this.setState({ loading: true });

    let data = '?';
    data = `${data}page=${this.state.page}`;
    if (this.state.search) {
      data = `${data}&search=${this.state.search}`;
    }
    axios.get(`https://localhost:2000/get-task${data}`, {
      headers: {
        'token': this.state.token
      }
    }).then((res) => {
      this.setState({ loading: false, tasks: res.data.tasks, pages: res.data.pages });
    }).catch((err) => {
      swal({
        text: err.response.data.errorMessage,
        icon: "error",
        type: "error"
      });
      this.setState({ loading: false, tasks: [], pages: 0 },()=>{});
    });
  }


//To delete the task
deleteTask = (id) => {
  axios.delete(`https://localhost:2000/delete-task/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      'token': this.state.token
    }
  }).then((res) => {
    swal({
      text: res.data.title,
      icon: "success",
      type: "success"
    });
    this.setState({ page: 1 }, () => {
      this.pageChange(null, 1);
    });
  }).catch((err) => {
    swal({
      text: err.response.data.errorMessage,
      icon: "error",
      type: "error"
    });
  });
}



//for page change
  pageChange = (e, page) => {
    this.setState({ page: page }, () => {
      this.getTask();
    });
  }


  logOut = () => {
    localStorage.setItem('token', null);
    this.props.navigate("/");
  }


onChange = (e) => {
  this.setState({ [e.target.name]: e.target.value }, () => { });
  if (e.target.name === 'search') {
    this.setState({ page: 1 }, () => {
      this.getTask();
    });
  } 
};


//To add task
addTask = () => {
  const file = new FormData();
  file.append('name', this.state.name);
  file.append('description', this.state.description);
  file.append('category', this.state.category);
  axios.post('https://localhost:2000/add-task', file, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'token': this.state.token
      
    }
  }).then((res) => {

    swal({
      text: res.data.title,
      icon: "success",
      type: "success"
    });

    this.handleTaskClose();
    this.setState({ name: '', description: '', category: '', page: 1 }, () => {
      this.getTask();
    });
  }).catch((err) => {
    console.error("Error sending data1:", err);
    swal({
      text: err.response.data.errorMessage,
      icon: "error",
      type: "error"
    });
    this.handleTaskClose();
  });

}


updateTask = () => {
  const file = new FormData();
  file.append('id', this.state.id);
  file.append('name', this.state.name);
  file.append('description', this.state.description);
  file.append('category', this.state.category);

  axios.put('https://localhost:2000/update-task', file, {
    headers: {
      'content-type': 'multipart/form-data',
      'token': this.state.token
    }
  }).then((res) => {

    swal({
      text: res.data.title,
      icon: "success",
      type: "success"
    });

    this.handleTaskEditClose();
    this.setState({ name: '', description: '', category: '' }, () => {
      this.getTask();
    });
  }).catch((err) => {
    swal({
      text: err.response.data.errorMessage,
      icon: "error",
      type: "error"
    });
    this.handleTaskEditClose();
  });

}


  handleTaskOpen = () => {
    this.setState({
      openTaskModal: true,
      id: '',
      name: '',
      description: '',
      category: ''
    });
  };


  handleTaskClose = () => {
    this.setState({ openTaskModal: false });
  };


handleTaskEditOpen = (data) => {
  this.setState({
    openTaskEditModal: true,
    id: data._id,
    name: data.name,
    description: data.description,
    category: data.category,
  });
};


  handleTaskEditClose = () => {
    this.setState({ openTaskEditModal: false });
  };

  
  render() {
    return (
      <div>
        {this.state.loading && <LinearProgress size={40} />}
        <div>
          <h2 style={{ color: 'black', fontWeight: 'bold' }}>Dashboard</h2>
          <Button
            className="button_style"
            variant="contained"
            color="primary"
            size="small"
            onClick={this.handleTaskOpen}
            style={{
              backgroundColor: '#000fff', // Your desired background color
              color: 'white' 
            }}
          >
            Add Task
          </Button>
          <Button
            className="button_style"
            variant="contained"
            size="small"
            onClick={this.logOut}
            style={{
              backgroundColor: 'black', // Your desired background color
              color: 'white' 
            }}
          >
            Log Out
          </Button>
        </div>

        {/* Edit Task */}
        <Dialog
          open={this.state.openTaskEditModal}
          onClose={this.handleTaskClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
              padding:"2%",
              background: 'linear-gradient(135deg, rgb(0, 102, 255) 0%, rgb(0, 204, 255) 100%)',
              color: 'white',
              width:"100vw",
              borderRadius: '20px'
            }
          }}
          
        >
          <DialogTitle id="alert-dialog-title"
          >Edit Task</DialogTitle>
          <DialogContent>
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Task Name"
              required
             
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="description"
              value={this.state.description}
              onChange={this.onChange}
              placeholder="Description"
              required
            
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="category"
              value={this.state.category}
              onChange={this.onChange}
              placeholder="Category"
              required
            /><br />

          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleTaskEditClose} color="primary"
            style={{
              margin:'1%',
              backgroundColor: 'black', // Your desired background color
              color: 'white'
            }}>
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.description == '' || this.state.category == ''}
              onClick={(e) => this.updateTask()} color="primary" autoFocus
              style={{
                backgroundColor: '#000fff', // Your desired background color
                color: 'white'
              }}>
              
              Edit Task
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Task */}
        <Dialog 
          open={this.state.openTaskModal}
          onClose={this.handleTaskClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            style: {
              padding:'2%',
              background: 'linear-gradient(135deg, rgb(0, 102, 255) 0%, rgb(0, 204, 255) 100%)',
              color: 'white',
              width:"100vw",
              borderRadius: '20px'
            }
          }}
        >
          <DialogTitle id="alert-dialog-title">Add Task</DialogTitle>
          <DialogContent>
          <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="name"
              value={this.state.name}
              onChange={this.onChange}
              placeholder="Task Name"
              required
             
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="description"
              value={this.state.description}
              onChange={this.onChange}
              placeholder="Description"
              required
            
            /><br />
            <TextField
              id="standard-basic"
              type="text"
              autoComplete="off"
              name="category"
              value={this.state.category}
              onChange={this.onChange}
              placeholder="Category"
              required
            /><br />

          </DialogContent>

          <DialogActions>
            <Button onClick={this.handleTaskClose} color="primary"
            style={{
              backgroundColor: 'black', // Your desired background color
              color: 'white'
            }}>
              Cancel
            </Button>
            <Button
              disabled={this.state.name == '' || this.state.description == '' || this.state.category == ''}
              onClick={(e) => this.addTask()} color="primary" autoFocus
              style={{
                backgroundColor: '#000fff',
                color: 'white'
              }}>
              Add Task
            </Button>
          </DialogActions>
        </Dialog>

        <br />
        <TextField
            id="standard-basic"
            type="search"
            autoComplete="off"
            name="search"
            value={this.state.search}
            onChange={this.onChange}
            placeholder="Search by task name"
            required
          />
        <div className="card-container">

        
          {this.state.tasks.map((task) => (
            <Card key={task._id} className="task-card">
              <CardContent style={{ overflow: 'hidden' }}>
                <h3>{task.name}</h3>
                <p>Description: {task.description}</p>
                <p>Category: {task.category}</p>
              </CardContent>
              <CardActions>
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => this.handleTaskEditOpen(task)}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => this.deleteTask(task._id)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </div>

        <br />

        <Pagination count={this.state.pages} page={this.state.page} onChange={this.pageChange} color="primary"/>

      </div>
    );
  }
}

export default withRouter(Dashboard);
