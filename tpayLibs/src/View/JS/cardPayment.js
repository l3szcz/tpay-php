function CardPayment(url, pubkey) {
    this.url = url;
    this.pubkey = pubkey;
    $("#card_payment_form").attr("action", url);
    var numberInput = $('#card_number'),
        expiryInput = $('#expiry_date'),
        cvcInput = $('#cvc'),
        nameInput = $('#c_name'),
        emailInput = $('#c_email');
    const TRIGGER_EVENTS = 'input change blur';

    function SubmitPayment() {
        var cd = numberInput.val().replace(/\s/g, '') + '|' + expiryInput.val().replace(/\s/g, '') + '|' + cvcInput.val().replace(/\s/g, '') + '|' + document.location.origin,
            encrypt = new JSEncrypt(),
            decoded = Base64.decode(pubkey),
            encrypted;
        $("#card_continue_btn").fadeOut();
        $("#loading_scr").fadeIn();
        encrypt.setPublicKey(decoded);
        encrypted = encrypt.encrypt(cd);
        $("#carddata").val(encrypted);
        numberInput.val('');
        expiryInput.val('');
        cvcInput.val('');
        $('#card_payment_form').submit();
    }

    function setWrong($elem) {
        $elem.addClass('wrong');
    }

    function setValid($elem) {
        $elem.removeClass('wrong');
    }

    function validateCcNumber($elem) {
        var isValid = false,
            ccNumber = $elem.val().replace(/\s/g, ''),
            supported = ['mastercard', 'maestro', 'visa'],
            type = $.payment.cardType(ccNumber);
        $elem.val($.payment.formatCardNumber($elem.val()));
        $('div.card_icon').removeClass('hover');
        if (supported.indexOf(type) > -1 && $.payment.validateCardNumber(ccNumber)) {
            setValid($elem);
            $('#info_msg').css('visibility', 'hidden');
            isValid = true;
        } else if (ccNumber.length < 12) {
            setWrong($elem);
            $('#info_msg').css('visibility', 'hidden');
        } else {
            $('#info_msg').css('visibility', 'visible');
            setWrong($elem);
        }
        if (type !== '') {
            $('#' + type).addClass('hover');
        }

        return isValid;
    }

    function validateExpiryDate($elem) {
        var isValid = false, expiration;
        $elem.val($.payment.formatExpiry($elem.val()));
        expiration = $elem.payment('cardExpiryVal');
        if (!$.payment.validateCardExpiry(expiration.month, expiration.year)) {
            setWrong($elem);
        } else {
            setValid($elem);
            isValid = true;
        }

        return isValid;
    }

    function validateCvc($elem) {
        var isValid = false;
        if (!$.payment.validateCardCVC($elem.val(), $.payment.cardType(numberInput.val().replace(/\s/g, '')))) {
            setWrong($elem);
        } else {
            setValid($elem);
            isValid = true;
        }

        return isValid;
    }

    function validateName($elem) {
        var isValid = false;
        if ($elem.val().length < 3) {
            setWrong($elem);
        } else {
            isValid = true;
            setValid($elem);
        }

        return isValid;
    }

    function validateEmail($elem) {
        var isValid = false;
        if (!$elem.formance('validate_email')) {
            setWrong($elem);
        } else {
            isValid = true;
            setValid($elem);
        }

        return isValid;
    }

    function checkName() {
        if (nameInput.length > 0) {
            return validateName(nameInput);
        }

        return true;
    }

    function checkEmail() {
        if (emailInput.length > 0) {
            return validateEmail(emailInput);
        }

        return true;
    }

    function checkForm() {
        var isValidForm = false;
        if (
            validateCcNumber(numberInput)
            && validateExpiryDate(expiryInput)
            && validateCvc(cvcInput)
            && checkName()
            && checkEmail()
        ) {
            isValidForm = true;
        }

        return isValidForm;
    }

    $('#card_continue_btn').click(function () {
        if (checkForm()) {
            SubmitPayment();
        }
    });
    numberInput.on(TRIGGER_EVENTS, function () {
        validateCcNumber($(this));
    });
    expiryInput.on(TRIGGER_EVENTS, function () {
        validateExpiryDate($(this));
    });
    cvcInput.on(TRIGGER_EVENTS, function () {
        validateCvc($(this));
    });
    nameInput.on(TRIGGER_EVENTS, function () {
        validateName($(this));
    });
    emailInput.on(TRIGGER_EVENTS, function () {
        validateEmail($(this));
    });

}
