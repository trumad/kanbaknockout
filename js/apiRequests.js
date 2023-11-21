
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
