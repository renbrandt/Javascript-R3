
    var xhttp = new XMLHttpRequest();
    var timetable = "";
    var depstation ="";
    var arrstation="";

    function getFile() {
        depstation = document.getElementById("getDepCity").value;
        arrstation = document.getElementById("getArrCity").value;
        xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + depstation + '/' + arrstation + '/' + '?limit=10', true);
        //limit loppuosa rajoittaa näytettävät yhteydet viiteen!
        xhttp.send(null);


    xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4 && xhttp.status == 200){

            var trains = JSON.parse(xhttp.responseText);

            /* Alla käydään läpi saatu ulkoinen data. For loop käy datan läpi, var result antaa
            datalle indeksin, muut hakevat niiden kuvaamia arvoja datasta.*/

                for (var i = 0; trains.length; i++){
                    var result = trains[i];

                    var index = indexSearch(result);

                    /* Alla erotellaan onko lähi- vai kaukojuna ja lisätään junan tyyppi/ID. Tiina lisäsi nämä. */

                    var trainCategory = result.trainCategory;
                        if (trainCategory === "Long-distance"){
                            if (result.trainType === "IC"){
                                var trainNumber = "Kaukojuna " + "InterCity " + result.trainType + result.trainNumber;
                            }else if (result.trainType === "IC2"){
                                    trainNumber = "Kaukojuna " + "InterCity 2 " + result.trainType + result.trainNumber;
                            } else if (result.trainType === "P"){
                                    trainNumber = "Kaukojuna " + "Pikajuna " + result.trainType + result.trainNumber;
                            } else if (result.trainType === "S"){
                                    trainNumber = "Kaukojuna " + "Pendolino " + result.trainType + result.trainNumber;
                            } else if (result.trainType = "AE"){
                                    trainNumber = "Kaukojuna " + "Allegro " + result.trainType + result.trainNumber;
                            }

                        } else if (trainCategory === "Commuter") {
                            trainNumber = "Lähijuna " + result.commuterLineID;
                        }

                    var deptTime = new Date(result.timeTableRows[0].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrTime = new Date(result.timeTableRows[index].scheduledTime).toLocaleTimeString("fi", {hour: '2-digit', minute:'2-digit', hour12: false});
                    var arrStation = (result.timeTableRows[index].stationShortCode);

                    /* Muutetaan lähtö- ja saapumisaika millisekunteiksi, jotta saadaan laskettua matkan kesto!  Tiina lisäsi nämä. */
                    var deptTimeMS = Date.parse(result.timeTableRows[0].scheduledTime);
                    var arrTimeMS = Date.parse(result.timeTableRows[index].scheduledTime);
                    var triptimeMS = arrTimeMS - deptTimeMS;

                    /* Lasketaan millisekunteista tunnit ja minuutit */
                    function msToTime(triptimeMS) {
                        var triptimeMS = arrTimeMS - deptTimeMS;
                        var secs = Math.floor(triptimeMS / 1000);
                        var hours = Math.floor(secs / (60 * 60));
                        console.log(hours);
                        var divisor_for_minutes = secs % (60 * 60);
                        var minutes = Math.floor(divisor_for_minutes / 60);
                            if (minutes < 10){
                                minutes = "0" + Math.floor(divisor_for_minutes / 60);
                            }
                        return hours + ":" + minutes;
                    }
                    var tripTime = msToTime();



                    if (result.timeTableRows[i].type === "DEPARTURE") { //tulostetaan vain departures
                        timetable = timetable + "<div class=\"trips\" onclick=\"toggleStopsVisibility(event)\">" + trainNumber + " Lähtöaika: " + deptTime + " Saapumisaika: " + arrTime +" Matkan kesto: " + tripTime + "<div>";

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


    // Name and Password from the register-form

    var usernameArray = [];
    var pwArray =[];

    // storing input from register-form
    function store() {
        var username = document.getElementById('name1').value;
        var pw = document.getElementById('pw').value;
        usernameArray.push(username);
        pwArray.push(pw);
        localStorage.setItem("usernameArray", JSON.stringify(usernameArray));
        localStorage.setItem("pwArray", JSON.stringify(pwArray));

        console.log(localStorage.getItem("usernameArray"));
        console.log(localStorage.getItem("pwArray"));

    }

    // check if stored data from register-form is equal to entered data in the   login-form
    function check() {

        // stored data from the register-form
        var storedNames = localStorage.getItem('usernameArray');
        var storedPws = localStorage.getItem('pwArray');
        storedNames  = usernameArray;
        storedPws = pwArray;
        var valid = -1;

        console.log(storedNames);

        // entered data from the login-form
        var userName = document.getElementById('userName').value;
        var userPw = document.getElementById('userPw').value;

        for (i=0; i<storedNames.length;i++) {
        // check if stored data from register-form is equal to data from login form
        if (userName == storedNames[i] && userPw == storedPws[i]) {
            valid = i;
            break;
        }
        }

        if (valid != -1) {
            alert('You are logged in now:' + storedNames[valid]);
        } else {
            alert('ERROR.');
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


