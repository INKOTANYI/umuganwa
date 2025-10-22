<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Notifications\DatabaseNotification;

class NotificationsController extends Controller
{
    public function list(Request $request)
    {
        $user = Auth::user();
        $limit = (int) ($request->query('limit', 10));
        $items = $user->notifications()->latest()->limit($limit)->get()->map(function (DatabaseNotification $n) {
            return [
                'id' => $n->id,
                'type' => class_basename($n->type),
                'data' => $n->data,
                'read_at' => $n->read_at,
                'created_at' => $n->created_at,
            ];
        });
        return response()->json(['items' => $items]);
    }

    public function unreadCount()
    {
        $user = Auth::user();
        return response()->json(['count' => $user->unreadNotifications()->count()]);
    }

    public function markRead(Request $request)
    {
        $user = Auth::user();
        $id = $request->input('id');
        if ($id) {
            $n = $user->notifications()->where('id', $id)->first();
            if ($n && is_null($n->read_at)) {
                $n->markAsRead();
            }
        }
        return response()->json(['ok' => true]);
    }

    public function markAllRead()
    {
        $user = Auth::user();
        $user->unreadNotifications->markAsRead();
        return response()->json(['ok' => true]);
    }
}
