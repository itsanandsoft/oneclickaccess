const db = new SQLiteHelper();
const { ipcRenderer } = require('electron');
const fs = require('fs');
const macAddFilePath = path.join(__dirname, '/../../mac.txt');
const hDSFilePath = path.join(__dirname, '/../../hds.txt');

$("#register-btn").on("click", function (e) {
    if ($("#confrim-password-div").is(":visible")) {
        $("#register-btn").html('Register');
        $("#login-btn").html('Login');
        $("#confrim-password-div").hide('fade');
    }
    else {
        $("#register-btn").html('Login');
        $("#login-btn").html('Register');
        $("#confrim-password-div").show('fade');
    }
});

$("#login-btn").on("click", function (e) {
    let page = 'login';
    if ($("#confrim-password-div").is(":visible")) {
        page = 'register';
    }
    let email = $('#email').val();
    let pass = $('#password').val();
    if (email == '' || pass == '') {
        $('.alert-danger').html('E-mail and Password is required!');
        $('.alert-danger').show();
        return;
    }

    if (page == 'login') {
        
        fetch('https://oneclickaccess.pears.info/api/login',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: pass,
                mac_address: fs.readFileSync(macAddFilePath, 'utf8'),
                hard_disk_serial: fs.readFileSync(hDSFilePath, 'utf8'),
            })
        })
        .then(response => {
            if (response.ok) {
                response.json().then(json => {
                    if(json.body.verified == true){
                        $('.alert-success').html(json.body.message);
                        $('.alert-success').show();
                        const data = {
                            name:json.body.user[0].name,
                            email:json.body.user[0].email,
                            mac:json.body.user[0].mac_address,
                            hds:json.body.user[0].hard_disk_serial,
                            expiry:'',
                            verified:1
                        };
                        console.log("Befor Stroing Local");
                        ipcRenderer.send('database', {
                            functionName: 'insertTable',
                            params: data,
                        });
                        console.log("After Stroing Local");
                        const condition = '';
                        db.selectTable('user', condition, (rows) => {
                        console.log(rows);
                        });
                    }
                    else{
                        $('.alert-danger').html(json.body.message);
                        $('.alert-danger').show();
                    }
                });
            }
            else{
                $('.alert-danger').html('Something went wrong');
                $('.alert-danger').show();
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }
    else {
        let confPass = $('#confrim-password').val();
        if (confPass == '') {
            $('.alert-danger').html('Confirm Password is required!');
            $('.alert-danger').show();
            return;
        }
        if (confPass != pass) {
            $('.alert-danger').html('Passwrod not matched');
            $('.alert-danger').show();
            return;
        }
        fetch('https://oneclickaccess.pears.info/api/signup',
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                password: pass,
                mac_address: fs.readFileSync(macAddFilePath, 'utf8'),
                hard_disk_serial: fs.readFileSync(hDSFilePath, 'utf8'),
            })
        })
        .then(response => {
            if (response.ok) {
                response.json().then(json => {
                    $('.alert-success').html(json.body.message);
                    $('.alert-success').show();
                });
            }
            else{
                $('.alert-danger').html('Something went wrong');
                $('.alert-danger').show();
            }
        })
        .catch((error) => {
            console.error(error);
        });
    }
});