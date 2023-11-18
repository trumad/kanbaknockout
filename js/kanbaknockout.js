function AppViewModel() {
    this.message = ko.observable('Just getting started...');
}

var appViewModel = new AppViewModel();
ko.applyBindings(appViewModel);

const hi = "hi";

