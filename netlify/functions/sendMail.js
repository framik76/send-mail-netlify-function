const nodemailer = require("nodemailer");
const mg = require("nodemailer-mailgun-transport");

const transporter = nodemailer.createTransport(
  mg({
    auth: {
      api_key: process.env.MAILGUN_API_KEY,
      domain: process.env.MAILGUN_DOMAIN,
    },
  })
);

exports.handler = async function (event, context) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, OPTION'
    };  
    try {
        const { destination, sender, subject, text } =  JSON.parse(event.body);
        if (event.httpMethod === 'OPTIONS' || event.httpMethod === 'OPTION') {
            // To enable CORS
            console.log("call OPTION method");
            return {
              statusCode: 200, // <-- Important!
              headers,
              body: JSON.stringify({ message: 'This was a preflight call!'})
            };
        } else {
            console.log(`Sending mail to ${destination}`);
            const info = await transporter.sendMail({
                from: sender,
                to: destination,
                subject: subject,
                text: text,
                /*attachments: [+ err.message 
                {
                    filename: `report-${new Date().toDateString()}.pdf`,
                    content: report,
                    contentType: "application/pdf",
                },
                ],*/
            });
            if (info && info.messageId) {
                console.log(`mail sent: ${info.messageId}`);
                return {
                    statusCode: 200,
                    headers,
                    'Content-Type': 'application/json',
                    body: JSON.stringify({ message: info.messageId }),
                };
            }
        }
    } catch (err) {
        if (err.message === 'Bad Request') {
            return {
                statusCode: 409,
                headers,
                'Content-Type': 'application/json',
                body: JSON.stringify({ message: 'error sending mail: check the payload of the request' }),
            };    
        } else {
            return {
                statusCode: 500,
                headers,
                'Content-Type': 'application/json',
                body: JSON.stringify({ message: 'error sending mail: ' + err.message }),
            };
        }
    }
  };