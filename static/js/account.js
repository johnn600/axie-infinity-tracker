//code by John Rey Vilbar




//Display manager name in navbar
var managerName = sessionStorage.managerName
document.getElementById('manager-name').innerHTML = managerName;


//increasing number animation
function incrementNum(element, number){
    $(element).prop('counter',0).animate({
        counter: number
    },
    {
      duration: 500,
      step: function(now){
        $(this).text(Math.round(now));
      }
    });
};

//widget values
//spare account widget
function widget(){
    eel.accountWidget_spare()(data => {
        if (typeof data === 'undefined'){
            //none
        } else {
        x = JSON.parse(data)
        document.getElementById('availableAccounts').innerHTML = x[0][0];
        document.getElementById('totalAccounts').innerHTML = x[0][1];
        incrementNum('#availableAccounts', x[0][0]);
        incrementNum('#totalAccounts', x[0][1]);
        document.getElementById('spare-accounts-chart').style.width = (x[0][0] / x[0][1]) * 100 +"%";
    }});
}



//get account info
function init(){
    console.log("function init()");
    // Destroy the existing DataTable if it exists
    var table = $('#dataTable').DataTable();
    if (table) {
        table.destroy();
    }
    //get the data from the SQLite database
    eel.account_info()(data => {
        //convert the data to JSON
        var scholarInfo = JSON.parse(data);

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
            data: scholarInfo,
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

                { title: 'Account ID', data: 0, visible: false },
                { title: 'Email', data: 1 },
                { title: 'Password', data: 2 },
                { title: 'Ronin Address', data: 3 } ],

                select: {
                    style: 'multi',
                    selector: 'td:first-child' },

                ordering: false,
                //order: [[ 2, 'asc' ]],
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
            var email = document.getElementById('entryEmail').value;
            var password = document.getElementById('entryPassword').value;
            var roninAddress = document.getElementById('entryRoninAddress').value;
            var entryData = [email, password, roninAddress];

            //add entry to database
            addEntry(entryData).then(result => {
                if (result !== true) {
                    alert('SQLite error.');
                } else {
                    showToast("Account added")
                    $('#addEntryModal').modal('hide');
                    //destroy the dataTable element
                    $('#dataTable').DataTable().destroy();
                    //repopulate the table
                    init();
                    //hide the modal
                    $('#addEntryModal').modal('hide');
                    //redraw the widget
                    widget();
                }
            });
            break;

        case 'Update':
            //check if form is valid
            var form = document.getElementById("formEdit");
            if (form.checkValidity() === false) {
                console.log("form invalid");
                return;
            }

            var id = document.getElementById('labelAccountID').innerText;
            var email = document.getElementById('editEmail').value;
            var password = document.getElementById('editPassword').value;
            var ronin = document.getElementById('editRoninAddress').value;
            var newData = [id, email, password, ronin]

            //update entry in database
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
            break;
        
        case 'Delete':
            var accountID = rowData('id');

            console.log("selected rows to be removed: " + accountID);

            //delete entry from database
            deleteEntry(accountID).then(result => {
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
                    //redraw the widget
                    widget();
                }
            });

            break;

    }
}

//when modal is opened
function modalButtons(action){
    switch(action){
        case "accountAdd":
            //reset the appearance of the form (from previous validation)
            var form = document.getElementById('formAdd');
            form.classList.remove('was-validated');
            form.reset();
            break;

        case "accountUpdate":
            //reset the widget values
            document.getElementById('slpBalance').innerText = "";
            document.getElementById('axieCount').innerText = "";
            //reset the border and text color of the widget
            document.getElementById('widgetSlp').classList.remove('border-bottom-info');
            document.getElementById('widgetSlpLabel').classList.remove('text-info');
            document.getElementById('widgetAxie').classList.remove('border-bottom-info');
            document.getElementById('widgetAxieLabel').classList.remove('text-info');
            //show the spinners
            document.getElementById('spinner1').classList.remove('d-none');
            document.getElementById('spinner2').classList.remove('d-none');

            //reset the appearance of the form (from previous validation)
            var form = document.getElementById('formEdit');
            form.classList.remove('was-validated');
            var selectedData = rowData('all');
            //modify the input values in the Update modal
            document.getElementById("editEmail").value = selectedData[0][1];
            document.getElementById("editPassword").value = selectedData[0][2];
            document.getElementById("editRoninAddress").value = selectedData[0][3];
            //show account ID in the modal
            document.getElementById("labelAccountID").innerHTML = selectedData[0][0] + '<i class="fas fa-regular fa-copy pl-2"></i>';

            //call the skymavis api to get the ronin address info
            var roninAddress = "0x" + selectedData[0][3];
            eel.get_slp_count(roninAddress)(data => {
                if(data != null){
                    document.getElementById("slpBalance").innerHTML = data;
                } else {
                    document.getElementById("slpBalance").innerHTML = "0";
                }
                //hide the spinner
                document.getElementById('spinner1').classList.add('d-none');
                //change the color of the widget
                document.getElementById('widgetSlp').classList.add('border-bottom-info');
                document.getElementById('widgetSlpLabel').classList.add('text-info');
                //animate the widget
                /*
                var card = document.getElementById("widgetSlp");
                card.classList.add('animate__animated', 'animate__headShake');
                card.addEventListener('animationend', () => {
                    card.classList.remove('animate__animated', 'animate__headShake');
                });
                */
            });

            eel.get_axie_count(roninAddress)(data => {
                if(data != null){
                    document.getElementById("axieCount").innerHTML = data;
                } else {
                    document.getElementById("axieCount").innerHTML = "0";
                }
                //hide the spinner
                document.getElementById('spinner2').classList.add('d-none');
                //change the color of the widget
                document.getElementById('widgetAxie').classList.add('border-bottom-info');
                document.getElementById('widgetAxieLabel').classList.add('text-info');
            });

            break;
        
        case "accountRemove":
            break;
    }
}
//call onstart
init();
checkboxAction();
widget();




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
        eel.account_addEntry(data)(data => {
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
        eel.account_updateEntry(data)(data => {
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
        eel.account_deleteEntry(data)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
}

//update modal >> skymavis widgets
function slpCount(ronin){
    return new Promise(resolve => {
        eel.get_slp_count(ronin)(data => {
            result = JSON.parse(data);
            if (result !== false) {
                console.log(result);
                return result;
            } else {
                resolve(false);
            }
        });
    });
}