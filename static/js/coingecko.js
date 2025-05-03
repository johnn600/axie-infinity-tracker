//code by John Rey Vilbar

// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';


//HTML code
/*
<!--
<div class="chart-area">
    <canvas id="slpGraph"></canvas>
</div>
    -->
*/






//call the JSON string from python
function wait_graph_data(){
    //check if python backend was initiated
    //since limited ra ang request call sa free tier sa CoinGeckoAPI (10-50 limit per min)
    //e.g. when user always refresh the index.html 
    if (sessionStorage.getItem('timestamps') === null){
        //debug purposes
        console.log('Python backend called in Javascript');
        //call the Python backend when sessionStorage 'timestamps' does not exist
        graph_data = eel.data_24hr_price('smooth-love-potion')();
        return graph_data;

    } else{
        console.log('Python backend not called.')
        //this line is needed so that wait_graph_data().then() does not return Uncaught TypeError
        //https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve 
        return Promise.resolve(0)
    }

    /*
    //thanks kay reinhart sa kini na part
    let x = graph_data.replace(/\[|\]/g,'').split(',');
    let result = x.map(function(i){ return parseInt(i, 10); });
    return result; */
};


wait_graph_data()
    .then((response) => {
        //split the data
        if(response !== 0){
            let timestamps = response[0]
            let price = response[1]
        
            //make session global variables for this graph
            window.sessionStorage.setItem('timestamps', timestamps);
            window.sessionStorage.setItem('prices', price);

            //debug
            console.log("sessionStorage 'timestamps': " + sessionStorage.getItem('timestamps'))
            console.log("sessionStorage 'prices': " + sessionStorage.getItem('prices'))
        }

        //dri nalang himuon ang graph
        var ctx = document.getElementById("slpGraph");
        var graphSLP = new Chart(ctx, {
            type: 'line',
            data: {
            labels: ((sessionStorage.getItem('timestamps')) ? JSON.parse(sessionStorage.getItem('timestamps')) :  JSON.parse(timestamps)),
            datasets: [{
                label: "",
                lineTension: 0.3,
                backgroundColor: "rgba(78, 115, 223, 0.05)",
                borderColor: "rgba(78, 115, 223, 1)",
                pointRadius: 3,
                pointBackgroundColor: "rgba(78, 115, 223, 1)",
                pointBorderColor: "rgba(78, 115, 223, 1)",
                pointHoverRadius: 3,
                pointHoverBackgroundColor: "rgba(78, 115, 223, 1)",
                pointHoverBorderColor: "rgba(78, 115, 223, 1)",
                pointHitRadius: 10,
                pointBorderWidth: 2,
        
                // mao ni ang data na ginakapita sa line graph
                data: ((sessionStorage.getItem('prices')) ? JSON.parse(sessionStorage.getItem('prices')) :  JSON.parse(price)),
            }]
            },
            options: {
                maintainAspectRatio: false,
                layout: {
                    padding: {
                    left: 10,
                    right: 25,
                    top: 25,
                    bottom: 0
                    }
                },
                scales: {
                    xAxes: [{
                    time: {
                        unit: 'date'
                    },
                    gridLines: {
                        display: false,
                        drawBorder: true
                    },
                    ticks: {
                        maxTicksLimit: 7,
                        maxRotation: 0,
                        minRotation: 0
                    }
                    }],
                    yAxes: [{
                    ticks: {
                        maxTicksLimit: 5,
                        padding: 10,
                        // Include a dollar sign in the ticks
                        callback: function(value, index, values) {
                        return 'PHP ' + value;
                        }
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
                legend: {
                    display: false
                },
                tooltips: {
                    backgroundColor: "rgb(255,255,255)",
                    bodyFontColor: "#858796",
                    titleMarginBottom: 10,
                    titleFontColor: '#6e707e',
                    titleFontSize: 14,
                    borderColor: '#dddfeb',
                    borderWidth: 1,
                    xPadding: 15,
                    yPadding: 15,
                    displayColors: false,
                    intersect: false,
                    mode: 'index',
                    caretPadding: 10,
                    callbacks: {
                    label: function(tooltipItem, chart) {
                        var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                        return datasetLabel + 'PHP ' + tooltipItem.yLabel;}
                                }
                }
            }
        }
            
    );
});

//destroy sessionStorage after 10 seconds to fetch new data again from CoinGecko API
function destroy_sessionStorage(){ 
    if (sessionStorage.getItem('timestamps') !== null ){
        console.log('All sessionStorage destroyed, waiting for user refresh.')
        sessionStorage.clear();
    }
};
setInterval(destroy_sessionStorage, 10000);


