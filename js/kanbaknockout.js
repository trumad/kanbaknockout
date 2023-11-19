

function AppViewModel() {
    const self = this;
    self.message = ko.observable('Just getting started...');

}



var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);


// eslint-disable-next-line
async function fetchTodos(){
    return await fetchFromApi({url: "http://localhost:3000/todos"});
}

async function fetchFromApi({ url, method = 'GET', postData = undefined }) {
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


