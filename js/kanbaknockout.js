const state = {
    someProperty: ko.observable('Our property');
};

ko.store.setState(state);

function ViewModel1(params) {
    const self = this;
    self.someProperty = params.someProperty; // from the app state, mapped by mapStateToParams
}

function mapStateToParams(state) { // 'state' here is the result of getState()()

    // the properties of the returned object will be attached to params
    // when the view model is instantiated
    return {
         someProperty: state.someProperty
    };
}

const AppViewModel = connect(mapStateToParams)(ViewModel1);

// function AppViewModel(params) {
//     const self = this;
//     self.message = ko.observable('Just getting started...');
//     self.cats = params.cats;    // from the state object, see mapStateToParams below
//     self.selectCat = function(cat) {
//         params.selectedCat(cat);    // also from the state object
//     }

// }



var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);



async function fetchTodos(){
    return await fetchFromApi({url: "http://localhost:3000/todos"});
}

async function fetchFromApi({ url, method = 'GET', postData = undefined }) {
    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json', // Adjust the content type as needed
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
      throw error; // Re-throw the error for the calling code to handle
    }
  }


  