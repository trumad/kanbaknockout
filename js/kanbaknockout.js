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

    self.handleKeyPress = function (data, event) {
        // Check if the pressed key is Enter (keyCode 13)
        if (event.keyCode === 13 && !event.metaKey && !event.shiftKey) {
            // Submit the form or perform any other action
            // For example, you can call a function to handle form submission
            self.stopEditing();
        }
        // Allow the default behavior for other keys
        return true;
    };
}

function AppViewModel() {
    const self = this;
    self.todos = ko.observableArray();
    self.ordering = ko.observableArray();

    self.compactCards = ko.observable(false, {persist: 'compactDisplay'});

    self.toggleCompact = function (){
        self.compactCards(!self.compactCards())
    }

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
    dragulaHelper(self);

}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

function dragulaHelper(self){
    dragula([
        document.querySelector("#new-swimlane"),
        document.querySelector("#in_progress-swimlane"),
        document.querySelector("#done-swimlane"),

    ])
        .on("drag", function(el) {
            el.classList.add('is-moving');
        })
        .on("dragend", function(el) {
            el.classList.remove('is-moving');
        })
        .on("drop", async function(el, source) {
            const oldStatus = el.getAttribute("itemstatus");
            const id = el.getAttribute("itemid");
            const newStatus = source.id.split("-swimlane")[0];
            const newOrdering = calculateCurrentOrdering();
            await self.updateOrdering(newOrdering);
            await self.patchTodo({id, status: newStatus});
            if (oldStatus !== newStatus){
                el.remove();
            }
        });
}

function calculateCurrentOrdering(){
    let ordering = [];
    const allTodos = document.querySelectorAll("li");
    for (let el of allTodos){
        const id = el.getAttribute("itemid");
        ordering.push(Number(id));
    }
    return ordering;
}



