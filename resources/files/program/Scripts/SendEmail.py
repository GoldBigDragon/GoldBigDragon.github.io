import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_email():
    from_address = "your_email@gmail.com"
    to_address = "recipient@example.com"
    password = "your_password"

    # SMTP setting
    smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
    smtp_server.starttls()
    smtp_server.login(from_address, password)

    # Create email
    msg = MIMEMultipart()
    msg['From'] = from_address
    msg['To'] = to_address
    msg['Subject'] = "Title"

    # Write context
    context = "Context"
    msg.attach(MIMEText(context, 'plain'))

    # Send email
    smtp_server.send_message(msg)
    smtp_server.quit()

send_email()