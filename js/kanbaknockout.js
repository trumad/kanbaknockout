
function TodoViewModel(id, content, status) {
    const self = this;
    self.id = ko.observable(id);
    self.content = ko.observable(content);
    self.status = ko.observable(status);
    self.editing = ko.observable(false);

    self.startEditing = function () {
        self.editing(true);
    };

    self.stopEditing = function () {
        self.editing(false);
        self.patchTodo();
        return false;
    };

    self.patchTodo = function () {
        appViewModel.patchTodo({
            id: self.id(),
            content: self.content(),
            status: self.status(),
        });
    };
}





function AppViewModel() {
    const self = this;
    self.message = ko.observable('Just getting started...');
    self.todos = ko.observableArray();

    self.createNewTodo = async function () {
        self.message("arse");
        await self.createTodo({ content: "" });
    };

    self.syncTodos = async function () {
        const serverTodos = await fetchTodos();
        self.todos(serverTodos.map(todo => new TodoViewModel(todo.id, todo.content, todo.status)));
    };

    self.createTodo = async function ({ content }) {
        const newTodo = await createTodo({ content });
        if (newTodo) {
            const newTodoViewModel = new TodoViewModel(newTodo.id, newTodo.content, newTodo.status);
            self.todos.push(newTodoViewModel);
                newTodoViewModel.startEditing();
        }
    };

    self.patchTodo = async function (updatedTodo) {
        const patchedTodo = await patchTodo(updatedTodo);
        if (patchedTodo) {
            const existingTodo = self.todos().find(todo => todo.id() === patchedTodo.id);
            existingTodo.id(patchedTodo.id);
            existingTodo.content(patchedTodo.content);
            existingTodo.status(patchedTodo.status);
            console.log(existingTodo);
        }
    };

    self.syncTodos();
}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

async function fetchTodos() {
    return await fetchRequestToApi({ url: "http://localhost:3003/todos" });
}

async function createTodo({content = ""}) {
    const postData = {
        content,
        status: "new"
    }
    return await fetchRequestToApi({ url: "http://localhost:3003/todos", method: "POST", postData });
}

async function patchTodo({id, content, status}) {
    const patchData = {
        content,
        status
    }
    return await fetchRequestToApi({ url: `http://localhost:3003/todos/${id}`, method: "PATCH", postData: patchData });
}

async function fetchRequestToApi({ url, method = 'GET', postData = undefined }) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json', 
        },
        body: postData ? JSON.stringify(postData) : undefined,
      });
  
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching data:', error.message);
      throw error; 
    }
  }


