function hasDigit(myString) {
    return /\d/.test(myString);
}

function hasCapitalLetter(myString) {
    return /[A-Z]/.test(myString);
}

function replaceAt(string, index, replace) {
    return string.substring(0, index) + replace + string.substring(index + 1);
}

function getMasterPasswordAndSalt(masterPassword, url, key) {
    var hashedPassword = CryptoJS.SHA512(CryptoJS.SHA512(masterPassword)).toString();
    var salt = CryptoJS.SHA512(clearUrl(url)).toString();
    
    if (key != "") {
        salt = CryptoJS.SHA512(salt + "/" + key.toLowerCase()).toString();
    }

    return {
        hashedPassword: hashedPassword,
        salt: salt
    }
}

function afterPasswordIsGenerated(scryptHash, passwordLength, capitals, digits, specialCharacter, onlyDigits) {
    if (passwordLength == "" || isNaN(passwordLength)) {
        passwordLength = 12;
    }
            
    if (onlyDigits == true) {
        var regex = new RegExp('[^0-9]', 'g');               
        scryptHash = scryptHash.replace(regex, "");
        return (scryptHash.length >= passwordLength) ? scryptHash.substring(0, passwordLength) : '';
    } 
    
    if (capitals == false) {
        scryptHash = scryptHash.toLowerCase();
    }

    if (digits == false) {
        var regex = new RegExp('[0-9]', 'g');               
        scryptHash = scryptHash.replace(regex, ""); 
    }
    
    if (scryptHash.length < passwordLength) {
        return '';
    }

    scryptHash = scryptHash.substring(0, passwordLength);

    if (capitals && !hasCapitalLetter(scryptHash)) {
        scryptHash = replaceAt(scryptHash, passwordLength-3, "Q");
    }

    if (digits && !hasDigit(scryptHash)) {
        scryptHash = replaceAt(scryptHash, passwordLength-2, "2");
    }

    if (specialCharacter) {
        scryptHash = replaceAt(scryptHash, passwordLength-1, "!");
    }

    return scryptHash;
}

function displayUnlockedPassword(unlockedPassword) {
    $('#failed-password').hide();
    $('#successful-password').hide();
    $('div.submit.button').removeClass('loading').addClass('disabled');

    if (unlockedPassword == '') {
        $('#failed-password').show();
    } else {
        gtag('event', 'password', {
            'event_label': 'unlocked'
        });

        $('input.unlocked.password').val(unlockedPassword);
        $('#successful-password').show();
    }

    $('div.password.result').show();
    Jump('.footer.message');
}

function unlockPassword(masterPassword, url, passwordLength, key, capital, digit, specialCharacter, onlyDigits) {
    scrypt_module_factory(function (scrypt) {
        var inputData = getMasterPasswordAndSalt(masterPassword, url, key);
        var hashedPassword = scrypt.encode_utf8(inputData.hashedPassword);
        var salt = scrypt.encode_utf8(inputData.salt);

        var scryptHash = scrypt.crypto_scrypt(hashedPassword, salt, 16384, 8, 15, 256);
        scryptHash = base58Encode(scrypt.to_hex(scryptHash));
        var unlockedPassword = afterPasswordIsGenerated(scryptHash, passwordLength, capital, digit, specialCharacter, onlyDigits);
        displayUnlockedPassword(unlockedPassword);
    });
}

$(document).ready(function() {
    if (!localStorage.getItem('disclaimerAccepted')) {
        localStorage.setItem('disclaimerAccepted', "false");
    }

    var disclaimerAccepted = localStorage.getItem('disclaimerAccepted') == "true";

    if (!disclaimerAccepted) {
        $('.disclaimer.message').show();
    }

    var clipboard = new ClipboardJS('.copy.button');

    clipboard.on('success', function(e) {
        $('.ui.result.input').transition('pulse');
    });

    $('.unlock.again.button').click(function() {
        Jump('.violet.header', {
            callback: () => {
                $('.ui.result.input input').val('');
                $('div.password.result').hide();
                $('div.submit.button').removeClass('disabled');
                $('input[name="websiteUrl"]').val('');
                $('input[name="key"]').val('');
            }
        });
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
        localStorage.setItem('disclaimerAccepted', "true");
        $(this)
            .closest('.message')
            .transition('fade');
        $('.tiny.message').remove();
    });

    $('div.checkbox.key').checkbox().checkbox({
        onChecked: function() { 
            $('div.key.field').removeClass('disabled');
            $('div.key.field input').prop('disabled', false);
        },
        onUnchecked: function() { 
            $('div.key.field').removeClass('error');
            $('div.key.field').addClass('disabled');
            $('div.key.field input').prop('disabled', true);
        }
    });

    $('div.buy.pro').click(function() {
        gtag('event', 'click', {
            'event_label': 'buy pro version'
        });
        $('div.buy.pro').addClass('disabled');
    });

    $('div.submit.button').click(function() {
        $("input[name='masterPassword']").parent().parent().removeClass("error");
        $('input[name="websiteUrl"]').parent().parent().removeClass("error");
        $('input[name="key"]').parent().parent().removeClass("error");

        var masterPassword = $("input[name='masterPassword']").val();
        var websiteUrl = $('input[name="websiteUrl"]').val();
        var passwordLength = $('input[name="passwordLength"]').val();
        var key = $('input[name="key"]').val();

        var keyEnabled = $("div.checkbox.key").checkbox("is checked");

        var capital = $('#capital').checkbox("is checked");
        var digit = $('#digit').checkbox("is checked");
        var specialCharacter = $('#specialCharacter').checkbox("is checked");
        var onlyDigits = $('#onlyDigits').checkbox("is checked");

        gtag('event', 'website', {
            'event_label': clearUrl(websiteUrl)
        });

        var errorsInForm = false;

        if (masterPassword == "")
        {
            errorsInForm = true;
            $("input[name='masterPassword']").parent().parent().addClass("error");
        }

        if (websiteUrl == "")
        {
            errorsInForm = true;
            $('input[name="websiteUrl"]').parent().parent().addClass("error");
        }

        if (keyEnabled && key == "") {
            errorsInForm = true;
            $('input[name="key"]').parent().parent().addClass("error");
        }

        if (errorsInForm) return;

        $('div.submit.button').addClass('loading');

        setTimeout(function() {
            unlockPassword(masterPassword, websiteUrl, passwordLength, key, capital, digit, specialCharacter, onlyDigits);
        }, 500);
    });
});
