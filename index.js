// use bcrypt or scrypt or pbkdf
// https://github.com/ricmoo/scrypt-js

function clearUrl(url) {
    url = url.toLowerCase();
	return url.replace('http://', '').replace('https://', '').replace('www.', '').split("/")[0];
}

function myBase56(text) {
  var regex = new RegExp('[^a-zA-Z0-9]', 'g');               
  text = text.replace(regex, "");
  var regex = new RegExp('[0OIl+\/1o]', 'g');               
  return text.replace(regex, "");
}

function unlockPassword(masterPassword, url, passwordLength, key, capital, digit, specialCharacter, onlyDigits) {
    if (passwordLength == "" || isNaN(passwordLength)) {
        passwordLength = 12;
    }

    var password =
            CryptoJS.SHA512(CryptoJS.SHA512(masterPassword)).toString() + "-" +
            CryptoJS.SHA512(clearUrl(url)).toString()

    if (key != "") {
        password += "-" + CryptoJS.SHA512(key.toLowerCase()).toString()
    }

    password = CryptoJS.SHA512(password).toString();

    before = performance.now();

    nonce = 0;
    while(true) {
        if (password.endsWith("000")) {
            break;
        }

        password = CryptoJS.SHA512(password + nonce).toString();
    }

    after = performance.now();
    // alert((after - before) / 1000);

    password = CryptoJS.SHA512(password).toString(CryptoJS.enc.Base64);
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

$(document).ready(function() {
    var clipboard = new ClipboardJS('.copy.button');

    clipboard.on('success', function(e) {
        $('.ui.result.input').transition('pulse');
        // e.clearSelection();
    });

    $('.ui.checkbox').checkbox();

    $('#onlyDigits').click(function() {
        if ($(this).checkbox("is checked") == true) {
            $("#digit").checkbox('set disabled');
            $("#specialCharacter").checkbox('set disabled');
            $("#capital").checkbox('set disabled');
        } else {
            $("#digit").checkbox('set enabled');
            $("#specialCharacter").checkbox('set enabled');
            $("#capital").checkbox('set enabled');
        }
        
    });

    $('.message .close').on('click', function() {
        $(this)
            .closest('.message')
            .transition('fade');
        $('.tiny.message').remove();
    });

    $('div.checkbox.key').click(function() {
        $('div.key.field').toggleClass('disabled');
    });

    $('div.buy.pro').click(function() {
        ga('send', 'event', 'purchase', 'pro')
        $('div.buy.pro').addClass('disabled');
    });

    $('div.submit.button').click(function() {
        var masterPassword = $("input.master.password").val();
        var websiteUrl = $('input[name="websiteUrl"').val();
        var passwordLength = $('input[name="passwordLength"').val();
        var key = $('input[name="key"').val();

        var capital = $('#capital').checkbox("is checked");
        var digit = $('#digit').checkbox("is checked");
        var specialCharacter = $('#specialCharacter').checkbox("is checked");
        var onlyDigits = $('#onlyDigits').checkbox("is checked");

        $('div.submit.button').addClass('loading');

        setTimeout(function() {
            scrypt_module_factory(function (scrypt) {
                var key = scrypt.crypto_scrypt(scrypt.encode_utf8("pleaseletmein"),
                            scrypt.encode_utf8("SodiumChloride"),
                            16384, 8, 30, 256);  // n, r, p <- which params to choose??
                var unlockedPassword = base58Encode(scrypt.to_hex(key));
                $('input.unlocked.password').val(unlockedPassword);
            });

            $('div.submit.button').removeClass('loading');
        

            // var unlockedPassword = unlockPassword(masterPassword, websiteUrl, passwordLength, key, capital, digit, specialCharacter, onlyDigits);

            $('div.password.result').toggle();
        }, 1000);
    });
});