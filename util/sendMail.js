const nodeMailer = require("nodemailer");


const sendMail = async (subject,message,send_to,sent_from, reply_to) => {

    //  Create transporter

    const transporter = nodeMailer.createTransport(
        {
            host: 'smpt-mail.outlook.com',
            port: 587,
            auth: {
                user: 'shoppergl1998@outlook.com',
                pass: 'lobianisgadamkvani20'
            },
            tls: {
                rejectUnauthorized: false
            }
        }
    );

    const options = {
        from: sent_from,
        to: send_to,
        replyTo: reply_to,
        subject: subject,
        html: message
    };

    transporter.sendMail(options, function(err, info){
          if(err){
            console.log(err)
          };
          console.log(info)
    })
};


module.exports = sendMail

