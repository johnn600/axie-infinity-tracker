//code by John Rey Vilbar




//Display manager name in navbar
var managerName = sessionStorage.managerName
document.getElementById('manager-name').innerHTML = managerName;

//get account info
function init(){
    console.log("function init()");
    // Destroy the existing DataTable if it exists
    var table = $('#dataTable').DataTable();
    if (table) {
        table.destroy();
    }
    //get the data from the SQLite database
    eel.quota_info()(data => {
        //convert the data to JSON
        var quotaInfo = JSON.parse(data);
        
        //check if spinner exists
        if(document.getElementById("spinnerTable") == null){
            //do nothing
        } else {
            document.getElementById("spinnerTable").remove();
        }

        //show the table
        document.getElementById("dataTableContainer").classList.remove("d-none");

        //insert data
        $(document).ready(function() {
            $('#dataTable').DataTable( {
            data: quotaInfo,
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

                { title: 'Quota ID', data: 0, visible: false },
                { title: 'Date', data: 1 },
                { title: 'Scholar ID', data: 2, visible: false },
                { title: 'Scholar Name', data: 5 },
                { title: 'Account ID', data: 3, visible: false },
                { title: 'Account email', data: 6 },
                { title: 'SLP', data: 4 } ],

                select: {
                    style: 'multi',
                    selector: 'td:first-child' },


                order: [[ 2, 'desc' ]],
            });

            //add date range filter (from-date and to-date)
            var table = $('#dataTable').DataTable();
            $('#from-date').on('change', function(){
                table.draw();
            });
            $('#to-date').on('change', function(){
                table.draw();
            });

            $.fn.dataTable.ext.search.push(
                function( settings, data, dataIndex ) {
                    var from_date = $('#from-date').val();
                    var to_date = $('#to-date').val();
                    var column_date = data[1]; // the column index of the date column

                    if(from_date && to_date){
                        var date = new Date(column_date);
                        var column_day = date.getDate();
                        var column_month = date.getMonth();
                        var column_year = date.getFullYear();

                        var from_date_obj = new Date(from_date);
                        var to_date_obj = new Date(to_date);
                        
                        if (column_year >= from_date_obj.getFullYear() && column_year <= to_date_obj.getFullYear()
                            && column_month >= from_date_obj.getMonth() && column_month <= to_date_obj.getMonth()
                            && column_day >= from_date_obj.getDate() && column_day <= to_date_obj.getDate()) {
                            return true;
                        }
                        return false;
                    }
                    return true;
                }
            );

        });

    });
}

//autocomplete in scholar name input field
function autoComplete(id){
    $(document).ready(function() {
      eel.quota_scholarRecord()(data => {
        var namesData = JSON.parse(data);
        var select = document.getElementById("entryScholarName");
        var scholarName = [];
        var scholarID = [];
        var accountID = [];
        
        //remove the previous options before writing the new options
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }

        //create default option
        if(namesData.length != 0){
            var defaultOption = document.createElement("option");
            defaultOption.disabled = true;
            defaultOption.selected = true;
            defaultOption.value = "";
            defaultOption.text = "Select scholar";
            select.appendChild(defaultOption);
        } else {
            //if no scholar is found
            var defaultOption = document.createElement("option");
            defaultOption.disabled = true;
            defaultOption.selected = true;
            defaultOption.value = "";
            defaultOption.text = "No scholar found";
            select.appendChild(defaultOption);
            //disable the input fields
            select.disabled = true;
            document.getElementById('entryDate').disabled = true;
            document.getElementById('entrySLP').disabled = true;
            //disable the add button (else SQLite error)
            document.getElementById("addBtn").disabled = true;
        }
        //create the options
        namesData.forEach(function(item, index) {
            scholarName.push(item[0]);
            scholarID.push(item[1]);
            accountID.push(item[2]);
            var option = document.createElement("option");
            option.value = scholarID[index];
            option.text = scholarName[index];
            select.appendChild(option);

            select.addEventListener("change", function(){
                //set the account ID
                document.getElementById("entryAccountID").value = accountID[index];
            });
        });



      });
    });
  }
  


//----------------------------------------------------------
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

//----------------------------------------------------------
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
        console.log(temp);
        return temp;
    }
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
            document.getElementById("updateBtn").classList.remove('disabled');
            document.getElementById("removeBtn").classList.remove('disabled');
        }
        else if (rowCount > 1){
            document.getElementById("updateBtn").classList.add('disabled');
        }
        else {
            //disable Edit and Remove buttons
            document.getElementById("updateBtn").classList.add('disabled');
            document.getElementById("removeBtn").classList.add('disabled');
        }
    });
}

//----------------------------------------------------------
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
            var date = document.getElementById('entryDate').value;
            var scholarID = document.getElementById('entryScholarName').value;
            var accountID = document.getElementById('entryAccountID').value;
            var slp = document.getElementById('entrySLP').value;

            var entryData = [date, scholarID, accountID, slp];

            console.log(entryData);

            //add entry to database
            addEntry(entryData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Quota record added")
                    $('#addEntryModal').modal('hide');
                    //destroy the dataTable element
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //hide the modal
                    $('#addEntryModal').modal('hide');
                }
            });

            break;

        case 'Update':
            //check if form is valid
            var form = document.getElementById("formEdit");
            if (form.checkValidity() === false) {
                return;
            }


            var id = document.getElementById('labelAccountID').innerText;
            var email = document.getElementById('editEmail').value;
            var password = document.getElementById('editPassword').value;
            var ronin = document.getElementById('editRoninAddress').value;
            var newData = [id, email, password, ronin]

            //update entry in database
            /*
            editEntry(newData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Updated account information")
                    //hide modal
                    $('#editEntryModal').modal('hide');
                    //destroy table
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //make the modal buttons disabled
                    document.getElementById("updateBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
            }); 
            */
            break;
        
        case 'Delete':
            var quotaID = rowData('id');

            console.log("selected rows to be removed: " + quotaID);

            //delete entry from database
            deleteEntry(quotaID).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Deleted")
                    $('#deleteEntryModal').modal('hide');
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //make the modal buttons disabled
                    document.getElementById("updateBtn").classList.add('disabled');
                    document.getElementById("removeBtn").classList.add('disabled');
                }
            });

            break;

    }
}

function modalButtons(action){
    //when modal is opened
    switch(action){
        case "quotaAdd":
            //reset the appearance of the form (from previous validation)
            var form = document.getElementById('formAdd');
            form.classList.remove('was-validated');
            form.reset();
            //autocomplete name field
            autoComplete("#entryScholarName");
            break;

        case "quotaUpdate":
            //reset the appearance of the form (from previous validation)
            var form = document.getElementById('formEdit');
            form.classList.remove('was-validated');
            var selectedData = rowData('all');
            console.log(selectedData);

            //modify the input values in the Update modal
            document.getElementById("editDate").value = selectedData[0][1];
            document.getElementById("editName").value = selectedData[0][5];
            document.getElementById("editAccountID").value = selectedData[0][3];
            //show account ID in the modal
            //document.getElementById("labelAccountID").innerHTML = selectedData[0][0] + '<i class="fas fa-regular fa-copy pl-2"></i>';
            break;
        
        case "quotaRemove":
            break;
    }
}
//call onstart
init();
checkboxAction();




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
    showToast('Copied to clipboard')
}

//print button
function generateReport(){
    //generate timestamp for footer
    var time = new Date();
    var x = time.getMonth()+1 +"/"+time.getDate()+"/"+time.getFullYear();
    var y = time.getHours()+":"+time.getMinutes();
    document.getElementById('right-footer').innerHTML = "Report generated on " + x + " " + y;
    //modify table title
    document.getElementById('table-title').innerHTML = "All accounts as of " + x;

    //print content
    element = document.getElementById('content');
    window.print(element);
}



//intermediary functions----------------------------------------------------
//bridge between python and javascript (through Eel framework)
//special thanks sa ChatGPT for helping me in this huhu
function addEntry(data) {
    return new Promise(resolve => {
        eel.quota_addEntry(data)(data => {
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
        eel.quota_updateEntry(data)(data => {
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
        eel.quota_deleteEntry(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}