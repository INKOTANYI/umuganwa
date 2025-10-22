<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ApplicationStatusUpdated extends Notification
{
    use Queueable;

    public string $jobTitle;
    public string $status;
    public ?string $applicationId;

    public function __construct(string $jobTitle, string $status, ?string $applicationId = null)
    {
        $this->jobTitle = $jobTitle;
        $this->status = $status;
        $this->applicationId = $applicationId;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'Application status updated',
            'message' => "Your application for '{$this->jobTitle}' is now '{$this->status}'.",
            'link' => $this->applicationId ? route('dashboard') : null,
            'meta' => [
                'job_title' => $this->jobTitle,
                'status' => $this->status,
                'application_id' => $this->applicationId,
            ],
        ];
    }
}
