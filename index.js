// https://cdnjs.com/libraries/crypto-js

function clearUrl(url) {
	return url.replace('http://','').replace('https://','').replace('www.','').split("/")[0].toLowerCase();

}

function myBase56(text) {
  var regex = new RegExp('[0OIl+\/1o]', 'g');               
  return text.replace(regex, "");
}

function unlockPassword(masterPassword, url) { //}, url, passwordLength, key, capitals, digits, specialCharacters, onlyDigits) {
    // var masterPassword = "MyMasterPassword!1";
    var color = "red";

    var capitals = true;
    var digits = true;
    var specialCharacters = true;
    var onlyDigits = false;
    var passwordLength = 12;

    var password = myBase56(
        CryptoJS.SHA512(
            CryptoJS.SHA512(CryptoJS.SHA512(masterPassword)).toString() + "-" +
            CryptoJS.SHA512(color.toLowerCase()).toString() + "-" +
            CryptoJS.SHA512(clearUrl(url)).toString()
        ).toString()
        );
        
    if (capitals == true) {
        password = "Q" + password
    }

    if (onlyDigits == true) {
    var regex = new RegExp('[^0-9]', 'g');               
    password = password.replace(regex, ""); 
    } else {
    if (digits == true) {
        password = "2" + password;
    } else {
        var regex = new RegExp('[0-9]', 'g');               
        password = password.replace(regex, ""); 
    }
    }

    if (specialCharacters == true && onlyDigits == false) {
    password = "!" + password;
    }

    if (password.length > passwordLength) {
    password = password.substring(0, passwordLength);
    }

    return password;
}