<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class SupportTicketMail extends Mailable
{
    use Queueable, SerializesModels;

    public string $senderName;
    public string $senderEmail;
    public string $senderPhone;
    public string $ticketSubject;
    public string $ticketBody;

    /**
     * Create a new message instance.
     */
    public function __construct(string $name, string $email, string $phone = '', string $subject = 'Support request', string $body = '')
    {
        $this->senderName = $name;
        $this->senderEmail = $email;
        $this->senderPhone = $phone;
        $this->ticketSubject = $subject ?: 'Support request';
        $this->ticketBody = $body;
        $this->subject($this->ticketSubject);
    }

    /**
     * Build the message.
     */
    public function build()
    {
        return $this->view('emails.support_ticket')
            ->with([
                'name' => $this->senderName,
                'email' => $this->senderEmail,
                'phone' => $this->senderPhone,
                'content' => $this->ticketBody,
                'subject' => $this->ticketSubject,
            ]);
    }
}
