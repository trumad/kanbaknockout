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
    self.ordering = ko.observableArray();

    self.createNewTodo = async function () {
        await self.createTodo({ content: "" });
    };

    self.syncOrdering = async function (){
        const ordering = await fetchOrdering();
        self.ordering(ordering);
    }

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

    self.updateOrdering = async function (ordering){
        const patchedOrdering = await updateOrdering(ordering);
        if (patchedOrdering){
            self.ordering(patchedOrdering);
        }
    }

    self.patchTodo = async function (updatedTodo) {
        const patchedTodo = await patchTodo(updatedTodo);
        if (patchedTodo) {
            const existingTodo = self.todos().find(todo => todo.id() === patchedTodo.id);
            existingTodo.content(patchedTodo.content);
            existingTodo.status(patchedTodo.status);
        }
    };

    self.orderedTodos = ko.computed(function () {
        const ordering = self.ordering();
        return self.todos().slice().sort(function (a, b) {
            const aIndex = ordering.indexOf(a.id());
            const bIndex = ordering.indexOf(b.id());
            return aIndex - bIndex;
        });
    });

    self.filteredTodos = function (status) {
        return ko.computed(function () {
            return ko.utils.arrayFilter(self.orderedTodos(), function (todo) {
                return todo.status() === status;
            });
        });
    };

    self.syncData = async function () {
        await self.syncOrdering();
        await self.syncTodos();
    };

    self.syncData();

    dragula([
        document.querySelector("#new-swimlane"),
        document.querySelector("#in_progress-swimlane"),
        document.querySelector("#done-swimlane"),

    ])
        // .on("drag", function(el) {
        //
        // })
        .on("drop", async function(el, source) {
            console.log(el);
            console.log(source);
            const oldStatus = el.getAttribute("itemstatus");
            const id = el.getAttribute("itemid");
            const newStatus = source.id.split("-swimlane")[0];
            const newOrdering = calculateCurrentOrdering();
            await self.updateOrdering(newOrdering);
            await self.patchTodo({id, status: newStatus});
            if (oldStatus !== newStatus){
                el.remove();
            }
        })
    // .on("over", function(el, container) {
    // })
    // .on("out", function(el, container) {
    // });

}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

function calculateCurrentOrdering(){
    let ordering = [];
    const allTodos = document.querySelectorAll("li");
    for (let el of allTodos){
        const id = el.getAttribute("itemid");
        ordering.push(Number(id));
    }
    return ordering;
}

async function fetchOrdering(){
    const ordering = await fetchRequestToApi({ url: "http://localhost:3003/ordering" });
    return ordering.order;
}

async function updateOrdering(orderingArray){
    const response = await fetchRequestToApi({url: "http://localhost:3003/ordering", method: "PATCH", postData: {order: orderingArray}});
    return response.order;
}

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


