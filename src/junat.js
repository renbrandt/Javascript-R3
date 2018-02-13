function getFile() {
    var xhttp = new XMLHttpRequest();
    var timetable = "";

    xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4 && xhttp.status == 200){

            var trains = JSON.parse(xhttp.responseText);
            console.log(trains);

            for (i = 0; trains.length; i++){
                timetable = timetable + "<li>" + trains[i].trainType + ", " + trains[i].trainNumber;

                document.getElementById("list").innerHTML = timetable;
            }

        }

    };

    xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/LH', true);
    xhttp.send(null);
    
}