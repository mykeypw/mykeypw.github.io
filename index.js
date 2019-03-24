function clearUrl(url) {
    url = url.toLowerCase();
	return url.replace('http://', '').replace('https://', '').replace('www.', '').split("/")[0];
}

function myBase56(text) {
  var regex = new RegExp('[0OIl+\/1o]', 'g');               
  return text.replace(regex, "");
}

function unlockPassword(masterPassword, url, passwordLength, key, capital, digit, specialCharacter, onlyDigits) {
    if (isNaN(passwordLength)) {
        passwordLength = 12;
    }

    var password =
            CryptoJS.SHA512(CryptoJS.SHA512(masterPassword)).toString() + "-" +
            CryptoJS.SHA512(clearUrl(url)).toString()

    if (key != "") {
        password += "-" + CryptoJS.SHA512(key.toLowerCase()).toString()
    }

    password = CryptoJS.SHA512(password).toString();
    password = myBase56(password)
        
    if (capital == true) {
        password = "Q" + password
    }

    if (onlyDigits == true) {
    var regex = new RegExp('[^0-9]', 'g');               
    password = password.replace(regex, ""); 
    } else {
    if (digit == true) {
        password = "2" + password;
    } else {
        var regex = new RegExp('[0-9]', 'g');               
        password = password.replace(regex, ""); 
    }
    }

    if (specialCharacter == true && onlyDigits == false) {
    password = "!" + password;
    }

    if (password.length > passwordLength) {
    password = password.substring(0, passwordLength);
    }

    return password;
}