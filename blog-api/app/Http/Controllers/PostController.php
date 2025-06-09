<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage; // Import Storage facade

class PostController extends Controller
{
    /**
     * Display a listing of the posts.
     */
    public function index()
    {
        // Paginate posts, 10 per page
        return Post::with('user')->latest()->paginate(10);
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048', // Validation for image
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('posts_images', 'public');
            // 'posts_images' is the folder inside storage/app/public
            // 'public' is the disk name, refers to config/filesystems.php
        }

        $post = Auth::user()->posts()->create([
            'title' => $request->title,
            'content' => $request->content,
            'image' => $imagePath, // This is what gets saved to your database
        ]);

        return response()->json($post, 201);
    }

    /**
     * Display the specified post.
     */
    public function show(Post $post)
    {
        return response()->json($post->load('user'));
    }

    /**
     * Update the specified post in storage.
     */
    public function update(Request $request, Post $post)
    {
        if ($request->user()->id !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $imagePath = $post->image; // Keep existing image path by default

        if ($request->hasFile('image')) {
            // Delete old image if it exists
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
            }
            $imagePath = $request->file('image')->store('posts_images', 'public');
        } elseif ($request->input('clear_image')) { // Handle frontend signal to remove image
            if ($post->image) {
                Storage::disk('public')->delete($post->image);
                $imagePath = null;
            }
        }

        $post->update([
            'title' => $request->title,
            'content' => $request->content,
            'image' => $imagePath, // This is what gets updated in your database
        ]);
        return response()->json($post);
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(Post $post)
    {
        if (Auth::id() !== $post->user_id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete associated image before deleting the post
        if ($post->image) {
            Storage::disk('public')->delete($post->image);
        }

        $post->delete();

        return response()->json(null, 204);
    }
}