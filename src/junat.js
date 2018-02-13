
    var xhttp = new XMLHttpRequest();
    var timetableHKI = "";

    xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4 && xhttp.status == 200){

            var trains = JSON.parse(xhttp.responseText);
            console.log(trains);

            /* Alla käydään läpi saatu ulkoinen data. For loop käy datan läpi, var result antaa
            datalle indeksin, muut hakevat niiden kuvaamia arvoja datasta.*/

                for (i = 0; trains.length; i++){
                    var result = trains[i];
                    var deptTime = new Date(result.timeTableRows[0].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrTime = new Date(result.timeTableRows[result.timeTableRows.length-1].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrStation = (result.timeTableRows[result.timeTableRows.length - 1].stationShortCode);


                    console.log(arrStation);
                    if (result.timeTableRows[i].type === "DEPARTURE") { //tulostetaan vain departures
                    timetableHKI = timetableHKI + "<li>" + result.timeTableRows[i].type + "Määräasema: " + arrStation + " Lähtöaika: " + deptTime + " Saapumisaika: " + arrTime;
                    }
                document.getElementById("list").innerHTML = timetableHKI;
                }
            }


    };

    function getFile() {
    xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/LH', true);
    xhttp.send(null);
    
    }