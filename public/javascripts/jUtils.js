var jUtils = {
    loadPaymentMethods: function (selectObject) {
        var xhttp = new XMLHttpRequest();
        var selectOption = selectObject.value;
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {

                var jsonPaymentList = JSON.parse(this.response);

                var select = document.getElementById("paymentMethodId");
                var length = select.options.length;
                //Cleaning the dropdown
                for (var i = 0; i < length; i++) {
                    select.options[i] = null;
                }
                //if it is empty we will add N/A value.
                //otherwise we will add the payment options
                if (jsonPaymentList.length === 0) {
                    select.options[0] = new Option("N/A. Elija otro país con agencias de pago");
                    select.options[0].setAttribute("disabled", "disabled")
                } else {
                    for (x in jsonPaymentList) {
                        select.options[select.options.length] = new Option(jsonPaymentList[x].name, jsonPaymentList[x].id);
                    }
                }
            }
        };
        xhttp.open("POST", "/payment_methods", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");

        xhttp.send(JSON.stringify({ "siteId" : selectOption }));
    },
    saveRecommendedAgency: function (agencyCode) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                alert(this.response);
            }
        };
        xhttp.open("POST", "/save_agency", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify({"agency_code" : agencyCode}));
    },

    deleteRecommendedAgency: function (agencyCode) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (this.readyState === 4 && this.status === 200) {
                alert(this.response);
                location.reload();
            }
        };
        xhttp.open("POST", "/delete_agency", true);
        xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        xhttp.send(JSON.stringify({"agency_code" : agencyCode}));
    }
};
