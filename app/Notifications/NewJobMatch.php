<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class NewJobMatch extends Notification
{
    use Queueable;

    public string $jobTitle;
    public ?int $jobId;

    public function __construct(string $jobTitle, ?int $jobId = null)
    {
        $this->jobTitle = $jobTitle;
        $this->jobId = $jobId;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'New job match',
            'message' => "We found a job that matches your profile: '{$this->jobTitle}'.",
            'link' => $this->jobId ? route('dashboard') : null,
            'meta' => [
                'job_title' => $this->jobTitle,
                'job_id' => $this->jobId,
            ],
        ];
    }
}
