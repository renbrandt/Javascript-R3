
// esitellään toiminnan kannalta tarvittavia muuttujia. Näihin asetetaan arvoja functioiden sisällä
var xhttp = new XMLHttpRequest();
var timetable = "";
var depstation = "";
var arrstation = "";
var id_kayttaja = "";
var login_id = 0;
var shortCode = [];
var longCode = [];
//Testailua varten välillä tyhjennetään localStora
//ns. Pääfunktio, jonka avulla haetaan data internetistä.
function getFile() {
    //napataan käyttäjän syöttämät lähtö- ja määränpääasemat HTML-formista.
    depstation = document.getElementById("getDepCity").value;
    arrstation = document.getElementById("getArrCity").value;

    //muutetaan käyttäjän syöttämästä asemasta station short code: @Tiina
    if (depstation === "Helsinki"){
        depstation = "HKI"
    } else if (depstation === "Hämeenlinna"){
        depstation = "HL"
    } else if (depstation === "Jyväskylä"){
        depstation = "JY"
    } else if (depstation === "Kouvola") {
        depstation = "KV"
    } else if (depstation === "Lahti"){
        depstation = "LH"
    } else if (depstation === "Lappeenranta") {
        depstation = "LR"
    }  else if (depstation === "Mikkeli") {
        depstation = "MI"
    }  else if (depstation === "Oulu") {
        depstation = "OL"
    }  else if (depstation === "Riihimäki") {
        depstation = "RI"
    }  else if (depstation === "Rovaniemi") {
        depstation = "ROI"
    }  else if (depstation === "Tampere") {
        depstation = "TPE"
    }  else if (depstation === "Tikkurila") {
        depstation = "TKL"
    }  else if (depstation === "Turku") {
        depstation = "TKU"
    }  else if (depstation === "Vaasa") {
        depstation = "VS"
    }

    if (arrstation === "Helsinki"){
        arrstation = "HKI"
    } else if (arrstation === "Hämeenlinna"){
        arrstation = "HL"
    } else if (arrstation === "Jyväskylä"){
        arrstation = "JY"
    } else if (arrstation === "Kouvola") {
        arrstation = "KV"
    } else if (arrstation === "Lahti"){
        arrstation = "LH"
    } else if (arrstation === "Lappeenranta") {
        arrstation = "LR"
    }  else if (depstation === "Mikkeli") {
        arrstation = "MI"
    }  else if (arrstation === "Oulu") {
        arrstation = "OL"
    }  else if (arrstation === "Riihimäki") {
        arrstation = "RI"
    }  else if (arrstation === "Rovaniemi") {
        arrstation = "ROI"
    }  else if (arrstation === "Tampere") {
        arrstation = "TPE"
    }  else if (arrstation === "Tikkurila") {
        arrstation = "TKL"
    }  else if (arrstation === "Turku") {
        arrstation = "TKU"
    }  else if (arrstation === "Vaasa") {
        arrstation = "VS"
    }

    //Haetaan vain näiden kahden pisteen välillä kulkevat junat URLIn kanssa kikkaillen @Tiina @Renne
    xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/' + depstation + '/' + arrstation + '/', true);
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

            //napataan vastaanotettu jason ja käännetään se helpommin käsiteltävään muotoon. @Tiina
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
            }
            /* Alla käydään läpi saatu ulkoinen data. For loop käy datan läpi, var result antaa
            datalle indeksin, muut hakevat niiden kuvaamia arvoja datasta. @Johanna @Tiina @Renne */

            for (var i = 0; trains.length; i++) {
                var result = trains[i];

                var index = indexSearch(result);
                var arrIndex = arrIndexSearch(result);

                // jos junan aika on ennen käyttäjän antamaa aikaa niin ei jatketa tämän junan kanssa
                var scheduledTimeDate = Date.parse(result.timeTableRows[0].scheduledTime);
                if (scheduledTimeDate < userSetTime) continue;

                /* Alla erotellaan onko lähi- vai kaukojuna ja lisätään junan tyyppi/ID. @Tiina  */

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
                    var deptTime = new Date(result.timeTableRows[arrIndex].scheduledTime).toLocaleTimeString("fi", {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false,

                    });

                    var arrTime = new Date(result.timeTableRows[index].scheduledTime).toLocaleTimeString("fi", {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: false
                    });

                    /* Muutetaan lähtö- ja saapumisaika millisekunteiksi, jotta saadaan laskettua matkan kesto!  @Tiina  */
                    var deptTimeMS = Date.parse(result.timeTableRows[arrIndex].scheduledTime);
                    var arrTimeMS = Date.parse(result.timeTableRows[index].scheduledTime);
                    var triptimeMS = arrTimeMS - deptTimeMS;

                    var tripTime = msToTime();

                // Hoidetaan datan tulostaminen InnerHTML:ään. @Renne @Johanna @Tiina @Outi
                    //tulostetaan vain departures
                    // Koska ollaan vieläkin for-loppin sisällä, saadaan luotua jokaiselle halutulle matkalle oma DIVi, johon säädetään visibility toggle
                    if (result.timeTableRows[i].type === "DEPARTURE" && result.trainType!="AE") {
                        timetable = timetable + "<div class=\"trips\" onclick=\"toggleStopsVisibility(event)\">" + trainNumber + " | " + " Lähtöaika: " +  deptTime + " | " + " Saapumisaika: " + arrTime + " | " + " Matkan kesto: " + tripTime + "<div>";

                        // Tehdään uusi for-loop, jonka avulla saadaan jokaista matkaa varten jokaisen välipysähdyksen. TUlostetaan lähtöaika ja paikka.
                        for (var k = arrIndex+1; k <= index; k++) {
                            var arrTimeStop = new Date(result.timeTableRows[k].scheduledTime).toLocaleTimeString("fi", {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false
                            });
                            if (result.timeTableRows[k].type === "DEPARTURE" && result.timeTableRows[k].trainStopping===true) {
                                var indexOfShort = shortCode.indexOf(result.timeTableRows[k].stationShortCode);
                                var station = longCode[indexOfShort];
                                timetable = timetable + "<div class=\"stops\">" + station + " - " + arrTimeStop + "</div>";
                            }
                        }

                        //suljetaan kaikki sisältö divien sisälle, jotta niiden ksäittely on helpompaa
                        timetable = timetable + "</div></div>";
                    }

                    // Muutetaan käyttäjän säätämät asemat ja tallenetaan ne hänen henkilökohtaisiin taulukoihin. Näiden avulla sisäänkirjautuessa
                    //käyttäjä saa suoraan viimeisimmän haun selaimelleen. @Renne @Johanna @Outi
                    if (login_id ==1 ){
                    var tempTableDept = JSON.parse(localStorage.getItem('userDeptStation'));
                    var tempTableArr = JSON.parse(localStorage.getItem("userArrStation"));

                    tempTableDept.splice(id_kayttaja, 1, depstation);
                    tempTableArr.splice(id_kayttaja, 1, arrstation);
                    localStorage.setItem("userDeptStation", JSON.stringify(tempTableDept));
                    localStorage.setItem("userArrStation", JSON.stringify(tempTableArr));
                    }

                //Tulostetaan viimein kasattu data (Eli iso määrä divejä) html-sivulle.
                        document.getElementById("list").innerHTML = timetable;

                }
            }
        };
        // Tyhjennetään datataulukko aina kun kutsutaan uutta dataa. @Tiina
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

//Haetaan lähtöaseman indeksi @Renne @Johanna
function arrIndexSearch(result) {
    for (var j = 0; j < result.timeTableRows.length; j++) {
        var arriIndex = result.timeTableRows[j].stationShortCode;
        if (arriIndex == depstation) {
            return j;
        }
    }
}

// Tehdään käyttäjätilejä varten useampi taulukko. Username, password ja tarvittava data. @Outi @Johanna @Renne
    var usernameArray = [];
    var pwArray =[];
    var userDeptStation =[];
    var userArrStation = [];

    // Rekisteröityminen tapahtuu tämän funktion avulla. Lisätään ja tallenetaan localstoragelle käyttäjän tiedot neljälle eri taulukolle, samalla indeksille
    // @Outi @Johanna @Renne
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
        userDeptStation.push("");
        userArrStation.push("");
        localStorage.setItem("userDeptStation", JSON.stringify(userDeptStation));
        localStorage.setItem("usernameArray", JSON.stringify(usernameArray));
        localStorage.setItem("pwArray", JSON.stringify(pwArray));
        localStorage.setItem("userArrStation", JSON.stringify(userArrStation));
        document.getElementById('name1').value = "";
        document.getElementById('pw').value = "";
        checkInNewAccount();
}

//Käyettään tätä kirjautumiseen suoraan rekisteröitymisen yhteydessä
// @Renne @Johanna
function checkInNewAccount() {
    modal.style.display="none";
    var storedNames = JSON.parse(localStorage.getItem('usernameArray'));
    id_kayttaja=storedNames.length-1;
    document.getElementById('knownuser').innerHTML="Olet kirjautuneena käyttäjänä:</br>"+ storedNames[id_kayttaja];
    //muokattu sisään- ja uloskirjautumisbuttoneja sen mukaan, onko käyttäjä kirjautunut sisään vai ei. @Outi
    document.getElementById("loginbutton").style.visibility="hidden";
    document.getElementById("logoutbutton").style.visibility="visible";
    login_id=1;

}
// Sisäänkirjautuminen. Tarkistetaan löytyykö syötetty käyttäjätunnust&salasana-pari localstoragelta. @Outi @Johanna @Renne
function check() {

        //  Haetaan tallennetut rekisteröityneet henkilöt localstoragelta
        var storedNames = JSON.parse(localStorage.getItem('usernameArray'));
        var storedPws = JSON.parse(localStorage.getItem('pwArray'));

        // Luodaan muuttuja, jota käytetään hyväksi sisäänkirjautumisen onnistumisen tunnistamiseksi
        var valid = -1;

    // Haetaan käyttäjän syöttämät arvot login-kentistä
    var userName = document.getElementById('userName').value;
    var userPw = document.getElementById('userPw').value;

        // Tehdään looppi, joka käy taulukot läpi
        for (i=0; i<storedNames.length;i++) {

        // tarkistetaan että samalla indeksillä sekä käyttäjänimi että salasana ovat samat.
        if (userName == storedNames[i] && userPw == storedPws[i]) {
            valid = i;
            id_kayttaja=i;
            login_id=1;
            break;
        }
    }

        // Jos käyttäjätunnarit löytyvät, ilmoitetaan että ollaan paikalla + haetaan localstoragelta datat! @Johanna @Renne
        if (valid != -1) {
               // console.log(JSON.parse(localStorage.getItem("userDeptStation"))[id_kayttaja]);
               // console.log(JSON.parse(localStorage.getItem("pwArray")));
               // console.log(JSON.parse(localStorage.getItem("usernameArray")));
            var storedDept = JSON.parse(localStorage.getItem('userDeptStation'));
            var storedArr = JSON.parse(localStorage.getItem("userArrStation"));
            var storedUser = JSON.parse(localStorage.getItem("usernameArray"));
            document.getElementById("getDepCity").value= storedDept[id_kayttaja];
            document.getElementById("getArrCity").value= storedArr[id_kayttaja];
            document.getElementById('knownuser').innerHTML="Olet kirjautuneena käyttäjänä:</br> "+ storedUser[id_kayttaja];
            modal.style.display="none";
            login_id=1;
        } else {
            alert('ERROR: Väärä käyttäjätunnus tai salasana');
        }
}

//Luotu erillinen kirjautumis-popup-ikkuna, joka sulkeutuu kun kirjaudutaan sisään @Outi @Tiina
var modal = document.getElementById('modal');
    var btn = document.getElementById('loginbutton');
    var span = document.getElementsByClassName("close")[0];
    var lubtn = document.getElementById("logoutbutton");

    btn.onclick=function() {
        modal.style.display="block";
    }

    login_btn.onclick=function() {
        check();
        document.getElementById("loginbutton").style.visibility = "hidden";
        document.getElementById("logoutbutton").style.visibility = "visible";
    }

    span.onclick=function() {
        modal.style.display="none";
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

// @Renne @Johanna
lubtn.onclick=function() {
        login_id=0;
        id_kayttaja="";
    document.getElementById("loginbutton").style.visibility = "visible";
    document.getElementById("logoutbutton").style.visibility = "hidden";
    document.getElementById("list").innerHTML = "";
    document.getElementById('knownuser').innerHTML="";
    document.getElementById("getDepCity").value= "";
    document.getElementById("getArrCity").value= "";
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

// Haetaan pysäkkien nimet shortchoden lisäksi @Tiina
var xhttp2 = new XMLHttpRequest();
xhttp2.open("GET", 'https://rata.digitraffic.fi/api/v1/metadata/stations', true);
xhttp2.send(null);

xhttp2.onreadystatechange = function () {

    if (xhttp2.readyState == 4 && xhttp2.status == 200) {

        var stationInfo = JSON.parse(xhttp2.responseText);

        // Lisätään taulukoihin kaikki arvot, jotta voidaan hakea koodille pitkä nimi @Renne @Tiina
        for (var i = 0; i < stationInfo.length; ++i) {
            var stations = stationInfo[i];
            shortCode.push(stations.stationShortCode);
            longCode.push(stations.stationName);
        }
    }
};

document.getElementById("logoutbutton").style.visibility = "hidden";



