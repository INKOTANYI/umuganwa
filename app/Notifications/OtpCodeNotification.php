<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpCodeNotification extends Notification
{
    use Queueable;

    public function __construct(public string $code)
    {
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your verification code')
            ->greeting('Hello '.$notifiable->first_name)
            ->line('Use the following code to verify your account:')
            ->line('')
            ->line('Code: '.$this->code)
            ->line('This code expires in 10 minutes.')
            ->line('If you did not request this, you can ignore this email.');
    }
}
