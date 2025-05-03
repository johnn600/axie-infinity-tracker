//code by John Rey Vilbar
//widget values
//https://stackoverflow.com/a/50026752/19225183


//display manager name in the navbar
document.getElementById('manager-name').innerHTML = sessionStorage.managerName;


//increasing number animation
//https://www.hashbangcode.com/article/animating-number-updates-jquery (modified)
function incrementNum(element, number, type){
    $(element).prop('counter',0).animate({
        counter: number
    },
    {
      duration: 500,
      type: type,
      step: function(now, fx){
        //different animation for integer and float values
        if (fx.options.type == 'integer'){
            $(this).text(Math.round(now));
        } else {
            $(this).text(now.toFixed(2));
        }
      }
    });
};


//earnings today
eel.earnings_today()(data => {
    var temp = JSON.parse(data);

    //check if data is empty
    if (temp.length == 0){
        //destroy the spinner
        document.getElementById('spinnerProfitToday').remove();
        return;
    } else {
        var slp = temp[0];

        //set the slp value
        document.getElementById('slp-today').innerHTML = slp;
        //animate the value
        incrementNum('#slp-today', slp, 'integer');

        //get the slp price
        eel.slp_price()(data => {
            var earnings_usd = data * slp;

            //convert to PHP
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '93cbb0ac53mshf3efe9bf6d64374p176dcajsn4f4d8a9d6eae',
                    'X-RapidAPI-Host': 'currency-converter-by-api-ninjas.p.rapidapi.com'
                }
            };

            fetch('https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=USD&want=PHP&amount='+ earnings_usd, options)
                .then(response => response.json())
                .then(response => {
                    var value = response.new_amount;
                    //remove the spinner
                    document.getElementById('spinnerProfitToday').remove();
                    //insert the value
                    document.getElementById('earnings-today').innerHTML = value;
                    //animate the value
                    incrementNum('#earnings-today', value, 'float');
                    })
                .catch(err => console.error(err));
        });

    }
});

//earnings this month
eel.earnings_currentMonth()(data => {  
    var temp = JSON.parse(data);
    
    //check if data is empty
    if (temp.length == 0){
        //destroy the spinner
        document.getElementById('spinnerProfitMonth').remove();
        return;
    } else {
        var slp = temp[0];

        //display the current Month (jusko JS why wala kay native strftime support)
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date().getMonth();
        const current_month = months[now];
        document.getElementById('header-current-month').innerHTML = 'Earnings: ' + current_month;

        //slp minted text
        document.getElementById('slp-month').innerHTML = slp;
        //animate the value
        incrementNum('#slp-month', slp, 'integer');

        //get the slp price
        eel.slp_price()(data => {
            var earnings_usd = data * slp;

            //convert to PHP
            const options = {
                method: 'GET',
                headers: {
                    'X-RapidAPI-Key': '93cbb0ac53mshf3efe9bf6d64374p176dcajsn4f4d8a9d6eae',
                    'X-RapidAPI-Host': 'currency-converter-by-api-ninjas.p.rapidapi.com'
                }
            };

            fetch('https://currency-converter-by-api-ninjas.p.rapidapi.com/v1/convertcurrency?have=USD&want=PHP&amount='+ earnings_usd, options)
                .then(response => response.json())
                .then(response => {
                    var value = response.new_amount;
                    //remove the spinner
                    document.getElementById('spinnerProfitMonth').remove();
                    //insert the value
                    document.getElementById('earnings-current-month').innerHTML = value;
                    //animate the value
                    incrementNum('#earnings-current-month', value, 'float');
                    })
                .catch(err => console.error(err));
        });
    }
});

//print button function
function generateReport(){
    //generate timestamp for footer
    var time = new Date();
    var x = time.getMonth()+1 +"/"+time.getDate()+"/"+time.getFullYear();
    var y = time.getHours()+":"+time.getMinutes();
    document.getElementById('right-footer').innerHTML = "Report generated on " + x + " " + y;
    //modify header title

    //print content
    element = document.getElementById('content');
    window.print(element);
}



//-------------------------------------------------------------------------
//chart.js
//-------------------------------------------------------------------------

//puta ka Chart.js maynalang nakita nako ni na code
//reference: https://github.com/chartjs/Chart.js/issues/1350#issuecomment-320265946
function beforePrint () {
    for (const id in Chart.instances) {
        Chart.instances[id].resize()
    }
}
if (window.matchMedia) {
let mediaQueryList = window.matchMedia('print')
mediaQueryList.addListener((mql) => {
    if (mql.matches) {
    beforePrint()
    }
})
}
window.onbeforeprint = beforePrint

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';

//create a chart.js bar graph for the earnings (7 days)
eel.earnings_weekly()(data => {
    var temp = JSON.parse(data);
    
    //delete the spinner
    document.getElementById('spinner').remove();

    //check if the array is empty
    if (temp.length == 0){
        //show the div containing the alternative content
        document.getElementById('noQuotaRecord').style.display = 'block';
        //terminate this function
        return
    }

    //show the chart
    document.getElementById('chart').classList.remove('d-none');

    //convert the array to a dictionary
    var dataObj = {};
    for(let i=0; i< temp.length; i++){
        dataObj = Object.assign(dataObj, {[temp[i][0]]: temp[i][1]});
    }

    //current date
    const currentDate = new Date();

    // Create an array of dates from 7 days, including the current date
    const past7Days = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        past7Days.push(date.toISOString().slice(0, 10));
    }

    // Iterate through the array of dates
    for (let i = 0; i < past7Days.length; i++) {
        // Check if the date already exists in the object
        if (!dataObj.hasOwnProperty(past7Days[i])) {
            // If not, add it with a value of 0
            dataObj[past7Days[i]] = 0;
        }
    }

    //sort the object by date
    var sorted = {};
    Object.keys(dataObj).sort().forEach(function(key) {
        sorted[key] = dataObj[key];
    });
    
    console.log(sorted);

    var usd_slp = "";
    eel.slp_price()(data => {
        var usd_slp = data;

    })



    //get the date keys and earnings values
    var date = Object.keys(sorted);
    var earnings = Object.values(sorted);

    //convert the date to a readable format of MMM DD
    for (let i = 0; i < date.length; i++) {
        date[i] = new Date(date[i]).toLocaleDateString('en-US', {month: 'short', day: 'numeric'}).toUpperCase();
    }

    //create the chart
    var ctx = document.getElementById("dailyEarningsGraph").getContext("2d");
    var myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: date,
            datasets: [{
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.75)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
                data: earnings
            }]
        },
        options: {
            layout: {
                padding: {
                    top: 20,
                    bottom: 0
                }
            },
            maintainAspectRatio: false,
            layout: {
            padding: {
                left: 10,
                right: 25,
                top: 25,
                bottom: 0
            }
            },
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 7,
                    }
                    }],
                yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                    },
                    gridLines: {
                        color: "rgb(234, 236, 244)",
                        zeroLineColor: "rgb(234, 236, 244)",
                        drawBorder: false,
                        borderDash: [2],
                        zeroLineBorderDash: [2]
                    }
                    }],
            },
            tooltips: {
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                titleMarginBottom: 1,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 10,
                yPadding: 5,
                displayColors: false,
                intersect: false,
                mode: 'index',
                caretPadding: 5,
                callbacks: {
                    title: function() {},
                    label: function(tooltipItem) {
                    return 'SLP: ' + tooltipItem.yLabel;}
                    },
            }
        }
    });


});
