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
    public ?string $reason;

    public function __construct(string $jobTitle, string $status, ?string $applicationId = null, ?string $reason = null)
    {
        $this->jobTitle = $jobTitle;
        $this->status = $status;
        $this->applicationId = $applicationId;
        $this->reason = $reason;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => '',
            // Show only the admin-provided reason in the visible message
            'message' => $this->reason ?? '',
            'link' => $this->applicationId ? route('dashboard') : null,
            'meta' => [
                'job_title' => $this->jobTitle,
                'status' => $this->status,
                'application_id' => $this->applicationId,
                'reason' => $this->reason,
            ],
        ];
    }


    protected function buildTitle(): string
    {
        $status = strtolower($this->status);
        if (in_array($status, ['approved','selected'], true)) {
            return 'Application approved';
        }
        if ($status === 'rejected') {
            return 'Application rejected';
        }
        return 'Application status updated';
    }
}
