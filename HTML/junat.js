function haeFile() {
    var xhttp = new XMLHttpRequest();
    var aikataulu = "";

    xhttp.onreadystatechange = function(){
        if (xhttp.readyState == 4 && xhttp.status == 200){

            var junat = JSON.parse(xhttp.responseText);
            console.log(junat);

            for (i = 0; junat.length; i++){
                aikataulu = aikataulu + "<li>" + junat[i].trainType + ", " + junat[i].trainNumber;

                document.getElementById("lista").innerHTML = aikataulu;
            }

        }

    };

    xhttp.open("GET", 'https://rata.digitraffic.fi/api/v1/live-trains/station/HKI/LH', true);
    xhttp.send(null);
    
}