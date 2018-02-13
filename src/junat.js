
    var xhttp = new XMLHttpRequest();
    var timetable = "";

    xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4 && xhttp.status == 200){

            var trains = JSON.parse(xhttp.responseText);
            console.log(trains);

            /* Alla käydään läpi saatu ulkoinen data. For loop käy datan läpi, var result antaa
            datalle indeksin, muut hakevat niiden kuvaamia arvoja datasta.*/

                for (var i = 0; trains.length; i++){
                    var result = trains[i];
                    var index = indexSearch(result);

                    var deptTime = new Date(result.timeTableRows[0].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrTime = new Date(result.timeTableRows[result.timeTableRows.length-1].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrStation = (result.timeTableRows[result.timeTableRows.length - 1].stationShortCode);


                    console.log(arrStation);
                    if (result.timeTableRows[i].type === "DEPARTURE") { //tulostetaan vain departures
                    timetable = timetable + "<div class=\"trips\" \"trip\""+i+"\">" + "Määräasema: " + arrStation + " Lähtöaika: " + deptTime + " Saapumisaika: " + arrTime + "</div>";
                        for(var k = 0; k < index; k++) {
                            if (result.timeTableRows[i].type === "DEPARTURE"){
                            timetable = timetable + "<div class=\"stops\" \"stop\""+i+"\">"+ result.timeTableRows[k].stationShortCode+" - " + result.timeTableRows[k].scheduledTime + "</div>";
                            }
                        }
                    }

                document.getElementById("list").innerHTML = timetable;
                }
            }



    };


    function getFile() {
    xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/LH', true);
    xhttp.send(null);

    }
        // Renne koodas Tiinan kanssa.
    function indexSearch(result) {
        for (var j = 0; j<result.timeTableRows.length;j++) {
            var arriIndex = result.timeTableRows[j].stationShortCode;
            if (arriIndex == 'LH') {
                return j;
            }
        }
    }