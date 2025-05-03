//code by John Rey Vilbar
//tenks ChatGPT for helping me to correct some portions



//Display manager name in navbar
var managerName = sessionStorage.managerName
document.getElementById('manager-name').innerHTML = managerName;


//retrieves data from the database and inserts it to the table
function init(){
    // Destroy the existing DataTable if it exists
    var table = $('#dataTable').DataTable();
    if (table) {
        table.destroy();
    }
    
    //get the data from the SQLite database
    eel.person_info()(data => {
        //convert the data to JSON
        var personInfo = JSON.parse(data);

        //check if spinner exists
        if(document.getElementById("spinner") == null){
            //do nothing
        } else {
            document.getElementById("spinner").remove();
        }

        //check if personInfo is empty
        if(personInfo.length == 0){
            //show the div containing the message
            document.getElementById('noPersonRecord').style.display = 'block';
            return;
        }

        //show the table
        document.getElementById('dataTableContainer').classList.remove('d-none');

        //insert data
        $(document).ready(function() {
            $('#dataTable').DataTable( {
            data: personInfo,
            columns: [
                {
                    data: null,
                    defaultContent: '',
                    orderable: false,
                    className: 'select-checkbox',
                    render: function () {
                        return '<input type="checkbox"/>';},
                    checkboxes: {
                        selectRow: true,
                        selectAllRender: '<input type="checkbox" class="select-checkbox"/>'}},

                { title: 'Person ID', data: 0, visible: false },
                { title: 'Name', data: 1 },
                { title: 'Status', data: 2 },
                { title: 'Email', data: 3 },
                { title: 'Mobile Number', data: 4 },
                { title: 'Address', data: 5 },
                { title: 'Ronin Address', data: 6, visible: false },
                { title: 'Facebook Link', data: 7, visible: false} ],

                select: {
                    style: 'multi',
                    selector: 'td:first-child' },

                order: [[ 2, 'asc' ]],
            });
        });

    });
}


//function to save preferences
//use localStorage to save 
function savePreference(){
    var inputPersonAddress = document.getElementById("defaultPersonAddress").value;
    var inputStatus = document.getElementById("defaultPersonStatus").value;

    //check if this form setPreferences is valid
    var form = document.getElementById("setPreferences");
    if (form.checkValidity() === false) {
        form.classList.add('was-validated');
        //shake the modal
        var modal = document.getElementById("userPreferences");
        modal.classList.add('animate__animated', 'animate__headShake');
        //remove the animation class after animation
        modal.addEventListener('animationend', () => {
            modal.classList.remove('animate__animated', 'animate__headShake');
        });
        return;
    }
    
    //set localStorage objects  
    window.localStorage.setItem("defaultPersonAddress", inputPersonAddress);
    window.localStorage.setItem("defaultPersonStatus", inputStatus);

    //debug
    var temp = [localStorage.getItem("defaultPersonAddress"), localStorage.getItem("defaultPersonStatus")]
    console.log("localStorage: " + temp);
    //show message
    showToast("Preferences saved");
    //close the modal
    $('#userPreferences').modal('hide'); 
}

//when the Preferences modal was opened
function preferencesModal(){
    //reset the appearance of the form
    var form = document.getElementById("setPreferences");
    form.classList.remove('was-validated');

    //check if localStorage has defaultPersonAddress and defaultPersonStatus
    if("defaultPersonAddress" in localStorage){
        document.getElementById("defaultPersonAddress").value = localStorage.getItem("defaultPersonAddress");
    }
    if("defaultPersonStatus" in localStorage){
        document.getElementById("defaultPersonStatus").value = localStorage.getItem("defaultPersonStatus");
    }

    //enable autocomplete in address input field
    autoComplete('#defaultPersonAddress');
}



//function to get data from selected rows
function rowData(arg){
    var table = $('#dataTable').DataTable();
    var data = table.rows('.selected').data();
    var temp = []

    if(arg == "all"){
        // Loop through the selected rows and log the data for each column
        for (var i = 0; i < data.length; i++) {
            temp.push(data[i])
        }
        return temp;
    } 
    else if(arg == "id"){
        for (var i = 0; i < data.length; i++) {
            temp.push(data[i][0])
        }
        return temp;
    }
}

//for Address input fields
function autoComplete(id){
      $(document).ready(function() {
        $.ajax({
          url: "js/philippine-cities.json",
          dataType: "json",
          success: function(citiesData) {
            $.ajax({
              url: "js/philippine-provinces.json",
              dataType: "json",
              success: function(provincesData) {
                var availableTags = citiesData.map(function(city) {
                  var province = provincesData.find(function(prov) {
                    return prov.key === city.province;
                  });
                  return {
                    label: city.name + ", " + province.name,
                    value: city.name
                  };
                });
                
                $(id).autocomplete({
                  source: availableTags,
                  select: function(event, ui) {
                    event.preventDefault();
                    $(id).val(ui.item.label);
                  }
                });
              }
            });
          }
        });
      });
}


//handles checkbox click events
function checkboxAction(){
    $('#dataTable').on('click', 'input[type="checkbox"]', function() {
        //data of selected row
        var row = $(this).closest('tr');

        //if the checkboxes are selected
        if (this.checked){
            //count the number of selected checkboxes
            var rowCount = $('td.select-checkbox :checkbox:checked').length;
            //change the background color of the selected row
            row.addClass('selected');
        } 
        else {
            var rowCount = $('td.select-checkbox :checkbox:checked').length;
            row.removeClass('selected');
        }

        console.log("Selected rows:" + rowCount);

        //enable/disable buttons
        if(rowCount == 1){
            document.getElementById("editBtn").classList.remove('disabled');
            document.getElementById("removeBtn").classList.remove('disabled');
        }
        else if (rowCount > 1){
            document.getElementById("editBtn").classList.add('disabled');
        }
        else {
            //disable Edit and Remove buttons
            document.getElementById("editBtn").classList.add('disabled');
            document.getElementById("removeBtn").classList.add('disabled');
        }
    });
}

//event listener for toggle button (Add modal >> Address field)
$('#useDefaultValues').change(function() {
    $('#labelEntryAddress').html('Address ' + ($(this).prop('checked') ? '(default)' : ''));
    document.getElementById('entryAddress').value = ($(this).prop('checked') ? localStorage.getItem("defaultPersonAddress") : '');
})


//call the starter function
init();
checkboxAction();


//-----------------------------------------------------------------
//This function handles the button actions in the modal
//action: Add, Update, Delete
function modalActionButton(action) {
    // Get the form in the currently displayed modal
    var modal = document.querySelector('.modal.show');
    var form = modal.querySelector('form');
  
    // Validate the form
    if(action == 'Add' | action == 'Update'){
        if (form.checkValidity() === false) {
        console.log("form invalid");
        //show the invalid input messages
        form.classList.add('was-validated');

        //animate the modal to shake
        modal.classList.add('animate__animated', 'animate__headShake');
        //remove the animation class after animation
        modal.addEventListener('animationend', () => {
            modal.classList.remove('animate__animated', 'animate__headShake');
        });
        //terminate the function if invalid form
        return;
        }
    } else {
        //Remove modal is opened
    }


    //If form is valid
    switch(action){
        case 'Add':
            var name = document.getElementById('entryName').value;
            var email = document.getElementById('entryEmail').value;
            var city = document.getElementById('entryAddress').value;
            var mobileNumber = document.getElementById('entryMobileNumber').value;
            var facebookLink = document.getElementById('entryFacebookLink').value;
            var roninAddress = document.getElementById('entryRoninAddress').value;
            //set value depending the state of use default toggle btn
            //if true, use the default value else 'idle'
            if($('#useDefaultValues').prop('checked') == true){
                var status = (localStorage.getItem("defaultPersonStatus") != '' ? localStorage.getItem("defaultPersonStatus") : 'idle');
            } else {
                var status = 'idle';
            }

            var entryData = [name, email, city, mobileNumber, facebookLink, roninAddress, status];
            console.log("entryData: " + entryData);

            //add entry to database
            addEntry(entryData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast(name + " is added to the guild.")
                    $('#addEntryModal').modal('hide');
                    //this is a workaround for this code: $(this).unbind('submit').submit()
                    //since ginareload niya ang page thus dili ma-display ang toast message
                    //destroy the dataTable element
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                }
            });
            //hide the modal
            $('#addEntryModal').modal('hide');
            break;

        case 'Update':
            var personID = document.getElementById('labelPersonID').textContent;
            var newName = document.getElementById('editName').value;
            var newStatus = document.getElementById('editStatus').value;
            var newEmail = document.getElementById('editEmail').value;
            var newCity = document.getElementById('editCity').value;
            var newMobileNumber = document.getElementById('editMobileNumber').value;
            var newFacebookLink = document.getElementById('editFacebookLink').value;
            var newRoninAddress = document.getElementById('editRoninAddress').value;
            var newData = [personID, newName, newStatus, newEmail, newCity, newMobileNumber, newFacebookLink, newRoninAddress];

            console.log('newData: ' + newData);
            console.log('personID: ' + personID);

            //update entry in database
            editEntry(newData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Updated information of " + newName)
                    //hide modal
                    $('#editEntryModal').modal('hide');
                    //destroy table
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //make the modal buttons disabled
                    document.getElementById("editBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
            });
            break;
        
        case 'Delete':
            var personID = rowData('id');

            console.log("selected rows to be removed: " + personID);

            //delete entry from database
            deleteEntry(personID).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Deleted")
                    $('#deleteEntryModal').modal('hide');
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //make the modal buttons disabled
                    document.getElementById("editBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
            });
            break;

    }
}

//function for Add, Edit, Remove buttons
function modalButtons(action){
    modal = document.getElementById(action);

    if(action == "formAdd" | action == "formEdit"){
        //needed to reset the appearance of the form (see https://getbootstrap.com/docs/5.0/forms/validation/)
        modal.classList.remove('was-validated');
    } else {
        console.log("Remove modal")
    }
    
    //what modal is opened
    switch(action){
        case "formAdd":
            modal.reset();
            autoComplete('#entryAddress');
            break;

        case "formEdit":

            //change from badge-success to badge-secondary
            var btn = document.getElementById("labelPersonID");
            btn.classList.add('badge-secondary');
            btn.classList.remove('badge-success');

            //enable autocomplete in address
            autoComplete('#editCity');

            var selectedData = rowData('all');
            //modify the input values in the modal for Edit button
            document.getElementById("editName").value = selectedData[0][1];
            document.getElementById("editEmail").value = selectedData[0][3];
            document.getElementById("editCity").value = selectedData[0][5];
            document.getElementById("editMobileNumber").value = selectedData[0][4];
            document.getElementById("editFacebookLink").value = selectedData[0][7];
            document.getElementById("editRoninAddress").value = selectedData[0][6];
            //show person ID in the modal
            document.getElementById("labelPersonID").innerHTML = selectedData[0][0] + '<i class="fas fa-regular fa-copy pl-2"></i>';
            //for modal Status combobox
            var status = selectedData[0][2];
            switch(status){
                case "active":
                    //reference: https://stackoverflow.com/a/17573451/19225183
                    $("#editStatus option[value=active]").prop("selected", "selected");
                    break;
                case "idle":
                    $("#editStatus option[value=idle]").prop("selected", "selected");
                    break;
                case "out":
                    $("#editStatus option[value=out]").prop("selected", "selected");
                    break;  }
            break;
        
        case "formRemove":
            break;
    }

}





//show a toast message
//https://www.jqueryscript.net/other/Toast-Notification-Library.html
function showToast(msg){
    $.toast({
        title: msg,
        position: 'bottom'
    });
}

//copy to clipboard
function copyToClipboard(value){
    navigator.clipboard.writeText(value);

    var btn = document.getElementById("labelPersonID");

    //change from badge-secondary to badge-success
    btn.classList.remove('badge-secondary');
    btn.classList.add('badge-success');




}

//print button
function generateReport(){
    //generate timestamp for footer
    var time = new Date();
    var x = time.getMonth()+1 +"/"+time.getDate()+"/"+time.getFullYear();
    var y = time.getHours()+":"+time.getMinutes();
    document.getElementById('right-footer').innerHTML = "Report generated on " + x + " " + y;
    //modify table title
    document.getElementById('table-title').innerHTML = "Persons in the system as of " + x;

    //print content
    element = document.getElementById('content');
    window.print(element);
}

//intermediary functions----------------------------------------------------
//bridge between python and javascript (through Eel framework)
//special thanks sa ChatGPT for helping me in this huhu
function addEntry(data) {
    return new Promise(resolve => {
        eel.person_addEntry(data)(data => {
        result = JSON.parse(data);
        if (result !== false) {
            resolve(true);
        } else {
            resolve(false);
        }
        });
    });
}

//update row sa database
function editEntry(data){
    return new Promise(resolve => {
        eel.person_editEntry(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

//delete row sa database
function deleteEntry(data){
    return new Promise(resolve => {
        eel.person_deleteEntry(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}