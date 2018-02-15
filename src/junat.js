// esitellään toiminnan kannalta tarvittavia muuttujia. Näihin asetetaan arvoja functioiden sisällä
var xhttp = new XMLHttpRequest();
var timetable = "";
var depstation = "";
var arrstation = "";
var id_kayttaja = "";
//Testailua varten välillä tyhjennetään localStorage
//localStorage.clear();

//ns. Pääfunktio, jonka avulla haetaan data internetistä. @Tiina & @Renne
function getFile() {
    //napataan käyttäjän syöttämät lähtö- ja määränpääasemat HTML-formista.
    depstation = document.getElementById("getDepCity").value;
    arrstation = document.getElementById("getArrCity").value;

    //Haetaan vain näiden kahden pisteen välillä kulkevat junat URLIn kanssa kikkaillen
    xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + depstation + '/' + arrstation + '/', true);
    //limit loppuosa rajoittaa näytettävät yhteydet viiteen!
    xhttp.send(null);


    xhttp.onreadystatechange = function () {
        /* Lasketaan millisekunteista tunnit ja minuutit, jotta saadaan näytettyä matkan kesto @Tiina*/
        function msToTime(triptimeMS) {
            var triptimeMS = arrTimeMS - deptTimeMS;
            var secs = Math.floor(triptimeMS / 1000);
            var hours = Math.floor(secs / (60 * 60));
            var divisor_for_minutes = secs % (60 * 60);
            var minutes = Math.floor(divisor_for_minutes / 60);
            if (minutes < 10) {
                minutes = "0" + Math.floor(divisor_for_minutes / 60);
            }
            return hours + ":" + minutes;
        }


        if (xhttp.readyState == 4 && xhttp.status == 200) {

            //napataan vastaanotettu jason ja käännetään se helpommin käsiteltävään muotoon.
            var trains = JSON.parse(xhttp.responseText);

            var userSetTime;
            var timeElementValue = document.getElementById("setTime").value;
            var pattern = new RegExp("[0-2]\\d:[0-5]\\d");
            if (pattern.test(timeElementValue)) {
                userSetTime = new Date(Date.now());
                userSetTime.setHours(timeElementValue.substring(0, 2), timeElementValue.substring(3, 5));
                userSetTime = userSetTime.getTime();
            } else {
                userSetTime = Date.now();
                var pvm = new Date(userSetTime);
                document.getElementById("setTime").value = pvm.getHours() + ":" + pvm.getMinutes();
            }
            /* Alla käydään läpi saatu ulkoinen data. For loop käy datan läpi, var result antaa
            datalle indeksin, muut hakevat niiden kuvaamia arvoja datasta.*/

            for (var i = 0; trains.length; i++) {
                var result = trains[i];

                var index = indexSearch(result);

                // jos junan aika on ennen käyttäjän antamaa aikaa niin ei jatketa tämän junan kanssa
                var scheduledTimeDate = Date.parse(result.timeTableRows[0].scheduledTime);
                if (scheduledTimeDate < userSetTime) continue;

                /* Alla erotellaan onko lähi- vai kaukojuna ja lisätään junan tyyppi/ID. Tiina lisäsi nämä. */

                var trainCategory = result.trainCategory;
                if (trainCategory === "Long-distance") {
                    if (result.trainType === "IC") {
                        var trainNumber = "Kaukojuna " + "InterCity " + result.trainType + result.trainNumber;
                    } else if (result.trainType === "IC2") {
                        trainNumber = "Kaukojuna " + "InterCity 2 " + result.trainType + result.trainNumber;
                    } else if (result.trainType === "P") {
                        trainNumber = "Kaukojuna " + "Pikajuna " + result.trainType + result.trainNumber;
                    } else if (result.trainType === "S") {
                        trainNumber = "Kaukojuna " + "Pendolino " + result.trainType + result.trainNumber;
                    } else if (result.trainType = "AE") {
                        trainNumber = "Kaukojuna " + "Allegro " + result.trainType + result.trainNumber;
                    }

                } else if (trainCategory === "Commuter") {
                    trainNumber = "Lähijuna " + result.commuterLineID;
                }

                    var arrStation = (result.timeTableRows[index].stationShortCode);
                    var deptTime = new Date(result.timeTableRows[0].scheduledTime).toLocaleTimeString("fi", {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,

                    });

                    var arrTime = new Date(result.timeTableRows[index].scheduledTime).toLocaleTimeString("fi", {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });

                    /* Muutetaan lähtö- ja saapumisaika millisekunteiksi, jotta saadaan laskettua matkan kesto!  Tiina lisäsi nämä. */
                    var deptTimeMS = Date.parse(result.timeTableRows[0].scheduledTime);
                    var arrTimeMS = Date.parse(result.timeTableRows[index].scheduledTime);
                    var triptimeMS = arrTimeMS - deptTimeMS;

                    var tripTime = msToTime();

                    // Hoidetaan datan tulostaminen InnerHTML:ään.
                    //tulostetaan vain departures
                    // Koska ollaan vieläkin for-loppin sisällä, saadaan luotua jokaiselle halutulle matkalle oma DIVi, johon säädetään visibility toggle
                    if (result.timeTableRows[i].type === "DEPARTURE") {
                        timetable = timetable + "<div class=\"trips\" onclick=\"toggleStopsVisibility(event)\">" + trainNumber + " | " + " Lähtöaika: " +  deptTime + " | " + " Saapumisaika: " + arrTime + " | " + " Matkan kesto: " + tripTime + "<div>";

                        // Tehdään uusi for-loop, jonka avulla saadaan jokaista matkaa varten jokaisen välipysähdyksen. TUlostetaan lähtöaika ja paikka.
                        for (var k = 0; k <= index; k++) {
                            var arrTimeStop = new Date(result.timeTableRows[k].scheduledTime).toLocaleTimeString("fi", {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            });
                            if (result.timeTableRows[k].type === "DEPARTURE") {
                                timetable = timetable + "<div class=\"stops\">" + result.timeTableRows[k].stationShortCode + " - " + arrTimeStop + "</div>";
                            }
                        }

                        //suljetaan kaikki sisältö divien sisälle, jotta niiden ksäittely on helpompaa
                        timetable = timetable + "</div></div>";
                    }


                    // Muutetaan käyttäjän säätämät asemat ja tallenetaan ne hänen henkilökohtaisiin taulukoihin. Näiden avulla sisäänkirjautuessa
                    //käyttäjä saa suoraan viimeisimmän haun selaimelleen.

                    var tempTableDept = JSON.parse(localStorage.getItem('userDeptStation'));
                    var tempTableArr = JSON.parse(localStorage.getItem("userArrStation"));


                    console.dir(tempTableDept);
                    console.dir(tempTableArr);
                    tempTableDept.splice(id_kayttaja, 1, depstation);
                    tempTableArr.splice(id_kayttaja, 1, arrstation);
                    //console.dir(tempTable[id_kayttaja]);
                    localStorage.setItem("userDeptStation", JSON.stringify(tempTableDept));
                    localStorage.setItem("userArrStation", JSON.stringify(tempTableArr));


                //Tulostetaan viimein kasattu data (Eli iso määrä divejä) html-sivulle.
                        document.getElementById("list").innerHTML = timetable;



                }


            }

        }
        ;
        // Tyhjennetään datataulukko aina kun kutsutaan uutta dataa.
        timetable = " ";

}

// haetaan päätyaseman indeksi json-taulukosta, jotta voidaan rajoittaa mottako asemaa näytetään. @Renne & @Tiina
function indexSearch(result) {
    for (var j = 0; j < result.timeTableRows.length; j++) {
        var arriIndex = result.timeTableRows[j].stationShortCode;
        if (arriIndex == arrstation) {
            return j;
        }
    }
}


// Tehdään käyttäjätilejä varten useampi taulukko. Username, password ja tarvittava data.
    var usernameArray = [];
    var pwArray =[];
    var userDeptStation =[];
    var userArrStation = [];

    // Rekisteröityminen tapahtuu tämän funktion avulla. Lisätään ja tallenetaan localstoragelle käyttäjän tiedot neljälle eri taulukolle, samalla indeksille
    function store() {
        var username = document.getElementById('name1').value;
        var pw = document.getElementById('pw').value;
        if (localStorage.getItem("usernameArray")!= null){
            usernameArray=JSON.parse(localStorage.getItem("usernameArray"));
            pwArray=JSON.parse(localStorage.getItem("pwArray"));
            userDeptStation=JSON.parse(localStorage.getItem("userDeptStation"));
            userArrStation=JSON.parse(localStorage.getItem("userArrStation"));
        }
        usernameArray.push(username);
        pwArray.push(pw);
        userDeptStation.push("HKI");
        userArrStation.push("");
        localStorage.setItem("userDeptStation", JSON.stringify(userDeptStation));
        localStorage.setItem("usernameArray", JSON.stringify(usernameArray));
        localStorage.setItem("pwArray", JSON.stringify(pwArray));
        localStorage.setItem("userArrStation", JSON.stringify(userArrStation));


    console.log(localStorage.getItem("usernameArray"));
    console.log(localStorage.getItem("pwArray"));
    console.log(localStorage.getItem("userDeptStation"));
    console.log(localStorage.getItem("userArrStation"));

}

// Sisäänkirjautuminen. Tarkistetaan löytyykö syötetty käyttäjätunnust&salasana-pari localstoragelta.
function check() {

        //  Haetaan tallennetut rekisteröityneet henkilöt localstoragelta
        var storedNames = JSON.parse(localStorage.getItem('usernameArray'));
        var storedPws = JSON.parse(localStorage.getItem('pwArray'));
        var storedDept = JSON.parse(localStorage.getItem('userDeptStation'));
        var storedArr = JSON.parse(localStorage.getItem("userArrStation"));

        // Luodaan muuttuja, jota käytetään hyväksi sisäänkirjautumisen onnistumisen tunnistamiseksi
        var valid = -1;



    // Haetaan käyttäjän syöttämät arvot login-kentistä
    var userName = document.getElementById('userName').value;
    var userPw = document.getElementById('userPw').value;

        console.log(storedNames[0]);
        console.log(userName);
        //console.log(storedPws);

        // Tehdään looppi, joka käy taulukot läpi
        for (i=0; i<storedNames.length;i++) {

        // tarkistetaan että samalla indeksillä sekä käyttäjänimi että salasana ovat samat.
        if (userName == storedNames[i] && userPw == storedPws[i]) {
            valid = i;
            id_kayttaja=i;
            break;
        }
    }

        // Jos käyttäjätunnarit löytyvät, ilmoitetaan että ollaan paikalla + haetaan localstoragelta datat!
        if (valid != -1) {
            console.log("ONNISTUI");
               // console.log(JSON.parse(localStorage.getItem("userDeptStation"))[id_kayttaja]);
               // console.log(JSON.parse(localStorage.getItem("pwArray")));
               // console.log(JSON.parse(localStorage.getItem("usernameArray")));
               document.getElementById("getDepCity").innerHTML = storedDept[id_kayttaja];
               document.getElementById("getArrCity").innerHTML = storedArr[id_kayttaja];
            modal.style.display="none";


        } else {
            alert('ERROR.');
            console.log("EIPÄ ONNISTUNU");
        }

}

//Luotu erillinen kirjautumis-popup-ikkuna, joka sulkeutuu kun kirjaudutaan sisään @Outi @Tiina
var modal = document.getElementById('modal');
    var btn = document.getElementById('loginbutton');
    var span = document.getElementsByClassName("close")[0];

    btn.onclick=function() {
        modal.style.display="block";

    }

    login_btn.onclick=function() {
        check();

    }

    span.onclick=function() {
        modal.style.display="none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }



// Käytetään tätä pysäkkien piilottamiseen! @Renne
function toggleStopsVisibility(event) {
    var stopsToggle = event.target.firstElementChild;
    if (stopsToggle.style.display === "none") {
        stopsToggle.style.display = "block";
    } else {
        stopsToggle.style.display = "none";
    }
}


