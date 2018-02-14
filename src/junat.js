
    var xhttp = new XMLHttpRequest();
    var timetable = "";
    var depstation ="";
    var arrstation="";

    function getFile() {
        depstation = document.getElementById("depoptions").value;
        arrstation = document.getElementById("destoptions").value;
        xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + depstation + "/" + arrstation, true);
        xhttp.send(null);


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
                    var arrTime = new Date(result.timeTableRows[index].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrStation = (result.timeTableRows[index].stationShortCode);

                    console.log(arrStation);
                    if (result.timeTableRows[i].type === "DEPARTURE") { //tulostetaan vain departures
                    timetable = timetable + "<div class=\"trips\" onclick=\"toggleStopsVisibility(event)\">" + "Määräasema: " + arrStation + " Lähtöaika: " + deptTime + " Saapumisaika: " + arrTime + "<div>";


                    for(var k = 0; k <= index; k++) {
                        var arrTimeStop = new Date(result.timeTableRows[k].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                        if (result.timeTableRows[k].type === "DEPARTURE") {
                            timetable = timetable + "<div class=\"stops\">"  + result.timeTableRows[k].stationShortCode + " - " + arrTimeStop + "</div>";
                            }
                        }
                        timetable = timetable +"</div></div>";
                    }


                document.getElementById("list").innerHTML = timetable;

                }


            }



    };
    timetable = " ";
    }

        // Renne koodas Tiinan kanssa.
    function indexSearch(result) {
        for (var j = 0; j<result.timeTableRows.length;j++) {
            var arriIndex = result.timeTableRows[j].stationShortCode;
            if (arriIndex == arrstation) {
                return j;
            }
        }
    }

    function toggleStopsVisibility(event) {
        var stopsToggle = event.target.firstElementChild;
        if (stopsToggle.style.display === "none") {
            stopsToggle.style.display = "block";
        } else {
        stopsToggle.style.display = "none";
        }
    }
