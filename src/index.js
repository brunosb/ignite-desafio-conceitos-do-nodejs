const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(404).json({error: "User not found!"});
  }

  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userFinded = users.find(user => user.username === username);

  if(userFinded) {
    return response.status(400).json({error: "User exists!"});
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  } 

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    deadline: new Date(deadline),
    done: false,
    created_at: new Date()
  }

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;
  const { id } = request.params;

  const todoFindedIndex = user.todos.findIndex(todo => todo.id === id);
  
  if(todoFindedIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos[todoFindedIndex] = Object.assign(user.todos[todoFindedIndex], {
    title,
    deadline: new Date(deadline)
  });
  

  return response.json(user.todos[todoFindedIndex]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFindedIndex = user.todos.findIndex(todo => todo.id === id);
  
  if(todoFindedIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos[todoFindedIndex].done = true;

  return response.json(user.todos[todoFindedIndex]);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoFindedIndex = user.todos.findIndex(todo => todo.id === id);
  
  if(todoFindedIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoFindedIndex, 1);

  return response.status(204);
});

module.exports = app;