<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Mail\SupportTicketMail;
use App\Models\SupportTicket;

class SupportController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required','string','max:255'],
            'email' => ['required','email','max:255'],
            'phone' => ['nullable','string','max:30'],
            'subject' => ['nullable','string','max:255'],
            'message' => ['required','string','max:5000'],
            'attachments.*' => ['file','max:5120'], // 5MB each
        ]);

        $to = env('SUPPORT_TO_EMAIL', config('mail.from.address'));

        $mailable = new SupportTicketMail(
            name: $validated['name'],
            email: $validated['email'],
            phone: $validated['phone'] ?? '',
            subject: $validated['subject'] ?? 'Support request',
            body: $validated['message']
        );

        // Attach files if any
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                if ($file && $file->isValid()) {
                    $mailable->attach($file->getRealPath(), [
                        'as' => $file->getClientOriginalName(),
                        'mime' => $file->getMimeType(),
                    ]);
                }
            }
        }

        // Persist support ticket if table exists
        $ticket = null;
        $saved = false;
        if (Schema::hasTable('support_tickets')) {
            $userId = auth()->id();
            if (!$userId && Schema::hasTable('users')) {
                $email = trim(strtolower($validated['email']));
                $userId = DB::table('users')->whereRaw('LOWER(email) = ?', [$email])->value('id');
            }
            $ticket = SupportTicket::create([
                'user_id' => $userId,
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'subject' => $validated['subject'] ?? null,
                'message' => $validated['message'],
                'status' => 'open',
            ]);
            $saved = (bool) $ticket;
        }

        Mail::to($to)->send($mailable);

        // Inertia form submissions must receive a redirect with flash, not JSON
        $flash = $saved
            ? __('Your message has been sent and saved as ticket #:id.', ['id' => $ticket->id])
            : __('Your message has been sent. Note: database ticket not saved.');

        if ($request->headers->has('X-Inertia')) {
            return back()->with('success', $flash);
        }

        if ($request->ajax() || $request->wantsJson()) {
            return response()->json([
                'ok' => true,
                'saved' => $saved,
                'ticket_id' => $ticket?->id,
                'message' => $saved ? 'Support request sent and saved.' : 'Support request emailed. Ticket not saved to DB (table missing?).',
            ]);
        }

        return back()->with('success', $flash);
    }

    // Admin JSON list of support tickets (open by default)
    public function adminIndex(Request $request)
    {
        if (!Schema::hasTable('support_tickets')) return response()->json(['data'=>[], 'total'=>0, 'links'=>[]]);
        $q = $request->get('q');
        $status = $request->get('status', 'all');
        $per = (int) $request->get('per_page', 10);
        $rows = SupportTicket::query()
            ->when($status && $status !== 'all', fn($qb) => $qb->where('status', $status))
            ->when($q, function($qb) use ($q){
                $qb->where(function($w) use ($q){
                    $w->where('name','like',"%{$q}%")
                      ->orWhere('email','like',"%{$q}%")
                      ->orWhere('subject','like',"%{$q}%")
                      ->orWhere('message','like',"%{$q}%");
                });
            })
            ->latest('id')->paginate($per);
        return response()->json($rows);
    }

    // Current user's tickets (for dashboard), match by user_id or email
    public function myTickets(Request $request)
    {
        if (!Schema::hasTable('support_tickets')) return response()->json(['data' => []]);
        $user = Auth::user();
        if (!$user) return response()->json(['data' => []]);
        $limit = (int) $request->get('limit', 10);
        $email = trim(strtolower($user->email));
        $rows = SupportTicket::query()
            ->where(function ($w) use ($user, $email) {
                $w->where('user_id', $user->id)
                  ->orWhere(function ($wb) use ($email) {
                      $wb->whereNotNull('email')->whereRaw('LOWER(email) = ?', [$email]);
                  });
            })
            ->latest('id')
            ->limit($limit)
            ->get(['id','subject','message','status','admin_reply','created_at','replied_at']);
        return response()->json(['data' => $rows]);
    }

    // Admin reply to a ticket
    public function reply(Request $request, SupportTicket $ticket)
    {
        $data = $request->validate([
            'reply' => ['required','string','max:5000'],
        ]);
        try {
            $ticket->update([
                'admin_reply' => $data['reply'],
                'status' => 'closed',
                'replied_at' => now(),
            ]);

            // Create DB notification for the ticket owner (by user_id; fallback to email match)
            if (Schema::hasTable('notifications')) {
                $targetUserId = $ticket->user_id;
                if (!$targetUserId && !empty($ticket->email) && Schema::hasTable('users')) {
                    $email = trim(strtolower($ticket->email));
                    $targetUserId = DB::table('users')->whereRaw('LOWER(email) = ?', [$email])->value('id');
                }
                if ($targetUserId) {
                    DB::table('notifications')->insert([
                        'id' => (string) Str::uuid(),
                        'type' => 'App\\Notifications\\SupportReplyNotification',
                        'notifiable_type' => 'App\\Models\\User',
                        'notifiable_id' => $targetUserId,
                        'data' => json_encode([
                            'title' => 'Support replied',
                            'message' => $data['reply'],
                        ]),
                        'read_at' => null,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }

            // Email the ticket owner if an email is present
            if (!empty($ticket->email)) {
                try {
                    Mail::raw($data['reply'], function ($message) use ($ticket) {
                        $subject = $ticket->subject ? ('Re: '.$ticket->subject) : 'Support reply';
                        $message->to($ticket->email)->subject($subject);
                    });
                } catch (\Throwable $e) {
                    // ignore mail failure but continue
                }
            }

            return response()->json(['ok' => true]);
        } catch (\Throwable $e) {
            return response()->json(['ok' => false, 'error' => $e->getMessage()], 422);
        }
    }
}
