import smtplib
from email.message import EmailMessage











class EmailSender:
    def __init__(self, my_email, password):
        self.my_email = my_email
        self.password = password

    def send_email(self, subject, content, recipient_email):
        # Create an email message
        message = EmailMessage()
        message.set_content(content)
        message.add_alternative(content, subtype="html")

        message["Subject"] = subject
        message["From"] = self.my_email
        message["To"] = recipient_email

        # Send the email
        try:
            with smtplib.SMTP_SSL('smtp.gmail.com', 465) as connection:
                connection.login(user=self.my_email, password=self.password)
                connection.send_message(message)
                print(f"Email sent to {recipient_email}")
        except Exception as e:
            print(f"Failed to send email: {str(e)}")









